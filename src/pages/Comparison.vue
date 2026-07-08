<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Price & Spending Comparison</h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">Analyze price differences and trends across outlets</p>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 transition hover:shadow-md duration-300">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="text-blue-500 font-extrabold">📊</span> Spending by Location
        </h2>
        <div class="min-h-[250px] flex items-center justify-center">
          <LocationComparisonChart :data="store.groupedByLocation" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 transition hover:shadow-md duration-300">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="text-emerald-500 font-extrabold">📈</span> Monthly Trend
        </h2>
        <div class="min-h-[250px] flex items-center justify-center">
          <TrendChart :transactions="store.filteredTransactions" />
        </div>
      </div>
    </div>

    <!-- Item Price Comparison -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
      <h2 class="text-lg font-bold text-slate-900 mb-2">Item Price Comparison</h2>
      <p class="text-xs text-slate-400 mb-6">Compare prices of identical descriptions across different outlets. The lowest price is highlighted in green.</p>
      
      <div class="space-y-4">
        <div v-if="itemComparisons.length === 0" class="text-center text-slate-500 py-12">
          <div class="text-4xl mb-3">⚖️</div>
          <p class="font-medium text-slate-700">No items to compare yet</p>
          <p class="text-xs text-slate-400 mt-1">Upload receipts or add transactions with matching names across outlets.</p>
        </div>

        <div
          v-for="item in itemComparisons"
          :key="item.description"
          class="border border-slate-100 p-5 bg-slate-50/50 rounded-2xl space-y-4 transition hover:bg-slate-50 duration-200"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 class="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
              <span class="text-blue-500 text-sm">🛒</span>
              <span>{{ item.description }}</span>
            </h3>
            <span class="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl">
              Range: {{ formatCurrency(item.min) }} - {{ formatCurrency(item.max) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div
              v-for="price in item.prices"
              :key="price.location"
              :class="[
                price.amount === item.min && item.prices.length > 1
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm shadow-emerald-500/5' 
                  : price.amount === item.max && item.prices.length > 1
                    ? 'bg-rose-50 border-rose-100 text-rose-950'
                    : 'bg-white border-slate-200/60 text-slate-800'
              ]"
              class="rounded-xl p-3 text-center border shadow-sm relative overflow-hidden transition hover:scale-[1.01]"
            >
              <!-- Price badges -->
              <span 
                v-if="price.amount === item.min && item.prices.length > 1" 
                class="absolute top-0 right-0 bg-emerald-600 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-bl-lg shadow-sm"
              >
                Cheapest
              </span>
              
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate mb-1">{{ price.location }}</p>
              <p class="font-black text-sm">
                {{ formatCurrency(price.amount) }}
              </p>
            </div>
          </div>
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

function formatCurrency(value) {
  return 'Rp ' + Number(value).toLocaleString('id-ID');
}

const itemComparisons = computed(() => {
  const items = {}
  store.filteredTransactions.forEach(t => {
    if (!t.description || !t.location_id) return
    const descLower = t.description.trim().toLowerCase()
    if (!descLower) return

    if (!items[descLower]) {
      items[descLower] = {
        description: t.description, // keep original casing
        locations: {}
      }
    }
    const locName = store.locations.find(l => String(l.id) === String(t.location_id))?.name || 'Unknown'
    if (!items[descLower].locations[locName]) {
      items[descLower].locations[locName] = []
    }
    items[descLower].locations[locName].push(t.amount)
  })

  return Object.values(items).map(item => {
    const prices = Object.entries(item.locations).map(([loc, amounts]) => ({
      location: loc,
      amount: amounts[amounts.length - 1]
    }))
    const amounts = prices.map(p => p.amount)
    return {
      description: item.description,
      prices,
      min: Math.min(...amounts),
      max: Math.max(...amounts)
    }
  }).filter(item => item.prices.length > 0)
    .sort((a, b) => b.prices.length - a.prices.length)
})
</script>
