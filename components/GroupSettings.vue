<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium"
          >{{ useGroups().getGroupByID(groupID).name }} - Settings</span
        >
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-4">
      <UTabs color="primary" :items="tabs">
        <template #item="{ item }">
          <div v-if="item.label === 'General'" class="space-y-2">
            <UFormGroup label="Group Name">
              <UInput
                @blur="updateName"
                placeholder="New Group"
                v-model="name"
              />
            </UFormGroup>
            <UFormGroup label="Currency Symbol">
              <UInput
                @blur="updateCurrency"
                placeholder="ex: $ or ₹"
                v-model="currency"
              />
            </UFormGroup>
          </div>
          <GroupSettingsMembers v-if="item.label === 'Members'" />
          <GroupSettingsBalances v-if="item.label === 'Balances'" />
        </template>
      </UTabs>
    </div>
  </UCard>
</template>

<script setup>
const groupID = useRoute().params.group_id;
const tabs = [
  { label: "General", icon: "i-heroicons-user-circle" },
  { label: "Members", icon: "i-heroicons-user-group" },
  { label: "Balances", icon: "i-heroicons-document-currency-dollar" },
];
const name = ref(useGroups().getGroupByID(groupID)?.name),
  currency = ref(useGroups().getGroupByID(groupID)?.currency);
function updateName() {
  useGroups().setGroupName(groupID, name.value);
}
function updateCurrency() {
  useGroups().setGroupCurrency(groupID, currency.value);
}
</script>
