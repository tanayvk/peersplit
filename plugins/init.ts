export default defineNuxtPlugin({
  hooks: {
    async "app:beforeMount"() {
      await dbInit();
      await updateGroups();
      // init main database
      // init all group databases
      // start sync for all groups
    },
  },
});
