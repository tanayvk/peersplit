<template>
  <div class="px-4 py-2 flex flex-col h-full">
    <div class="space-y-2 flex-grow">
      <SettingsName />
      <UFormGroup label="Color Mode">
        <DarkModeSwitch />
      </UFormGroup>
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
</template>
