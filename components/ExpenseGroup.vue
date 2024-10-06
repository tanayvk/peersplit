<template>
  <span class="text-lg">{{ group.month }}</span>
  <ExpenseItem :expense="expense" v-for="expense in group.transactions" />
</template>

<script setup>
const { group } = defineProps(["group"]);
</script>
