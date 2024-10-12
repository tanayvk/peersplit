<template>
  <UTabs
    :ui="{
      wrapper: 'space-y-0',
      list: {
        height: 'h-auto',
        rounded: 'rounded-none rounded-t-lg',
        tab: {
          base: 'flex flex-col items-center py-1 gap-1',
          height: 'h-auto',
          icon: 'w-5 h-5 me-0',
        },
      },
    }"
    class="w-full"
    :items="items"
    v-model="selected"
  />
</template>

<script setup lang="ts">
const items = [
  {
    label: "Groups",
    icon: "i-heroicons-users",
  },
  // {
  //   disabled: true,
  //   label: "Payments",
  //   icon: "i-heroicons-currency-dollar",
  // },
  {
    label: "Activity",
    icon: "i-heroicons-clipboard-document-list",
  },
  // {
  //   disabled: true,
  //   label: "Sync",
  //   icon: "i-heroicons-arrow-path",
  // },
  {
    label: "Settings",
    icon: "i-heroicons-cog",
  },
];
const route = useRoute();
const selected = computed({
  get() {
    const index = items.findIndex((item) =>
      route.name.includes(item.label.toLowerCase()),
    );
    if (index === -1) {
      navigateTo("/app/" + items[0].label.toLowerCase());
      return 0;
    }
    return index;
  },
  set(value) {
    const tab = items[value].label.toLowerCase();
    navigateTo("/app/" + tab);
  },
});
</script>
