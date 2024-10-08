export default defineNuxtPlugin({
  hooks: {
    async "app:beforeMount"() {
      useName().value = localStorage.getItem("peersplit.name") || "";
      await dbInit();
      await updateGroups();
      await initGun();
      // init main database
      // init all group databases
      // start sync for all groups
    },
  },
});
