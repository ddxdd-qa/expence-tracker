<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
      <button
        @click="showAddModal = true"
        class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Add
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-x-auto">
      <table class="w-full text-xs sm:text-sm">
        <thead class="bg-gray-100 border-b sticky top-0">
          <tr>
            <th class="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Date</th>
            <th class="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Location</th>
            <th class="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Category</th>
            <th class="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Description</th>
            <th class="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700">Amount</th>
            <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in store.filteredTransactions"
            :key="transaction.id"
            class="border-b hover:bg-gray-50 transition"
          >
            <td class="px-2 sm:px-4 py-2 sm:py-4 text-gray-700">
              {{ new Date(transaction.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) }}
            </td>
            <td class="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 text-gray-700 truncate">
              {{ getLocationName(transaction.location_id) }}
            </td>
            <td class="px-2 sm:px-4 py-2 sm:py-4">
              <span
                class="px-2 py-1 rounded text-white text-xs font-medium inline-block"
                :style="{ backgroundColor: getCategoryColor(transaction.category_id) }"
              >
                {{ getCategoryName(transaction.category_id).substring(0, 10) }}
              </span>
            </td>
            <td class="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-4 text-gray-700 truncate max-w-xs">{{ transaction.description }}</td>
            <td class="px-2 sm:px-4 py-2 sm:py-4 text-right font-semibold text-gray-900 text-xs sm:text-sm">
              {{ (transaction.amount / 1000).toLocaleString('id-ID') }}k
            </td>
            <td class="px-2 sm:px-4 py-2 sm:py-4">
              <div class="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center text-xs sm:text-sm">
                <button
                  @click="editTransaction(transaction)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(transaction.id)"
                  class="text-red-600 hover:text-red-800 font-medium"
                >
                  Del
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
import { ref } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import EditTransactionModal from '../components/EditTransactionModal.vue'

const store = useTransactionStore()
const showAddModal = ref(false)
const editingTransaction = ref(null)

function getLocationName(locationId) {
  const location = store.locations.find(l => l.id === locationId)
  return location?.name || 'Unknown'
}

function getCategoryName(categoryId) {
  const category = store.categories.find(c => c.id === categoryId)
  return category?.name || 'Unknown'
}

function getCategoryColor(categoryId) {
  const category = store.categories.find(c => c.id === categoryId)
  return category?.color || '#999999'
}

function editTransaction(transaction) {
  editingTransaction.value = { ...transaction }
}

async function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await store.deleteTransaction(id)
    } catch (e) {
      alert('Error deleting transaction: ' + e.message)
    }
  }
}
</script>
