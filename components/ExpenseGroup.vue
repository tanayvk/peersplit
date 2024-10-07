<template>
  <span class="text-lg">{{ group.month }}</span>
  <ExpenseItem
    :expense="expense"
    v-for="expense in group.transactions"
    @edit="$emit('edit', expense)"
  />
</template>

<script setup>
const { group } = defineProps(["group"]);
</script>
