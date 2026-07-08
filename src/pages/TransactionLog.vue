<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          <template v-if="accountFilterName">{{ accountFilterName }}</template>
          <template v-else>Transactions</template>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          <template v-if="accountFilterName">Transaction history for {{ accountFilterName }}</template>
          <template v-else>Manage and audit your transaction history</template>
        </p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base flex items-center gap-1.5"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add</span>
      </button>
    </div>

    <!-- Type filter -->
    <div class="flex bg-slate-100 rounded-xl p-0.5">
      <button
        type="button"
        @click="typeFilter = 'all'"
        class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        :class="typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >All</button>
      <button
        type="button"
        @click="typeFilter = 'expense'"
        class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        :class="typeFilter === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >Expense</button>
      <button
        type="button"
        @click="typeFilter = 'income'"
        class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        :class="typeFilter === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >Income</button>
    </div>

    <!-- Date Filter -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Date Range</h2>
          <p class="text-xs text-slate-400">{{ store.filteredTransactions.length }} of {{ store.transactions.length }} shown</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button @click="setWeekRange"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200"
            :class="isWeekSelected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'"
          >Last 7 Days</button>
          <button @click="setMonthRange"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200"
            :class="isMonthSelected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'"
          >This Month</button>
          <button @click="setAllRange"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200"
            :class="!isWeekSelected && !isMonthSelected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'"
          >All Time</button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From</label>
          <input v-model="filterFrom" type="date"
            class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none transition-all duration-200"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
          <input v-model="filterTo" type="date"
            class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none transition-all duration-200"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredByType.length === 0" class="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
      <div class="text-5xl mb-4">📝</div>
      <h3 class="text-lg font-bold text-slate-900 mb-1">No Transactions Found</h3>
      <p class="text-sm text-slate-500 max-w-sm mx-auto">No transactions match your current date range filter, or you haven't uploaded any transactions yet.</p>
    </div>

    <!-- Desktop Table View -->
    <div v-else class="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50/70 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 text-left font-semibold text-slate-600">Date</th>
            <th class="px-6 py-4 text-left font-semibold text-slate-600">Wallet</th>
            <th class="px-6 py-4 text-left font-semibold text-slate-600">Category</th>
            <th class="px-6 py-4 text-left font-semibold text-slate-600">Description</th>
            <th class="px-6 py-4 text-right font-semibold text-slate-600">Amount</th>
            <th class="px-6 py-4 text-center font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="transaction in filteredByType"
            :key="transaction.id"
            class="hover:bg-slate-50/50 transition duration-150"
          >
            <td class="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
              {{ new Date(transaction.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-bold text-slate-800 text-xs">{{ getAccountName(transaction.account_id) }}</span>
            </td>
            <td class="px-6 py-4">
              <span
                v-if="transaction.category_id"
                class="px-2.5 py-1 rounded-lg text-white text-xs font-semibold inline-block"
                :style="{ backgroundColor: getCategoryColor(transaction.category_id) }"
              >{{ getCategoryName(transaction.category_id) }}</span>
              <span v-else class="text-xs text-slate-400">—</span>
            </td>
            <td class="px-6 py-4 text-slate-500 max-w-xs truncate">{{ transaction.description }}</td>
            <td class="px-6 py-4 text-right font-bold"
              :class="transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-3 justify-center">
                <button
                  @click="editTransaction(transaction)"
                  class="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <span>Edit</span>
                </button>
                <button
                  @click="confirmDelete(transaction.id)"
                  class="text-red-600 hover:text-red-800 font-semibold text-xs flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card List View -->
    <div v-if="filteredByType.length > 0" class="md:hidden space-y-3">
      <div
        v-for="transaction in filteredByType"
        :key="transaction.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 transition active:bg-slate-50"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-900 text-sm leading-tight truncate flex items-center gap-1.5">
              <span
                v-if="transaction.type === 'income'"
                class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex-shrink-0"
              >Income</span>
              {{ getLocationName(transaction.location_id) }}
            </h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5 truncate">{{ transaction.description }}</p>
          </div>
          <span class="text-sm font-extrabold flex-shrink-0 ml-2"
            :class="transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'"
          >{{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}</span>
        </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
          <span v-if="transaction.category_id"
            class="px-2.5 py-0.5 rounded-lg text-white text-[10px] font-bold"
            :style="{ backgroundColor: getCategoryColor(transaction.category_id) }"
          >{{ getCategoryName(transaction.category_id) }}</span>
          <span v-else class="text-[10px] text-slate-400">—</span>
          <span class="text-[10px] text-slate-500 font-semibold ml-auto">{{ getAccountName(transaction.account_id) }}</span>

          <div class="flex gap-3 text-xs">
            <button
              @click="editTransaction(transaction)"
              class="text-blue-600 font-bold flex items-center gap-1 py-1"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Edit</span>
            </button>
             <button
              @click="confirmDelete(transaction.id)"
              :disabled="isDeletingTransactionId === transaction.id"
              class="text-red-500 font-bold flex items-center gap-1 py-1 disabled:text-red-300"
            >
              <svg v-if="isDeletingTransactionId === transaction.id" class="animate-spin h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>{{ isDeletingTransactionId === transaction.id ? 'Deleting...' : 'Del' }}</span>
            </button>
          </div>
        </div>

        <div class="text-[10px] text-slate-400 font-medium">
          {{ new Date(transaction.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddTransactionModal v-if="showAddModal" @close="showAddModal = false" @added="showAddModal = false" />
    <EditTransactionModal
      v-if="editingTransaction"
      :transaction="editingTransaction"
      @close="editingTransaction = null"
      @saved="editingTransaction = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

// Reset type filter when account filter changes
watch(() => route.query.account, () => { typeFilter.value = 'all' })
import { useTransactionStore } from '../stores/transactionStore'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import EditTransactionModal from '../components/EditTransactionModal.vue'

const store = useTransactionStore()
const route = useRoute()
const showAddModal = ref(false)
const editingTransaction = ref(null)
const isDeletingTransactionId = ref(null)
const typeFilter = ref('all')

// ponytail: toLocaleDateString('en-CA') returns YYYY-MM-DD in local timezone, avoids UTC off-by-one
function toLocalDate(d) { return d.toLocaleDateString('en-CA') }
const filterFrom = ref(toLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
const filterTo = ref(toLocalDate(new Date()))
const isWeekSelected = ref(false)
const isMonthSelected = ref(true)

function setWeekRange() {
  isWeekSelected.value = true
  isMonthSelected.value = false
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  filterFrom.value = toLocalDate(weekAgo)
  filterTo.value = toLocalDate(today)
}

function setMonthRange() {
  isWeekSelected.value = false
  isMonthSelected.value = true
  const today = new Date()
  filterFrom.value = toLocalDate(new Date(today.getFullYear(), today.getMonth(), 1))
  filterTo.value = toLocalDate(today)
}

function setAllRange() {
  isWeekSelected.value = false
  isMonthSelected.value = false
  const today = new Date()
  filterFrom.value = '2000-01-01'
  filterTo.value = toLocalDate(today)
}

watch([filterFrom, filterTo], () => {
  store.setDateFilter(new Date(filterFrom.value), new Date(filterTo.value))
})

const accountFilter = computed(() => {
  const q = route.query.account
  return q ? Number(q) : null
})

const filteredByType = computed(() => {
  let txs = store.filteredTransactions
  const accId = accountFilter.value
  if (accId) {
    txs = txs.filter(t => Number(t.account_id) === accId)
  }
  if (typeFilter.value !== 'all') {
    txs = txs.filter(t => t.type === typeFilter.value)
  }
  return txs
})

const accountFilterName = computed(() => {
  const accId = accountFilter.value
  if (!accId) return ''
  const acc = store.accounts.find(a => Number(a.id) === accId)
  return acc ? acc.name : ''
})

function formatCurrency(value) {
  return 'Rp ' + Number(value).toLocaleString('id-ID');
}

function getLocationName(locationId) {
  const location = store.locations.find(l => String(l.id) === String(locationId))
  return location?.name || 'Unknown'
}

function getAccountName(accountId) {
  const acc = store.accounts.find(a => a.id === accountId)
  return acc?.name || '—'
}

function getCategoryName(categoryId) {
  const category = store.categories.find(c => c.id === categoryId)
  return category?.name || '—'
}

function getCategoryColor(categoryId) {
  if (!categoryId) return '#cbd5e1'
  const category = store.categories.find(c => c.id === categoryId)
  return category?.color || '#cbd5e1'
}

function editTransaction(transaction) {
  editingTransaction.value = { ...transaction }
}

async function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    isDeletingTransactionId.value = id
    try {
      await store.deleteTransaction(id)
    } catch (e) {
      alert('Error deleting transaction: ' + e.message)
    } finally {
      isDeletingTransactionId.value = null
    }
  }
}
</script>
