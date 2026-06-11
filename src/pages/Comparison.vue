<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Price & Spending Comparison</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Spending by Location</h2>
        <LocationComparisonChart :data="store.groupedByLocation" />
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Monthly Trend</h2>
        <TrendChart :transactions="store.filteredTransactions" />
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">Item Price Comparison</h2>
      <div class="space-y-4">
        <div v-if="itemComparisons.length === 0" class="text-center text-gray-500 py-8">
          No items to compare yet
        </div>
        <div
          v-for="item in itemComparisons"
          :key="item.description"
          class="border-l-4 border-blue-600 p-4 bg-gray-50 rounded"
        >
          <h3 class="font-semibold text-gray-900">{{ item.description }}</h3>
          <div class="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <div
              v-for="price in item.prices"
              :key="price.location"
              class="bg-white rounded p-2 text-center border border-gray-200"
            >
              <p class="text-xs text-gray-600">{{ price.location }}</p>
              <p class="font-semibold text-gray-900">
                {{ price.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }}
              </p>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            Range: {{ item.min.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }} - {{ item.max.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import LocationComparisonChart from '../components/LocationComparisonChart.vue'
import TrendChart from '../components/TrendChart.vue'

const store = useTransactionStore()

const itemComparisons = computed(() => {
  const items = {}
  store.filteredTransactions.forEach(t => {
    if (!items[t.description]) {
      items[t.description] = {}
    }
    const locName = store.locations.find(l => l.id === t.location_id)?.name || 'Unknown'
    if (!items[t.description][locName]) {
      items[t.description][locName] = []
    }
    items[t.description][locName].push(t.amount)
  })

  return Object.entries(items).map(([desc, locations]) => {
    const prices = Object.entries(locations).map(([loc, amounts]) => ({
      location: loc,
      amount: amounts[amounts.length - 1]
    }))
    const amounts = prices.map(p => p.amount)
    return {
      description: desc,
      prices,
      min: Math.min(...amounts),
      max: Math.max(...amounts)
    }
  }).sort((a, b) => b.prices.length - a.prices.length)
})
</script>
