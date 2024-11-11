const moduleExclude = (match) => {
  const m = (id) => id.indexOf(match) > -1;
  return {
    name: `exclude-${match}`,
    resolveId(id) {
      if (m(id)) return id;
    },
    load(id) {
      if (m(id)) return `export default {}`;
    },
  };
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  // devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "nuxt-svgo",
  ],
  fonts: {
    families: [{ name: "Fredoka", provider: "google" }],
  },
  nitro: {
    routeRules: {
      "/": { prerender: true },
      "/*": { prerender: true },
    },
  },
  pwa: {
    strategies: "generateSW",
    registerWebManifestInRouteRules: true,
    registerType: "autoUpdate",
    includeAssets: ["index.html", "robots.txt"],
    manifest: {
      name: "PeerSplit | Track and split group expenses. 100% free, 100% private.",
      short_name: "PeerSplit",
      theme_color: "#89a1f0",
      icons: [
        {
          src: "pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      globPatterns: ["/", "**/*.{mjs,js,css,html,png,svg,ico}"],
    },
    injectManifest: {
      globPatterns: ["/", "**/*.{mjs,js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: "/",
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "gun",
        "gun/gun",
        "gun/sea",
        "gun/sea.js",
        "gun/lib/then",
        "gun/lib/webrtc",
        "gun/lib/radix",
        "gun/lib/radisk",
        "gun/lib/store",
        "gun/lib/rindexed",
      ],
    },
    plugins: [moduleExclude("text-encoding")],
  },
});
