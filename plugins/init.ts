export default defineNuxtPlugin({
  hooks: {
    async "app:beforeMount"() {
      try {
        useName().value = localStorage.getItem("peersplit.name") || "New User";
        await dbInit();
        await updateGroups();
        initGun();
      } catch {}
    },
  },
});
