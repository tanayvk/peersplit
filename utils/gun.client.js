import Gun from "gun/gun";
import "gun/sea.js";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";
import "gun/lib/webrtc";

const newGun = () =>
  Gun({
    peers: ["https://gun-manhattan.herokuapp.com/gun"],
    localStorage: false,
  });

export const initGun = async () => {
  const groups = await getGroups();
  for (const group of Object.values(groups)) {
    try {
      listenGroup(group).then(() => {
        pushChanges(group);
      });
    } catch (err) {
      console.log("err", err);
    }
  }
};

const getCredsFromGroupID = (groupID) => {
  const length = groupID.length;
  return [groupID.slice(0, length / 2), groupID.slice(length / 2)];
};

export const createGroupUser = (groupID) =>
  new Promise((res) => {
    let mygun = newGun();
    let u = mygun.user();
    const [alias, pass] = getCredsFromGroupID(groupID);
    u.create(alias, pass, () => {
      u.auth(alias, pass, ({ err }) => {
        if (err) {
          rej(err);
        }
      });
      mygun.on("auth", () => {
        groupGuns[groupID] = [u];
        res(groupGuns[groupID]);
      });
    });
  });

export const authUser = (alias, pass) =>
  new Promise((res, rej) => {
    let mygun = newGun();
    let user = mygun.user();
    user.auth(alias, pass, ({ err }) => {
      if (err) {
        rej(err);
      }
    });
    mygun.on("auth", () => {
      res([user]);
    });
  });

const groupGuns = {};
const getGroupGun = async (groupID) => {
  // TODO: use group secret
  if (groupGuns[groupID]) return groupGuns[groupID];
  const [alias, pass] = getCredsFromGroupID(groupID);
  return (groupGuns[groupID] = await authUser(alias, pass));
};

export async function listenGroup(group) {
  const [g] = await findGroupAsync(group.id, 5);
  g.get("changes")
    .map()
    .on(
      async (data, key) => {
        const id = `${group.id}.${key}`;
        const match = data.match(/(^\((.*)\))?([\S\s]*)/);
        const [peer, json] = [match[2], match[3]];
        if (peer !== group.mySiteID && !(await checkChange(id))) {
          applyChanges(group, JSON.parse(json));
          insertChange(id);
        }
      },
      { change: true },
    );
}

const setObj = (g, key, obj) =>
  new Promise((res) => {
    g.get(key).set(obj, res);
  });

const putObj = (g, key, obj) =>
  new Promise((res) => {
    g.get(key).put(obj, res);
  });

const getObj = (g, key) =>
  new Promise((res) => {
    g.get(key).once((v) => {
      res(v);
    });
  });

const groupChanges = {};
const groupApplyChangesTimeouts = {};
const groupChangeListeners = {};

async function applyChanges(group, changes) {
  const groupID = group.id;
  groupChanges[groupID] ||= [];
  groupChanges[groupID].push(changes);
  if (groupApplyChangesTimeouts[groupID])
    clearTimeout(groupApplyChangesTimeouts[groupID]);
  groupApplyChangesTimeouts[groupID] = setTimeout(async () => {
    const changes = groupChanges[groupID].flat();
    groupChanges[groupID] = [];
    await applyChangesForGroup(group.id, changes);
    if (groupChangeListeners[groupID]) {
      for (const f of groupChangeListeners[groupID]) {
        f?.();
      }
      groupChangeListeners[groupID] = [];
    }
  }, 500);
}

export async function pushChanges(group) {
  // TODO: wait for gun init?
  const groupID = group.id;
  const peer = group.mySiteID;
  const [g] = await findGroupAsync(groupID, 5);
  if (!g) return;
  const current = (await getObj(g.get("count"), peer)) || -1;
  const [changes, maxChange] = await getGroupChanges(groupID, Number(current));
  if (changes.length > 0) {
    await setObj(g, "changes", `(${peer})` + JSON.stringify(changes));
    await putObj(g.get("count"), peer, maxChange);
  }
}

const findGroupAsync = async (
  groupID,
  maxRetries,
  cancel = { value: false },
) => {
  let retries = 0;
  while (
    !cancel.value &&
    (typeof maxRetries !== "number" || retries < maxRetries)
  ) {
    try {
      return await getGroupGun(groupID);
    } catch {
      retries++;
      await new Promise((res) => setTimeout(res, 300));
    }
  }
};

export const findGroup = (groupID) => {
  let cancel = { value: false };
  return [cancel, findGroupAsync(groupID, undefined, cancel)];
};

export const groupOnApply = (groupID, onApply) => {
  groupChangeListeners[groupID] ||= [];
  groupChangeListeners[groupID].push(onApply);
};
