<template>
  <div v-if="useRoute().name === 'app-groups'" class="px-3 pt-5 space-y-4">
    <UButton variant="solid" icon="i-heroicons-plus" size="lg" class="w-full"
      >Create Group</UButton
    >
    <div class="space-y-2">
      <UCard
        v-for="group in groups"
        class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-950"
        :ui="{
          body: { padding: 'py-2' },
          rounded: 'rounded-none',
          shadow: 'shadow-none',
        }"
        @click="navigateTo(`/app/groups/group/${group.id}`)"
      >
        <div class="flex items-center space-y-2">
          <div
            class="text-2xl font-medium text-primary-700 dark:text-primary-300 flex-grow"
          >
            {{ group.name }}
          </div>
          <div v-if="group.balance > 0" class="flex flex-col items-end">
            <span class="text-xs">You owe</span>
            <span class="text-xl text-lime-500">${{ group.balance }}</span>
          </div>
          <div v-if="group.balance < 0" class="flex flex-col items-end">
            <span class="text-xs">You are owed</span>
            <span class="text-xl text-red-400">${{ -group.balance }}</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
  <NuxtPage v-else />
</template>

<script setup>
const groups = [
  { name: "Group 1", balance: 3532, id: "asdf" },
  { name: "Group 2", balance: -32, id: "fdsa" },
];
</script>
