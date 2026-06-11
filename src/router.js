import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import TransactionLog from './pages/TransactionLog.vue'
import Locations from './pages/Locations.vue'
import Categories from './pages/Categories.vue'
import Comparison from './pages/Comparison.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/transactions', component: TransactionLog, name: 'Transactions' },
  { path: '/locations', component: Locations, name: 'Locations' },
  { path: '/categories', component: Categories, name: 'Categories' },
  { path: '/comparison', component: Comparison, name: 'Comparison' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
