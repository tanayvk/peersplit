<script setup>
const props = defineProps(["height", "text"]);
const height = props.height === undefined ? "h-32" : props.height;
</script>
<template>
  <div :class="[height, 'flex flex-col gap-2 items-center justify-center']">
    <span
      class="text-primary text-sm text-center max-w-[60%]"
      v-if="props.text"
      >{{ props.text }}</span
    >
    <UIcon
      class="text-primary w-6 h-6 animate-spin"
      name="i-heroicons-arrow-path-20-solid"
    />
  </div>
</template>
