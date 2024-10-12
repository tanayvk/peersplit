<template>
  <div
    class="hover:bg-primary-200/40 dark:hover:bg-primary-800/20 p-4 cursor-pointer text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 [&:not(:last-child)]:border-b-0"
  >
    <!-- Displaying Member Name -->
    <span class="font-medium text-primary-500 dark:text-primary-400">
      {{ useGroups().getMemberName(item.groupID, item.by) || "Someone" }}
    </span>

    <!-- Activity Messages -->
    <span v-if="item.data.type === 'update_currency'">
      updated the group
      <span class="font-medium">{{ groupName }}</span
      >'s currency from <span class="font-medium">{{ item.data.prev }}</span> to
      <span class="font-medium">{{ item.data.cur }}</span
      >.
    </span>

    <span v-if="item.data.type === 'update_name'">
      updated the group
      <span class="font-medium">{{ groupName }}</span
      >'s name from <span class="font-medium">{{ item.data.prev }}</span> to
      <span class="font-medium">{{ item.data.cur }}</span
      >.
    </span>

    <!-- Transaction Updates -->
    <span
      v-if="
        item.data.type === 'update_transaction' &&
        item.data.cur?.type === 'expense'
      "
    >
      updated the expense
      <span class="font-medium">{{ transactionTitle }}</span> in
      <span class="font-medium">{{ groupName }}</span
      >.
    </span>

    <span
      v-if="
        item.data.type === 'update_transaction' &&
        item.data.cur?.type === 'payment'
      "
    >
      updated the payment
      <span class="font-medium">{{ transactionTitle }}</span> in
      <span class="font-medium">{{ groupName }}</span
      >.
    </span>

    <!-- Transaction Deletions -->
    <span
      v-if="
        item.data.type === 'delete_transaction' &&
        item.data.prev?.type === 'expense'
      "
    >
      deleted the expense
      <span class="font-medium">{{ transactionTitle }}</span> in
      <span class="font-medium">{{ groupName }}</span
      >.
    </span>

    <span
      v-if="
        item.data.type === 'delete_transaction' &&
        item.data.prev?.type === 'payment'
      "
    >
      deleted the payment
      <span class="font-medium">{{ transactionTitle }}</span> in
      <span class="font-medium">{{ groupName }}</span
      >.
    </span>

    <!-- New Transactions -->
    <span
      v-if="
        item.data.type === 'create_transaction' &&
        item.data.cur?.type === 'expense'
      "
    >
      added an expense
      <span class="font-medium">{{ transactionTitle }}</span> in
      <span class="font-medium">{{ groupName }}</span
      >.
    </span>

    <span
      v-if="
        item.data.type === 'create_transaction' &&
        item.data.cur?.type === 'payment'
      "
    >
      recorded a payment
      <span class="font-medium">{{ transactionTitle }}</span> in
      <span class="font-medium">{{ groupName }}</span
      >.
    </span>

    <!-- Timestamp -->
    <div class="text-sm text-gray-600/50 dark:text-gray-300/50">
      {{ moment.utc(item.created_at).fromNow() }}
    </div>
  </div>
</template>

<script setup>
import moment from "moment";

const { item } = defineProps(["item"]);

const group = computed(() => useGroups().getGroupByID(item.groupID));
const groupName = computed(() => group.value?.name);
const transactionTitle = computed(() => {
  const transaction = item.data.cur || item.data.prev;
  if (!transaction) return "";
  if (transaction.type === "expense") {
    return transaction.description;
  } else {
    if (transaction.data) {
      const { payers, splitters } = JSON.parse(transaction.data);
      transaction.payers = payers;
      transaction.splitters = splitters;
    }
    const from = Object.keys(transaction.payers)?.[0];
    const value = Object.values(transaction.payers)?.[0];
    const to = Object.keys(transaction.splitters)?.[0];
    return `${group.value.members[from]?.name} 🡒 ${group.value.members[to]?.name} (${group.value.currency}${value})`;
  }
});
</script>
