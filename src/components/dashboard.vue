<template>
  <section>
    <h2 class="text-3xl font-bold text-yellow-900 mb-6">Dashboard</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-green-50 rounded-lg p-4 shadow">
        <h3 class="text-xl font-semibold text-green-700 mb-2">Ingresos (por mes)</h3>
        <canvas ref="incomeChart" aria-label="Income chart" role="img"></canvas>
      </div>

      <div class="bg-red-50 rounded-lg p-4 shadow">
        <h3 class="text-xl font-semibold text-red-700 mb-2">Gastos (por mes)</h3>
        <canvas ref="expenseChart" aria-label="Expenses chart" role="img"></canvas>
      </div>
    </div>

    <div class="mt-8 bg-yellow-100 rounded-lg p-6 shadow">
      <h3 class="text-2xl font-semibold text-yellow-800 mb-4">Resumen Monetario</h3>
      <div class="grid grid-cols-3 gap-6 text-center">
        <div>
          <p class="text-lg font-medium text-green-700">Ingreso Total</p>
          <p class="text-3xl font-bold text-green-900">{{ formatCurrency(totalIncome) }}</p>
        </div>
        <div>
          <p class="text-lg font-medium text-red-700">Gasto Total</p>
          <p class="text-3xl font-bold text-red-900">{{ formatCurrency(totalExpenses) }}</p>
        </div>
        <div>
          <p class="text-lg font-medium">Balance Neto</p>
          <p :class="netBalance >= 0 ? 'text-blue-900' : 'text-red-900'" class="text-3xl font-bold">
            {{ formatCurrency(netBalance) }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 space-y-8 max-w-5xl mx-auto">
      <section class="bg-indigo-100 rounded-lg p-6 shadow">
        <h3 class="text-2xl font-semibold text-indigo-800 mb-4">Resumen de Ventas de Bebidas Frías</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-indigo-900">
          <div v-for="(qty, bev) in beverageSummary" :key="bev" class="bg-indigo-50 p-4 rounded shadow text-center font-semibold text-lg">
            <p>{{ bev }}</p>
            <p class="text-2xl font-bold">{{ qty }}</p>
          </div>
          <div v-if="Object.keys(beverageSummary).length === 0" class="text-indigo-700 italic col-span-full text-center">
            No hay ventas de bebidas frías disponibles.
          </div>
        </div>
      </section>

      <section class="bg-amber-100 rounded-lg p-6 shadow">
        <h3 class="text-2xl font-semibold text-amber-800 mb-4">Resumen de Ventas de Bebidas Calientes</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-amber-900">
          <div v-for="(qty, bev) in hotBeverageSummary" :key="bev" class="bg-amber-50 p-4 rounded shadow text-center font-semibold text-lg">
            <p>{{ bev }}</p>
            <p class="text-2xl font-bold">{{ qty }}</p>
          </div>
          <div v-if="Object.keys(hotBeverageSummary).length === 0" class="text-amber-700 italic col-span-full text-center">
            No hay ventas de bebidas calientes disponibles.
          </div>
        </div>
      </section>

      <section class="bg-yellow-100 rounded-lg p-6 shadow">
        <h3 class="text-2xl font-semibold text-yellow-900 mb-4">Resumen de Ventas de Sopas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-yellow-900">
          <div v-for="(qty, soup) in soupSummary" :key="soup" class="bg-yellow-50 p-4 rounded shadow text-center font-semibold text-lg">
            <p>{{ soup }}</p>
            <p class="text-2xl font-bold">{{ qty }}</p>
          </div>
          <div v-if="Object.keys(soupSummary).length === 0" class="text-yellow-700 italic col-span-full text-center">
            No hay ventas de sopas disponibles.
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Chart from 'chart.js/auto'
import { supabase } from '../supabase'

const incomes = ref([])
const expenses = ref([])
const beverages = ref([])
const hotBeverages = ref([])
const soups = ref([])

const incomeChart = ref(null)
const expenseChart = ref(null)
let incomeChartInstance = null
let expenseChartInstance = null

const formatCurrency = (val) => val.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

const sumByMonth = (items) => {
  const map = {}
  for (const item of items) {
    if (!item.date) continue
    const d = new Date(item.date)
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    map[key] = (map[key] || 0) + (item.amount || 0)
  }
  return map
}

const totalIncome = computed(() => incomes.value.reduce((acc, i) => acc + (i.amount || 0), 0))
const totalExpenses = computed(() => expenses.value.reduce((acc, e) => acc + (e.amount || 0), 0))
const netBalance = computed(() => totalIncome.value - totalExpenses.value)

const beverageSummary = computed(() => {
  return beverages.value.reduce((acc, sale) => {
    acc[sale.beverage] = (acc[sale.beverage] || 0) + (sale.quantity || 0)
    return acc
  }, {})
})

const hotBeverageSummary = computed(() => {
  return hotBeverages.value.reduce((acc, sale) => {
    acc[sale.beverage] = (acc[sale.beverage] || 0) + (sale.quantity || 0)
    return acc
  }, {})
})

const soupSummary = computed(() => {
  return soups.value.reduce((acc, sale) => {
    acc[sale.soup] = (acc[sale.soup] || 0) + (sale.quantity || 0)
    return acc
  }, {})
})

function getLast12MonthsLabels() {
  const labels = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleString(undefined, { year: 'numeric', month: 'short' }))
  }
  return labels
}

