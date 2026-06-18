import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref([])
  const locations = ref([])
  const categories = ref([])
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

  const groupedByLocation = computed(() => {
    const grouped = {}
    filteredTransactions.value.forEach(t => {
      const loc = locations.value.find(l => l.id === t.location_id)
      const locName = loc?.name || 'Unknown'
      if (!grouped[locName]) grouped[locName] = 0
      grouped[locName] += t.amount
    })
    return grouped
  })

  const groupedByCategory = computed(() => {
    const grouped = {}
    filteredTransactions.value.forEach(t => {
      const cat = categories.value.find(c => c.id === t.category_id)
      const catName = cat?.name || 'Unknown'
      if (!grouped[catName]) {
        grouped[catName] = { total: 0, color: cat?.color || '#999' }
      }
      grouped[catName].total += t.amount
    })
    return grouped
  })

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/transactions')
      transactions.value = response.data || []
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

  async function addTransaction(transaction) {
    try {
      const response = await axios.post('/api/transactions', transaction)
      transactions.value.unshift(response.data)
      return response.data
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateTransaction(id, updates) {
    try {
      const response = await axios.put('/api/transactions', { id, ...updates })
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx >= 0) {
        transactions.value[idx] = response.data
      }
      return response.data
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

  async function deleteCategory(id) {
    try {
      await axios.delete('/api/categories', { data: { id } })
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  function setDateFilter(from, to) {
    dateFilter.value.from = from
    dateFilter.value.to = to
  }

  return {
    transactions,
    locations,
    categories,
    dateFilter,
    loading,
    error,
    filteredTransactions,
    groupedByLocation,
    groupedByCategory,
    fetchTransactions,
    fetchLocations,
    fetchCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addLocation,
    deleteLocation,
    addCategory,
    deleteCategory,
    setDateFilter
  }
})
