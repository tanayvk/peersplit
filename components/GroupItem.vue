<template>
  <UCard
    class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-950"
    :ui="{
      body: { padding: 'py-2' },
      rounded: 'rounded-none',
      shadow: 'shadow-none',
    }"
    @click="go(group.id)"
  >
    <div class="flex items-center space-y-2">
      <div
        class="text-2xl font-medium text-primary-700 dark:text-primary-300 flex-grow"
      >
        {{ group.name }}
      </div>
      <div v-if="balance > 0" class="flex flex-col items-end">
        <span class="text-xs">You are owed</span>
        <span class="text-xl color-positive"
          >{{ useGroups().getGroupCurrency(group.id) }}{{ balance }}</span
        >
      </div>
      <div v-if="balance < 0" class="flex flex-col items-end">
        <span class="text-xs">You owe</span>
        <span class="text-xl color-negative"
          >{{ useGroups().getGroupCurrency(group.id) }}{{ -balance }}</span
        >
      </div>
    </div>
  </UCard>
</template>

<script setup>
const { group } = defineProps(["group"]);
const balance = computed(() => groupGetMyBalance(group));
async function go(id) {
  navigateToGroup(id);
}
</script>