function buildMonthlyData(itemsMap) {
  const labels = getLast12MonthsLabels()
  return labels.map((label) => {
    const [monthStr, yearStr] = label.split(' ')
    const monthNum = new Date(`${monthStr} 1, ${yearStr}`).getMonth() + 1
    const key = `${yearStr}-${monthNum.toString().padStart(2, '0')}`
    return itemsMap[key] || 0
  })
}

const renderCharts = () => {
  if (incomeChartInstance) incomeChartInstance.destroy()
  if (expenseChartInstance) expenseChartInstance.destroy()

  const incomeMap = sumByMonth(incomes.value)
  const expenseMap = sumByMonth(expenses.value)
  const labels = getLast12MonthsLabels()
  const incomeData = buildMonthlyData(incomeMap)
  const expenseData = buildMonthlyData(expenseMap)

  incomeChartInstance = new Chart(incomeChart.value.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105,0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: { y: { beginAtZero: true } },
    },
  })

  expenseChartInstance = new Chart(expenseChart.value.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Gastos',
          data: expenseData,
          borderColor: '#b91c1c',
          backgroundColor: 'rgba(185, 28, 28,0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: { y: { beginAtZero: true } },
    },
  })
}

async function fetchData() {
  const { data: incData, error: incError } = await supabase.from('incomes').select('*')
  if (incError) alert('Error loading incomes: ' + incError.message)
  else incomes.value = incData || []

  const { data: expData, error: expError } = await supabase.from('expenses').select('*')
  if (expError) alert('Error loading expenses: ' + expError.message)
  else expenses.value = expData || []

  const { data: bevData, error: bevError } = await supabase.from('beverages').select('*')
  if (bevError) alert('Error loading beverages: ' + bevError.message)
  else beverages.value = bevData || []

  const { data: hotBevData, error: hotBevError } = await supabase.from('bebidas_calientes').select('*')
  if (hotBevError) alert('Error loading hot beverages: ' + hotBevError.message)
  else hotBeverages.value = hotBevData || []

  const { data: soupsData, error: soupsError } = await supabase.from('sopas').select('*')
  if (soupsError) alert('Error loading soups: ' + soupsError.message)
  else soups.value = soupsData || []

  renderCharts()
}

onMounted(() => {
  fetchData()
})

watch([incomes, expenses], () => {
  nextTick(() => renderCharts())
})
</script>

<style scoped>
/* Añade estilos si quieres personalizar más el dashboard */
</style>