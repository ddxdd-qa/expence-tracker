import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref([])
  const locations = ref([])
  const categories = ref([])
  const accounts = ref([])
  const budgets = ref([])
  const debts = ref([])
  const debtPayments = ref([])
  const items = ref([])

  const dateFilter = ref({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const loading = ref(false)
  const error = ref(null)

  const filteredTransactions = computed(() => {
    return transactions.value.filter(t => {
      const tDate = new Date(t.date)
      return tDate >= dateFilter.value.from && tDate <= dateFilter.value.to
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const expenseTransactions = computed(() =>
    filteredTransactions.value.filter(t => t.type !== 'income')
  )

  const groupedByLocation = computed(() => {
    const grouped = {}
    expenseTransactions.value.forEach(t => {
      const loc = locations.value.find(l => String(l.id) === String(t.location_id))
      const locName = loc?.name || 'Unknown'
      if (!grouped[locName]) grouped[locName] = 0
      grouped[locName] += t.amount
    })
    return grouped
  })

  const groupedByCategory = computed(() => {
    const grouped = {}
    expenseTransactions.value.forEach(t => {
      const cat = t.category_id ? categories.value.find(c => c.id === t.category_id) : null
      const catName = cat?.name || (t.category_id ? '—' : '—')
      if (!grouped[catName]) {
        grouped[catName] = { total: 0, color: cat?.color || '#cbd5e1' }
      }
      grouped[catName].total += t.amount
    })
    return grouped
  })

  const groupedByDay = computed(() => {
    const grouped = {}
    expenseTransactions.value.forEach(t => {
      const d = new Date(t.date)
      const key = d.toLocaleDateString('en-CA')
      grouped[key] = (grouped[key] || 0) + t.amount
    })
    const sorted = Object.keys(grouped).sort()
    const result = {}
    sorted.forEach(k => { result[k] = grouped[k] })
    return result
  })

  const groupedByMonth = computed(() => {
    const grouped = {}
    filteredTransactions.value.forEach(t => {
      const d = new Date(t.date)
      const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 }
      if (t.type === 'income') {
        grouped[key].income += t.amount
      } else {
        grouped[key].expense += t.amount
      }
    })
    const sorted = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b))
    const result = {}
    sorted.forEach(k => { result[k] = grouped[k] })
    return result
  })

  const groupedByHour = computed(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const grouped = {}
    hours.forEach(h => { grouped[h] = 0 })
    expenseTransactions.value.forEach(t => {
      if (!t.created_at) return
      const h = new Date(t.created_at).getHours()
      grouped[h] += t.amount
    })
    return grouped
  })

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/transactions')
      transactions.value = (response.data || []).map(t => ({
        ...t,
        amount: Number(t.amount)
      }))
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchLocations() {
    try {
      const response = await axios.get('/api/locations')
      locations.value = response.data || []
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchCategories() {
    try {
      const response = await axios.get('/api/categories')
      categories.value = response.data || []
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchAccounts() {
    try {
      const response = await axios.get('/api/accounts')
      accounts.value = (response.data || []).map(a => ({
        ...a,
        balance: Number(a.balance)
      }))
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchBudgets() {
    try {
      const response = await axios.get('/api/budgets')
      budgets.value = (response.data || []).map(b => ({
        ...b,
        amount: Number(b.amount)
      }))
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchItems() {
    try {
      const response = await axios.get('/api/items')
      items.value = (response.data || []).map(i => ({
        ...i,
        location_id: i.location_id ? Number(i.location_id) : null,
        qty: Number(i.qty),
        price: Number(i.price)
      }))
    } catch (e) {
      error.value = e.message
    }
  }

  async function addItem(item) {
    try {
      const response = await axios.post('/api/items', item)
      const newItem = { ...response.data, qty: Number(response.data.qty), price: Number(response.data.price) }
      items.value.unshift(newItem)
      return newItem
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateItem(id, updates) {
    try {
      const response = await axios.put('/api/items', { id, ...updates })
      const updatedItem = { ...response.data, qty: Number(response.data.qty), price: Number(response.data.price) }
      const idx = items.value.findIndex(i => i.id === id)
      if (idx >= 0) items.value[idx] = updatedItem
      return updatedItem
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteItem(id) {
    try {
      await axios.delete('/api/items', { data: { id } })
      items.value = items.value.filter(i => i.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addTransaction(transaction) {
    try {
      const response = await axios.post('/api/transactions', transaction)
      const newTx = { ...response.data, amount: Number(response.data.amount) }
      transactions.value.unshift(newTx)
      return newTx
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateTransaction(id, updates) {
    try {
      const response = await axios.put('/api/transactions', { id, ...updates })
      const updatedTx = { ...response.data, amount: Number(response.data.amount) }
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx >= 0) transactions.value[idx] = updatedTx
      return updatedTx
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteTransaction(id) {
    try {
      await axios.delete('/api/transactions', { data: { id } })
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addLocation(location) {
    try {
      const response = await axios.post('/api/locations', location)
      locations.value.push(response.data)
      return response.data
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateLocation(id, updates) {
    try {
      const response = await axios.put('/api/locations', { id, ...updates })
      const idx = locations.value.findIndex(l => l.id === id)
      if (idx >= 0) locations.value[idx] = response.data
      return response.data
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteLocation(id) {
    try {
      await axios.delete('/api/locations', { data: { id } })
      locations.value = locations.value.filter(l => l.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addCategory(category) {
    try {
      const response = await axios.post('/api/categories', category)
      categories.value.push(response.data)
      return response.data
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateCategory(id, updates) {
    try {
      const response = await axios.put('/api/categories', { id, ...updates })
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx >= 0) categories.value[idx] = response.data
      return response.data
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteCategory(id) {
    try {
      await axios.delete('/api/categories', { data: { id } })
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addAccount(account) {
    try {
      const response = await axios.post('/api/accounts', account)
      const newAcc = { ...response.data, balance: Number(response.data.balance) }
      accounts.value.push(newAcc)
      return newAcc
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateAccount(id, updates) {
    try {
      const response = await axios.put('/api/accounts', { id, ...updates })
      const updatedAcc = { ...response.data, balance: Number(response.data.balance) }
      const idx = accounts.value.findIndex(a => a.id === id)
      if (idx >= 0) {
        accounts.value[idx] = updatedAcc
      }
      return updatedAcc
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteAccount(id) {
    try {
      await axios.delete('/api/accounts', { data: { id } })
      accounts.value = accounts.value.filter(a => a.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addBudget(budget) {
    try {
      const response = await axios.post('/api/budgets', budget)
      const newBgt = { ...response.data, amount: Number(response.data.amount) }
      const idx = budgets.value.findIndex(b => b.category_id === newBgt.category_id && b.period === newBgt.period)
      if (idx >= 0) {
        budgets.value[idx] = newBgt
      } else {
        budgets.value.push(newBgt)
      }
      return newBgt
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateBudget(id, updates) {
    try {
      const response = await axios.put('/api/budgets', { id, ...updates })
      const updatedBgt = { ...response.data, amount: Number(response.data.amount) }
      const idx = budgets.value.findIndex(b => b.id === id)
      if (idx >= 0) {
        budgets.value[idx] = updatedBgt
      }
      return updatedBgt
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteBudget(id) {
    try {
      await axios.delete('/api/budgets', { data: { id } })
      budgets.value = budgets.value.filter(b => b.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function fetchDebts() {
    try {
      const response = await axios.get('/api/debts')
      debts.value = (response.data || []).map(d => ({
        ...d,
        amount: Number(d.amount),
        total_amount: d.total_amount ? Number(d.total_amount) : Number(d.amount),
        installment_count: d.installment_count ? Number(d.installment_count) : 1,
        installment_amount: d.installment_amount ? Number(d.installment_amount) : null
      }))
    } catch (e) {
      error.value = e.message
    }
  }

  async function addDebt(debt) {
    try {
      const response = await axios.post('/api/debts', debt)
      const newDebt = { ...response.data, amount: Number(response.data.amount), total_amount: response.data.total_amount ? Number(response.data.total_amount) : Number(response.data.amount), installment_count: response.data.installment_count ? Number(response.data.installment_count) : 1, installment_amount: response.data.installment_amount ? Number(response.data.installment_amount) : null }
      debts.value.unshift(newDebt)
      return newDebt
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateDebt(id, updates) {
    try {
      const response = await axios.put('/api/debts', { id, ...updates })
      const updatedDebt = { ...response.data, amount: Number(response.data.amount), total_amount: response.data.total_amount ? Number(response.data.total_amount) : undefined, installment_count: response.data.installment_count ? Number(response.data.installment_count) : undefined, installment_amount: response.data.installment_amount ? Number(response.data.installment_amount) : undefined }
      const idx = debts.value.findIndex(d => d.id === id)
      if (idx >= 0) {
        debts.value[idx] = { ...debts.value[idx], ...updatedDebt }
      }
      return updatedDebt
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteDebt(id) {
    try {
      await axios.delete('/api/debts', { data: { id } })
      debts.value = debts.value.filter(d => d.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function fetchDebtPayments(debtId) {
    try {
      const response = await axios.get('/api/debt-payments', { params: { debt_id: debtId } })
      debtPayments.value = (response.data || []).map(p => ({
        ...p,
        amount: Number(p.amount)
      }))
      return debtPayments.value
    } catch (e) {
      error.value = e.message
      return []
    }
  }

  async function addDebtPayment(payment) {
    try {
      const response = await axios.post('/api/debt-payments', payment)
      const newPay = { ...response.data, amount: Number(response.data.amount) }
      debtPayments.value.unshift(newPay)
      const debt = debts.value.find(d => d.id === payment.debt_id)
      if (debt) {
        debt.amount = Number(debt.amount) - Number(payment.amount)
      }
      // Sync wallet balance by refetching transactions
      await fetchTransactions()
      return newPay
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteDebtPayment(id) {
    try {
      const pay = debtPayments.value.find(p => p.id === id)
      await axios.delete('/api/debt-payments', { data: { id } })
      debtPayments.value = debtPayments.value.filter(p => p.id !== id)
      if (pay) {
        const debt = debts.value.find(d => d.id === pay.debt_id)
        if (debt) {
          debt.amount = Number(debt.amount) + Number(pay.amount)
        }
      }
      // Sync wallet balance
      await fetchTransactions()
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  function getAccountBalance(accountId) {
    const all = transactions.value.filter(t => t.account_id === accountId)
    return all.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
  }

  function getAccountTransactions(accountId) {
    return transactions.value.filter(t => t.account_id === accountId)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  function setDateFilter(from, to) {
    dateFilter.value.from = from
    dateFilter.value.to = to
  }

  return {
    transactions,
    locations,
    categories,
    accounts,
    budgets,
    debts,
    debtPayments,
    items,
    dateFilter,
    loading,
    error,
    filteredTransactions,
    expenseTransactions,
    groupedByLocation,
    groupedByCategory,
    groupedByDay,
    groupedByMonth,
    groupedByHour,
    fetchTransactions,
    fetchLocations,
    fetchCategories,
    fetchAccounts,
    fetchBudgets,
    fetchDebts,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addLocation,
    updateLocation,
    deleteLocation,
    addCategory,
    updateCategory,
    deleteCategory,
    addAccount,
    updateAccount,
    deleteAccount,
    addBudget,
    updateBudget,
    deleteBudget,
    addDebt,
    updateDebt,
    deleteDebt,
    fetchDebtPayments,
    addDebtPayment,
    deleteDebtPayment,
    getAccountBalance,
    getAccountTransactions,
    setDateFilter
  }
})
