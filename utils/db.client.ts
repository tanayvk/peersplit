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
      columns: "name",
    });
    await createTable({
      db: groupDB,
      tableName: "transactions",
      columns: "description, split_type",
    });
    await createTable({
      db: groupDB,
      tableName: "transaction_data",
      columns: "transaction_id, member_id, type, value, amount",
    });
    await createIndex({
      db: groupDB,
      tableName: "transaction_data",
      indexName: "by_transaction",
      fields: "transaction_id",
    });
    await createIndex({
      db: groupDB,
      tableName: "transaction_data",
      indexName: "by_member",
      fields: "member_id",
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
  const databases = await indexedDB.databases();
  for (const database of databases) {
    indexedDB.deleteDatabase(database.name as string);
  }
};

export const dbInit = async () => {
  // await clean(); // Optional: Clean previous databases
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

export const setGroupName = async (id: string, name: string) => {
  const groupDB = await initGroupDb(id);
  await groupDB.exec(
    "INSERT OR REPLACE INTO kv (id, value) VALUES ('name', ?)",
    [name],
  );
};

export const createGroup = async (name: string) => {
  const id = nanoid();
  await db.exec("INSERT INTO groups (id) VALUES (?)", [id]);
  await initGroupDb(id);
  await setGroupName(id, name);
  await updateGroups();
  return id;
};

export const getGroups = async (): Promise<
  Record<string, { id: string; name: string }>
> => {
  const groupsIds = await db.execO("SELECT id FROM groups");
  const groups: Record<string, any> = {};
  await Promise.all(
    groupsIds.map(async (group: { id: string }) => {
      const [{ value: name } = { value: "" }] = await groupDBs[group.id].execO(
        "SELECT value FROM kv WHERE id = 'name'",
      );
      groups[group.id] = {
        id: group.id,
        name: name || "Unnamed Group",
        balance: -200,
      };
    }),
  );
  return groups;
};
