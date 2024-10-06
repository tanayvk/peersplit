import { defineStore } from "pinia";

export const useSettings = defineStore("settings", {
  state: () => ({
    loading: true,
    name: "",
  }),
  actions: {
    setGroups(groups) {
      this.groups = groups;
      this.loading = false;
    },
  },
  getters: {
    groupedTransactions(state) {
      return [
        {
          month: "November 2024",
          transactions: [
            {
              description: "Rent",
              payers: { John: 40 },
              splitters: { John: 20, Tanay: 20 },
              created_at: new Date(),
              type: "expense",
              splitType: "Split Equally",
            },
            {
              description: "Groceries",
              payers: { John: 40 },
              splitters: { John: 20, Tanay: 20 },
              created_at: new Date(),
              splitType: "Split Equally",
            },
          ],
        },
      ];
    },
    groupsList(state) {
      return Object.values(state.groups);
    },
    getGroupByID(state) {
      return (id) => state.groups[id];
    },
  },
});

export const updateSettings = async () => {
  useGroups().setGroups(await getGroups());
};
