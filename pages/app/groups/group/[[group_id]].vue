<template>
  <SpinLoader height="h-full" v-if="loading" />
  <div v-if="!loading" class="flex flex-col gap-2 h-full px-2">
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
      <UButton
        @click="showGroupShare = true"
        icon="i-heroicons-user-plus"
        variant="ghost"
        color="gray"
      />
      <!-- <UButton
        disabled
        icon="i-heroicons-cog-6-tooth"
        variant="ghost"
        color="gray"
      /> -->
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
        :group="group"
        v-for="group in getGroupedTransactionsByGroupID(groupID)"
      />
    </div>
  </div>
  <UModal v-model="showPaymentEditor">
    <PaymentEditor
      @record="add"
      v-model="ugly"
      @close="showPaymentEditor = false"
    />
  </UModal>
  <UModal v-model="showExpenseEditor">
    <ExpenseEditor @add="add" @close="showExpenseEditor = false" />
  </UModal>
  <UModal v-model="showGroupShare">
    <GroupShare @close="showGroupShare = false" />
  </UModal>
</template>

<script setup>
const showExpenseEditor = ref(false),
  showPaymentEditor = ref(false),
  showGroupShare = ref(false),
  ugly = ref({ hello: "" });
const groupID = useRoute().params.group_id;
// TODO: handle loading states
const { getGroupByID, loading, getGroupedTransactionsByGroupID } = storeToRefs(
  useGroups(),
);

function add(expense) {
  showExpenseEditor.value = false;
  showPaymentEditor.value = false;
  useGroups().addTransaction(groupID, expense);
}
</script>
