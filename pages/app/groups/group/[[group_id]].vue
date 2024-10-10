<template>
  <SpinLoader height="h-full" v-if="loading" />
  <div v-if="!loading && group" class="flex flex-col gap-2 h-full px-2">
    <div class="h-12 flex justify-between items-center gap-2">
      <UButton
        to="/app/groups"
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="gray"
        square
      />
      <span class="text-center font-medium text-lg">{{
        getGroupByID(groupID)?.name
      }}</span>
      <div>
        <UButton
          icon="i-heroicons-chart-bar"
          variant="ghost"
          color="gray"
          @click="showStats = true"
        />
        <UButton
          @click="showGroupShare = true"
          icon="i-heroicons-user-plus"
          variant="ghost"
          color="gray"
        />
      </div>
    </div>
    <div v-if="group && !group.myID">
      <UAlert
        variant="soft"
        color="primary"
        description="You don't have a member assigned in this group."
        :actions="[
          {
            click() {
              showGroupShare = true;
            },
            variant: 'solid',
            label: 'Assign Member',
          },
        ]"
      />
    </div>
    <YourBalances :groupID="groupID" />
    <div class="w-full flex text-center gap-2">
      <div class="flex-grow">
        <UButton @click="showExpenseEditor = true" block>Add Expense</UButton>
      </div>
      <div class="flex-grow">
        <UButton @click="showPaymentEditor = true" block variant="outline"
          >Record Payment</UButton
        >
      </div>
    </div>
    <div class="space-y-1">
      <ExpenseGroup
        @edit="edit"
        :group="group"
        v-for="group in getGroupedTransactionsByGroupID(groupID)"
      />
    </div>
  </div>
  <UModal prevent-close v-model="showPaymentEditor">
    <PaymentEditor
      v-model="ugly"
      :expenseItem="expense"
      @update="update"
      @record="add"
      @close="clearEditors"
      @delete="requestDel"
    />
  </UModal>
  <UModal prevent-close v-model="showExpenseEditor">
    <ExpenseEditor
      :expenseItem="expense"
      @update="update"
      @add="add"
      @close="clearEditors"
      @delete="requestDel"
    />
  </UModal>
  <UModal v-model="showStats">
    <ClientOnly>
      <Stats @close="showStats = false" />
    </ClientOnly>
  </UModal>
  <UModal v-model="showGroupShare">
    <GroupShare @close="showGroupShare = false" />
  </UModal>
  <UModal v-model="showDeleteConfirmation">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">Delete Expense</span>
          <UButton
            @click="showDeleteConfirmation = false"
            variant="ghost"
            color="gray"
            icon="i-heroicons-x-mark"
          />
        </div>
      </template>
      <div class="space-y-2">Are you sure you want to delete this expense?</div>
      <template #footer>
        <div class="flex gap-2">
          <UButton @click="del" color="rose" variant="outline"
            >Yes, delete</UButton
          >
          <UButton @click="cancelDel" variant="ghost">Cancel</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
const showExpenseEditor = ref(false),
  showPaymentEditor = ref(false),
  showGroupShare = ref(false),
  showStats = ref(false),
  showDeleteConfirmation = ref(false),
  ugly = ref({ hello: "" }),
  expense = ref(null),
  deleteExpense = ref(null);
// TODO: handle loading states
const { getGroupByID, loading, getGroupedTransactionsByGroupID } = storeToRefs(
  useGroups(),
);

const groupID = useRoute().params.group_id;
const group = computed(() => getGroupByID.value(groupID));

watch(loading, () => {
  checkGroup();
});
onMounted(() => {
  checkGroup();
});

function checkGroup() {
  if (!loading.value && !group.value) {
    navigateTo("/app/groups");
  }
}

function add(expense) {
  useGroups().addTransaction(groupID, expense);
  clearEditors();
}
function update(expense) {
  useGroups().updateTransaction(groupID, expense);
  clearEditors();
}
function edit(exp) {
  expense.value = exp;
  if (exp.type === "expense") {
    showExpenseEditor.value = true;
  } else {
    showPaymentEditor.value = true;
  }
}
function clearEditors() {
  showExpenseEditor.value = false;
  showPaymentEditor.value = false;
  expense.value = null;
  ugly.value = { hello: "" };
}
function requestDel(expense) {
  deleteExpense.value = expense;
  showDeleteConfirmation.value = true;
}
function del() {
  useGroups().deleteTransaction(groupID, deleteExpense.value.id);
  showDeleteConfirmation.value = false;
  clearEditors();
}
function cancelDel() {
  showDeleteConfirmation.value = false;
  deleteExpense.value = null;
}
</script>
