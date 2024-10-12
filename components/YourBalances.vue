<template>
  <div class="px-1">
    <UCard
      ><div class="flex flex-col gap-1">
        <span v-if="balance === 0" class="flex items-center gap-2"
          >You are settled up in this group.</span
        >
        <div v-else>
          <span class="flex items-center gap-2"
            >You {{ balance > 0 ? "are owed" : "owe" }}
            <span
              :class="[
                'text-2xl',
                balance > 0 ? 'color-positive' : 'color-negative',
              ]"
              >{{ useGroups().getGroupCurrency(groupID)
              }}{{ Math.abs(balance) }}</span
            ></span
          >
          <div>
            <span
              v-for="payment in payments"
              class="flex items-center gap-1 text-sm"
              >- {{ useGroups().getMemberName(groupID, payment.from) }}
              {{ payment.from === myID ? "owe" : "owes" }}
              {{ useGroups().getMemberName(groupID, payment.to, true) }}
              <span
                :class="[
                  'text-md',
                  balance > 0 ? 'color-positive' : 'color-negative',
                ]"
                >{{ useGroups().getGroupCurrency(groupID)
                }}{{ payment.value }}</span
              ></span
            >
          </div>
        </div>
      </div></UCard
    >
  </div>
</template>

<script setup>
const { groupID } = defineProps(["groupID"]);
const { getBalancesByGroupID, getGroupByID, getPaymentsByGroupID } =
  storeToRefs(useGroups());
const myID = computed(() => {
  const { myID } = getGroupByID.value(groupID);
  return myID;
});
const balance = computed(() => {
  const balances = getBalancesByGroupID.value(groupID);
  return balances[myID.value] || 0;
});
const payments = computed(() => {
  return getPaymentsByGroupID
    .value(groupID)
    .filter(
      (payment) => payment.from === myID.value || payment.to === myID.value,
    );
});
</script>
