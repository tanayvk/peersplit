<script setup>
const props = defineProps(["height"]);
const height = props.height === undefined ? "h-32" : props.height;
</script>
<template>
  <div :class="[height, 'flex items-center justify-center']">
    <UIcon
      class="text-primary w-6 h-6 animate-spin"
      name="i-heroicons-arrow-path-20-solid"
    />
  </div>
</template>
