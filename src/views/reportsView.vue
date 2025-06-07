<template>
  <section>
    <h2 class="text-3xl font-bold text-yellow-900 mb-6">Reporte Semanal</h2>
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Selector de semana y botones -->
      <div class="max-w-md mx-auto flex items-center gap-4">
        <label for="weekPicker" class="font-semibold text-yellow-800">Seleccionar semana:</label>
        <input
          id="weekPicker"
          type="week"
          v-model="selectedWeek"
          class="border border-yellow-400 rounded px-3 py-2 focus:outline-yellow-500 focus:ring-yellow-300"
        />
        <button
          @click="generateReport"
          class="bg-yellow-500 text-yellow-900 px-5 py-2 font-semibold rounded shadow hover:bg-yellow-600 transition"
        >
          Realizar Reporte
        </button>
        <button
          v-if="reportGenerated"
          @click="downloadPdf"
          class="bg-green-600 text-white px-5 py-2 font-semibold rounded shadow hover:bg-green-700 transition"
        >
          Descargar PDF
        </button>
      </div>

      <!-- Periodo actual -->
      <div v-if="selectedWeek" class="text-center text-yellow-700 font-semibold">
        Reporte para la semana {{ selectedWeek }} ({{ formatDate(startDateRef) }} - {{ formatDate(endDateRef) }})
      </div>

      <!-- Reporte generado en pantalla -->
      <div v-if="reportGenerated" class="mt-6 bg-yellow-50 rounded-lg p-6 shadow space-y-4 max-w-4xl mx-auto">
        <div class="grid grid-cols-3 gap-6 text-center">
          <div>
            <p class="font-semibold text-green-700">Ingreso Total</p>
            <p class="text-xl font-bold text-green-900">{{ formatCurrency(reportData.totalIncome) }}</p>
          </div>
          <div>
            <p class="font-semibold text-red-700">Gasto Total</p>
            <p class="text-xl font-bold text-red-900">{{ formatCurrency(reportData.totalExpenses) }}</p>
          </div>
          <div>
            <p class="font-semibold">Balance Neto</p>
            <p :class="reportData.netBalance >= 0 ? 'text-blue-900' : 'text-red-900'" class="text-xl font-bold">
              {{ formatCurrency(reportData.netBalance) }}
            </p>
          </div>
        </div>

        <div>
          <h4 class="font-semibold text-yellow-800 mt-6 mb-2">Desglose de Ventas de Bebidas Calientes</h4>
          <ul class="divide-y divide-yellow-300 max-h-52 overflow-y-auto">
            <li v-for="(drinkSale, index) in drinkSales" :key="index" class="py-2 flex justify-between">
              <span>{{ drinkSale.beverage }}</span>
              <span>{{ drinkSale.quantity }}</span>
            </li>
            <li v-if="drinkSales.length === 0" class="py-2 text-center italic text-yellow-700">
              No hay ventas de bebidas calientes en esta semana.
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-yellow-800 mt-6 mb-2">Desglose de Ventas de Bebidas Frías</h4>
          <ul class="divide-y divide-yellow-300 max-h-52 overflow-y-auto">
            <li v-for="(coldDrinkSale, index) in coldDrinkSales" :key="index" class="py-2 flex justify-between">
              <span>{{ coldDrinkSale.beverage }}</span>
              <span>{{ coldDrinkSale.quantity }}</span>
            </li>
            <li v-if="coldDrinkSales.length === 0" class="py-2 text-center italic text-yellow-700">
              No hay ventas de bebidas frías en esta semana.
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-yellow-800 mt-6 mb-2">Desglose de Ventas de Sopas</h4>
          <ul class="divide-y divide-yellow-300 max-h-52 overflow-y-auto">
            <li v-for="(soupSale, index) in soupSales" :key="index" class="py-2 flex justify-between">
              <span>{{ soupSale.soup }}</span>
              <span>{{ soupSale.quantity }}</span>
            </li>
            <li v-if="soupSales.length === 0" class="py-2 text-center italic text-yellow-700">
              No hay ventas de sopas en esta semana.
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-yellow-800 mt-6 mb-2">Desglose Detallado de Gastos</h4>
          <table class="w-full border-collapse text-left text-yellow-900 max-h-48 overflow-y-auto block">
            <thead class="bg-yellow-200 sticky top-0 drop-shadow">
              <tr>
                <th class="px-4 py-2 border-b border-yellow-400">Fecha</th>
                <th class="px-4 py-2 border-b border-yellow-400">Tipo</th>
                <th class="px-4 py-2 border-b border-yellow-400">Descripción</th>
                <th class="px-4 py-2 border-b border-yellow-400 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expensesInPeriod" :key="expense.id" class="even:bg-yellow-50">
                <td class="px-4 py-2">{{ formatDate(expense.date) }}</td>
                <td class="px-4 py-2 capitalize">{{ expense.type }}</td>
                <td class="px-4 py-2">{{ expense.description || '-' }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(expense.amount) }}</td>
              </tr>
              <tr v-if="expensesInPeriod.length === 0">
                <td colspan="4" class="text-center py-4 italic text-yellow-700">No hay gastos en esta semana.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Nueva sección para cierres de caja -->
        <div>
          <h4 class="font-semibold text-yellow-800 mt-6 mb-2">Desglose Detallado de Cierres de Caja</h4>
          <table class="w-full border-collapse text-left text-yellow-900 max-h-48 overflow-y-auto block">
            <thead class="bg-yellow-200 sticky top-0 drop-shadow">
              <tr>
                <th class="px-4 py-2 border-b border-yellow-400">Fecha</th>
                <th class="px-4 py-2 border-b border-yellow-400 text-right">Efectivo</th>
                <th class="px-4 py-2 border-b border-yellow-400 text-right">Transferencia</th>
                <th class="px-4 py-2 border-b border-yellow-400 text-right">Data Austro</th>
                <th class="px-4 py-2 border-b border-yellow-400 text-right">Data Fast</th>
                <th class="px-4 py-2 border-b border-yellow-400 text-right">De Una</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="close in closesInPeriod" :key="close.date" class="even:bg-yellow-50">
                <td class="px-4 py-2">{{ formatDate(close.date) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(close.cash) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(close.transfer) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(close.data_austro) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(close.data_fast) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(close.de_una) }}</td>
              </tr>
              <tr v-if="closesInPeriod.length === 0">
                <td colspan="6" class="text-center py-4 italic text-yellow-700">No hay cierres de caja en esta semana.</td>
              </tr>
            </tbody>
            <tfoot class="font-semibold bg-yellow-100">
              <tr>
                <td class="px-4 py-2">Total</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(closeTotals.cash) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(closeTotals.transfer) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(closeTotals.data_austro) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(closeTotals.data_fast) }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(closeTotals.de_una) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../supabase'

