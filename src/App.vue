<template>
  <div class="max-w-6xl mx-auto py-8 px-6 flex flex-col min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-300 font-sans">
    <header class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 class="text-4xl font-extrabold text-yellow-900 drop-shadow-lg">Manejo Financiero</h1>
      <Navbar />
    </header>

    <main class="flex-grow bg-white rounded-lg shadow p-6">
      <router-view />
    </main>

    <footer class="text-center text-yellow-800 text-sm mt-8">
      &copy; 2024 Manejo Financiero CR
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>