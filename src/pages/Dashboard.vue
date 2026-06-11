<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
      <button
        @click="showAddModal = true"
        class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
      >
        + Add
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Date Range</h2>
      <div class="flex flex-col gap-3">
        <div class="flex gap-2 flex-wrap">
          <div class="flex-1 min-w-[140px]">
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              v-model="filterFrom"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm"
            />
          </div>
          <div class="flex-1 min-w-[140px]">
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              v-model="filterTo"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm"
            />
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            @click="setWeekRange"
            class="flex-1 min-w-[80px] bg-gray-200 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm"
          >
            Week
          </button>
          <button
            @click="setMonthRange"
            class="flex-1 min-w-[80px] bg-gray-200 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm"
          >
            Month
          </button>
          <button
            @click="setYearRange"
            class="flex-1 min-w-[80px] bg-gray-200 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm"
          >
            Year
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 class="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Spent</h3>
        <p class="text-2xl sm:text-3xl font-bold text-blue-600">{{ (totalSpent / 1000000).toFixed(1) }}M</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 class="text-xs sm:text-sm font-medium text-gray-600 mb-2">Transactions</h3>
        <p class="text-2xl sm:text-3xl font-bold text-green-600">{{ store.filteredTransactions.length }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 class="text-xs sm:text-sm font-medium text-gray-600 mb-2">Avg per Tx</h3>
        <p class="text-2xl sm:text-3xl font-bold text-purple-600">{{ (avgPerTransaction / 1000).toFixed(0) }}k</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Spending by Location</h2>
        <div class="w-full overflow-x-auto">
          <MonthlyChart :data="store.groupedByLocation" />
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Spending by Category</h2>
        <div class="w-full overflow-x-auto">
          <CategoryChart :data="store.groupedByCategory" />
        </div>
      </div>
    </div>

    <AddTransactionModal v-if="showAddModal" @close="showAddModal = false" @added="showAddModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import MonthlyChart from '../components/MonthlyChart.vue'
import CategoryChart from '../components/CategoryChart.vue'
import AddTransactionModal from '../components/AddTransactionModal.vue'

const store = useTransactionStore()
const showAddModal = ref(false)
const filterFrom = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const filterTo = ref(new Date().toISOString().split('T')[0])

const totalSpent = computed(() => {
  return store.filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
})

const avgPerTransaction = computed(() => {
  return store.filteredTransactions.length > 0 ? totalSpent.value / store.filteredTransactions.length : 0
})

function setWeekRange() {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  filterFrom.value = weekAgo.toISOString().split('T')[0]
  filterTo.value = today.toISOString().split('T')[0]
}

function setMonthRange() {
  const today = new Date()
  const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1)
  filterFrom.value = monthAgo.toISOString().split('T')[0]
  filterTo.value = today.toISOString().split('T')[0]
}

function setYearRange() {
  const today = new Date()
  const yearAgo = new Date(today.getFullYear(), 0, 1)
  filterFrom.value = yearAgo.toISOString().split('T')[0]
  filterTo.value = today.toISOString().split('T')[0]
}

watch([filterFrom, filterTo], () => {
  store.setDateFilter(new Date(filterFrom.value), new Date(filterTo.value))
})
</script>
