<template>
  <section>
    <h2 class="text-3xl font-bold text-red-900 mb-6">Gastos</h2>

    <form @submit.prevent="addExpense" class="max-w-md bg-red-50 p-6 rounded-lg shadow-md mx-auto space-y-6">
      <div>
        <label for="date" class="block text-red-800 font-semibold mb-1">Fecha</label>
        <input type="date" id="date" v-model="form.date" :max="today" required class="w-full border border-red-300 rounded px-3 py-2" />
      </div>

      <div>
        <label for="type" class="block text-red-700 font-semibold mb-1">Tipo de Gasto</label>
        <select id="type" v-model="form.type" required class="w-full border border-red-400 rounded px-3 py-2">
          <option disabled value="">Seleccionar tipo</option>
          <option>Empleados</option>
          <option>Granos</option>
          <option>Gastos Basicos</option>
          <option>Carne</option>
          <option>Bebidas</option>
          <option>Otros</option>
        </select>
      </div>

      <div>
        <label for="amount" class="block text-red-700 font-semibold mb-1">Monto</label>
        <input type="number" id="amount" v-model.number="form.amount" min="0.01" step="0.01" required class="w-full border border-red-400 rounded px-3 py-2" />
      </div>

      <div>
        <label for="description" class="block text-red-800 font-semibold mb-1">Descripción (obligatorio)</label>
        <input type="text" id="description" v-model="form.description" placeholder="Description" class="w-full border border-red-300 rounded px-3 py-2" />
      </div>

      <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow transition">Agregar gasto</button>
    </form>

    <div class="max-w-md mx-auto mt-8 flex items-center gap-2">
      <label for="filterDate" class="font-semibold text-red-800">Filtrar por fecha:</label>
      <input type="date" id="filterDate" v-model="filterDate" :max="today" class="border border-red-300 rounded px-2 py-1" />
      <button @click="clearFilter" class="bg-red-400 hover:bg-red-500 text-red-900 px-3 py-1 rounded ml-2">Limpiar</button>
    </div>

    <section v-if="filteredExpensesSorted.length" class="max-w-4xl mx-auto mt-6">
      <h3 class="text-xl font-semibold text-red-800 border-b pb-2 mb-4">Gastos recientes</h3>
      <table class="w-full border-collapse text-left text-red-900">
        <thead class="bg-red-200 sticky top-0 drop-shadow">
          <tr>
            <th class="px-4 py-2 border-b border-red-400">Fecha</th>
            <th class="px-4 py-2 border-b border-red-400">Tipo</th>
            <th class="px-4 py-2 border-b border-red-400">Descripción</th>
            <th class="px-4 py-2 border-b border-red-400 text-right">Monto</th>
            <th class="px-4 py-2 border-b border-red-400 text-center">Accion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in filteredExpensesSorted" :key="expense.id" class="even:bg-red-50 hover:bg-red-100 transition">
            <td class="px-4 py-2">{{ formatDate(expense.date) }}</td>
            <td class="px-4 py-2 capitalize">{{ expense.type }}</td>
            <td class="px-4 py-2">{{ expense.description || '-' }}</td>
            <td class="px-4 py-2 text-right">{{ formatCurrency(expense.amount) }}</td>
            <td class="px-4 py-2 text-center">
              <button @click="deleteExpense(expense.id)" title="Delete" class="text-red-700 hover:text-red-900 transition">×</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="text-red-700 italic text-center mt-6">
      Sin gastos para la fecha seleccionada.
    </section>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid'

const today = new Date().toISOString().split('T')[0]
const expenses = ref([])
const filterDate = ref('')

const form = reactive({
  date: today,
  type: '',
  amount: null,
  description: '',
})

const formatDate = (date) => new Date(date).toLocaleDateString()
const formatCurrency = (val) =>
  val.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

async function fetchExpenses() {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })
  if (error) {
    alert('Error cargando gastos: ' + error.message)
    return
  }
  expenses.value = data || []
}

async function addExpense() {
  if (!form.type) {
    alert('Por favor seleccione un tipo de gasto.')
    return
  }
  if (!form.date) {
    alert('Por favor seleccione una fecha.')
    return
  }
  if (!form.amount || form.amount <= 0) {
    alert('Por favor ingrese un monto valido.')
    return
  }

  const expense = {
    id: uuidv4(),
    date: form.date,
    type: form.type,
    amount: Number(form.amount),
    description: form.description.trim(),
  }

  const { error } = await supabase.from('expenses').insert([expense])
  if (error) {
    alert('Error agregando gasto: ' + error.message)
    return
  }

  alert('Gasto Agregado.')
  form.type = ''
  form.amount = null
  form.description = ''
  form.date = today

  await fetchExpenses()
}

async function deleteExpense(id) {
  if (!confirm('Eliminar gasto?')) return
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) {
    alert('Error eliminando gasto: ' + error.message)
    return
  }
  expenses.value = expenses.value.filter(e => e.id !== id)
  alert('Gasto eliminado.')
}

const filteredExpensesSorted = computed(() => {
  return filterDate.value
    ? expenses.value.filter(expense => expense.date === filterDate.value)
    : expenses.value
})

function clearFilter() {
  filterDate.value = ''
  fetchExpenses()
}

onMounted(fetchExpenses)
</script>