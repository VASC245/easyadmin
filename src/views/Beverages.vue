<template>
  <section>
    <h2 class="text-3xl font-bold text-indigo-900 mb-6">Registro de Venta de Bebidas Frias</h2>

    <form @submit.prevent="addSale" class="max-w-md bg-indigo-50 p-6 rounded-lg shadow-md mx-auto space-y-6">
      <div>
        <label for="date" class="block text-indigo-800 font-semibold mb-1">Fecha</label>
        <input type="date" id="date" v-model="form.date" :max="today" required class="w-full border border-indigo-300 rounded px-3 py-2" />
      </div>

      <div>
        <label for="beverage" class="block text-indigo-700 font-semibold mb-1">Bebida</label>
        <select id="beverage" v-model="form.beverage" required class="w-full border border-indigo-400 rounded px-3 py-2">
          <option disabled value="">Seleccionar bebida</option>
          <option>Vasos Jamaica</option>
          <option>Media Jarra Jamaica</option>
          <option>Jarra Jamaica</option>
          <option>Vasos Chicha</option>
          <option>Media Jarra Chicha</option>
          <option>Jarra Chicha</option>
        </select>
      </div>

      <div>
        <label for="quantity" class="block text-indigo-700 font-semibold mb-1">Cantidad</label>
        <input type="number" id="quantity" v-model.number="form.quantity" min="1" step="1" required class="w-full border border-indigo-400 rounded px-3 py-2" />
      </div>

      <button type="submit" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg shadow transition">
        Agregar
      </button>
    </form>

    <div class="max-w-md mx-auto mt-8 flex items-center gap-2">
      <label for="filterDate" class="font-semibold text-indigo-800">Filtrar por fecha:</label>
      <input type="date" id="filterDate" v-model="filterDate" :max="today" class="border border-indigo-300 rounded px-2 py-1" />
      <button @click="clearFilter" class="bg-indigo-400 hover:bg-indigo-500 text-indigo-900 px-3 py-1 rounded ml-2">Clear</button>
    </div>

    <section v-if="filteredBeveragesSorted.length" class="max-w-4xl mx-auto mt-6">
      <h3 class="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4">Ventas recientes</h3>
      <table class="w-full border-collapse text-left text-indigo-900">
        <thead class="bg-indigo-200 sticky top-0 drop-shadow">
          <tr>
            <th class="px-4 py-2 border-b border-indigo-400">Fecha</th>
            <th class="px-4 py-2 border-b border-indigo-400">Bebida</th>
            <th class="px-4 py-2 border-b border-indigo-400 text-right">Cantidad</th>
            <th class="px-4 py-2 border-b border-indigo-400 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in filteredBeveragesSorted" :key="sale.id" class="even:bg-indigo-50 hover:bg-indigo-100 transition">
            <td class="px-4 py-2">{{ formatDate(sale.date) }}</td>
            <td class="px-4 py-2">{{ sale.beverage }}</td>
            <td class="px-4 py-2 text-right">{{ sale.quantity }}</td>
            <td class="px-4 py-2 text-center">
              <button @click="deleteSale(sale.id)" title="Delete" class="text-red-600 hover:text-red-800 transition font-bold text-xl">×</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="text-indigo-700 italic text-center mt-6">
      No hay venta de bebidas para la fecha seleccionada.
    </section>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid'

const today = new Date().toISOString().split('T')[0]
const beverages = ref([])
const filterDate = ref('')

const form = reactive({
  date: today,
  beverage: '',
  quantity: 1,
})

const formatDate = (date) => {
  const d = new Date(date);
  // Adjust the date to ensure it displays correctly
  d.setHours(d.getHours() + d.getTimezoneOffset() / 60);
  return d.toLocaleDateString(); // Ensure consistent formatting
}

async function fetchBeverages() {
  const { data, error } = await supabase.from('beverages').select('*').order('date', { ascending: false })
  if (error) {
    alert('Error cargando bebidas: ' + error.message)
    return
  }
  beverages.value = data || []
}

async function addSale() {
  if (!form.beverage) {
    alert('Por favor selecciona una bebida.')
    return
  }
  if (!form.date) {
    alert('Por favor selecciona una fecha.')
    return
  }
  if (!form.quantity || form.quantity < 1) {
    alert('Por favor ingresa la cantidad.')
    return
  }

  const sale = {
    id: uuidv4(),
    date: form.date,
    beverage: form.beverage,
    quantity: form.quantity,
  }

  const { error } = await supabase.from('beverages').insert([sale])
  if (error) {
    alert('Error agregando venta de bebida: ' + error.message)
    return
  }

  alert('Venta de bebida agregada.')
  form.beverage = ''
  form.quantity = 1
  form.date = today

  await fetchBeverages()
}

async function deleteSale(id) {
  if (!confirm('Eliminar esta venta?')) return
  const { error } = await supabase.from('beverages').delete().eq('id', id)
  if (error) {
    alert('Error eliminando venta de bebida: ' + error.message)
    return
  }
  beverages.value = beverages.value.filter((b) => b.id !== id)
  alert('Venta de bebida eliminada')
}

const filteredBeveragesSorted = computed(() => {
  return filterDate.value
    ? beverages.value.filter(sale => sale.date === filterDate.value)
    : beverages.value
})

function clearFilter() {
  filterDate.value = ''
  fetchBeverages()
}

onMounted(fetchBeverages)
</script>