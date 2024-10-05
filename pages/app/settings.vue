<template>
  <div class="px-4 py-2 flex flex-col h-full">
    <div class="space-y-2 flex-grow">
      <UFormGroup label="Name">
        <UInput placeholder="John Doe" />
      </UFormGroup>
      <UFormGroup label="Color Mode">
        <DarkModeSwitch />
      </UFormGroup>
    </div>
    <div class="text-center w-full py-4">
      <UButton to="/" variant="link" class="px-0">PeerSplit</UButton>
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
