import Gun from "gun/gun";
import SEA from "gun/sea.js";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";
import "gun/lib/webrtc";
import { nanoid } from "nanoid";

let gun;

const newGun = () =>
  Gun({
    peers: ["https://gun-manhattan.herokuapp.com/gun"],
    localStorage: false,
  });

export const initGun = async () => {
  gun = newGun();
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

export const createGroupUser = (groupID) =>
  new Promise((res) => {
    let mygun = newGun();
    let u = mygun.user();
    u.create(groupID, groupID, () => {
      u.auth(groupID, groupID, ({ err }) => {
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

export const getStart = (groupID, peer) =>
  localStorage.getItem(`${groupID}.${peer}`) || "-1";

export const updateStart = (groupID, peer, start) =>
  localStorage.setItem(`${groupID}.${peer}`, start);

const listening = {};

const groupGuns = {};
const getGroupGun = async (groupID) => {
  // TODO: use group secret
  if (groupGuns[groupID]) return groupGuns[groupID];
  return (groupGuns[groupID] = await authUser(groupID, groupID));
};

export async function listenGroup(group) {
  const [g] = await findGroupAsync(group.id, 5);
  const mySite = group.mySiteID;
  if (mySite) g.get("peers").set(mySite);
  window.g = g;
  g.get("peers")
    .map()
    .on((peer) => {
      if (
        typeof peer === "string" &&
        peer !== mySite &&
        !listening[group.id]?.[peer]
      ) {
        listening[group.id] ||= {};
        listening[group.id][peer] = true;
        listenPeer(g.get(peer), group, peer);
      }
    });
}

async function listenPeer(g, group, peer) {
  let current = getStart(group.id, peer);
  while (true) {
    const next = await waitForNext(g, current);
    await applyChanges(group, g, next);
    current = next;
    updateStart(group.id, peer, current);
  }
}

const waitForNext = (g, key) =>
  new Promise((res) => {
    g.get("data")
      .get(key)
      .on((value, _key, _msg, ev) => {
        if (value.next) {
          res(value.next);
          ev.off();
        }
      });
  });

const getObj = (g, key) =>
  new Promise((res) => {
    g.get("data")
      .get(key)
      .on((v, _k, _m, ev) => {
        if (v) res(v);
        ev.off();
      });
  });

const putObj = (g, key, obj) =>
  new Promise((res) => {
    g.get("data").get(key).put(obj, res);
  });

async function applyChanges(group, g, key) {
  const obj = await getObj(g, key);
  if (obj.changes) {
    await applyChangesForGroup(group.id, JSON.parse(obj.changes));
  }
}

export async function pushChanges(group) {
  // TODO: wait for gun init?
  const groupID = group.id;
  const [g] = await findGroupAsync(groupID, 5);
  if (!g) return;
  const current = getStart(groupID, group.mySiteID);
  const [peer, changes, maxChange] = await getGroupChanges(
    groupID,
    Number(current),
  );
  if (changes.length > 0) {
    const newID = maxChange.toString();
    await putObj(g.get(peer), newID, { changes: JSON.stringify(changes) });
    await putObj(g.get(peer), current, { next: newID });
    updateStart(groupID, peer, newID);
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
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
};

export const findGroup = (groupID) => {
  let cancel = { value: false };
  return [cancel, findGroupAsync(groupID, undefined, cancel)];
};
