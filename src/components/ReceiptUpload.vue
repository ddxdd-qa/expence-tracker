<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Receipt Scanner</h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">Upload a photo of your receipt to parse and add items automatically</p>
    </div>
    
    <!-- Drag and Drop Zone -->
    <div v-if="items.length === 0 && !loading" class="mb-6">
      <label class="block mb-2.5 font-bold text-slate-500 uppercase tracking-wider text-xs">Upload Receipt Photo</label>
      <div 
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
        :class="dragOver ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 hover:border-blue-400 bg-white'"
        class="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 group shadow-sm"
      >
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition duration-200 shadow-inner">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <div>
          <p class="text-sm font-extrabold text-slate-800">Tap to upload receipt or drag photo here</p>
          <p class="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG. Best quality photo guarantees better accuracy.</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileChange"
          class="hidden"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm space-y-4">
      <div class="relative w-16 h-16 mx-auto">
        <div class="animate-ping absolute inset-0 rounded-full bg-blue-500/10"></div>
        <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner relative">
          <svg class="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
      </div>
      <div>
        <p class="text-sm font-extrabold text-slate-800">{{ loadingStatus }}</p>
        <p class="text-xs text-slate-400 mt-1">Processing image content. This may take up to a minute.</p>
      </div>
    </div>

    <!-- Scanned Items List Form -->
    <div v-else-if="items.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-base sm:text-lg font-bold text-slate-800">Receipt Items ({{ items.length }})</h3>
        <button
          @click="addItem"
          class="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition text-xs border border-slate-200/50"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>Add Item Manually</span>
        </button>
      </div>
      
      <div class="space-y-4">
        <div 
          v-for="(item, idx) in items" 
          :key="idx" 
          class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 relative"
        >
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
            <input
              v-model="item.description"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
              placeholder="Enter product/item name"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount (IDR)</label>
              <input
                v-model.number="item.amount"
                type="number"
                step="any"
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-bold"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Outlet / Location</label>
              <select
                v-model="item.location_id"
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
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

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
            <div class="w-full sm:max-w-xs">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
              <select
                v-model="item.category_id"
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
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
              class="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-0.5 py-2 px-3 rounded-xl hover:bg-red-50/50 transition border border-red-200/10 w-full sm:w-auto justify-center"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Delete Item</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Additional Charges & Fees -->
      <div class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h4 class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Charges & Fees</h4>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Service Charge (Rp)</label>
            <input
              v-model.number="serviceCharge"
              type="number"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-bold"
              placeholder="0"
            />
          </div>
          
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pajak (Tax / PPN / Rp)</label>
            <input
              v-model.number="taxAmount"
              type="number"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-bold"
              placeholder="0"
            />
          </div>
          
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Biaya Tambahan (Rp)</label>
            <input
              v-model.number="additionalFee"
              type="number"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-bold"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
        <button
          @click="saveItems"
          :disabled="!allItemsValid"
          class="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold rounded-xl shadow-lg shadow-blue-500/10 disabled:shadow-none transition text-sm flex items-center justify-center gap-1.5"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          <span>Save Transactions</span>
        </button>
        <button
          @click="resetForm"
          class="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition text-sm text-center"
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

