<template>
  <UFormGroup label="Name">
    <UInput @blur="setName(name)" v-model="name" placeholder="John Doe" />
  </UFormGroup>
</template>
<script setup>
const name = ref(useName());
</script>
