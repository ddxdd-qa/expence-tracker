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
        <button
          @click="deleteItem(idx)"
          class="mt-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Delete Item
        </button>
      </div>

      <button
        @click="addItem"
        class="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        + Add Item Manually
      </button>

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
  
  const excludePatterns = [
    /TOTAL/i, /BELANJA/i, /TUNAI/i, /KEMBALI/i, /SUBTOTAL/i,
    /DISKON/i, /PAJAK/i, /TAX/i, /CHANGE/i, /PAYMENT/i,
    /HARGA JUAL/i, /PPN/i, /LAYANAN/i, /KONSUMEN/i, /GRATIS/i,
    /STRUK/i, /TERIMA/i, /KASIH/i, /INVOICE/i, /NO\s*HP/i,
    /^-+$/, /^\*+$/, /^\.+$/
  ]
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.length < 3) continue
    if (excludePatterns.some(pattern => pattern.test(trimmed))) continue
    
    const numbers = trimmed.match(/\d+[.,]\d+|\d+/g) || []
    if (numbers.length === 0) continue
    
    const lastNumber = numbers[numbers.length - 1]
    const amount = parseFloat(lastNumber.replace(',', '.'))
    
    if (amount < 50 || amount > 999999) continue
    
    let description = trimmed
      .replace(/\d+[.,]\d+/g, '')
      .replace(/\d+/g, '')
      .replace(/[|[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (description.length > 2 && !description.match(/^[-*\.]{2,}$/)) {
      extractedItems.push({
        description,
        amount,
        category_id: null,
        location_id: null
      })
    }
  }
  
  return extractedItems.length > 0 ? extractedItems : []
}

async function enhanceImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        canvas.toBlob(resolve, 'image/png')
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  loading.value = true
  loadingStatus.value = 'Enhancing image...'
  
  try {
    const enhancedFile = await enhanceImage(file)
    
    loadingStatus.value = 'Initializing OCR...'
    const worker = await createWorker('eng')
    
    loadingStatus.value = 'Reading receipt...'
    const { data: { text } } = await worker.recognize(enhancedFile)
    
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

function deleteItem(idx) {
  items.value.splice(idx, 1)
}

function addItem() {
  items.value.push({
    description: '',
    amount: 0,
    category_id: null,
    location_id: null
  })
}

function resetForm() {
  items.value = []
}
</script>