const selectedWeek = ref('')
const incomes = ref([])
const expenses = ref([])
const bebidasCalientes = ref([]) // Hot beverages
const bebidasFrias = ref([])      // Cold beverages
const soups = ref([])             // Soups
const closes = ref([])            // Cierres de caja

const reportData = reactive({
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
})

const drinkSales = ref([])         // Hot beverages sales aggregated
const coldDrinkSales = ref([])     // Cold beverages sales aggregated
const soupSales = ref([])          // Soups sales aggregated
const reportGenerated = ref(false)
const incomesInPeriod = ref([])
const expensesInPeriod = ref([])
const closesInPeriod = ref([])
const closeTotals = reactive({
  cash: 0,
  transfer: 0,
  data_austro: 0,
  data_fast: 0,
  de_una: 0,
})
const startDateRef = ref(null)
const endDateRef = ref(null)

const formatCurrency = (val) => val.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
const formatDate = (d) => {
  const date = new Date(d)
  // Adjust date for timezone offset to display correct day
  date.setHours(date.getHours() + date.getTimezoneOffset() / 60)
  return date.toLocaleDateString()
}

const reportWeekLabel = computed(() => {
  if (!selectedWeek.value) return 'Selecciona una semana'
  return selectedWeek.value
})

async function fetchData() {
  const { data: incomeData, error: incomeError } = await supabase.from('incomes').select('*')
  if (incomeError) {
    alert('Error al cargar ingresos: ' + incomeError.message)
    return
  }
  incomes.value = incomeData || []

  const { data: expenseData, error: expenseError } = await supabase.from('expenses').select('*')
  if (expenseError) {
    alert('Error al cargar gastos: ' + expenseError.message)
    return
  }
  expenses.value = expenseData || []

  const { data: hotBeverageData, error: hotBeverageError } = await supabase.from('bebidas_calientes').select('*')
  if (hotBeverageError) {
    alert('Error al cargar ventas de bebidas calientes: ' + hotBeverageError.message)
    return
  }
  bebidasCalientes.value = hotBeverageData || []

  const { data: coldBeverageData, error: coldBeverageError } = await supabase.from('beverages').select('*')
  if (coldBeverageError) {
    alert('Error al cargar ventas de bebidas frías: ' + coldBeverageError.message)
    return
  }
  bebidasFrias.value = coldBeverageData || []

  const { data: soupData, error: soupError } = await supabase.from('sopas').select('*')
  if (soupError) {
    alert('Error al cargar ventas de sopas: ' + soupError.message)
    return
  }
  soups.value = soupData || []

  const { data: closesData, error: closesError } = await supabase.from('end_of_day_reports').select('*')
  if (closesError) {
    alert('Error al cargar cierres de caja: ' + closesError.message)
    return
  }
  closes.value = closesData || []
}