const store = useTransactionStore()
const fileInput = ref(null)
const loading = ref(false)
const loadingStatus = ref('')
const items = ref([])
const locations = ref([])
const categories = ref([])
const dragOver = ref(false)
const serviceCharge = ref(0)
const taxAmount = ref(0)
const additionalFee = ref(0)

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
  let taxVal = 0
  let serviceVal = 0

  // ponytail: patterns that indicate we've reached the payment/summary section and should end item collection
  const summaryPatterns = [
    /TOTAL/i, /BELANJA/i, /TUNAI/i, /KEMBALI/i, /SUBTOTAL/i, /BAYAR/i,
    /CARD/i, /CREDIT/i, /DEBIT/i, /LOYALTY/i, /THANK/i
  ]

  // ponytail: general patterns to skip (headers, footers, metadata, contact info)
  const excludePatterns = [
    /DISKON/i, /PAJAK/i, /TAX/i, /CHANGE/i, /PAYMENT/i,
    /HARGA JUAL/i, /PPN/i, /DPP/i, /LAYANAN/i, /KONSUMEN/i, /GRATIS/i,
    /STRUK/i, /TERIMA/i, /KASIH/i, /INVOICE/i, /NO\s*HP/i,
    /NPWP/i, /TELP/i, /TEIP/i, /TLP/i, /SMS/i, /KONTAK/i, /KLIKINDOMARET/i,
    /ONGKIR/i, /BELANJA LEBIH/i, /INDOMARET/i, /ALFAMART/i,
    /POIN/i, /POINT/i, /RETAILINDO/i, /PLAZA/i, /RENON/i, /DENPASAR/i, /VICTORY/i,
    /CUSTOMER/i, /KASIR/i, /KONTER/i, /NOTA/i, /NOMOR/i,
    /ONLINE/i, /\bWA\b/i, /TANGGAL/i,
    /^[\s\-\*\.=:]+$/,
    /\d{2}[.\-/]\d{2}[.\-/]\d{2,4}/, // dates anywhere in the line
    /^\d{2}[.\-/]\d{2}/,
    /^JL\b/i, /^KEC\b/i, /^KOTA\b/i, /^PULAU\b/i, /GEDUNG/i, /BOULEVARD/i, /KAPUK/i,
    /JAKARTA/i, /BARAT/i
  ]

  let pendingDescription = ''

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.length < 3) continue

    // Check for tax / service charge lines specifically (BEFORE summary/exclude checks)
    const hasTaxKeyword = /PAJAK|TAX|PPN|PB1/i.test(trimmed)
    const hasServiceKeyword = /SERVICE|LAYANAN|\bSVC\b/i.test(trimmed)
    
    if (hasTaxKeyword || hasServiceKeyword) {
      const numberGroups = trimmed.match(/\d+[\d.,\-]*/g) || []
      const candidates = numberGroups
        .map(g => parseInt(g.replace(/\D/g, ''), 10))
        .filter(val => !isNaN(val) && val >= 100 && val <= 9999999)
      
      const amount = candidates.length > 0 ? Math.max(...candidates) : 0
      if (amount > 0) {
        if (hasTaxKeyword) {
          taxVal = amount
        } else if (hasServiceKeyword) {
          serviceVal = amount
        }
      }
      continue // Skip further processing of this line as an item
    }

    // If we hit the payment summary section, clear pending description and skip
    if (summaryPatterns.some(p => p.test(trimmed))) {
      pendingDescription = ''
      continue
    }

    // Skip general header/footer lines without clearing pending description
    if (excludePatterns.some(p => p.test(trimmed))) {
      continue
    }

    // Extract all numbers on this line (no spaces allowed inside number group)
    const numberGroups = trimmed.match(/\d+[\d.,\-]*/g) || []
    const candidates = numberGroups
      .map(g => parseInt(g.replace(/\D/g, ''), 10))
      .filter(val => !isNaN(val) && val >= 100 && val <= 9999999)

    const amount = candidates.length > 0 ? Math.max(...candidates) : null

    if (amount !== null) {
      // Find where the amount starts in the line to separate the description
      let bestIndex = trimmed.length
      for (const group of numberGroups) {
        const val = parseInt(group.replace(/\D/g, ''), 10)
        if (val === amount) {
          const idx = trimmed.indexOf(group)
          if (idx !== -1 && idx < bestIndex) {
            bestIndex = idx
          }
        }
      }

      let description = trimmed.substring(0, bestIndex).trim()

      description = description
        .replace(/^[|\\/:;._\-\s]+/, '')
        .replace(/[|\\/:;._\-\s]+$/, '')
        .replace(/[|[\](){}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Quantity indicator checks: e.g. "1.000 x" or "1 x" or "1.000 X" or similar
      const hasQtyIndicator = /\b\d+([.,]\d+)?\s*[xX*]\b/.test(trimmed) || /\b\d+([.,]\d+)?\s+x\b/i.test(trimmed);
      const isQtyOnly = description.length === 0 || /^\d+([.,]\d+)?\s*x?$/i.test(description) || description.length < 3;

      let finalDescription = description
      if ((isQtyOnly || hasQtyIndicator) && pendingDescription) {
        finalDescription = pendingDescription
      }

      if (finalDescription.length > 1 && !/^[-*\.=:]{2,}$/.test(finalDescription)) {
        // Strip common leading/trailing artifacts from final description
        finalDescription = finalDescription
          .replace(/^[|\\/:;._\-\s]+/, '')
          .replace(/[|\\/:;._\-\s]+$/, '')
          .trim()

        extractedItems.push({
          description: finalDescription,
          amount,
          category_id: null,
          location_id: null
        })
        pendingDescription = '' // clear after success
      }
    } else {
      // No valid price found on this line. Clean it up.
      const cleanedDesc = trimmed
        .replace(/^[|\\/:;._\-\s]+/, '')
        .replace(/[|\\/:;._\-\s]+$/, '')
        .replace(/[|[\](){}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Check for noise lines: high ratio of single-character words or symbols
      const singleLetterWords = cleanedDesc.split(/\s+/).filter(w => w.length === 1 && /[a-zA-Z]/.test(w));
      const hasNoiseSymbols = /[\%\\&£©$@#]/g.test(cleanedDesc);
      const isNoise = singleLetterWords.length > 2 || hasNoiseSymbols;

      // If it looks like a valid item description line and not noise, save it
      if (cleanedDesc.length > 3 && /[a-zA-Z]/.test(cleanedDesc) && !isNoise) {
        pendingDescription = cleanedDesc
      }
    }
  }

  return {
    items: extractedItems,
    tax: taxVal,
    service: serviceVal
  }
}


function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  } else {
    alert('Please upload an image file.')
  }
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    processImageFile(file)
  }
}

