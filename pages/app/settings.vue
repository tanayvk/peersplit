<template>
  <div class="px-4 py-2 flex flex-col h-full">
    <div class="space-y-3 flex-grow">
      <SettingsName />
      <UFormGroup label="Color Mode">
        <DarkModeSwitch />
      </UFormGroup>
      <UAccordion :items="[{ label: 'Danger Zone', color: 'red' }]">
        <template #item>
          <UFormGroup label="Clear All Data">
            <UButton
              @click="confirmClear = true"
              label="Clear All Data"
              color="red"
              block
            />
          </UFormGroup>
        </template>
      </UAccordion>
    </div>
    <div class="text-center w-full py-4">
      <div class="flex gap-1 justify-center items-center">
        <UButton to="/" variant="link" class="p-0">PeerSplit</UButton>
        <span class="text-primary"> | </span>
        <UButton
          to="https://github.com/tanayvk/peersplit"
          variant="link"
          class="p-0"
          >GitHub</UButton
        >
      </div>
      <div class="dark:text-gray-400 space-x-1">
        <span>Made with</span
        ><UIcon class="text-rose-600" name="i-heroicons-heart-solid" /><span
          >by
          <UButton
            to="https://tanay.xyz"
            target="_blank"
            class="p-0"
            size="lg"
            variant="link"
            >Tanay Karnik</UButton
          ></span
        >
      </div>
    </div>
  </div>
  <UModal v-model="confirmClear">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">Permanently Delete All Data</span>
          <UButton
            @click="confirmClear = false"
            variant="ghost"
            color="gray"
            icon="i-heroicons-x-mark"
          />
        </div>
      </template>
      <div class="space-y-3">
        <UAlert
          description="This will erase all your groups and transactions. This action cannot be undone."
          color="red"
          variant="subtle"
          icon="i-heroicons-exclamation-triangle"
        />
        <div class="flex gap-2">
          <UButton
            @click="del"
            color="rose"
            variant="outline"
            :loading="clearing"
            >Yes, delete everything</UButton
          >
          <UButton @click="confirmClear = false" variant="ghost"
            >Cancel</UButton
          >
        </div>
      </div>
    </UCard>
  </UModal>
</template>
<script setup>
const confirmClear = ref(false),
  clearing = ref(false);
async function del() {
  clearing.value = true;
  await wipeData();
  window.location.reload();
}
</script>
