export default defineNuxtPlugin({
  hooks: {
    async "app:beforeMount"() {
      useName().value = localStorage.getItem("peersplit.name") || "New User";
      await dbInit();
      await updateGroups();
      initGun();
      // init main database
      // init all group databases
      // start sync for all groups
    },
  },
});
