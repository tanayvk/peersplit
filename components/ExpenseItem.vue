<template>
  <div class="px-3 py-2 flex gap-3 bg-gray-100 dark:bg-gray-800">
    <div class="flex-grow flex justify-between items-center">
      <div v-if="expense.type === 'expense'" class="flex flex-col">
        <div class="gap-1 flex items-center pb-1">
          <span>{{ expense.description }}</span>
          <span class="text-sm text-primary-600/80 dark:text-primary-300/80"
            >&middot; {{ moment(expense.created_at).format("MMM DD") }}</span
          >
        </div>
        <span
          v-for="[payer, val] in Object.entries(expense.payers)"
          class="text-sm font-light"
          >{{ payer === myID ? "You" : payer }} paid ${{ val }}</span
        >
      </div>
      <div v-else>
        {{
          Object.keys(expense.payers)[0] === myID
            ? "You"
            : Object.keys(expense.payers)[0]
        }}
        paid
        {{ Object.keys(expense.splitters)[0] }}
      </div>
      <span :class="['text-xl', getColorForValue(value)]"
        >${{ Math.abs(value) }}</span
      >
    </div>
  </div>
</template>

<script setup>
import moment from "moment";
const { expense } = defineProps(["expense"]);
const { myID } = useGroups().getGroupByID(useRoute().params.group_id);
const value = computed(() => {
  const computedExpense = computeTransaction(expense);
  return (
    (computedExpense.payers[myID] || 0) - (computedExpense.splits[myID] || 0)
  );
});
</script>
