<template>
  <div class="min-h-screen flex flex-col">
    <div class="mx-auto container max-w-[800px] px-8 pb-20 flex-grow space-y-6">
      <div class="text-center space-y-6 my-8">
        <div class="flex flex-col items-center gap-2">
          <Icon class="w-20 h-20" filled :fontControlled="false" />
          <h1 class="text-6xl select-none">
            <span class="text-primary">Peer</span
            ><span class="text-lime-300">Split</span>
          </h1>
          <h3 class="text-2xl">Split your expenses with friends!</h3>
        </div>
        <div class="flex flex-row items-center justify-center gap-2">
          <UButton to="/app" size="xl">Get Started</UButton>
          <UButton
            variant="outline"
            to="https://github.com/tanayvk/peersplit"
            size="xl"
            >Star on GitHub</UButton
          >
        </div>
      </div>

      <UAlert
        icon="i-heroicons-rocket-launch"
        color="primary"
        variant="subtle"
        title="Exciting News!"
        description="I'm launching PeerSplit on Product Hunt next Tuesday (Oct 22)! I'd really appreciate your support—click below to check it out."
        :actions="[
          {
            label: 'Visit Launch',
            target: '_blank',
            to: 'https://www.producthunt.com/posts/peersplit',
            variant: 'solid',
            color: 'emerald',
          },
        ]"
      />

      <div class="text-xl space-y-4">
        <p>
          <span class="text-primary font-medium">PeerSplit</span> is a
          <span class="font-semibold">free</span> app that helps you split and
          track group expenses with ease.
        </p>
        <p>
          It’s peer-to-peer, so your data stays
          <span class="font-semibold">completely private</span>—nothing is
          stored on the cloud.
        </p>
        <p>
          Got feedback or ideas? Reach out to me
          <UButton class="p-0 text-xl" to="https://x.com/tanayvk" variant="link"
            >@tanayvk</UButton
          >
          on X, or create an issue on GitHub.
        </p>
      </div>

      <h2 class="text-3xl font-medium text-primary-400 underline">FEATURES</h2>
      <div class="text-lg">
        <p v-for="feature in features" :key="feature.text">
          {{ feature.text }}
        </p>
      </div>

      <div class="space-y-6">
        <h2 class="text-3xl font-medium text-primary-400 underline">
          QUICK START GUIDE
        </h2>
        <div class="text-lg space-y-4">
          <p>
            <span class="text-primary font-medium">PeerSplit</span>
            works directly in your browser, so you can use it as a web app
            instantly or install it as a PWA (Progressive Web App) for an even
            better experience. Here’s how:
          </p>

          <UAccordion
            :items="[
              { label: 'On Android (Using Chrome)' },
              { label: 'On iOS (Using Safari or Chrome)' },
              { label: 'On Desktop (Chrome or Edge)' },
            ]"
            :ui="{
              item: {
                color: 'text-gray-800 dark:text-gray-100',
              },
            }"
          >
            <!-- Android Instructions -->
            <template #item="{ item }">
              <div
                v-if="item.label === 'On Android (Using Chrome)'"
                class="text-lg space-y-4"
              >
                <ol class="list-decimal pl-5 space-y-2">
                  <li>
                    Open <span class="font-semibold">Chrome</span> and visit the
                    <span class="text-primary font-medium">PeerSplit</span>
                    website.
                  </li>
                  <li>
                    Tap the menu icon (three dots) in the top-right corner.
                  </li>
                  <li>
                    Select
                    <span class="font-semibold">"Add to Home screen"</span>.
                  </li>
                  <li>
                    Follow the prompts to install the app and create a shortcut
                    on your home screen.
                  </li>
                  <li>
                    Now, you can launch
                    <span class="text-primary font-medium">PeerSplit</span> like
                    any other app from your home screen!
                  </li>
                </ol>
              </div>

              <!-- iOS Instructions -->
              <div
                v-else-if="item.label === 'On iOS (Using Safari or Chrome)'"
                class="text-lg space-y-4"
              >
                <ol class="list-decimal pl-5 space-y-2">
                  <li>
                    Open <span class="font-semibold">Safari</span> or
                    <span class="font-semibold">Chrome</span> and navigate to
                    the
                    <span class="text-primary font-medium">PeerSplit</span>
                    website.
                  </li>
                  <li>
                    Tap the <span class="font-semibold">Share</span> icon at the
                    bottom (the square with an arrow pointing up).
                  </li>
                  <li>
                    Scroll down and select
                    <span class="font-semibold">"Add to Home Screen"</span>.
                  </li>
                  <li>
                    Choose a name for the app (PeerSplit is default) and tap
                    <span class="font-semibold">"Add"</span>.
                  </li>
                  <li>
                    <span class="text-primary font-medium">PeerSplit</span> will
                    now appear on your home screen, ready to use like a regular
                    app!
                  </li>
                </ol>
              </div>

              <!-- Desktop Instructions -->
              <div v-else class="text-lg space-y-4">
                <ol class="list-decimal pl-5 space-y-2">
                  <li>
                    Open <span class="font-semibold">Chrome</span> or
                    <span class="font-semibold">Microsoft Edge</span> and visit
                    the
                    <span class="text-primary font-medium">PeerSplit</span>
                    website.
                  </li>
                  <li>
                    Look for the install icon (a small plus sign in the address
                    bar) and click it.
                  </li>
                  <li>
                    Follow the prompts to install
                    <span class="text-primary font-medium">PeerSplit</span> as a
                    desktop app.
                  </li>
                  <li>
                    Once installed, you can open
                    <span class="text-primary font-medium">PeerSplit</span> from
                    your Start menu or desktop.
                  </li>
                </ol>
              </div>
            </template>
          </UAccordion>
        </div>
      </div>

      <h2 class="text-3xl font-medium text-primary-400 underline">DEVLOG</h2>
      <div class="space-y-2">
        <p v-for="log in devlog" :key="log.date">
          <span
            ><UButton
              :to="log.link"
              target="_blank"
              class="m-0 p-0 text-lg"
              variant="link"
              color="lime"
              ><span class="font-medium">{{ log.date }}</span></UButton
            >
            : {{ log.text }}</span
          >
        </p>
      </div>
    </div>

    <footer
      class="flex flex-col md:flex-row items-center justify-between px-1 gap-1 dark:text-gray-400"
    >
      <div class="flex items-center space-x-1">
        <span>Made with</span>
        <UIcon class="text-rose-600" name="i-heroicons-heart-solid" />
        <span
          >by
          <UButton
            to="https://tanay.xyz"
            target="_blank"
            class="p-0"
            size="lg"
            variant="link"
            >Tanay Karnik</UButton
          >
        </span>
      </div>
      <div class="flex items-center space-x-2 text-gray-800 dark:text-gray-400">
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
import Icon from "~/assets/logo.svg";
definePageMeta({ colorMode: "dark" });

