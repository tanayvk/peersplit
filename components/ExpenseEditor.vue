<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium">Add Expense</span>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-2">
      <UFormGroup label="Description">
        <UInput v-model="expense.description" placeholder="ex: Groceries" />
      </UFormGroup>
      <UFormGroup label="Paid By">
        <MemberValueEdit
          :members="members"
          addLabel="Add Payers"
          v-model="expense.payers"
        />
      </UFormGroup>
      <UFormGroup label="Split Type">
        <USelectMenu
          v-model="expense.splitType"
          value-attribute="id"
          option-attribute="name"
          placeholder="Select split type"
          :options="splitTypes"
        />
      </UFormGroup>
      <UFormGroup>
        <template #label>
          <span>Split Between</span
          ><span class="font-normal text-rose-400" v-if="remaining !== 0">
            &middot; {{ remaining }} remaining</span
          >
        </template>
        <MemberValueEdit
          v-model="expense.splitters"
          :members="members"
          addLabel="Add Members"
          :noValues="expense.splitType === 1"
        />
      </UFormGroup>
    </div>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          @click="$emit('add', expense)"
          :loading="adding"
          variant="outline"
          :disabled="
            Object.keys(expense.splitters).length === 0 ||
            paid === 0 ||
            !expense.description ||
            remaining !== 0
          "
          >Add Expense</UButton
        >
      </div>
    </template>
  </UCard>
</template>

<script setup>
import { nanoid } from "nanoid";

const groupID = useRoute().params.group_id;
const expense = ref({
  id: nanoid(),
  type: "expense",
  description: "",
  splitType: 1,
  payers: {},
  splitters: {},
  created_at: new Date(),
});
const paid = computed(() =>
  Object.values(expense.value.payers).reduce(
    (a, b) => Number(a) + Number(b),
    0,
  ),
);
const split = computed(() =>
  Object.values(expense.value.splitters).reduce(
    (a, b) => Number(a) + Number(b),
    0,
  ),
);
const remaining = computed(() => {
  if (expense.value.splitType === 4 || expense.value.splitType === 1) return 0; // shares or split equally
  const total = expense.value.splitType === 2 ? paid.value : 100;
  return total - split.value;
});
const adding = ref(false);
const members = ["Tanay", "John", "Jane"].map((x) => ({ id: x, name: x }));
</script>
