import { nanoid } from "nanoid";
import moment from "moment";
import initWasm from "@vlcn.io/crsqlite-wasm";
import wasmUrl from "@vlcn.io/crsqlite-wasm/crsqlite.wasm?url";

let sqlite: any, db: any;
const resolves: Function[] = [];
const groupDBs: Record<string, any> = {};
const groupResolves: Record<string, Function[]> = {};

export const updatedAtTrigger = (tableName: string) => `
CREATE TRIGGER IF NOT EXISTS ${tableName}_update
    AFTER UPDATE
    ON ${tableName}
    FOR EACH ROW
    WHEN NEW.updates = OLD.updates
BEGIN
    UPDATE ${tableName} 
    SET updated_at = CURRENT_TIMESTAMP, updates = updates + 1 
    WHERE id = OLD.id;
END;
`;

export const createTable = async ({
  db,
  tableName,
  columns,
  crr = true,
  constraints = "",
  noID = false,
}: {
  db: any;
  tableName: string;
  columns: string;
  crr?: boolean;
  constraints?: string;
  noID?: boolean;
}) => {
  const primaryKey = noID ? "" : "id PRIMARY KEY NOT NULL, ";
  const timestamps = `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
                      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
                      updates INT DEFAULT 0`;
  const fullConstraints = constraints ? `, ${constraints}` : "";

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${primaryKey}${columns}, 
      ${timestamps}${fullConstraints}
    )
  `;

  await db.exec(createTableQuery);
  await db.exec(updatedAtTrigger(tableName));

  if (crr) {
    const enableCrrQuery = `SELECT crsql_as_crr('${tableName}')`;
    await db.exec(enableCrrQuery);
  }
};

export const createIndex = async ({
  db,
  tableName,
  indexName,
  fields,
}: {
  db: any;
  tableName: string;
  indexName: string;
  fields: string;
}) => {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_${tableName}_${indexName}
    ON ${tableName} (${fields})
  `;

  await db.exec(createIndexQuery);
};