function parseWeekYear(weekStr) {
  if (!weekStr) return null
  const [year, week] = weekStr.split('-W').map(Number)
  if (!year || !week) return null
  return { year, week }
}

function getISOWeekStart(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const day = simple.getDay()
  // Calculate the Monday of the ISO week
  const ISOweekStart = day <= 4 ? new Date(simple.setDate(simple.getDate() - simple.getDay() + 1)) : new Date(simple.setDate(simple.getDate() + 8 - simple.getDay()))
  return ISOweekStart
}

async function generateReport() {
  await fetchData()

  const res = parseWeekYear(selectedWeek.value)
  if (!res) {
    alert('Por favor selecciona una semana válida.')
    return
  }

  const startDate = getISOWeekStart(res.year, res.week)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  startDateRef.value = startDate
  endDateRef.value = endDate

  incomesInPeriod.value = incomes.value.filter((i) => {
    const d = new Date(i.date)
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60)
    return d >= startDate && d <= endDate
  })

  expensesInPeriod.value = expenses.value.filter((e) => {
    const d = new Date(e.date)
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60)
    return d >= startDate && d <= endDate
  })

  const bebidasHotInPeriod = bebidasCalientes.value.filter(b => {
    const d = new Date(b.date)
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60)
    return d >= startDate && d <= endDate
  })

  const bebidasColdInPeriod = bebidasFrias.value.filter(b => {
    const d = new Date(b.date)
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60)
    return d >= startDate && d <= endDate
  })

  const soupsInPeriod = soups.value.filter(s => {
    const d = new Date(s.date)
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60)
    return d >= startDate && d <= endDate
  })

  closesInPeriod.value = closes.value.filter(c => {
    const d = new Date(c.date)
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60)
    return d >= startDate && d <= endDate
  })

  reportData.totalIncome = incomesInPeriod.value.reduce((a, i) => a + (i.amount || 0), 0)
  reportData.totalExpenses = expensesInPeriod.value.reduce((a, e) => a + (e.amount || 0), 0)
  reportData.netBalance = reportData.totalIncome - reportData.totalExpenses

  // Aggregate hot beverages sales by beverage type
  const drinkMap = {}
  for (const sale of bebidasHotInPeriod) {
    if (drinkMap[sale.beverage]) {
      drinkMap[sale.beverage] += sale.quantity
    } else {
      drinkMap[sale.beverage] = sale.quantity
    }
  }
  drinkSales.value = Object.entries(drinkMap).map(([bev, qty]) => ({ beverage: bev, quantity: qty }))

  // Aggregate cold beverages sales by beverage type
  const coldDrinkMap = {}
  for (const sale of bebidasColdInPeriod) {
    if (coldDrinkMap[sale.beverage]) {
      coldDrinkMap[sale.beverage] += sale.quantity
    } else {
      coldDrinkMap[sale.beverage] = sale.quantity
    }
  }
  coldDrinkSales.value = Object.entries(coldDrinkMap).map(([bev, qty]) => ({ beverage: bev, quantity: qty }))

  // Aggregate soups sales by soup type
  const soupMap = {}
  for (const sale of soupsInPeriod) {
    if (soupMap[sale.soup]) {
      soupMap[sale.soup] += sale.quantity
    } else {
      soupMap[sale.soup] = sale.quantity
    }
  }
  soupSales.value = Object.entries(soupMap).map(([soup, qty]) => ({ soup, quantity: qty }))

  // Calculate totals for closesInPeriod
  closeTotals.cash = closesInPeriod.value.reduce((a, c) => a + (c.cash || 0), 0)
  closeTotals.transfer = closesInPeriod.value.reduce((a, c) => a + (c.transfer || 0), 0)
  closeTotals.data_austro = closesInPeriod.value.reduce((a, c) => a + (c.data_austro || 0), 0)
  closeTotals.data_fast = closesInPeriod.value.reduce((a, c) => a + (c.data_fast || 0), 0)
  closeTotals.de_una = closesInPeriod.value.reduce((a, c) => a + (c.de_una || 0), 0)

  reportGenerated.value = true
}

