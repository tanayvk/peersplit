<template>
  <div class="flex flex-col gap-2 h-full px-2">
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
      <UButton icon="i-heroicons-user-plus" variant="ghost" color="gray" />
      <!-- <UButton
        disabled
        icon="i-heroicons-cog-6-tooth"
        variant="ghost"
        color="gray"
      /> -->
    </div>
    <UCard
      ><div class="flex flex-col gap-1">
        <span class="flex items-center gap-2"
          >You are owed <span class="text-2xl text-lime-500">$3500</span></span
        >
        <div>
          <span class="flex items-center gap-1 text-sm"
            >- Tanay owes you
            <span class="text-md text-lime-500">$3500</span></span
          >
        </div>
      </div></UCard
    >
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
      <span class="text-lg">October 2024</span>
      <ExpenseItem :expense="expense" v-for="expense in expenses" />
    </div>
  </div>
  <UModal v-model="showPaymentEditor">
    <PaymentEditor @close="showPaymentEditor = false" />
  </UModal>
  <UModal v-model="showExpenseEditor">
    <ExpenseEditor @add="add" @close="showExpenseEditor = false" />
  </UModal>
</template>

<script setup>
const showExpenseEditor = ref(false),
  showPaymentEditor = ref(false),
  expenses = ref([
    // {
    //   description: "Rent",
    //   payers: { John: 40 },
    //   splitters: { John: 40 },
    //   created_at: new Date(),
    //   splitType: "Split Equally",
    // },
  ]);
// const expensesByMon
const groupID = useRoute().params.group_id;
// TODO: handle loading states
const { getGroupByID, loading } = storeToRefs(useGroups());

function add(expense) {
  expenses.value.push(expense);
  showExpenseEditor.value = false;
}
</script>
