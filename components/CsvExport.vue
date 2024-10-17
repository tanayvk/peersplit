<template>
  <UFormGroup label="Export to CSV">
    <UButton @click="exportCSV" label="Export" />
  </UFormGroup>
</template>

<script setup>
import moment from "moment";

const exportCSV = () => {
  const group = useGroups().getGroupByID(useGroupID());
  const members = group.members;
  const memberIDs = Object.keys(members);
  const memberNames = memberIDs.map((id) => members[id].name);
  const header = `Time,Description,Currency,${memberNames.join(",")}`;

  const getPaymentDescription = (transaction) => {
    const from = members[Object.keys(transaction.payers)?.[0]]?.name;
    const to = members[Object.keys(transaction.splitters)?.[0]]?.name;
    return `${from} paid ${to}`;
  };

  const transactionRows = group.transactionOrder.map((id) => {
    const transaction = group.transactions[id];
    const computedTransaction = computeTransaction(transaction);
    const memberValues = memberIDs.map((id) => {
      return round(
        (computedTransaction.payers[id] || 0) -
          (computedTransaction.splits[id] || 0),
      ).toFixed(2);
    });
    return `${moment.utc(transaction.created_at).format()},${
      transaction.type === "expense"
        ? transaction.description
        : getPaymentDescription(transaction)
    },${group.currency},${memberValues.join(",")}`;
  });

  const csvContent = header + "\n" + transactionRows.join("\n");

  // Create a Blob from the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Create a link element to trigger download
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `peersplit_export_${moment(new Date()).format("YYYY-MM-DD")}.csv`,
  );
  link.style.visibility = "hidden";

  // Append link to the document and trigger click to download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
