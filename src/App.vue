<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl sm:text-2xl font-bold text-blue-600">💰 Tracker</h1>
          
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="hidden md:flex items-center gap-1">
            <router-link
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="px-3 py-2 rounded-md text-sm font-medium transition"
              :class="$route.path === link.path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>

        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 py-2 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="block px-3 py-2 rounded-md text-base font-medium transition"
            :class="$route.path === link.path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useTransactionStore } from './stores/transactionStore'

const store = useTransactionStore()
const mobileMenuOpen = ref(false)

const navLinks = [
  { path: '/', label: 'Dashboard' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/receipt', label: 'Receipt Scanner' },
  { path: '/locations', label: 'Locations' },
  { path: '/categories', label: 'Categories' },
  { path: '/comparison', label: 'Comparison' }
]

onMounted(() => {
  store.fetchTransactions()
  store.fetchLocations()
  store.fetchCategories()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}
</style>
