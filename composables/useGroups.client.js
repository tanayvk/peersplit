import moment from "moment";
import { defineStore } from "pinia";

// group
// {
//   id
//   name
//   transactionOrder
//   transactions
//   myID
//   members
// }
//
// transaction
// {
//   id
//   description
//   created_at
//   updated_at
//   payers
//   splitters
//   splits // computed
//   type
//   splitType
//   totalCost // computed
// }

export const groupGetMyBalance = (group) => {
  const balances = groupGetBalances(group);
  return balances[group.myID];
};

export const computeTransaction = (transaction) => {
  const totalCost = Object.values(transaction.payers).reduce(
    (a, b) => Number(a) + Number(b),
    0,
  );
  const totalSplit = Object.values(transaction.splitters).reduce(
    (a, b) => Number(a) + Number(b),
    0,
  );
  const splits = { ...transaction.splitters };
  const members = Object.keys(splits);
  members.sort();
  for (const split of Object.keys(splits)) {
    // split equally
    if (transaction.splitType === 1) {
      splits[split] = totalCost / members.length;
    } else {
      splits[split] = totalCost * splits[split];
      splits[split] /= totalSplit;
    }
    // TODO: make sure all amounts in transactions are sanitized to 2 decimal places
  }
  const newTotalSplit = Object.values(splits).reduce(
    (a, b) => Number(a) + Number(b),
    0,
  );
  if (members[0]) {
    const diff = totalCost - newTotalSplit;
    if (diff > 0) {
      splits[members[0]] += diff;
    }
  }
  return {
    ...transaction,
    totalCost,
    splits,
  };
};

export const groupGetBalances = (group) => {
  const balances = {};
  for (const member of Object.keys(group.members || {})) {
    balances[member] = 0;
  }
  for (const transaction of Object.values(group.transactions || {})) {
    const computedTrasaction = computeTransaction(transaction);
    for (const [payer, value] of Object.entries(computedTrasaction.payers)) {
      balances[payer] ||= 0;
      balances[payer] += Number(value);
    }
    for (const [splitter, value] of Object.entries(computedTrasaction.splits)) {
      balances[splitter] ||= 0;
      balances[splitter] -= Number(value);
    }
  }
  return balances;
};

export const groupGetPayments = (group) => {
  const payments = [];
  const balances = Object.entries(groupGetBalances(group)).map(([a, b]) => [
    b,
    a,
  ]);
  balances.sort();
  console.log("wtf", balances);
  let i = 0,
    j = balances.length - 1;
  while (i < j) {
    if (balances[i][0] === 0) {
      i++;
    } else if (balances[j][0] === 0) {
      j--;
    } else if (-balances[i][0] > balances[j][0]) {
      payments.push({
        from: balances[i][1],
        to: balances[j][1],
        value: balances[j][0],
      });
      balances[i][0] += balances[j][0];
      balances[j][0] = 0;
    } else {
      payments.push({
        from: balances[i][1],
        to: balances[j][1],
        value: -balances[i][0],
      });
      balances[j][0] += balances[i][0];
      balances[i][0] = 0;
    }
  }
  return payments;
};

export const useGroups = defineStore("groups", {
  state: () => ({
    loading: true,
    groups: {},
  }),
  actions: {
    setGroups(groups) {
      this.groups = groups;
      this.loading = false;
    },
    addTransaction(groupID, transaction) {
      const group = this.groups[groupID];
      group.transactions[transaction.id] = transaction;
      group.transactionOrder.push(transaction.id);
      // TODO: might need to optionally sort if we use this method for syncing also
    },
    updateTransaction(groupID, transaction) {
      const group = this.groups[groupID];
      group.transactions[transaction.id] = transaction;
    },
    deleteTransaction(groupID, transactionID) {
      const group = this.groups[groupID];
      delete group.transactions[transactionID];
      group.transactionOrder = group.transactionOrder.filter(
        (id) => id !== transactionID,
      );
    },
  },
  getters: {
    getGroupedTransactionsByGroupID(state) {
      return (groupID) => {
        const groups = [];
        let currentGroup = {};
        for (const transactionID of state.groups[groupID]?.transactionOrder ||
          []) {
          const transaction =
            state.groups[groupID]?.transactions?.[transactionID];
          if (transaction) {
            const month = moment(transaction.created_at).format("MMMM YYYY");
            if (month === currentGroup.month) {
              currentGroup.transactions.push(transaction);
            } else {
              currentGroup = {
                month,
                transactions: [transaction],
              };
              groups.push(currentGroup);
            }
          }
        }
        return groups;
      };
    },
    groupsList(state) {
      return Object.values(state.groups);
    },
    getGroupByID(state) {
      return (id) => state.groups[id];
    },
    getBalancesByGroupID(state) {
      return (id) => {
        return groupGetBalances(this.getGroupByID(id));
      };
    },
    getPaymentsByGroupID(state) {
      return (id) => groupGetPayments(this.getGroupByID(id));
    },
  },
});
// TODO: can we make stuff slightly more performant
// by computing all group balances and payments together and caching them
// in the store???

export const updateGroups = async () => {
  useGroups().setGroups(await getGroups());
};
