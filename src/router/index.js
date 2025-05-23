import { createRouter, createWebHistory } from 'vue-router'
import dashboard from '@/components/dashboard.vue'
import endofday from '@/components/endofday.vue'
import Expenses from '@/views/Expenses.vue'
import reportsView from '@/views/reportsView.vue'
import Beverages from '@/views/Beverages.vue'
import bebidasCalientes from '@/components/bebidasCalientes.vue'
import Sopas from '@/components/Sopas.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  { path: '/', component: dashboard },
  { path: '/endofday', component: endofday },
  { path: '/expenses', component: Expenses },
  { path: '/beverages', component: Beverages },
  {path:'/bebidas-calientes', component: bebidasCalientes},
  {path:'/sopas', component:Sopas},
  { path: '/reports', component: reportsView }

  ],
})

export default router
