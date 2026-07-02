<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <h2 class="text-lg font-bold text-slate-900 mb-1">Transfer Balance</h2>
      <p class="text-xs text-slate-500 mb-5">Pindahkan saldo antar wallet</p>

      <form @submit.prevent="submitTransfer" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Wallet</label>
          <select v-model.number="form.from" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold" required>
            <option :value="null" disabled>Pilih wallet sumber</option>
            <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id" :disabled="acc.id === form.to">
              {{ acc.name }} (Rp {{ store.getAccountBalance(acc.id).toLocaleString('id-ID') }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Wallet</label>
          <select v-model.number="form.to" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold" required>
            <option :value="null" disabled>Pilih wallet tujuan</option>
            <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id" :disabled="acc.id === form.from">
              {{ acc.name }} (Rp {{ store.getAccountBalance(acc.id).toLocaleString('id-ID') }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (IDR)</label>
          <input v-model.number="form.amount" type="number" min="0" placeholder="0" class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-extrabold" required />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
          <input v-model="form.date" type="date" class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold" required />
        </div>
        <button type="submit" :disabled="submitting" class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-500/10 disabled:bg-blue-400 flex items-center justify-center gap-2">
          <svg v-if="submitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          {{ submitting ? 'Processing...' : 'Transfer' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const emit = defineEmits(['close', 'done'])
const store = useTransactionStore()
const submitting = ref(false)

const form = reactive({
  from: null,
  to: null,
  amount: null,
  date: new Date().toISOString().split('T')[0]
})

function getSystemCategory(key) {
  return store.categories.find(c => c.system_key === key)
}

async function submitTransfer() {
  if (!form.from || !form.to || form.from === form.to || !form.amount || form.amount <= 0) return
  submitting.value = true
  try {
    const src = store.accounts.find(a => a.id === form.from)
    const dst = store.accounts.find(a => a.id === form.to)
    const transferCat = getSystemCategory('transfer')
    // Create expense from source
    await store.addTransaction({
      type: 'expense',
      amount: Number(form.amount),
      account_id: form.from,
      description: `Transfer ke ${dst?.name || 'Wallet'}`,
      date: form.date,
      category_id: transferCat?.id || null
    })
    // Create income to destination
    await store.addTransaction({
      type: 'income',
      amount: Number(form.amount),
      account_id: form.to,
      description: `Transfer dari ${src?.name || 'Wallet'}`,
      date: form.date,
      category_id: transferCat?.id || null
    })
    emit('done')
  } catch (e) {
    alert('Transfer gagal: ' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>
