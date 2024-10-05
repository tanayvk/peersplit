<template>
  <div class="px-3 py-2 flex gap-3 bg-gray-100 dark:bg-gray-800">
    <div class="flex-grow flex justify-between items-center">
      <div class="flex flex-col">
        <div class="gap-1 flex items-center pb-1">
          <span>{{ expense.description }}</span>
          <span class="text-sm text-primary-600/80 dark:text-primary-300/80"
            >&middot; {{ moment(expense.created_at).format("MMM DD") }}</span
          >
        </div>
        <span
          v-for="[payer, val] in Object.entries(expense.payers)"
          class="text-sm font-light"
          >{{ payer }} paid ${{ val }}</span
        >
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
const value = computed(
  () => (expense.payers["Tanay"] || 0) - (expense.splitters["Tanay"] || 0),
);
</script>
