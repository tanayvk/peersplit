import { nanoid } from "nanoid";
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

export const clean = async () => {
  localStorage.clear();
  const databases = await indexedDB.databases();
  for (const database of databases) {
    indexedDB.deleteDatabase(database.name as string);
  }
};

export const dbInit = async () => {
  // await clean();
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

export const setGroupCurrency = async (id: string, currency: string) => {
  const groupDB = await initGroupDb(id);
  await groupDB.exec(
    "INSERT OR REPLACE INTO kv (id, value) VALUES ('currency', ?)",
    [currency],
  );
};

export const setGroupName = async (id: string, name: string) => {
  const groupDB = await initGroupDb(id);
  await groupDB.exec(
    "INSERT OR REPLACE INTO kv (id, value) VALUES ('name', ?)",
    [name],
  );
};

export const createGroup = async (name: string, currency: string) => {
  const id = nanoid();
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
    "SELECT id, description, created_at, updated_at, type, split_type, data FROM transactions ORDER BY created_at ASC",
  );
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
