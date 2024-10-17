<template>
  <div
    @click="$emit('edit')"
    class="px-3 py-2 flex gap-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
  >
    <div class="flex-grow flex justify-between items-center gap-2">
      <div v-if="expense.type === 'expense'" class="flex flex-col">
        <div class="gap-1 flex items-center pb-1">
          <span>{{ expense.description }}</span>
          <span class="text-sm text-primary-600/80 dark:text-primary-300/80"
            >&middot;
            {{ moment.utc(expense.created_at).format("MMM DD") }}</span
          >
        </div>
        <span
          v-for="[payer, val] in Object.entries(expense.payers)"
          class="text-sm font-light"
          >{{ useGroups().getMemberName(groupID, payer) }} paid
          {{ useGroups().getGroupCurrency(groupID) }}{{ val }}</span
        >
      </div>
      <div v-else>
        {{ useGroups().getMemberName(groupID, Object.keys(expense.payers)[0]) }}
        paid
        {{
          useGroups().getMemberName(
            groupID,
            Object.keys(expense.splitters)[0],
            true,
          )
        }}
        {{ useGroups().getGroupCurrency(groupID)
        }}{{ Object.values(expense.payers)[0] }}
        <span class="text-sm text-primary-600/80 dark:text-primary-300/80"
          >&middot; {{ moment.utc(expense.created_at).format("MMM DD") }}</span
        >
      </div>
      <span :class="['text-xl', getColorForValue(value)]"
        >{{ useGroups().getGroupCurrency(groupID) }}{{ Math.abs(value) }}</span
      >
    </div>
  </div>
</template>

<script setup>
import moment from "moment";
const groupID = useGroupID();
const { expense } = defineProps(["expense"]);
const myID = computed(() => {
  const { myID } = useGroups().getGroupByID(groupID);
  return myID;
});
const value = computed(() => {
  const computedExpense = computeTransaction(expense);
  return round(
    (computedExpense.payers[myID.value] || 0) -
      (computedExpense.splits[myID.value] || 0),
  );
});
</script>
