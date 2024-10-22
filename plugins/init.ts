export default defineNuxtPlugin({
  hooks: {
    async "app:beforeMount"() {
      try {
        useName().value = localStorage.getItem("peersplit.name");
        await dbInit();
        await updateGroups();
        initGun();
      } catch {}
    },
  },
});
