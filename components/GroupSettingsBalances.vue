<template>
  <UAccordion
    :items="
      members.map((member) => ({
        label: useGroups().getMemberName(groupID, member.id),
        name: useGroups().getMemberName(groupID, member.id),
        id: member.id,
      }))
    "
  >
    <template #item="{ item: member }">
      <span v-if="!balances[member.id]"
        >{{ member.name }} {{ member.name === "You" ? "are" : "is" }} settled up
        in this group.</span
      >
      <div v-else>
        <span class="flex items-center gap-2"
          >{{ member.name }}
          {{
            balances[member.id] > 0
              ? `${member.id === myID ? "are" : "is"} owed`
              : `${member.id === myID ? "owe" : "owes"}`
          }}
          <span
            :class="[
              'text-lg',
              balances[member.id] > 0 ? 'color-positive' : 'color-negative',
            ]"
            >{{ useGroups().getGroupCurrency(groupID)
            }}{{ Math.abs(balances[member.id]) }}</span
          ></span
        >
        <div>
          <span
            v-for="payment in payments[member.id]"
            class="flex items-center gap-1 text-sm"
            >- {{ useGroups().getMemberName(groupID, payment.from) }}
            {{ payment.from === myID ? "owe" : "owes" }}
            {{ useGroups().getMemberName(groupID, payment.to, true) }}
            <span
              :class="[
                'text-md',
                balances[member.id] > 0 ? 'color-positive' : 'color-negative',
              ]"
              >{{ useGroups().getGroupCurrency(groupID)
              }}{{ payment.value }}</span
            ></span
          >
        </div>
      </div>
    </template>
  </UAccordion>
</template>

<script setup>
const groupID = useRoute().params.group_id;
const { getGroupByID, getPaymentsByGroupID } = storeToRefs(useGroups());
const myID = computed(() => {
  const { myID } = getGroupByID.value(groupID);
  return myID;
});
const members = computed(() => useGroups().getMembersList(groupID));
const payments = computed(() => {
  const paymentsByUser = {};
  const payments = getPaymentsByGroupID.value(groupID);
  for (const payment of payments) {
    paymentsByUser[payment.from] ||= [];
    paymentsByUser[payment.from].push(payment);
    paymentsByUser[payment.to] ||= [];
    paymentsByUser[payment.to].push(payment);
  }
  return paymentsByUser;
});
const balances = computed(() => {
  const balancesByUser = {};
  const payments = getPaymentsByGroupID.value(groupID);
  for (const payment of payments) {
    balancesByUser[payment.from] ||= 0;
    balancesByUser[payment.from] = round(
      balancesByUser[payment.from] - payment.value,
    );
    balancesByUser[payment.to] ||= 0;
    balancesByUser[payment.to] = round(
      balancesByUser[payment.to] + payment.value,
    );
  }
  return balancesByUser;
});
</script>
