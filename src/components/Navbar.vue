<template>
  <nav class="flex gap-4 text-yellow-900 bg-yellow-200 rounded-lg shadow px-4 py-2">
    <RouterLink to="/" class="nav-link" active-class="nav-link-active" exact>Dashboard</RouterLink>
    <RouterLink to="/endofday" class="nav-link" active-class="nav-link-active">Cierre de Caja</RouterLink>
    <RouterLink to="/beverages" class="nav-link" active-class="nav-link-active">Bebidas Frias</RouterLink>
    <router-link to="/bebidas-calientes" class="nav-link" active-class="nav-link-active">Bebidas Calientes</router-link>
    <router-link to="/sopas" class="nav-link" active-class="nav-link-active">Sopas</router-link>
    <RouterLink to="/expenses" class="nav-link" active-class="nav-link-active">Gastos</RouterLink>
    <RouterLink to="/reports" class="nav-link" active-class="nav-link-active">Reportes</RouterLink>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.nav-link-active {
  background-color: #fbbf24; /* Tailwind yellow-400 */
  color: #78350f; /* Tailwind yellow-900 */
  font-weight: 600;
  border-radius: 0.5rem;
}

.nav-link {
  cursor: pointer;
  color: #78350f; /* Tailwind yellow-800 */
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: #78350f; /* Tailwind yellow-900 */
}
</style>