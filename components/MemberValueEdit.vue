<template>
  <div class="space-y-2">
    <div>
      <div
        v-for="member in Object.keys(model || {})"
        class="flex justify-between items-center"
      >
        <div class="flex-grow flex items-center">
          <span class="font-light text-gray-700 dark:text-gray-300">{{
            member
          }}</span>
        </div>
        <div class="flex items-center gap-1">
          <UInput
            v-if="!noValues"
            @input="fixValue(member)"
            v-model="model[member]"
            size="xs"
          />
          <UButton
            color="gray"
            icon="i-heroicons-x-mark"
            size="sm"
            variant="ghost"
            @click="delete model[member]"
          />
        </div>
      </div>
    </div>
    <div :style="cssVars">
      <UDropdown
        v-if="availableMembers.length > 0"
        class="w-full"
        :ui="{ width: 'w-[--width]' }"
        :items="[
          availableMembers.map((member) => ({
            label: member.name,
            click: () => {
              model[member.id] = '';
            },
          })),
        ]"
        :popper="{ placement: 'bottom-start' }"
      >
        <UButton
          icon="i-heroicons-plus"
          block
          size="xs"
          color="white"
          :label="addLabel"
          ref="button"
        />
      </UDropdown>
    </div>
  </div>
</template>

<script setup>
const model = defineModel();
const { addLabel, members, noValues } = defineProps([
  "addLabel",
  "members",
  "noValues",
]);
const availableMembers = computed(() =>
  members.filter((member) => !model.value.hasOwnProperty(member.id)),
);
const dropdownWidth = ref(0);
const cssVars = computed(() => ({ "--width": `${dropdownWidth.value}px` }));
const button = ref(null);
onMounted(() => {
  nextTick(() => {
    if (button.value) {
      dropdownWidth.value = button.value.$el.offsetWidth;
    }
  });
});
function fixValue(member) {
  nextTick(() => {
    const fixed = model.value[member].match(/\d+(\.\d*)?/)?.[0] || "";
    if (model.value[member] !== fixed) model.value[member] = fixed;
  });
}
</script>
