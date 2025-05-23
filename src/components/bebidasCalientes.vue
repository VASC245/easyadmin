<template>
  <section>
    <h2 class="text-3xl font-bold text-indigo-900 mb-6">Ventas de Bebidas Calientes</h2>

    <form @submit.prevent="addSale" class="max-w-md bg-indigo-50 p-6 rounded-lg shadow-md mx-auto space-y-6">
      <div>
        <label for="date" class="block text-indigo-800 font-semibold mb-1">Fecha</label>
        <input
          type="date"
          id="date"
          v-model="form.date"
          :max="today"
          required
          class="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-indigo-500 focus:ring-indigo-300"
        />
      </div>

      <div>
        <label for="beverage" class="block text-indigo-700 font-semibold mb-1">Bebida Caliente</label>
        <select
          id="beverage"
          v-model="form.beverage"
          required
          class="w-full border border-indigo-400 rounded px-3 py-2 focus:outline-indigo-500 focus:ring-indigo-300"
        >
          <option disabled value="">Seleccione una bebida caliente</option>
          <option>Americano</option>
          <option>Mokaccino</option>
          <option>Expreso</option>
          <option>Capuchino</option>
        </select>
      </div>

      <div>
        <label for="quantity" class="block text-indigo-700 font-semibold mb-1">Cantidad</label>
        <input
          type="number"
          id="quantity"
          v-model.number="form.quantity"
          min="1"
          step="1"
          required
          class="w-full border border-indigo-400 rounded px-3 py-2 focus:outline-indigo-500 focus:ring-indigo-300"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg shadow transition"
      >
        Agregar Venta
      </button>
    </form>

    <!-- Filtro por una sola fecha -->
    <div class="max-w-md mx-auto mt-8 flex items-center gap-2">
      <label for="filterDate" class="font-semibold text-indigo-800">Filtrar por fecha:</label>
      <input
        type="date"
        id="filterDate"
        v-model="filterDate"
        :max="today"
        class="border border-indigo-300 rounded px-2 py-1"
      />
      <button @click="clearFilter" class="bg-indigo-400 hover:bg-indigo-500 text-indigo-900 px-3 py-1 rounded ml-2">
        Limpiar
      </button>
    </div>

    <!-- Resumen filtrado -->
    <section v-if="filteredBeveragesSorted.length" class="max-w-4xl mx-auto mt-6">
      <h3 class="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4">Ventas Recientes de Bebidas Calientes</h3>
      <table class="w-full border-collapse text-left text-indigo-900">
        <thead class="bg-indigo-200 sticky top-0 drop-shadow">
          <tr>
            <th class="px-4 py-2 border-b border-indigo-400">Fecha</th>
            <th class="px-4 py-2 border-b border-indigo-400">Bebida Caliente</th>
            <th class="px-4 py-2 border-b border-indigo-400 text-right">Cantidad</th>
            <th class="px-4 py-2 border-b border-indigo-400 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sale in filteredBeveragesSorted"
            :key="sale.id"
            class="even:bg-indigo-50 hover:bg-indigo-100 transition"
          >
            <td class="px-4 py-2">{{ formatDate(sale.date) }}</td>
            <td class="px-4 py-2">{{ sale.beverage }}</td>
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

    <section v-else class="text-indigo-700 italic text-center mt-6">
      No hay ventas de bebidas calientes para mostrar en la fecha seleccionada.
    </section>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase' // Asegúrate de que la ruta sea correcta

const today = new Date().toISOString().split('T')[0]
const beveragesHot = ref([])

const form = reactive({
  date: today,
  beverage: '',
  quantity: 1,
})

const filterDate = ref('')

const formatDate = (d) => new Date(d).toLocaleDateString()

// Carga inicial de datos desde Supabase
async function fetchBeveragesHot() {
  const { data, error } = await supabase
    .from('bebidas_calientes')
    .select('*')

  if (error) {
    alert('Error al cargar las ventas: ' + error.message)
  } else {
    beveragesHot.value = data
  }
}

const addSale = async () => {
  if (!form.beverage) {
    alert('Por favor, selecciona una bebida caliente.')
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
    id: Date.now().toString(), // Generar un ID único
    date: form.date,
    beverage: form.beverage,
    quantity: form.quantity,
  }

  const { error } = await supabase
    .from('bebidas_calientes')
    .insert([newSale])

  if (error) {
    alert('Error al agregar la venta: ' + error.message)
  } else {
    // Refrescar lista tras insertar
    await fetchBeveragesHot()
    // Reset formulario
    form.beverage = ''
    form.quantity = 1
    form.date = today
  }
}

const deleteSale = async (id) => {
  if (confirm('¿Estás seguro de eliminar esta venta?')) {
    const { error } = await supabase
      .from('bebidas_calientes')
      .delete()
      .match({ id })

    if (error) {
      alert('Error al eliminar la venta: ' + error.message)
    } else {
      // Refrescar lista tras eliminar
      await fetchBeveragesHot()
    }
  }
}

const filteredBeverages = computed(() => {
  if (!filterDate.value) return beveragesHot.value
  return beveragesHot.value.filter(sale => sale.date === filterDate.value)
})

const filteredBeveragesSorted = computed(() => {
  return [...filteredBeverages.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const clearFilter = () => {
  filterDate.value = ''
}

// Cargar datos iniciales al montar
onMounted(() => {
  fetchBeveragesHot()
})
</script>

<style scoped>
/* Optional styles for scrollable table or specific styling */
</style>