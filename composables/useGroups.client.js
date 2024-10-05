import { defineStore } from "pinia";

export const useGroups = defineStore("groups", {
  state: () => ({
    loading: true,
    groups: {},
    currentGroup: null,
  }),
  actions: {
    setGroups(groups) {
      this.groups = groups;
      this.loading = false;
    },
  },
  getters: {
    groupsList(state) {
      return Object.values(state.groups);
    },
    getGroupByID(state) {
      return (id) => state.groups[id];
    },
  },
});

export const updateGroups = async () => {
  useGroups().setGroups(await getGroups());
};
