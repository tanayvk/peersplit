import Gun from "gun/gun";
import SEA from "gun/sea.js";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";
import "gun/lib/webrtc";
import { nanoid } from "nanoid";

let gun;

export const initGun = async () => {
  gun = Gun({
    peers: ["https://gun-manhattan.herokuapp.com/gun"],
    localStorage: false,
  });
  const groups = await getGroups();
  for (const group of Object.values(groups)) {
    await listen(group);
    break;
  }
};

export const createUser = (alias, pass) =>
  new Promise((res) => {
    gun.user().create(alias, pass, res);
  });

export const authUser = (alias, pass) =>
  new Promise((res) => {
    gun.user().auth(alias, pass, res);
  });

export const getStart = (groupID, peer) =>
  localStorage.getItem(`${groupID}.${peer}`) || "start";

export const updateStart = (groupID, peer, start) =>
  localStorage.setItem(`${groupID}.${peer}`, start);

const listening = {};

const getGroupGun = (groupID) => {
  // TODO: use group secret
  // return await authUser(groupID, groupID);
  return gun.get("tanaytwo");
};

async function listen(group) {
  const g = getGroupGun(group.id);
  g.get("peers")
    .map()
    .on((peer) => {
      if (typeof peer === "string" && !listening[group.id]?.[peer]) {
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
    await applyChangesForGroup(group.id, obj.changes);
  }
}

export async function pushChanges(groupID, peer, changes) {
  // TODO: wait for gun init?
  const g = getGroupGun(groupID);
  const newID = nanoid();
  await putObj(g.get(peer), newID, { changes });
  const current = getStart(groupID, peer);
  await putObj(g.get(peer), current, { next: newID });
  updateStart(groupID, peer, newID);
}
