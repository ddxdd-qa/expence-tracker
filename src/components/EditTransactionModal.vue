<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
    <div class="bg-white rounded-t-lg sm:rounded-lg shadow-xl p-4 sm:p-6 w-full sm:max-w-md">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Edit Transaction</h2>
      <form @submit.prevent="submit" class="space-y-3 sm:space-y-4 max-h-[70vh] sm:max-h-none overflow-y-auto">
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Date</label>
          <input
            v-model="form.date"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Location</label>
          <select
            v-model.number="form.location_id"
            class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          >
            <option value="">Select location</option>
            <option v-for="loc in store.locations" :key="loc.id" :value="loc.id">
              {{ loc.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
          <select
            v-model.number="form.category_id"
            class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          >
            <option value="">Select category</option>
            <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Description</label>
          <input
            v-model="form.description"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Amount (IDR)</label>
          <input
            v-model.number="form.amount"
            type="number"
            min="0"
            step="1000"
            class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div class="flex gap-2 pt-2 sm:pt-4">
          <button
            type="submit"
            class="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Save
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const props = defineProps({
  transaction: Object
})

const store = useTransactionStore()
const emit = defineEmits(['close', 'saved'])

const form = ref({ ...props.transaction })

watch(() => props.transaction, (newVal) => {
  form.value = { ...newVal }
})

async function submit() {
  try {
    await store.updateTransaction(form.value.id, {
      date: form.value.date,
      location_id: form.value.location_id,
      category_id: form.value.category_id,
      description: form.value.description,
      amount: form.value.amount
    })
    emit('saved')
  } catch (e) {
    alert('Error updating transaction: ' + e.message)
  }
}
</script>
