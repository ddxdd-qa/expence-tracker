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
      <p class="text-gray-600 mb-2">{{ loadingStatus }}</p>
      <div class="inline-block">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
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
import { createWorker } from 'tesseract.js'

const store = useTransactionStore()
const loading = ref(false)
const loadingStatus = ref('')
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

function parseReceiptText(text) {
  const lines = text.split('\n').filter(line => line.trim())
  const extractedItems = []
  
  for (const line of lines) {
    const match = line.match(/(.+?)\s+(\d+\.?\d*)\s*$/)
    if (match) {
      const description = match[1].trim()
      const amount = parseFloat(match[2])
      
      if (amount > 0 && description.length > 2) {
        extractedItems.push({
          description,
          amount,
          category_id: null,
          location_id: null
        })
      }
    }
  }
  
  return extractedItems.length > 0 ? extractedItems : parseSimpleFormat(text)
}

function parseSimpleFormat(text) {
  const lines = text.split('\n').filter(line => line.trim())
  const extractedItems = []
  
  for (const line of lines) {
    const numbers = line.match(/\d+\.?\d*/g)
    if (numbers?.length > 0) {
      const amount = parseFloat(numbers[numbers.length - 1])
      if (amount > 0 && amount < 10000) {
        extractedItems.push({
          description: line.replace(/\d+\.?\d*/g, '').trim() || 'Item',
          amount,
          category_id: null,
          location_id: null
        })
      }
    }
  }
  
  return extractedItems
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  loading.value = true
  loadingStatus.value = 'Initializing OCR...'
  
  try {
    const worker = await createWorker('eng')
    
    loadingStatus.value = 'Reading receipt...'
    const { data: { text } } = await worker.recognize(file)
    
    await worker.terminate()
    
    const extractedItems = parseReceiptText(text)
    
    if (extractedItems.length === 0) {
      alert('No items found in receipt. Try a clearer photo.')
      return
    }
    
    items.value = extractedItems
    loadingStatus.value = ''
  } catch (error) {
    console.error('OCR Error:', error)
    alert('Error processing receipt: ' + error.message)
    loadingStatus.value = ''
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
