<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium"
          >{{ expenseItem ? "Update" : "Record" }} Payment</span
        >
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-2">
      <UFormGroup label="Paid By">
        <USelectMenu
          v-model="paidBy"
          value-attribute="id"
          option-attribute="name"
          placeholder="Select member"
          :options="members"
        />
      </UFormGroup>
      <UFormGroup label="Paid To">
        <USelectMenu
          v-model="paidTo"
          value-attribute="id"
          option-attribute="name"
          placeholder="Select member"
          :options="members"
        />
      </UFormGroup>
      <UFormGroup label="Amount" v-for="member in Object.keys(model || {})">
        <UInput
          @input="fixValue(member)"
          v-model="model[member]"
          placeholder="ex: 340.5"
        />
      </UFormGroup>
    </div>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          @click="
            $emit(expenseItem ? 'update' : 'record', getPaymentTransaction())
          "
          :loading="adding"
          variant="outline"
          :disabled="!paidBy || !paidTo || !model.hello || paidBy === paidTo"
          >{{ expenseItem ? "Update" : "Record" }} Payment</UButton
        >
        <UButton
          v-if="expenseItem"
          @click="$emit('delete', expense)"
          variant="ghost"
          color="rose"
          >Delete</UButton
        >
      </div>
    </template>
  </UCard>
</template>

<script setup>
import { nanoid } from "nanoid";
const { expenseItem } = defineProps(["expenseItem"]);
const adding = ref(false),
  paidBy = ref(Object.keys(expenseItem?.payers || {})?.[0] || null),
  paidTo = ref(Object.keys(expenseItem?.splitters || {})?.[0] || null);
// TODO: remove ugly validation, why the fuck do i need to pass a model from outside
const model = defineModel({ default: { hello: "" } });
model.value.hello = Object.values(expenseItem?.payers || {})?.[0] || "";

const groupID = useRoute().params.group_id;
const members = computed(() => useGroups().getMembersList(groupID));

function fixValue(member) {
  nextTick(() => {
    const fixed = model.value[member].match(/\d+(\.\d?\d?)?/)?.[0] || "";
    if (model.value[member] !== fixed) model.value[member] = fixed;
  });
}
function getPaymentTransaction() {
  return {
    id: expenseItem?.id || nanoid(),
    type: "payment",
    created_at: new Date(),
    splitType: 1, // doesn't matter
    payers: { [paidBy.value]: model.value.hello },
    splitters: { [paidTo.value]: model.value.hello },
  };
}
</script>
