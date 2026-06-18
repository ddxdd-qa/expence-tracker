<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Receipt Scanner</h2>
    
    <div class="mb-6">
      <label class="block mb-2 font-semibold">Upload Receipt Photo</label>
      <input
        type="file"
        accept="image/*"
        @change="handleImageUpload"
        class="block w-full border border-gray-300 rounded p-2"
      />
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Processing receipt...</p>
    </div>

    <div v-else-if="items.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold">Receipt Items</h3>
      
      <div v-for="(item, idx) in items" :key="idx" class="border rounded p-4 bg-gray-50">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Description</label>
          <input
            v-model="item.description"
            class="w-full border rounded px-2 py-1"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Amount</label>
            <input
              v-model.number="item.amount"
              type="number"
              step="0.01"
              class="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Outlet</label>
            <select
              v-model="item.location_id"
              class="w-full border rounded px-2 py-1"
            >
              <option :value="null">Select outlet</option>
              <option
                v-for="loc in locations"
                :key="loc.id"
                :value="loc.id"
              >
                {{ loc.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <select
            v-model="item.category_id"
            class="w-full border rounded px-2 py-1"
          >
            <option :value="null">Select category</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button
          @click="saveItems"
          :disabled="!allItemsValid"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Save Transactions
        </button>
        <button
          @click="resetForm"
          class="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import axios from 'axios'

const store = useTransactionStore()
const loading = ref(false)
const items = ref([])
const locations = ref([])
const categories = ref([])

const allItemsValid = computed(() =>
  items.value.every(item => item.location_id && item.category_id && item.amount > 0)
)

onMounted(async () => {
  await store.fetchLocations()
  await store.fetchCategories()
  locations.value = store.locations
  categories.value = store.categories
})

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  loading.value = true
  try {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result?.split(',')[1]
      if (!base64) return

      const response = await axios.post('/api/receipt', {
        imageBuffer: base64
      })

      items.value = response.data.items
    }
    reader.readAsDataURL(file)
  } catch (error) {
    alert('Error processing receipt: ' + error.message)
  } finally {
    loading.value = false
  }
}

async function saveItems() {
  try {
    for (const item of items.value) {
      await store.addTransaction({
        location_id: item.location_id,
        category_id: item.category_id,
        amount: item.amount,
        description: item.description,
        date: new Date().toISOString()
      })
    }
    alert('Transactions saved successfully!')
    resetForm()
  } catch (error) {
    alert('Error saving transactions: ' + error.message)
  }
}

function resetForm() {
  items.value = []
}
</script>