const devlog = [
  {
    date: "Oct 3, 2024",
    text: "Launched the app with a simple UI and landing page. Minimal but it works!",
    link: "https://x.com/tanayvk/status/1841837882061082816",
  },
  {
    date: "Oct 4, 2024",
    text: "Added group UI, started working on the database design, and started looking into peer-to-peer syncing with gun.eco.",
    link: "https://x.com/tanayvk/status/1842189991688249622",
  },
  {
    date: "Oct 5, 2024",
    text: "Tweaked the UI and built the 'Add Expense' form. Small but crucial stuff!",
    link: "https://x.com/tanayvk/status/1842574320171929889",
  },
  {
    date: "Oct 6, 2024",
    text: "'Simplifying Debts'—added balance and repayment computations.",
    link: "https://x.com/tanayvk/status/1842957866526973978",
  },
  {
    date: "Oct 8, 2024",
    text: "More UI/UX polish, persisting data locally, and made some progress on peer-to-peer syncing.",
    link: "https://x.com/tanayvk/status/1843682849402360020",
  },
  {
    date: "Oct 9, 2024",
    text: "Got peer-to-peer sync working! You can now invite and join groups.",
    link: "https://x.com/tanayvk/status/1844030889061503127",
  },
  {
    date: "Oct 10, 2024",
    text: "Fixed a few sync issues, added currency symbol customization, and built out group stats.",
    link: "https://x.com/tanayvk/status/1844409444639310298",
  },
  {
    date: "Oct 12, 2024",
    text: "The app is live and stable! Turned it into a PWA. Ready for everyone to start using it.",
    link: "https://x.com/tanayvk/status/1845138111749292519",
  },
  {
    date: "Oct 16, 2024",
    text: "Added default splits for groups and improved stats.",
    link: "https://x.com/tanayvk/status/1846498652770218347",
  },
  {
    date: "Oct 17, 2024",
    text: "Added Splitwise import and CSV export functionality.",
    link: "https://x.com/tanayvk/status/1846787787812753444",
  },
].reverse();

const features = [
  { text: "- 100% free—no signup required" },
  { text: "- Local-first and works fully offline" },
  { text: "- Cross-platform: use it on mobile, desktop, or laptop" },
  {
    text: "- Peer-to-peer: collaborate with friends while keeping your data private",
  },
  { text: "- Smooth UX that stays out of your way" },
  { text: "- Available in dark and light modes" },
  { text: "- Import from Splitwise, export to CSV" },
];
</script>