function downloadPdf() {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Reporte Semanal: ${reportWeekLabel.value}`, 14, 20)
  doc.text(`Periodo: ${formatDate(startDateRef.value)} - ${formatDate(endDateRef.value)}`, 14, 28)
  doc.setFontSize(14)
  doc.text('Resumen General', 14, 40)
  doc.setFontSize(12)
  doc.text(`Ingreso Total: ${formatCurrency(reportData.totalIncome)}`, 14, 48)
  doc.text(`Gasto Total: ${formatCurrency(reportData.totalExpenses)}`, 14, 56)
  doc.text(`Balance Neto: ${formatCurrency(reportData.netBalance)}`, 14, 64)

  // Bebidas Calientes
  doc.setFontSize(14)
  doc.text('Desglose de Ventas de Bebidas Calientes:', 14, 78)
  autoTable(doc, {
    startY: 82,
    head: [['Bebida Caliente', 'Cantidad']],
    body: drinkSales.value.length ? drinkSales.value.map(ds => [ds.beverage, ds.quantity]) : [['No hay ventas de bebidas calientes', '']],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 221, 89] }
  })

  // Bebidas Frías
  const yAfterHotDrinks = doc.lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.text('Desglose de Ventas de Bebidas Frías:', 14, yAfterHotDrinks)
  autoTable(doc, {
    startY: yAfterHotDrinks + 4,
    head: [['Bebida Fría', 'Cantidad']],
    body: coldDrinkSales.value.length ? coldDrinkSales.value.map(cds => [cds.beverage, cds.quantity]) : [['No hay ventas de bebidas frías', '']],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 221, 89] }
  })

  // Sopas
  const yAfterColdDrinks = doc.lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.text('Desglose de Ventas de Sopas:', 14, yAfterColdDrinks)
  autoTable(doc, {
    startY: yAfterColdDrinks + 4,
    head: [['Sopa', 'Cantidad']],
    body: soupSales.value.length ? soupSales.value.map(ss => [ss.soup, ss.quantity]) : [['No hay ventas de sopas', '']],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 221, 89] }
  })

  // Gastos Detallados
  const yAfterSoups = doc.lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.text('Desglose Detallado de Gastos:', 14, yAfterSoups)
  autoTable(doc, {
    startY: yAfterSoups + 4,
    head: [['Fecha', 'Tipo', 'Descripción', 'Cantidad']],
    body: expensesInPeriod.value.length ? expensesInPeriod.value.map(e => [formatDate(e.date), e.type, e.description || '-', formatCurrency(e.amount)]) : [['No hay gastos', '', '', '']],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [255, 221, 89] }
  })

  // Cierres de Caja Detallados
  const yAfterExpenses = doc.lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.text('Desglose Detallado de Cierres de Caja:', 14, yAfterExpenses)
  autoTable(doc, {
    startY: yAfterExpenses + 4,
    head: [
      'Fecha',
      'Efectivo',
      'Transferencia',
      'Data Austro',
      'Data Fast',
      'De Una'
    ],
    body: closesInPeriod.value.length
      ? closesInPeriod.value.map(c => [
          formatDate(c.date),
          formatCurrency(c.cash),
          formatCurrency(c.transfer),
          formatCurrency(c.data_austro),
          formatCurrency(c.data_fast),
          formatCurrency(c.de_una),
        ])
      : [['No hay cierres de caja', '', '', '', '', '']],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [255, 221, 89] },
    foot: [
      [
        'Total',
        formatCurrency(closeTotals.cash),
        formatCurrency(closeTotals.transfer),
        formatCurrency(closeTotals.data_austro),
        formatCurrency(closeTotals.data_fast),
        formatCurrency(closeTotals.de_una),
      ],
    ],
  })

  doc.save(`reporte_semanal_${selectedWeek.value}.pdf`)
}

onMounted(() => {
  setCurrentWeek()
})

function setCurrentWeek() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentWeek = getISOWeek(currentDate)
  selectedWeek.value = `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`
}

function getISOWeek(date) {
  const tempDate = new Date(date.getTime())
  tempDate.setHours(0, 0, 0, 0)
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7))
  const yearStart = new Date(tempDate.getFullYear(), 0, 1)
  return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7)
}
</script>

<style scoped>
table {
  border-spacing: 0;
  border-collapse: collapse;
}
thead th {
  position: sticky;
  top: 0;
  background: #fef3c7;
  z-index: 10;
}
tbody {
  overflow-y: auto;
  max-height: 200px;
  display: block;
}
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
</style>

``` ⬤