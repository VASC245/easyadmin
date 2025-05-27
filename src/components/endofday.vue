<template>
  <section>
    <h2 class="text-3xl font-bold text-yellow-900 mb-6">Cierre de Caja</h2>

    <form @submit.prevent="saveEndOfDay" class="max-w-md bg-yellow-50 p-6 rounded-lg shadow-md mx-auto space-y-6">

      <div>
        <label for="date" class="block text-yellow-800 font-semibold mb-1">Fecha</label>
        <input type="date" id="date" v-model="form.date" :max="today" required
               class="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-yellow-500 focus:ring-yellow-300" />
      </div>

      <div>
        <label for="cash" class="block text-green-700 font-semibold mb-1">Efectivo</label>
        <input type="number" id="cash" v-model.number="form.cash" min="0" step="0.01" required
               class="w-full border border-green-400 rounded px-3 py-2 focus:outline-green-500 focus:ring-green-300" />
      </div>

      <div>
        <label for="transfer" class="block text-purple-700 font-semibold mb-1">Transferencia</label>
        <input type="number" id="transfer" v-model.number="form.transfer" min="0" step="0.01" required
               class="w-full border border-purple-400 rounded px-3 py-2 focus:outline-purple-500 focus:ring-purple-300" />
      </div>

      <div>
        <label for="dataAustro" class="block text-indigo-700 font-semibold mb-1">Data Austro</label>
        <input type="number" id="dataAustro" v-model.number="form.dataAustro" min="0" step="0.01" required
               class="w-full border border-indigo-400 rounded px-3 py-2 focus:outline-indigo-500 focus:ring-indigo-300" />
      </div>

      <div>
        <label for="dataFast" class="block text-indigo-700 font-semibold mb-1">Data Fast</label>
        <input type="number" id="dataFast" v-model.number="form.dataFast" min="0" step="0.01" required
               class="w-full border border-indigo-400 rounded px-3 py-2 focus:outline-indigo-500 focus:ring-indigo-300" />
      </div>

      <div>
        <label for="deUna" class="block text-pink-700 font-semibold mb-1">De Una</label>
        <input type="number" id="deUna" v-model.number="form.deUna" min="0" step="0.01" required
               class="w-full border border-pink-400 rounded px-3 py-2 focus:outline-pink-500 focus:ring-pink-300" />
      </div>

      <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-3 rounded-lg shadow transition">
        Guardar Cierre
      </button>
    </form>

    <div class="max-w-md mx-auto mt-8 flex items-center gap-2">
      <label for="filterDate" class="font-semibold text-yellow-800">Filtrar por fecha:</label>
      <input type="date" id="filterDate" v-model="filterDate" :max="today" class="border border-yellow-300 rounded px-2 py-1" />
      <button @click="clearFilter" class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded ml-2">Limpiar</button>
    </div>

    <section v-if="filteredReportsSorted.length" class="max-w-3xl mx-auto mt-6 space-y-4">
      <h3 class="text-xl font-semibold text-yellow-900 border-b pb-2">Cierre de Caja guardados</h3>
      <ul class="divide-y divide-yellow-300 max-h-80 overflow-y-auto">
        <li v-for="r in filteredReportsSorted" :key="r.date" class="py-3 flex justify-between items-center">
          <div>
            <p><strong>Fecha:</strong> {{ formatDate(r.date) }}</p>
            <p><strong class="text-green-700">Efectivo:</strong> {{ formatCurrency(r.cash) }}</p>
            <p><strong class="text-purple-700">Transferencia:</strong> {{ formatCurrency(r.transfer) }}</p>
            <p><strong class="text-indigo-700">Data Austro:</strong> {{ formatCurrency(r.data_austro) }}</p>
            <p><strong class="text-indigo-700">Data Fast:</strong> {{ formatCurrency(r.data_fast) }}</p>
            <p><strong class="text-pink-700">De Una:</strong> {{ formatCurrency(r.de_una) }}</p>
          </div>
          <button @click="deleteReport(r.date)" title="Delete" class="text-red-600 hover:text-red-800 text-xl font-bold cursor-pointer">&times;</button>
        </li>
      </ul>
    </section>

    <section v-else class="max-w-3xl mx-auto mt-6 text-center text-yellow-800 italic">
      No hay cierres para mostrar para la fecha seleccionada.
    </section>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

const today = new Date().toISOString().split('T')[0]
const reports = ref([])
const filterDate = ref('')

const form = reactive({
  date: today, // Set the initial date to today
  cash: 0,
  transfer: 0,
  dataAustro: 0,
  dataFast: 0,
  deUna: 0,
})

const formatDate = (date) => {
  const d = new Date(date);
  // Adjust the date to ensure it displays correctly
  d.setHours(d.getHours() + d.getTimezoneOffset() / 60);
  return d.toLocaleDateString(); // Ensure consistent formatting
}

const formatCurrency = (val) =>
  val.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

async function fetchReports() {
  let query = supabase.from('end_of_day_reports').select('*').order('date', { ascending: false })
  if (filterDate.value) {
    query = query.eq('date', filterDate.value); // Ensure the filter matches the date format
  }
  const { data, error } = await query
  if (error) {
    alert('Error cargando cierre: ' + error.message)
  } else {
    reports.value = data
  }
}

async function saveEndOfDay() {
  if ([form.cash, form.transfer, form.dataAustro, form.dataFast, form.deUna].some(v => v < 0)) {
    alert('Valores no pueden ser negativos.')
    return
  }
  try {
    // Insert report
    const { error: insertErr } = await supabase.from('end_of_day_reports').upsert({
      date: form.date, // Ensure the date is saved correctly
      cash: form.cash,
      transfer: form.transfer,
      data_austro: form.dataAustro,
      data_fast: form.dataFast,
      de_una: form.deUna,
    })
    if (insertErr) throw insertErr

    // Calculate total income and upsert income record
    const totalIncome = [form.cash, form.transfer, form.dataAustro, form.dataFast, form.deUna].reduce((a, b) => a + b, 0)
    const { error: incomeErr } = await supabase.from('incomes').upsert({
      id: form.date + '-endofday',
      date: form.date,
      amount: totalIncome,
      description: 'Cierre de caja',
    })
    if (incomeErr) throw incomeErr

    alert('Cierre de Caja guardado.')
    await fetchReports()

    // Reset form
    form.cash = 0
    form.transfer = 0
    form.dataAustro = 0
    form.dataFast = 0
    form.deUna = 0

  } catch (e) {
    alert(`Error guardando cierre: ${e.message}`)
  }
}

async function deleteReport(date) {
  if (!confirm('Eliminar cierre?')) return
  try {
    const { error } = await supabase.from('end_of_day_reports').delete().eq('date', date)
    if (error) throw error
    await supabase.from('incomes').delete().eq('id', date + '-endofday')
    await fetchReports()
  } catch (e) {
    alert(`Error eliminando cierre: ${e.message}`)
  }
}

const filteredReportsSorted = computed(() =>
  [...reports.value].sort((a, b) => new Date(b.date) - new Date(a.date))
)

function clearFilter() {
  filterDate.value = ''
  fetchReports()
}

onMounted(fetchReports)
</script>