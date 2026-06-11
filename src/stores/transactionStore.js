import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

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
      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
      if (err) throw err
      transactions.value = data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchLocations() {
    try {
      const { data, error: err } = await supabase
        .from('locations')
        .select('*')
        .order('name')
      if (err) throw err
      locations.value = data || []
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchCategories() {
    try {
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (err) throw err
      categories.value = data || []
    } catch (e) {
      error.value = e.message
    }
  }

  async function addTransaction(transaction) {
    try {
      const { data, error: err } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
      if (err) throw err
      transactions.value.unshift(data[0])
      return data[0]
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function updateTransaction(id, updates) {
    try {
      const { data, error: err } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
      if (err) throw err
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx >= 0) {
        transactions.value[idx] = data[0]
      }
      return data[0]
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteTransaction(id) {
    try {
      const { error: err } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      if (err) throw err
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addLocation(location) {
    try {
      const { data, error: err } = await supabase
        .from('locations')
        .insert([location])
        .select()
      if (err) throw err
      locations.value.push(data[0])
      return data[0]
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteLocation(id) {
    try {
      const { error: err } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)
      if (err) throw err
      locations.value = locations.value.filter(l => l.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function addCategory(category) {
    try {
      const { data, error: err } = await supabase
        .from('categories')
        .insert([category])
        .select()
      if (err) throw err
      categories.value.push(data[0])
      return data[0]
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteCategory(id) {
    try {
      const { error: err } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      if (err) throw err
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
