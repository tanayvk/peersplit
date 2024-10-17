<template>
  <UFormGroup
    :error="error ? 'Something went wrong!' : null"
    label="Import from Splitwise"
  >
    <UAlert
      v-if="(loading && !members) || importing"
      title="Importing..."
      variant="soft"
      color="primary"
      icon="i-heroicons-arrow-path-20-solid"
      :ui="{ icon: { base: 'animate-spin' } }"
    />
    <UAlert
      v-if="loading && members"
      title="Importing..."
      variant="soft"
      color="primary"
      icon="i-heroicons-information-circle"
    />
    <UInput
      v-else-if="!showConfirmation && !importing"
      type="file"
      size="sm"
      icon="i-heroicons-folder"
      accept=".csv"
      @change="handleFileChange"
    />

    <!-- Confirmation Alert -->
    <UAlert
      v-if="showConfirmation"
      :actions="[
        {
          variant: 'solid',
          color: 'primary',
          label: 'Confirm',
          onClick: confirmImport,
        },
        {
          variant: 'outline',
          color: 'primary',
          label: 'Cancel',
          onClick: cancelImport,
        },
      ]"
      title="Confirm Import"
      icon="i-heroicons-information-circle"
    >
      <template #description>
        You are about to import
        <span class="font-medium">{{ membersCount }}</span> members and
        <span class="font-medium">{{ transactionsCount }}</span> transactions.
        Proceed?
      </template>
    </UAlert>
  </UFormGroup>
</template>

<script setup>
import { parse } from "csv-parse/browser/esm";

const loading = ref(false),
  error = ref(null),
  members = ref(null),
  transactions = ref([]),
  showConfirmation = ref(false),
  membersCount = ref(0),
  transactionsCount = ref(0),
  importing = ref(false);

const handleFileChange = (files) => {
  const file = files[0];
  if (file && file.type === "text/csv") {
    loading.value = true;
    error.value = null;
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      parseCSV(csvContent);
    };
    reader.readAsText(file);
  } else {
    error.value = "Please select a valid CSV file.";
  }
};

const parseCSV = (csvContent) => {
  const records = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  parse(records, {}, (err, data) => {
    if (err || !data || data.length < 2) {
      loading.value = false;
      error.value = true;
    } else {
      const m = data[0].slice(5); // members are in column 5 onward
      const t = data.slice(1, -1); // the rest are transactions, last one is "Total balance"
      members.value = m;
      transactions.value = t;
      membersCount.value = m.length;
      transactionsCount.value = t.length;
      loading.value = false;
      showConfirmation.value = true;
    }
  });
};

const confirmImport = async () => {
  showConfirmation.value = false;
  importing.value = true;
  try {
    const groupID = useGroupID();
    await importSplitwise(
      groupID,
      useGroups().getGroupByID(groupID).myID,
      members.value,
      transactions.value,
    );
  } catch (err) {
    error.value = true;
  }
  importing.value = false;
};

const cancelImport = () => {
  showConfirmation.value = false;
  members.value = null;
  transactions.value = [];
};
</script>
