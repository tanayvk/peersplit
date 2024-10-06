<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium">Add Members</span>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-2"></div>
    <template #footer>
      <div class="flex gap-2">
        <UButton variant="outline">Add Expense</UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup></script>
