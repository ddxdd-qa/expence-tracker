<template>
  <div id="app" class="min-h-screen bg-slate-50 text-slate-800 pb-20 md:pb-0">
    <!-- Desktop Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <span class="text-2xl">💰</span>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HematSave
            </span>
          </div>

          <!-- Desktop Nav Links -->
          <nav class="hidden md:flex items-center gap-1">
            <router-link
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
              :class="$route.path === link.path 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
            >
              <!-- Icon for Desktop Nav -->
              <svg v-if="link.icon === 'home'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              <svg v-else-if="link.icon === 'list'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              <svg v-else-if="link.icon === 'scan'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
              <svg v-else-if="link.icon === 'location'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <svg v-else-if="link.icon === 'tag'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.159 3.659A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>
              <svg v-else-if="link.icon === 'compare'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L17.5 12M21 7.5H7.5"/></svg>
              <svg v-else-if="link.icon === 'item'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              <svg v-else-if="link.icon === 'debt'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>{{ link.label }}</span>
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-2xl z-50 px-2 py-1 flex justify-around items-center safe-bottom">
      <router-link
        v-for="link in primaryNavLinks"
        :key="link.path"
        :to="link.path"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 text-[10px] font-semibold whitespace-nowrap"
        :class="$route.path === link.path 
          ? 'text-blue-600 scale-105' 
          : 'text-slate-500 hover:text-slate-700'"
      >
        <span class="mb-0.5">
          <svg v-if="link.icon === 'home'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <svg v-else-if="link.icon === 'list'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          <svg v-else-if="link.icon === 'item'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <svg v-else-if="link.icon === 'compare'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L17.5 12M21 7.5H7.5"/></svg>
          <svg v-else-if="link.icon === 'scan'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
        </span>
        <span>{{ link.mobileLabel }}</span>
      </router-link>

      <!-- More button -->
      <button @click="showMoreMenu = !showMoreMenu"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 text-[10px] font-semibold"
        :class="showMoreMenu ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'"
      >
        <span class="mb-0.5">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </span>
        <span>More</span>
      </button>
    </nav>

    <!-- More menu overlay -->
    <div v-if="showMoreMenu" class="md:hidden fixed inset-0 z-40 bg-black/20" @click="showMoreMenu = false"></div>
    <div v-if="showMoreMenu" class="md:hidden fixed bottom-24 left-3 right-3 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 overflow-hidden">
      <router-link
        v-for="link in moreNavLinks"
        :key="link.path"
        :to="link.path"
        @click="showMoreMenu = false"
        class="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition"
        :class="$route.path === link.path ? 'text-blue-600 bg-blue-50' : ''"
      >
        <span class="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <svg v-if="link.icon === 'location'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <svg v-else-if="link.icon === 'tag'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.159 3.659A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>
          <svg v-else-if="link.icon === 'compare'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L17.5 12M21 7.5H7.5"/></svg>
          <svg v-else-if="link.icon === 'debt'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </span>
        <span>{{ link.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionStore } from './stores/transactionStore'

const store = useTransactionStore()
const showMoreMenu = ref(false)

const navLinks = [
  { path: '/', label: 'Dashboard', mobileLabel: 'Dashboard', icon: 'home' },
  { path: '/transactions', label: 'Transactions', mobileLabel: 'History', icon: 'list' },
  { path: '/items', label: 'Items', mobileLabel: 'Items', icon: 'item' },
  { path: '/screener', label: 'Screener', mobileLabel: 'Stocks', icon: 'compare' },
  { path: '/receipt', label: 'Receipt Scanner', mobileLabel: 'Scan', icon: 'scan' },
  { path: '/locations', label: 'Locations', mobileLabel: 'Outlets', icon: 'location' },
  { path: '/categories', label: 'Categories', mobileLabel: 'Categories', icon: 'tag' },
  { path: '/comparison', label: 'Comparison', mobileLabel: 'Compare', icon: 'compare' },
  { path: '/debts', label: 'Debts', mobileLabel: 'Debts', icon: 'debt' }
]

const primaryNavLinks = navLinks.slice(0, 4)
const moreNavLinks = navLinks.slice(4)

onMounted(() => {
  store.fetchTransactions()
  store.fetchLocations()
  store.fetchCategories()
  store.fetchAccounts()
  store.fetchBudgets()
  store.fetchDebts()
  store.fetchItems()
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Safe areas for iOS devices */
.safe-bottom {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
}

/* Hide scrollbar on mobile nav */
.scrollbar-hide::-webkit-scrollbar { display: none }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
</style>
