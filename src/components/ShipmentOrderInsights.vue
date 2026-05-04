<template>
  <div class="q-pa-lg">
    <!-- Title -->
    <div class="row items-center justify-between">
      <div>
        <div class="text-h5 text-weight-bold">Shipment & Order Insights</div>
        <div class="text-grey-6 q-mb-md">
          Global logistics monitoring and regional performance analytics
        </div>
      </div>

      <div class="row items-center no-wrap">
        <q-btn size="md" outline label="Generate Branded Report" class="q-mr-sm" />
        <q-btn size="md" color="dark" label="Create New Order" to="/create-order" />
      </div>
    </div>

    <div class="row q-col-gutter-lg items-stretch">
      <!-- BAR CHART -->
      <div class="col-8 full-height">
        <q-card flat bordered class="q-pa-md full-height">
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">Orders Over Time</div>

            <q-select
              dense
              outlined
              v-model="year"
              :options="years"
              label="Year"
              style="width: 100px"
            />
          </div>

          <apexchart
            type="bar"
            height="260"
            :options="barOptions"
            :series="barSeries"
            class="q-mt-lg"
          />
        </q-card>
      </div>

      <!-- DONUT CHART -->
      <div class="col-4 full-height">
        <q-card flat bordered class="q-pa-md full-height">
          <div class="row justify-between items-center">
            <div class="text-subtitle1 text-weight-medium">Shipments by Region</div>
            <q-badge color="primary" outline>Current Status</q-badge>
          </div>

          <apexchart type="donut" height="260" :options="donutOptions" :series="donutSeries" />

          <q-separator class="q-my-md" />

          <div class="text-caption text-grey-7">Western Europe Leading</div>
          <div class="text-positive text-weight-medium">+14.2% Growth vs Last Mo.</div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'

/* ---------------- STATE ---------------- */
const year = ref(null)
const allOrders = ref([])
const years = ref([])

/* ---------------- BAR CHART ---------------- */
const barSeries = ref([{ name: 'Orders', data: [] }])

const barOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  colors: ['#0d3b66'],
  dataLabels: { enabled: false },
  xaxis: {
    categories: [],
  },
})

/* ---------------- DONUT CHART ---------------- */
const donutSeries = ref([])

const donutOptions = ref({
  labels: [],
  colors: ['#0d3b66', '#4dabf7', '#90caf9', '#e0e0e0'],
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
        labels: {
          show: true,
          value: {
            show: true,
            offsetY: -2,
            fontSize: '22px',
            fontWeight: 600,
          },
          name: {
            show: true,
            color: '0d3b66',
            fontSize: '14px',
          },
          total: {
            show: true,
            label: 'TOTAL',
            fontSize: '12px',
            fontWeight: 600,
            formatter: function (w) {
              // sum all series values
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            },
          },
        },
      },
    },
  },
  legend: {
    position: 'bottom',
  },
})

/* ---------------- FETCH DATA ---------------- */
const fetchOrders = async () => {
  try {
    const res = await api.get('/order-detail-views')
    allOrders.value = res.data || []

    buildYears()
    setDefaultYear()

    setTimeout(() => {
      updateChart()
      updateDonutChart()
    }, 0)
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  }
}

/* ---------------- YEARS ---------------- */
const buildYears = () => {
  const uniqueYears = new Set()

  allOrders.value.forEach((order) => {
    const date = new Date(order.orderDate)
    if (!isNaN(date)) {
      uniqueYears.add(date.getFullYear())
    }
  })

  years.value = [...uniqueYears].map(String).sort((a, b) => b - a)
}

const setDefaultYear = () => {
  if (years.value.length) {
    year.value = years.value[0]
  }
}

/* ---------------- BAR CHART ---------------- */
const updateChart = () => {
  if (!year.value) return

  const monthly = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  }

  allOrders.value.forEach((order) => {
    const date = new Date(order.orderDate)
    if (isNaN(date)) return

    if (date.getFullYear() === Number(year.value)) {
      const month = date.toLocaleString('en-US', { month: 'short' })
      monthly[month]++
    }
  })

  barOptions.value = {
    ...barOptions.value,
    xaxis: {
      categories: Object.keys(monthly),
    },
  }

  barSeries.value = [
    {
      name: 'Orders',
      data: Object.values(monthly),
    },
  ]
}

/* ---------------- DONUT CHART ---------------- */
const updateDonutChart = () => {
  if (!year.value) return

  const regionCount = {}

  allOrders.value.forEach((order) => {
    const date = new Date(order.orderDate)
    if (isNaN(date)) return

    if (date.getFullYear() === Number(year.value)) {
      let region = order.region
      if (!region) region = 'Unknown'

      regionCount[region] = (regionCount[region] || 0) + 1
    }
  })

  donutOptions.value = {
    ...donutOptions.value,
    labels: Object.keys(regionCount),
  }

  donutSeries.value = Object.values(regionCount)
}

/* ---------------- WATCH YEAR ---------------- */
watch(year, (val) => {
  if (val) {
    updateChart()
    updateDonutChart()
  }
})

/* ---------------- INIT ---------------- */
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.full-height {
  min-height: 400px;
}
</style>