async function processImageFile(file) {
  loading.value = true
  loadingStatus.value = 'Reading receipt (Puter AI)...'

  try {
    const puter = window.puter
    if (!puter) {
      throw new Error('Puter SDK is not loaded. Please check your internet connection.')
    }

    const text = await puter.ai.img2txt(file)
    console.log('OCR raw text (Puter):', text)

    const result = parseReceiptText(text)

    if (result.items.length === 0 && result.tax === 0 && result.service === 0) {
      alert('No items found in receipt. Try a clearer photo.')
      return
    }

    items.value = result.items
    taxAmount.value = result.tax
    serviceCharge.value = result.service
    additionalFee.value = 0
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
    // 1. Save regular items
    for (const item of items.value) {
      await store.addTransaction({
        location_id: item.location_id,
        category_id: item.category_id,
        amount: item.amount,
        description: item.description,
        date: new Date().toISOString()
      })
    }
    
    // Inherit location and category from the first item as fallback
    const defaultLocationId = items.value[0]?.location_id || null
    const defaultCategoryId = items.value[0]?.category_id || null

    // 2. Save Service Charge
    if (serviceCharge.value > 0) {
      await store.addTransaction({
        location_id: defaultLocationId,
        category_id: defaultCategoryId,
        amount: serviceCharge.value,
        description: 'Service Charge',
        date: new Date().toISOString()
      })
    }

    // 3. Save Tax
    if (taxAmount.value > 0) {
      await store.addTransaction({
        location_id: defaultLocationId,
        category_id: defaultCategoryId,
        amount: taxAmount.value,
        description: 'Pajak (Tax / PPN)',
        date: new Date().toISOString()
      })
    }

    // 4. Save Additional Fee
    if (additionalFee.value > 0) {
      await store.addTransaction({
        location_id: defaultLocationId,
        category_id: defaultCategoryId,
        amount: additionalFee.value,
        description: 'Biaya Tambahan',
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
  serviceCharge.value = 0
  taxAmount.value = 0
  additionalFee.value = 0
}
</script>
