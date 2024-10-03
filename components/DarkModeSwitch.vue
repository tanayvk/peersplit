<script setup>
const modes = ["system", "light", "dark"];
const colorMode = useColorMode();
const switchMode = () => {
  colorMode.preference =
    modes[(modes.indexOf(colorMode.preference) + 1) % modes.length];
};
const icons = {
  system: "i-heroicons-computer-desktop-20-solid",
  light: "i-heroicons-sun",
  dark: "i-heroicons-moon",
};
</script>
<template>
  <USelectMenu
    v-model="$colorMode.preference"
    placeholder="Select a server"
    :options="['system', 'light', 'dark']"
  >
    <template #option="{ option }">
      <UIcon class="w-5 h-5" :name="icons[option]" />
      {{ toTitleCase(option) }}
    </template>
    <template #label>
      <UIcon class="w-5 h-5" :name="icons[$colorMode.preference]" />
      {{ toTitleCase($colorMode.preference) }}
    </template>
  </USelectMenu>
</template>
