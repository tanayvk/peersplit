<template>
  <UCard class="max-h-[80vh] overflow-scroll">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-medium">Group Stats</span>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          color="gray"
          icon="i-heroicons-x-mark"
        />
      </div>
    </template>
    <div class="space-y-2">
      <div>
        <span class="font-medium">Spending</span>
        <canvas id="spending-chart" :height="members.length * 60"></canvas>
      </div>
      <div>
        <span class="font-medium">Shares</span>
        <canvas id="shares-chart" :height="members.length * 60"></canvas>
      </div>
      <div>
        <span class="font-medium">Payments Made</span>
        <canvas id="payments-made-chart" :height="members.length * 60"></canvas>
      </div>
      <div>
        <span class="font-medium">Payments Received</span>
        <canvas
          id="payments-received-chart"
          :height="members.length * 60"
        ></canvas>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import Chart from "chart.js/auto";
import * as helpers from "chart.js/helpers";
import autocolors from "chartjs-plugin-autocolors";
Chart.register(autocolors);
const lighten = (color, value) =>
  helpers.color(color).lighten(value).rgbString();

const groupID = useRoute().params.group_id;

const members = computed(() =>
  Object.keys(useGroups().getGroupByID(groupID).members || {}),
);

const graphOptions = () => ({
  indexAxis: "y",
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
    },
    autocolors: {
      mode: "data",
      customize(context) {
        const colors = context.colors;
        return {
          background: lighten(colors.background, 0.5),
          border: lighten(colors.border, 0.5),
        };
      },
      offset: 5,
    },
  },
});

const getData = (data) => {
  const rows = [
    {
      member: "Total",
      val: Object.values(data).reduce((a, b) => round(a + b), 0),
    },
    ...Object.entries(data).map(([member, val]) => ({
      member: useGroups().getMemberName(groupID, member),
      val,
    })),
  ];
  for (const member of members.value) {
    if (!data[member]) {
      rows.push({ member: useGroups().getMemberName(groupID, member), val: 0 });
    }
  }
  return {
    labels: rows.map((row) => [row.member, row.val]),
    datasets: [
      {
        data: rows.map((row) => row.val),
      },
    ],
  };
};

onMounted(() => {
  const transactions = useGroups().getGroupByID(groupID).transactions;
  const spending = {},
    paymentsMade = {},
    paymentsReceived = {},
    shares = {};
  for (const transaction of Object.values(transactions)) {
    const computedTransaction = computeTransaction(transaction);
    if (computedTransaction.type === "expense") {
      for (const [payer, value] of Object.entries(computedTransaction.payers)) {
        spending[payer] ||= 0;
        spending[payer] = round(spending[payer] + Number(value));
      }
      for (const [splitter, value] of Object.entries(
        computedTransaction.splits,
      )) {
        shares[splitter] ||= 0;
        shares[splitter] = round(shares[splitter] + Number(value));
      }
    } else {
      for (const [payer, value] of Object.entries(computedTransaction.payers)) {
        paymentsMade[payer] ||= 0;
        paymentsMade[payer] = round(paymentsMade[payer] + Number(value));
      }
      for (const [splitter, value] of Object.entries(
        computedTransaction.splits,
      )) {
        paymentsReceived[splitter] ||= 0;
        paymentsReceived[splitter] = round(
          paymentsReceived[splitter] + Number(value),
        );
      }
    }
  }
  new Chart(document.getElementById("spending-chart"), {
    type: "bar",
    options: graphOptions(),
    data: getData(spending),
  });
  new Chart(document.getElementById("shares-chart"), {
    type: "bar",
    options: graphOptions(),
    data: getData(shares),
  });
  new Chart(document.getElementById("payments-made-chart"), {
    type: "bar",
    options: graphOptions(),
    data: getData(paymentsMade),
  });
  new Chart(document.getElementById("payments-received-chart"), {
    type: "bar",
    options: graphOptions(),
    data: getData(paymentsReceived),
  });
});
</script>
