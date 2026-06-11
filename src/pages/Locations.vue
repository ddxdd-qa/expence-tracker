<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Locations</h1>
      <button
        @click="showAddForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Add Location
      </button>
    </div>

    <div v-if="showAddForm" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">Add New Location</h2>
      <form @submit.prevent="addLocation" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
          <input
            v-model="newLocationName"
            type="text"
            placeholder="e.g., Supermarket ABC, Mall XYZ"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
          <button
            type="button"
            @click="showAddForm = false"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="location in store.locations"
        :key="location.id"
        class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
      >
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ location.name }}</h3>
          <p class="text-sm text-gray-500">{{ countTransactions(location.id) }} transactions</p>
        </div>
        <button
          @click="confirmDeleteLocation(location.id)"
          class="text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      </div>
    </div>

    <div v-if="store.locations.length === 0 && !showAddForm" class="bg-gray-100 rounded-lg p-8 text-center">
      <p class="text-gray-600">No locations yet. Add one to get started!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()
const showAddForm = ref(false)
const newLocationName = ref('')

function countTransactions(locationId) {
  return store.transactions.filter(t => t.location_id === locationId).length
}

async function addLocation() {
  if (!newLocationName.value.trim()) return
  try {
    await store.addLocation({ name: newLocationName.value })
    newLocationName.value = ''
    showAddForm.value = false
  } catch (e) {
    alert('Error adding location: ' + e.message)
  }
}

async function confirmDeleteLocation(id) {
  if (confirm('Are you sure? This will not delete related transactions.')) {
    try {
      await store.deleteLocation(id)
    } catch (e) {
      alert('Error deleting location: ' + e.message)
    }
  }
}
</script>
