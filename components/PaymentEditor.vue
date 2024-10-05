<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium">Record Payment</span>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-2">
      <UFormGroup label="Paid By">
        <USelectMenu
          v-model="paidBy"
          value-attribute="id"
          option-attribute="name"
          placeholder="Select member"
          :options="members"
        />
      </UFormGroup>
      <UFormGroup label="Paid To">
        <USelectMenu
          v-model="paidTo"
          value-attribute="id"
          option-attribute="name"
          placeholder="Select member"
          :options="members"
        />
      </UFormGroup>
      <UFormGroup label="Amount">
        <UInput placeholder="ex: 340.5" />
      </UFormGroup>
    </div>
    <template #footer>
      <div class="flex gap-2">
        <UButton :loading="adding" variant="outline">Record</UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup>
const adding = ref(false),
  paidBy = ref(null),
  paidTo = ref(null);
const members = ["Tanay", "John", "Jane"].map((x) => ({ id: x, name: x }));
</script>
