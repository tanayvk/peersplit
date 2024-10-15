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
        <canvas id="spending-chart" :height="graphHeight"></canvas>
      </div>
      <div>
        <span class="font-medium">Shares</span>
        <canvas id="shares-chart" :height="graphHeight"></canvas>
      </div>
      <div>
        <span class="font-medium">Payments Made</span>
        <canvas id="payments-made-chart" :height="graphHeight"></canvas>
      </div>
      <div>
        <span class="font-medium">Payments Received</span>
        <canvas id="payments-received-chart" :height="graphHeight"></canvas>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import Chart from "chart.js/auto";

const groupID = useGroupID();

const members = computed(() =>
  Object.keys(useGroups().getGroupByID(groupID).members || {}),
);

const graphHeight = computed(() => (members.value.length + 1) * 40);

const graphOptions = () => ({
  indexAxis: "y",
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  scales: {
    x: {
      border: {
        display: false,
      },
      grid: {
        display: false,
        drawOnChartArea: false,
      },
    },
    y: {
      grid: {},
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
    },
  },
});

const colors = [
  { background: "rgba(255, 99, 132, 0.2)", border: "rgb(255, 99, 132)" },
  { background: "rgba(255, 159, 64, 0.2)", border: "rgb(255, 159, 64)" },
  { background: "rgba(255, 205, 86, 0.2)", border: "rgb(255, 205, 86)" },
  { background: "rgba(75, 192, 192, 0.2)", border: "rgb(75, 192, 192)" },
  { background: "rgba(54, 162, 235, 0.2)", border: "rgb(54, 162, 235)" },
  { background: "rgba(153, 102, 255, 0.2)", border: "rgb(153, 102, 255)" },
  { background: "rgba(201, 203, 207, 0.2)", border: "rgb(201, 203, 207)" },
];

const memberColors = {};
let colorIndex = 0;
const getMemberColor = (member) => {
  if (memberColors[member]) return memberColors[member];
  colorIndex++;
  colorIndex %= colors.length;
  return (memberColors[member] = colors[colorIndex]);
};

const getData = (data) => {
  const rows = [
    {
      member: "Total",
      val: Object.values(data).reduce((a, b) => round(a + b), 0),
    },
    ...Object.entries(data).map(([member, val]) => ({
      id: member,
      member: useGroups().getMemberName(groupID, member),
      val,
    })),
  ];
  for (const member of members.value) {
    if (!data[member]) {
      rows.push({ member: useGroups().getMemberName(groupID, member), val: 0 });
    }
  }
  const colors = rows.map((row) => getMemberColor(row.id));
  return {
    labels: rows.map((row) => [row.member, row.val]),
    datasets: [
      {
        data: rows.map((row) => row.val),
        backgroundColor: colors.map((color) => color.background),
        borderColor: colors.map((color) => color.border),
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
