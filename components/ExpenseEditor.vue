<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium"
          >{{ expenseItem ? "Update" : "Add" }} Expense</span
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
      <UFormGroup label="Description">
        <UInput v-model="expense.description" placeholder="ex: Groceries" />
      </UFormGroup>
      <UFormGroup>
        <template #label>
          <span>Paid By</span
          ><span class="font-normal color-positive" v-if="paid !== 0">
            &middot; {{ paid }}</span
          >
        </template>
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
          ><span class="font-normal color-negative" v-if="remaining !== 0">
            &middot; {{ remaining }} remaining</span
          >
          <span
            class="font-normal color-neutral"
            v-if="expense.splitType === 4"
          >
            &middot; {{ split }} total shares</span
          >
        </template>
        <MemberValueEdit
          v-model="expense.splitters"
          :members="members"
          addLabel="Add Members"
          :noValues="expense.splitType === 1"
        />
      </UFormGroup>
      <UFormGroup>
        <UCheckbox v-model="saveAsDefaultSplit" label="Save as default split" />
      </UFormGroup>
    </div>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          @click="onSubmit"
          :loading="adding"
          variant="outline"
          :disabled="
            Object.keys(expense.splitters).length === 0 ||
            (expense.splitType === 4 && split === 0) ||
            paid === 0 ||
            !expense.description ||
            remaining !== 0
          "
          >{{ expenseItem ? "Update" : "Add" }} Expense</UButton
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

const emit = defineEmits(["update", "add"]);

const groupID = useGroupID();

const getDefaultSplit = () => {
  const json = localStorage.getItem(`peersplit.${groupID}.defaultSplit`);
  if (json) {
    return JSON.parse(json);
  }
  return { splitters: {}, splitType: 1 };
};

const onSubmit = () => {
  if (saveAsDefaultSplit.value) {
    localStorage.setItem(
      `peersplit.${groupID}.defaultSplit`,
      JSON.stringify({
        splitters: expense.value.splitters,
        splitType: expense.value.splitType,
      }),
    );
  }
  emit(expenseItem ? "update" : "add", expense.value);
};

const getDefaultExpense = () => {
  const e = {
    id: nanoid(),
    type: "expense",
    description: "",
    created_at: new Date(),
    ...getDefaultSplit(),
  };
  const myID = useGroups().getGroupByID(groupID)?.myID;
  e.payers = myID ? { [myID]: "" } : {};
  return e;
};

const { expenseItem } = defineProps(["expenseItem"]);
const expense = ref(
  expenseItem ? JSON.parse(JSON.stringify(expenseItem)) : getDefaultExpense(),
);
const saveAsDefaultSplit = ref(false);
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
const members = computed(() => useGroups().getMembersList(groupID));
</script>
