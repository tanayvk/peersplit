<template>
  <div class="min-h-screen flex flex-col">
    <div class="mx-auto container max-w-[800px] px-8 pb-6 flex-grow space-y-6">
      <div class="text-center space-y-6 my-8">
        <div class="space-y-2">
          <h1 class="text-6xl select-none">
            <span class="text-primary">Peer</span
            ><span class="text-lime-300">Split</span>
          </h1>
          <h3 class="text-2xl">Split your expenses with friends!</h3>
        </div>
        <div class="flex flex-row gap-2 items-center justify-center">
          <div>
            <UButton to="/app" size="xl">Try PeerSplit</UButton>
          </div>
          <div>
            <UButton
              variant="outline"
              to="https://github.com/tanayvk/peersplit"
              size="xl"
              >Star on GitHub</UButton
            >
          </div>
        </div>
      </div>
      <UAlert
        variant="subtle"
        color="rose"
        icon="i-heroicons-exclamation-triangle"
        title="Under Development!"
        description="PeerSplit is still in development and isn't stable yet."
      />
      <div class="text-xl space-y-4">
        <p>
          PeerSplit is a <span class="font-semibold">free</span> app to help you
          split and track expenses with ease.
        </p>
        <p>
          It's a peer-to-peer app, ensuring your data remains
          <span class="font-semibold">completely private</span>—nothing is
          stored on the cloud.
        </p>
        <p>The app is still being developed.</p>
        <p>
          For feedback or ideas, reach out to me
          <UButton class="p-0 text-xl" to="https://x.com/tanayvk" variant="link"
            >@tanayvk</UButton
          >
          on X where I post daily updates as I build this app in public.
        </p>
      </div>
      <h2 class="text-3xl font-medium">DEVLOG</h2>
      <div class="text-lg">
        <div v-for="log in devlog" class="space-x-2">
          <span class="font-medium">{{ log.date }}</span>
          <span>{{ log.text }}</span>
        </div>
      </div>
    </div>
    <footer
      class="flex flex-col md:flex-row md:justify-between items-center px-1 gap-1"
    >
      <div class="dark:text-gray-400 flex items-center space-x-1">
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
      <div class="text-gray-800 dark:text-gray-400 flex items-center space-x-2">
        <UButton
          to="https://github.com/tanayvk/peersplit"
          target="_blank"
          variant="ghost"
          color="gray"
          icon="fa6-brands-github"
        />
        <UButton
          to="https://x.com/tanayvk"
          target="_blank"
          variant="ghost"
          color="gray"
          icon="fa6-brands-x-twitter"
        />
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: "dark",
});
const devlog = [
  {
    date: "Oct 3, 2024",
    text: "Initial deployment of the app and landing page with a minimal UI.",
  },
];
</script>
