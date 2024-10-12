<template>
  <div class="h-full flex flex-col">
    <div class="p-4 text-xl font-medium">Activity Logs</div>
    <div class="flex-grow overflow-y-scroll">
      <ActivityItem v-for="item in activity" :item="item" />
    </div>
  </div>
</template>

<script setup>
const activity = storeToRefs(useGroups()).getAllActivity;
</script>