const migrations = [
  async function first() {
    await db.exec("PRAGMA recursive_triggers = 1");
    await createTable({
      db,
      tableName: "kv",
      columns: "value",
    });
    await createTable({
      db,
      tableName: "groups",
      columns: "active INT DEFAULT TRUE",
    });
  },
  async function second() {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS change_keys (id PRIMARY KEY NOT NULL)`,
    );
  },
];

const groupMigrations = [
  async function first(groupDB: any) {
    await groupDB.exec("PRAGMA recursive_triggers = 1");
    await createTable({
      db: groupDB,
      tableName: "kv",
      columns: "value",
    });
    await createTable({
      db: groupDB,
      tableName: "members",
      columns: "name, site_id",
    });
    await createTable({
      db: groupDB,
      tableName: "transactions",
      columns: "type, description, split_type, data, created_by, updated_by",
    });
  },
  async function second(groupDB: any) {
    await createTable({
      db: groupDB,
      tableName: "activity",
      columns: "data, by",
    });
  },
];

const runMigrations = async (groupDB: any = db) => {
  let [{ user_version } = { user_version: 0 }] = await groupDB.execO(
    "PRAGMA user_version",
  );
  const migrationsToRun = groupDB === db ? migrations : groupMigrations;
  while (user_version < migrationsToRun.length) {
    await migrationsToRun[user_version]?.(groupDB);
    user_version++;
    await groupDB.exec(`PRAGMA user_version = ${user_version}`);
  }
};

export const wipeData = async () => {
  if (db) {
    try {
      await db.close();
    } catch {}
  }
  for (const groupDB of Object.values(groupDBs)) {
    try {
      await groupDB.close();
    } catch {}
  }
  localStorage.clear();
  const databases = await indexedDB.databases();
  for (const database of databases) {
    indexedDB.deleteDatabase(database.name as string);
  }
};

export const dbInit = async () => {
  // await wipeData();
  sqlite = await initWasm(() => wasmUrl);
  db = await sqlite.open("peersplit-main");
  await runMigrations();
  resolves.forEach((res) => res(db));
  const activeGroups = await db.execO("SELECT id FROM groups WHERE active = 1");
  for (const group of activeGroups) {
    await initGroupDb(group.id);
  }
};

export const getDB = () => {
  if (db) return db;
  return new Promise((res) => resolves.push(res));
};

export const getGroupDB = (id: string) => {
  if (groupDBs[id]) return groupDBs[id];
  groupResolves[id] ||= [];
  return new Promise((res) => groupResolves[id].push(res));
};

export const initGroupDb = async (id: string) => {
  if (!groupDBs[id]) {
    groupDBs[id] = await sqlite.open(`peersplit-${id}`);
    await runMigrations(groupDBs[id]);
    (groupResolves[id] || []).forEach((res) => res(db));
  }
  return groupDBs[id];
};

export const getActivity = async (tx, id) => {
  const [activity] = await tx.execO("SELECT * FROM activity WHERE id = ?", [
    id,
  ]);
  if (activity.data) {
    try {
      activity.data = JSON.parse(activity.data);
    } catch {}
  }
  return activity;
};

export const setGroupCurrency = async (
  id: string,
  currency: string,
  by?: string,
) => {
  const groupDB = await initGroupDb(id);
  let activity;
  await groupDB.tx(async (tx: any) => {
    const [{ value } = { value: "" }] = await tx.execO(
      "SELECT value FROM kv WHERE id = ?",
      ["currency"],
    );
    await tx.exec(
      "INSERT OR REPLACE INTO kv (id, value) VALUES ('currency', ?)",
      [currency],
    );
    const activityID = nanoid();
    await tx.exec("INSERT INTO activity (id, data, by) VALUES (?, ?, ?)", [
      activityID,
      JSON.stringify({
        type: "update_currency",
        prev: value,
        cur: currency,
      }),
      by || "",
    ]);
    activity = await getActivity(tx, activityID);
  });
  return activity;
};

export const setGroupName = async (id: string, name: string, by?: string) => {
  const groupDB = await initGroupDb(id);
  let activity;
  await groupDB.tx(async (tx: any) => {
    const [{ value } = { value: "" }] = await tx.execO(
      "SELECT value FROM kv WHERE id = ?",
      ["name"],
    );
    await tx.exec("INSERT OR REPLACE INTO kv (id, value) VALUES ('name', ?)", [
      name,
    ]);
    const activityID = nanoid();
    await tx.exec("INSERT INTO activity (id, data, by) VALUES (?, ?, ?)", [
      activityID,
      JSON.stringify({
        type: "update_name",
        prev: value,
        cur: name,
      }),
      by || "",
    ]);
    activity = await getActivity(tx, activityID);
  });
  return activity;
};

export const createGroup = async (name: string, currency: string) => {
  const id = nanoid(32);
  const groupDB = await createEmptyGroup(id);
  await setGroupName(id, name);
  await setGroupCurrency(id, currency);
  const siteID = await getSiteID(groupDB);
  await groupDB.exec(
    "INSERT INTO members (id, name, site_id) VALUES (?, ?, ?)",
    [nanoid(), useName().value, siteID],
  );
  const group = await updateGroup(id);
  await createGroupUser(id);
  listenGroup(group).then(() => {
    pushChanges(group);
  });
  return id;
};

export const createEmptyGroup = async (id: string) => {
  await db.exec("INSERT INTO groups (id) VALUES (?)", [id]);
  return await initGroupDb(id);
};

export const getSiteID = async (db: any) => {
  const [{ site_id }] = await db.execO(
    "SELECT hex(crsql_site_id()) AS site_id",
  );
  return site_id;
};

export const getGroup = async (id: string) => {
  let myID;
  const groupDB = groupDBs[id];
  if (!groupDB) return null;
  const mySiteID = await getSiteID(groupDB);
  const kv = await groupDB.execO("SELECT id, value FROM kv");
  const transactionsList = await groupDB.execO(
    "SELECT * FROM transactions ORDER BY created_at ASC",
  );
  const activityList = await groupDB.execO(
    "SELECT * FROM activity ORDER BY created_at ASC",
  );
  activityList.forEach((activity) => {
    try {
      activity.data = JSON.parse(activity.data);
    } catch {}
  });
  const transactions = {};
  transactionsList.forEach((transaction) => {
    const { payers, splitters } = JSON.parse(transaction.data);
    transactions[transaction.id] = {
      id: transaction.id,
      description: transaction.description,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      payers: payers,
      splitters: splitters,
      type: transaction.type,
      splitType: transaction.split_type,
    };
  });
  const transactionOrder = transactionsList.map(
    (transaction) => transaction.id,
  );
  const membersList = await groupDBs[id].execO(
    "SELECT id, site_id, name FROM members",
  );
  const members: Record<string, any> = {};
  membersList.forEach((member: any) => {
    // TODO: support multiple sites per user
    if (member.site_id === mySiteID) {
      myID = member.id;
    }
    members[member.id] = {
      id: member.id,
      siteID: member.site_id,
      name: member.name,
    };
  });
  const group = {
    id,
    myID,
    mySiteID,
    name: "Unnamed Group",
    transactions,
    transactionOrder,
    activityList,
    members,
  };
  for (const obj of kv) {
    if (obj.value) {
      group[obj.id] = obj.value;
    }
  }
  return group;
};

export const getGroups = async (): Promise<
  Record<
    string,
    {
      id: string;
      myID: string;
      name: string;
      transactions: Record<string, any>;
      transactionOrder: string[];
      members: Record<string, any>;
    }
  >
> => {
  const groupsIDs = await db.execO("SELECT id FROM groups");
  const groups: Record<string, any> = {};
  await Promise.all(
    groupsIDs.map(async ({ id }: any) => {
      const group = await getGroup(id);
      groups[group.id] = group;
    }),
  );
  return groups;
};

export const applyChangesForGroup = async (groupID: any, changes: any[]) => {
  if (changes.length === 0) return;
  const db = await getGroupDB(groupID);
  await db.tx(async (tx: any) => {
    for (const change of changes) {
      // TODO: apply some filter to not apply delete changes?
      // i don't know, i'll worry about extra security later
      // for now, all damage will only be done to the group
      await tx.exec(
        "INSERT INTO crsql_changes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        change.map((c: any) => {
          if (c?.v) {
            return new Uint8Array(c.v.split(","));
          }
          return c;
        }),
      );
    }
  });
  updateGroup(groupID);
};

export const getGroupChanges = async (groupID: string, index: number) => {
  const db = await getGroupDB(groupID);
  const siteID = await getSiteID(db);
  const changes = await db.execA(
    "SELECT * FROM crsql_changes WHERE db_version > ? AND hex(site_id) = ?",
    [index, siteID],
  );
  return [
    changes.map((c) => {
      return c.map((cc) => {
        if (cc && typeof cc === "object") {
          return { v: cc.join(",") };
        }
        return cc;
      });
    }),
    changes.reduce((a, b) => Math.max(a, b[5]), -1),
  ];
};

export const checkChange = async (id: string) => {
  const db = await getDB();
  const [change] = await db.execO("SELECT * FROM change_keys WHERE id = ?", [
    id,
  ]);
  return !!change;
};

export const insertChange = async (id: string) => {
  const db = await getDB();
  await db.exec("INSERT INTO change_keys (id) VALUES (?)", [id]);
};

export const importSplitwise = async (groupID, myID, members, transactions) => {
  const db = await getGroupDB(groupID);
  const membersIDs = [];
  await db.tx(async (tx: any) => {
    for (const member of members) {
      const m = { id: nanoid(), name: member };
      membersIDs.push(m.id);
      await tx.exec(`INSERT INTO members (id, name) VALUES (?, ?)`, [
        m.id,
        m.name,
      ]);
    }
    for (const transaction of transactions) {
      const payers = {};
      const splitters = {};
      transaction.slice(5).forEach((v, index) => {
        const val = Number(v);
        if (val > 0) {
          payers[membersIDs[index]] = round(val);
        }
        if (val < 0) {
          splitters[membersIDs[index]] = round(-val);
        }
      });
      const [date, description] = transaction;
      const isPayment =
        description.includes("paid") &&
        transaction
          .slice(5)
          .map((v) => Number(v))
          .filter((v) => v !== 0).length === 2; // only two people involved
      const createdAt = moment(date).utc().format("YYYY-MM-DD HH:mm:ss");
      await tx.exec(
        `INSERT INTO transactions (id, type, description, split_type, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          nanoid(),
          isPayment ? "payment" : "expense",
          description,
          2, // split by amount
          JSON.stringify({
            payers,
            splitters,
          }),
          createdAt,
        ],
      );
    }
    await tx.exec("INSERT INTO activity (id, data, by) VALUES (?, ?, ?)", [
      nanoid(),
      JSON.stringify({
        type: "import_splitwise",
        members: members.length,
        transactions: transactions.length,
      }),
      myID || "",
    ]);
  });
  await updateGroup(groupID);
  await pushChanges(useGroups().getGroupByID(groupID));
};
