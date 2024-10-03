// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  // devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/fonts", "nuxt-gtag"],
  fonts: {
    families: [{ name: "Fredoka", provider: "google" }],
  },
  gtag: {
    id: "G-VH3Y7P4PLH",
  },
});
