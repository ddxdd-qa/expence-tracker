<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-extrabold text-slate-900">Stock Screener (IDX)</h1>
    
    <div v-if="loading" class="text-center py-10 text-slate-500">Memuat data...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-4 py-3 font-bold text-slate-700">Simbol</th>
            <th class="px-4 py-3 font-bold text-slate-700">Nama</th>
            <th class="px-4 py-3 font-bold text-slate-700">Harga</th>
            <th class="px-4 py-3 font-bold text-slate-700">P/E</th>
            <th class="px-4 py-3 font-bold text-slate-700">Div. Yield</th>
            <th class="px-4 py-3 font-bold text-slate-700">Rekomendasi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stock in stocks" :key="stock.s"
            @click="selected = selected === stock.s ? null : stock.s"
            class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition"
            :class="selected === stock.s ? 'bg-blue-50' : ''"
          >
            <td class="px-4 py-3 font-bold">{{ stock.s }}</td>
            <td class="px-4 py-3">{{ stock.d[0] }}</td>
            <td class="px-4 py-3">Rp {{ Number(stock.d[1] || 0).toLocaleString('id-ID') }}</td>
            <td class="px-4 py-3">{{ stock.d[8] ? stock.d[8].toFixed(2) : '-' }}</td>
            <td class="px-4 py-3">{{ stock.d[9] ? (stock.d[9] * 100).toFixed(2) + '%' : '-' }}</td>
            <td class="px-4 py-3">
              <span :class="getRatingClass(stock.d[3])" class="px-2 py-1 rounded-full text-xs font-bold">
                {{ formatRating(stock.d[3]) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Panel -->
    <div v-if="detail" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-extrabold text-slate-900">{{ detail.s }}</h2>
          <p class="text-sm text-slate-500">{{ detail.d[0] }}</p>
        </div>
        <div class="text-right">
          <p class="text-xl font-extrabold">Rp {{ Number(detail.d[1] || 0).toLocaleString('id-ID') }}</p>
          <p class="text-xs font-bold" :class="Number(detail.d[2] || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ Number(detail.d[2] || 0) >= 0 ? '+' : '' }}{{ Number(detail.d[2] || 0).toFixed(2) }}%
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Moving Averages -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span> Moving Averages
          </h3>
          <div v-for="(item, i) in maSignals" :key="i"
            class="flex items-center justify-between text-sm py-2 px-3 rounded-xl"
            :class="getSignalBg(item.signal)"
          >
            <span class="font-semibold text-slate-700">{{ item.label }}</span>
            <span class="font-bold flex items-center gap-1.5">
              <span class="text-xs text-slate-400 font-normal">{{ formatValue(item.val) }}</span>
              <span :class="getSignalText(item.signal)" class="text-xs px-1.5 py-0.5 rounded font-bold">{{ item.signal }}</span>
            </span>
          </div>
          <div class="pt-2 flex justify-between text-sm font-bold text-slate-600 border-t border-slate-100">
            <span>Composite</span>
            <span :class="getSignalText(formatRating(detail.d[4]))" class="px-2 py-0.5 rounded text-xs">{{ formatRating(detail.d[4]) }}</span>
          </div>
        </div>

        <!-- Oscillators -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span> Oscillators
          </h3>
          <div v-for="(item, i) in oscSignals" :key="i"
            class="flex items-center justify-between text-sm py-2 px-3 rounded-xl"
            :class="getSignalBg(item.signal)"
          >
            <span class="font-semibold text-slate-700">{{ item.label }}</span>
            <span class="font-bold flex items-center gap-1.5">
              <span class="text-xs text-slate-400 font-normal">{{ formatValue(item.val) }}</span>
              <span :class="getSignalText(item.signal)" class="text-xs px-1.5 py-0.5 rounded font-bold">{{ item.signal }}</span>
            </span>
          </div>
          <div class="pt-2 flex justify-between text-sm font-bold text-slate-600 border-t border-slate-100">
            <span>Composite</span>
            <span :class="getSignalText(formatRating(detail.d[5]))" class="px-2 py-0.5 rounded text-xs">{{ formatRating(detail.d[5]) }}</span>
          </div>
        </div>
      </div>

      <!-- Final Verdict -->
      <div class="bg-slate-50 rounded-2xl p-5 flex items-center justify-between">
        <span class="text-sm font-bold text-slate-600">Overall Verdict</span>
        <span :class="getRatingClass(detail.d[3])" class="px-4 py-2 rounded-xl text-sm font-extrabold">
          {{ formatRating(detail.d[3]) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const stocks = ref([])
const loading = ref(true)
const error = ref(null)
const selected = ref(null)

const detail = computed(() => {
  if (!selected.value) return null
  return stocks.value.find(s => s.s === selected.value) || null
})

onMounted(async () => {
  try {
    const res = await axios.get('/api/stocks')
    stocks.value = res.data
  } catch (e) {
    error.value = 'Gagal mengambil data'
  } finally {
    loading.value = false
  }
})

function signal(val, buyLow, sellHigh) {
  if (val == null) return { signal: 'Neutral', val: null }
  if (val <= buyLow) return { signal: 'Buy', val }
  if (val >= sellHigh) return { signal: 'Sell', val }
  return { signal: 'Neutral', val }
}

function signalMACD(macd, signal) {
  if (macd == null || signal == null) return { signal: 'Neutral', val: `${formatValue(macd)} / ${formatValue(signal)}` }
  return macd > signal ? { signal: 'Buy', val: `${formatValue(macd)} / ${formatValue(signal)}` } : { signal: 'Sell', val: `${formatValue(macd)} / ${formatValue(signal)}` }
}

function signalMA(price, ma) {
  const label = ma != null ? `${formatValue(ma)} / ${formatValue(price)}` : '-'
  if (ma == null || price == null) return { signal: 'Neutral', val: label }
  return price > ma ? { signal: 'Buy', val: label } : { signal: 'Sell', val: label }
}

const maSignals = computed(() => {
  if (!detail.value) return []
  const d = detail.value.d
  const price = d[1]
  return [
    { label: 'SMA 20', ...signalMA(price, d[18]) },
    { label: 'SMA 50', ...signalMA(price, d[19]) },
    { label: 'EMA 20', ...signalMA(price, d[20]) },
  ]
})

const oscSignals = computed(() => {
  if (!detail.value) return []
  const d = detail.value.d
  return [
    { label: 'RSI (14)', ...signal(d[10], 30, 70) },
    { label: 'Stochastic %K', ...signal(d[11], 20, 80) },
    { label: 'CCI (20)', ...signal(d[12], -100, 100) },
    { label: 'ADX', ...signalADX(d[13]) },
    { label: 'AO', ...signalAO(d[14]) },
    { label: 'Momentum', ...signalZero(d[15]) },
    { label: 'MACD', ...signalMACD(d[16], d[17]) },
    { label: 'Williams %R', ...signalWPR(d[21]) },
  ]
})

function signalADX(v) {
  if (v == null) return { signal: 'Neutral', val: null }
  return v >= 25 ? { signal: 'Buy', val: v } : { signal: 'Neutral', val: v }
}

function signalAO(v) {
  if (v == null) return { signal: 'Neutral', val: null }
  return v > 0 ? { signal: 'Buy', val: v } : { signal: 'Sell', val: v }
}

function signalZero(v) {
  if (v == null) return { signal: 'Neutral', val: null }
  return v > 0 ? { signal: 'Buy', val: v } : { signal: 'Sell', val: v }
}

function signalWPR(v) {
  if (v == null) return { signal: 'Neutral', val: null }
  if (v <= -80) return { signal: 'Buy', val: v }
  if (v >= -20) return { signal: 'Sell', val: v }
  return { signal: 'Neutral', val: v }
}

function formatValue(v) {
  if (v == null) return '-'
  return Number(v).toFixed(2)
}

function formatRating(val) {
  if (val == null) return 'Neutral'
  if (val >= 0.5) return 'Strong Buy'
  if (val >= 0.1) return 'Buy'
  if (val <= -0.5) return 'Strong Sell'
  if (val <= -0.1) return 'Sell'
  return 'Neutral'
}

function getRatingClass(val) {
  if (val >= 0.1) return 'bg-emerald-100 text-emerald-700'
  if (val <= -0.1) return 'bg-red-100 text-red-600'
  return 'bg-slate-100 text-slate-600'
}

function getSignalText(s) {
  if (s === 'Buy' || s === 'Strong Buy') return 'text-emerald-600'
  if (s === 'Sell' || s === 'Strong Sell') return 'text-red-500'
  return 'text-slate-500'
}

function getSignalBg(s) {
  if (s === 'Buy' || s === 'Strong Buy') return 'bg-emerald-50'
  if (s === 'Sell' || s === 'Strong Sell') return 'bg-red-50'
  return 'bg-slate-50'
}
</script>
