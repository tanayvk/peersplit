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
  modules: ["@nuxt/ui", "@nuxt/fonts", "nuxt-gtag", "@pinia/nuxt"],
  fonts: {
    families: [{ name: "Fredoka", provider: "google" }],
  },
  gtag: {
    id: "G-VH3Y7P4PLH",
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
