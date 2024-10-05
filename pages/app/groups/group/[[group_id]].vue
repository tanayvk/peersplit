<template>
  <div class="flex flex-col gap-2 h-full px-2">
    <div class="h-12 flex justify-between items-center gap-2">
      <UButton
        to="/app/groups"
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="gray"
        square
      />
      <span class="text-center font-medium text-lg">{{
        getGroupByID(groupID)?.name
      }}</span>
      <UButton icon="i-heroicons-user-plus" variant="ghost" color="gray" />
      <!-- <UButton
        disabled
        icon="i-heroicons-cog-6-tooth"
        variant="ghost"
        color="gray"
      /> -->
    </div>
    <UCard
      ><div class="flex flex-col gap-1">
        <span class="flex items-center gap-2"
          >You are owed <span class="text-2xl text-lime-500">$3500</span></span
        >
        <div>
          <span class="flex items-center gap-2 text-sm"
            >- Tanay owes you
            <span class="text-md text-lime-500">$3500</span></span
          >
        </div>
      </div></UCard
    >
    <div class="w-full flex text-center gap-2">
      <div class="flex-grow">
        <UButton block>Add Expense</UButton>
      </div>
      <div class="flex-grow">
        <UButton block variant="outline">Record Payment</UButton>
      </div>
    </div>
    <div class="space-y-1">
      <span class="text-lg">October 2024</span>
      <div
        v-for="_ in [1, 2]"
        class="px-3 py-2 flex gap-3 bg-gray-100 dark:bg-gray-800"
      >
        <!-- <div class="flex flex-col items-center font-light">
          <span class="text-xs">Oct</span>
          <span class="text-sm">05</span>
        </div> -->
        <div class="flex-grow flex justify-between items-center">
          <div class="flex flex-col">
            <div class="gap-1 flex items-center pb-1">
              <span>Rent</span>
              <span class="text-sm text-primary-600/80 dark:text-primary-300/80"
                >&middot; Oct 05</span
              >
            </div>
            <span class="text-sm font-light">You paid $300</span>
            <span class="text-sm font-light">Tanay paid $40</span>
          </div>
          <span class="text-xl text-lime-500">$340</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const groupID = useRoute().params.group_id;
// TODO: handle loading states
const { getGroupByID, loading } = storeToRefs(useGroups());
</script>
