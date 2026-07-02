<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Debts</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Track cicilan, hutang & piutang</p>
      </div>
      <button
        v-if="!showAddForm"
        @click="showAddForm = true"
        class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base flex items-center gap-1.5"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add Debt</span>
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hutang</p>
        <p class="text-2xl font-extrabold text-red-600 mt-1">Rp {{ totalTaken.toLocaleString('id-ID') }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Piutang</p>
        <p class="text-2xl font-extrabold text-emerald-600 mt-1">Rp {{ totalGiven.toLocaleString('id-ID') }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Net</p>
        <p class="text-2xl font-extrabold mt-1" :class="netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'">
          Rp {{ Math.abs(netBalance).toLocaleString('id-ID') }}
          <span class="text-sm font-bold">{{ netBalance >= 0 ? '(Piutang)' : '(Hutang)' }}</span>
        </p>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 transition-all duration-300">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4">{{ editingDebtId ? 'Edit Debt' : 'Add New Debt' }}</h2>
      <form @submit.prevent="submitDebt" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
            <div class="flex bg-slate-100 rounded-xl p-0.5">
              <button type="button" @click="form.type = 'taken'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200" :class="form.type === 'taken' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'">I Owe (Hutang)</button>
              <button type="button" @click="form.type = 'given'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200" :class="form.type === 'given' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'">Owed Me (Piutang)</button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select v-model="form.status" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Person / Lender</label>
          <input v-model="form.person" type="text" placeholder="e.g., Budi, Bank XYZ" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Amount (IDR)</label>
            <input v-model.number="form.total_amount" @input="autoCalcInstallment" type="number" min="0" placeholder="Total hutang" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-extrabold" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
            <input v-model="form.due_date" type="date" class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jangka Waktu (Cicilan)</label>
            <input v-model.number="form.installment_count" @input="autoCalcInstallment" type="number" min="1" placeholder="Kali cicil" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Periode</label>
            <select v-model="form.tenor_type" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold">
              <option value="monthly">Per Bulan</option>
              <option value="weekly">Per Minggu</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biaya per Cicilan</label>
            <input v-model.number="form.installment_amount" @input="autoCalcCount" type="number" min="0" placeholder="Auto" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
          <input v-model="form.description" type="text" placeholder="Optional notes..." class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200" />
        </div>
        <div class="flex gap-3">
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-500/10">
            {{ editingDebtId ? 'Save Changes' : 'Add Debt' }}
          </button>
          <button type="button" @click="cancelForm" class="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-semibold py-2.5 rounded-xl transition text-sm">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Debt List -->
    <div v-if="store.debts.length > 0" class="space-y-3">
      <div v-for="debt in store.debts" :key="debt.id" class="bg-white rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md duration-200">
        <!-- Debt Header -->
        <div class="p-5">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-extrabold px-2 py-0.5 rounded" :class="debt.type === 'taken' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">{{ debt.type === 'taken' ? 'Hutang' : 'Piutang' }}</span>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded" :class="debt.status === 'pending' ? 'bg-amber-100 text-amber-700' : debt.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">{{ debt.status }}</span>
                <span v-if="debt.installment_count > 1" class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{{ debt.installment_count }}× {{ debt.tenor_type === 'weekly' ? 'Minggu' : 'Bulan' }}</span>
              </div>
              <h3 class="text-lg font-extrabold text-slate-900 mt-2">{{ debt.person }}</h3>
              <p v-if="debt.description" class="text-sm text-slate-500 mt-0.5">{{ debt.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-slate-400 font-semibold">
                <span v-if="debt.due_date">📅 Jatuh Tempo: {{ new Date(debt.due_date).toLocaleDateString('id-ID') }}</span>
                <span>📆 {{ new Date(debt.date).toLocaleDateString('id-ID') }}</span>
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-4">
              <p class="text-xl font-extrabold" :class="debt.type === 'taken' ? 'text-red-600' : 'text-emerald-600'">
                {{ debt.type === 'taken' ? '-' : '+' }}Rp {{ debt.amount.toLocaleString('id-ID') }}
              </p>
              <p v-if="debt.total_amount && debt.total_amount !== debt.amount" class="text-[10px] text-slate-400 font-semibold line-through mt-0.5">
                Rp {{ debt.total_amount.toLocaleString('id-ID') }}
              </p>
              <div class="flex items-center gap-2 mt-2 justify-end">
                <button @click="startEdit(debt)" class="text-blue-600 hover:text-blue-800 font-bold text-xs p-1.5 rounded-lg hover:bg-blue-50/50 transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button @click="confirmDelete(debt.id)" class="text-red-500 hover:text-red-700 font-bold text-xs p-1.5 rounded-lg hover:bg-red-50/50 transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="debt.total_amount && debt.total_amount > 0" class="mt-4">
            <div class="flex justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>{{ paidCount(debt) }} of {{ debt.installment_count || 1 }} cicilan dibayar</span>
              <span>{{ Math.round(paidPercent(debt)) }}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" :class="debt.type === 'taken' ? 'bg-red-500' : 'bg-emerald-500'" :style="{ width: paidPercent(debt) + '%' }"></div>
            </div>
          </div>

          <!-- Toggle Payments -->
          <button @click="togglePayments(debt.id)" class="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1">
            <svg class="w-3.5 h-3.5 transition-transform" :class="expandedPayments[debt.id] ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            {{ expandedPayments[debt.id] ? 'Sembunyikan' : 'Lihat' }} Riwayat Pembayaran
          </button>
        </div>

        <!-- Payment History -->
        <div v-if="expandedPayments[debt.id]" class="border-t border-slate-100 px-5 pb-5 pt-3 space-y-3">
          <div v-if="paymentsLoading[debt.id]" class="text-center py-3 text-xs text-slate-400">Loading...</div>
          <div v-else-if="debtPaymentsMap[debt.id] && debtPaymentsMap[debt.id].length > 0" class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="pay in debtPaymentsMap[debt.id]" :key="pay.id" class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
              <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span class="text-sm font-bold text-slate-700">Rp {{ pay.amount.toLocaleString('id-ID') }}</span>
                <span class="text-[10px] text-slate-400 font-semibold">{{ new Date(pay.date).toLocaleDateString('id-ID') }}</span>
                <span v-if="pay.account_name" class="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">{{ pay.account_name }}</span>
                <span v-if="pay.notes" class="text-[10px] text-slate-500 italic">— {{ pay.notes }}</span>
              </div>
              <button @click="deletePayment(pay.id, debt.id)" class="text-red-400 hover:text-red-600 transition p-1 flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <p v-else class="text-xs text-slate-400 text-center py-2">Belum ada pembayaran</p>

          <!-- Add Payment -->
          <div class="flex items-center gap-2 flex-wrap">
            <input v-model="newPaymentAmount[debt.id]" type="number" min="0" placeholder="Jumlah bayar" class="min-w-[100px] flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 font-semibold" />
            <input v-model="newPaymentDate[debt.id]" type="date" class="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500" />
            <select v-model="newPaymentAccountId[debt.id]" class="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 font-semibold min-w-[120px]">
              <option :value="null">Pilih Wallet</option>
              <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
            </select>
            <button @click="addPayment(debt.id)" :disabled="!newPaymentAmount[debt.id] || newPaymentAmount[debt.id] <= 0" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition disabled:bg-slate-200 disabled:text-slate-400 whitespace-nowrap">
              Bayar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="store.debts.length === 0 && !showAddForm" class="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
      <div class="text-5xl mb-4">💰</div>
      <h3 class="text-lg font-bold text-slate-900 mb-1">No Debts Recorded</h3>
      <p class="text-sm text-slate-500 max-w-sm mx-auto mb-6">Track cicilan, hutang & piutang dengan tenor dan riwayat pembayaran.</p>
      <button @click="showAddForm = true" class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add Your First Debt</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()
const showAddForm = ref(false)
const editingDebtId = ref(null)
const expandedPayments = reactive({})
const paymentsLoading = reactive({})
const newPaymentAmount = reactive({})
const newPaymentDate = reactive({})
const newPaymentAccountId = reactive({})
const debtPaymentsMap = reactive({})

const form = ref(getDefaultForm())

function getDefaultForm() {
  return {
    person: '',
    total_amount: null,
    installment_count: 1,
    installment_amount: null,
    tenor_type: 'monthly',
    description: '',
    type: 'taken',
    status: 'pending',
    due_date: '',
    date: new Date().toISOString().split('T')[0]
  }
}

function resetForm() {
  Object.assign(form.value, getDefaultForm())
}

function cancelForm() {
  resetForm()
  editingDebtId.value = null
  showAddForm.value = false
}

function autoCalcInstallment() {
  const total = Number(form.value.total_amount)
  const count = Number(form.value.installment_count)
  if (total && count > 0) {
    form.value.installment_amount = Math.round(total / count)
  }
}

function autoCalcCount() {
  const total = Number(form.value.total_amount)
  const ia = Number(form.value.installment_amount)
  if (total && ia > 0) {
    form.value.installment_count = Math.ceil(total / ia)
  }
}

function startEdit(debt) {
  editingDebtId.value = debt.id
  form.value = {
    person: debt.person,
    total_amount: debt.total_amount || debt.amount,
    installment_count: debt.installment_count || 1,
    installment_amount: debt.installment_amount || null,
    tenor_type: debt.tenor_type || 'monthly',
    description: debt.description || '',
    type: debt.type,
    status: debt.status,
    due_date: debt.due_date ? debt.due_date.split('T')[0] : '',
    date: debt.date ? debt.date.split('T')[0] : new Date().toISOString().split('T')[0]
  }
  showAddForm.value = true
}

async function submitDebt() {
  if (!form.value.person.trim() || !form.value.total_amount) return
  const payload = {
    person: form.value.person,
    amount: Number(form.value.total_amount),
    total_amount: Number(form.value.total_amount),
    installment_count: Number(form.value.installment_count) || 1,
    installment_amount: form.value.installment_amount ? Number(form.value.installment_amount) : null,
    tenor_type: form.value.tenor_type || 'monthly',
    description: form.value.description,
    type: form.value.type,
    status: form.value.status,
    due_date: form.value.due_date || null,
    date: form.value.date
  }
  try {
    if (editingDebtId.value) {
      await store.updateDebt(editingDebtId.value, payload)
    } else {
      await store.addDebt(payload)
    }
    cancelForm()
  } catch (e) {
    alert('Error: ' + e.message)
  }
}

async function confirmDelete(id) {
  if (confirm('Hapus utang ini?')) {
    try {
      await store.deleteDebt(id)
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }
}

async function togglePayments(debtId) {
  expandedPayments[debtId] = !expandedPayments[debtId]
  if (expandedPayments[debtId] && !debtPaymentsMap[debtId]) {
    paymentsLoading[debtId] = true
    const pays = await store.fetchDebtPayments(debtId)
    debtPaymentsMap[debtId] = pays
    paymentsLoading[debtId] = false
  }
}

async function addPayment(debtId) {
  const amount = Number(newPaymentAmount[debtId])
  if (!amount || amount <= 0) return
  try {
    const pay = await store.addDebtPayment({
      debt_id: debtId,
      amount,
      date: newPaymentDate[debtId] || new Date().toISOString().split('T')[0],
      notes: '',
      account_id: newPaymentAccountId[debtId] || null
    })
    if (!debtPaymentsMap[debtId]) debtPaymentsMap[debtId] = []
    // Fetch payments fresh to get account_name from join
    debtPaymentsMap[debtId] = await store.fetchDebtPayments(debtId)
    newPaymentAmount[debtId] = null
    newPaymentDate[debtId] = null
    newPaymentAccountId[debtId] = null
  } catch (e) {
    alert('Error: ' + e.message)
  }
}

async function deletePayment(paymentId, debtId) {
  if (!confirm('Hapus pembayaran ini?')) return
  try {
    await store.deleteDebtPayment(paymentId)
    // Refresh payments & debts to sync wallet balance
    debtPaymentsMap[debtId] = await store.fetchDebtPayments(debtId)
    await store.fetchDebts()
  } catch (e) {
    alert('Error: ' + e.message)
  }
}

function paidCount(debt) {
  const total = debt.total_amount || debt.amount
  const remaining = debt.amount
  if (debt.installment_amount && debt.installment_amount > 0) {
    const paid = total - remaining
    return Math.round(paid / debt.installment_amount)
  }
  return remaining <= 0 ? (debt.installment_count || 1) : 0
}

function paidPercent(debt) {
  const total = debt.total_amount || debt.amount
  if (total <= 0) return 0
  return ((total - debt.amount) / total) * 100
}

const totalTaken = computed(() =>
  store.debts.filter(d => d.type === 'taken').reduce((s, d) => s + Number(d.amount), 0)
)

const totalGiven = computed(() =>
  store.debts.filter(d => d.type === 'given').reduce((s, d) => s + Number(d.amount), 0)
)

const netBalance = computed(() => totalGiven.value - totalTaken.value)
</script>
