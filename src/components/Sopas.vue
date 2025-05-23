<template>
  <section>
    <h2 class="text-3xl font-bold text-amber-900 mb-6">Ventas de Sopas</h2>

    <form @submit.prevent="addSale" class="max-w-md bg-amber-50 p-6 rounded-lg shadow-md mx-auto space-y-6">
      <div>
        <label for="date" class="block text-amber-800 font-semibold mb-1">Fecha</label>
        <input
          type="date"
          id="date"
          v-model="form.date"
          :max="today"
          required
          class="w-full border border-amber-300 rounded px-3 py-2 focus:outline-amber-500 focus:ring-amber-300"
        />
      </div>

      <div>
        <label for="soup" class="block text-amber-700 font-semibold mb-1">Tipo de Sopa</label>
        <select
          id="soup"
          v-model="form.soup"
          required
          class="w-full border border-amber-400 rounded px-3 py-2 focus:outline-amber-500 focus:ring-amber-300"
        >
          <option disabled value="">Seleccione una sopa</option>
          <option>Caldos de Gallina</option>
          <option>Consomé</option>
        </select>
      </div>

      <div>
        <label for="quantity" class="block text-amber-700 font-semibold mb-1">Cantidad</label>
        <input
          type="number"
          id="quantity"
          v-model.number="form.quantity"
          min="1"
          step="1"
          required
          class="w-full border border-amber-400 rounded px-3 py-2 focus:outline-amber-500 focus:ring-amber-300"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow transition"
      >
        Agregar Venta
      </button>
    </form>

    <!-- Filtro por una sola fecha -->
    <div class="max-w-md mx-auto mt-8 flex items-center gap-2">
      <label for="filterDate" class="font-semibold text-amber-800">Filtrar por fecha:</label>
      <input
        type="date"
        id="filterDate"
        v-model="filterDate"
        :max="today"
        class="border border-amber-300 rounded px-2 py-1"
      />
      <button @click="clearFilter" class="bg-amber-400 hover:bg-amber-500 text-amber-900 px-3 py-1 rounded ml-2">
        Limpiar
      </button>
    </div>

    <!-- Resumen filtrado -->
    <section v-if="filteredSoupsSorted.length" class="max-w-4xl mx-auto mt-6">
      <h3 class="text-xl font-semibold text-amber-700 border-b pb-2 mb-4">Ventas Recientes de Sopas</h3>
      <table class="w-full border-collapse text-left text-amber-900">
        <thead class="bg-amber-200 sticky top-0 drop-shadow">
          <tr>
            <th class="px-4 py-2 border-b border-amber-400">Fecha</th>
            <th class="px-4 py-2 border-b border-amber-400">Tipo de Sopa</th>
            <th class="px-4 py-2 border-b border-amber-400 text-right">Cantidad</th>
            <th class="px-4 py-2 border-b border-amber-400 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sale in filteredSoupsSorted"
            :key="sale.id"
            class="even:bg-amber-50 hover:bg-amber-100 transition"
          >
            <td class="px-4 py-2">{{ formatDate(sale.date) }}</td>
            <td class="px-4 py-2">{{ sale.soup }}</td>
            <td class="px-4 py-2 text-right">{{ sale.quantity }}</td>
            <td class="px-4 py-2 text-center">
              <button
                @click="deleteSale(sale.id)"
                title="Eliminar"
                class="text-red-600 hover:text-red-800 transition font-bold text-xl"
              >
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="text-amber-700 italic text-center mt-6">
      No hay ventas de sopas para mostrar en la fecha seleccionada.
    </section>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase' // Ajusta la ruta si es necesario

const today = new Date().toISOString().split('T')[0]
const soups = ref([])

const form = reactive({
  date: today,
  soup: '',
  quantity: 1,
})

const filterDate = ref('')

const formatDate = (d) => new Date(d).toLocaleDateString()

const fetchSoups = async () => {
  const { data, error } = await supabase
    .from('sopas')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    alert('Error al cargar las ventas: ' + error.message)
  } else {
    soups.value = data
  }
}

const addSale = async () => {
  if (!form.soup) {
    alert('Por favor, selecciona un tipo de sopa.')
    return
  }
  if (!form.date) {
    alert('Por favor, selecciona una fecha.')
    return
  }
  if (!form.quantity || form.quantity < 1) {
    alert('Por favor, ingresa una cantidad válida.')
    return
  }

  const newSale = {
    id: Date.now().toString(),
    date: form.date,
    soup: form.soup,
    quantity: form.quantity,
  }

  const { error } = await supabase
    .from('sopas')
    .insert([newSale])

  if (error) {
    alert('Error al agregar la venta: ' + error.message)
  } else {
    await fetchSoups()
    form.soup = ''
    form.quantity = 1
    form.date = today
  }
}

const deleteSale = async (id) => {
  if (confirm('¿Estás seguro de eliminar esta venta?')) {
    const { error } = await supabase
      .from('sopas')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error al eliminar la venta: ' + error.message)
    } else {
      await fetchSoups()
    }
  }
}

const filteredSoups = computed(() => {
  if (!filterDate.value) return soups.value
  return soups.value.filter(sale => sale.date === filterDate.value)
})

const filteredSoupsSorted = computed(() => {
  return [...filteredSoups.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const clearFilter = () => {
  filterDate.value = ''
}

onMounted(() => {
  fetchSoups()
})
</script>

<style scoped>
/* Opcional, estilos para tabla scrollable */
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