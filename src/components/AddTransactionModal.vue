<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
    <!-- Backdrop Close Area -->
    <div class="absolute inset-0" @click="$emit('close')"></div>
    
    <!-- Modal/Sheet Container -->
    <div class="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl p-6 w-full md:max-w-md max-h-[85vh] md:max-h-none overflow-y-auto pb-10 md:pb-6 z-10 relative">
      <!-- Drag handle for mobile -->
      <div class="md:hidden w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 flex-shrink-0" />
      
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-extrabold text-slate-900">{{ txType === 'expense' ? 'Add Expense' : 'Add Income' }}</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- Type Toggle -->
        <div class="flex bg-slate-100 rounded-xl p-1">
          <button
            type="button"
            @click="txType = 'expense'"
            class="flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200"
            :class="txType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            💳 Expense
          </button>
          <button
            type="button"
            @click="txType = 'income'"
            class="flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200"
            :class="txType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            💰 Income
          </button>
        </div>

        <!-- Date & Wallet -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
            <input
              v-model="date"
              type="date"
              class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wallet / Source</label>
            <select
              v-model.number="accountId"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
            >
              <option :value="null">{{ txType === 'income' ? 'None (Direct income)' : 'None (Not specified)' }}</option>
              <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }} (Rp {{ store.getAccountBalance(acc.id).toLocaleString('id-ID') }})
              </option>
            </select>
          </div>
        </div>

        <!-- Expense: Location + Multi-item -->
        <template v-if="txType === 'expense'">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
            <div class="relative">
               <input
                v-model="locationInput"
                @input="filterLocations"
                @keydown.enter.prevent="selectOrCreateLocation"
                @focus="locationFocused = true"
                @blur="setTimeout(() => { locationFocused = false }, 200)"
                type="text"
                placeholder="e.g., Starpoint, Supermarket..."
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
                ref="locationInputRef"
              />
              
              <div
                v-if="locationFocused && locationInput && filteredLocations.length > 0"
                class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl z-[60] max-h-40 overflow-y-auto shadow-xl py-1 divide-y divide-slate-100"
                @mousedown.prevent
              >
                <div
                  v-for="loc in filteredLocations"
                  :key="loc.id"
                  @mousedown.prevent.stop="selectLocation(loc)"
                  class="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-700 transition"
                >
                  {{ loc.name }}
                </div>
                <div
                  @mousedown.prevent.stop="selectOrCreateLocation"
                  class="px-4 py-2 bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-sm border-t border-slate-100 text-blue-700 font-bold"
                >
                  + Create: "{{ locationInput }}"
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Items</label>
            <button
              type="button"
              @click="addItem"
              class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
            >
              + Add Item
            </button>
          </div>

          <div class="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
            <div 
              v-for="(item, idx) in items" 
              :key="idx" 
              class="border border-slate-100 p-4 bg-slate-50/50 rounded-2xl space-y-3 relative"
            >
              <button 
                v-if="items.length > 1" 
                type="button" 
                @click="removeItem(idx)"
                class="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>

              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Item #{{ idx + 1 }}</h3>

              <div class="relative">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  v-model="item.description"
                  @keydown.enter.prevent="selectOrKeepDescription(idx)"
                  @focus="item.descriptionFocused = true"
                  @blur="setTimeout(() => { item.descriptionFocused = false }, 200)"
                  type="text"
                  placeholder="e.g., Apple, Bread..."
                  class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
                  required
                />
                <div
                  v-if="item.descriptionFocused && item.description && getFilteredDescriptions(item.description).length > 0"
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl z-[60] max-h-32 overflow-y-auto shadow-xl py-1 divide-y divide-slate-100"
                  @mousedown.prevent
                >
                  <div
                    v-for="desc in getFilteredDescriptions(item.description)"
                    :key="desc"
                    @mousedown.prevent.stop="selectDescription(idx, desc)"
                    class="px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition"
                  >
                    {{ desc }}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount (IDR)</label>
                  <input
                    v-model.number="item.amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-extrabold"
                    required
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <div class="relative">
                    <input
                      v-model="item.categoryInput"
                      @input="filterItemCategories(idx)"
                      @keydown.enter.prevent="selectOrCreateItemCategory(idx)"
                      @focus="item.categoryFocused = true"
                      @blur="setTimeout(() => { item.categoryFocused = false }, 200)"
                      type="text"
                      placeholder="Type..."
                      class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
                    />
                    
                    <div
                      v-if="item.categoryFocused && item.categoryInput && getFilteredItemCategories(item.categoryInput).length > 0"
                      class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl z-[60] max-h-32 overflow-y-auto shadow-xl py-1 divide-y divide-slate-100"
                      @mousedown.prevent
                    >
                      <div
                        v-for="cat in getFilteredItemCategories(item.categoryInput)"
                        :key="cat.id"
                        @mousedown.prevent.stop="selectItemCategory(idx, cat)"
                        class="px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition"
                      >
                        {{ cat.name }}
                      </div>
                      <div
                        @mousedown.prevent.stop="selectOrCreateItemCategory(idx)"
                        class="px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-xs border-t border-slate-100 text-blue-700 font-bold"
                      >
                        + Create: "{{ item.categoryInput }}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Income: single entry, no location, no multi-item -->
        <template v-if="txType === 'income'">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <input
              v-model="incomeDescription"
              type="text"
              placeholder="e.g., Salary, Freelance, Gift..."
              class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
              required
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (IDR)</label>
              <input
                v-model.number="incomeAmount"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-extrabold"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
              <div class="relative">
                <input
                  v-model="incomeCategoryInput"
                  @input="filterIncomeCategories"
                  @keydown.enter.prevent="selectOrCreateIncomeCategory"
                  @focus="incomeCategoryFocused = true"
                  @blur="setTimeout(() => { incomeCategoryFocused = false }, 200)"
                  type="text"
                  placeholder="Type..."
                  class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 font-semibold"
                />
                <div
                  v-if="incomeCategoryFocused && incomeCategoryInput && filteredIncomeCategories.length > 0"
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl z-[60] max-h-32 overflow-y-auto shadow-xl py-1 divide-y divide-slate-100"
                  @mousedown.prevent
                >
                  <div
                    v-for="cat in filteredIncomeCategories"
                    :key="cat.id"
                    @mousedown.prevent.stop="selectIncomeCategory(cat)"
                    class="px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition"
                  >
                    {{ cat.name }}
                  </div>
                  <div
                    @mousedown.prevent.stop="selectOrCreateIncomeCategory"
                    class="px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-xs border-t border-slate-100 text-blue-700 font-bold"
                  >
                    + Create: "{{ incomeCategoryInput }}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Save as Item checkbox -->
        <div v-if="txType === 'expense'" class="flex items-center gap-2 pt-2">
          <input type="checkbox" id="saveAsItem" v-model="saveAsItem" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
          <label for="saveAsItem" class="text-sm font-semibold text-slate-600 cursor-pointer select-none">Also save as item</label>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Saving...' : txType === 'expense' ? 'Add All' : 'Add Income' }}</span>
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-semibold py-2.5 rounded-xl transition text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()
const emit = defineEmits(['close', 'added'])
const isSubmitting = ref(false)

const today = new Date().toISOString().split('T')[0]
const date = ref(today)
const txType = ref('expense')
const locationId = ref(null)
const locationInput = ref('')
const locationInputRef = ref(null)
const locationFocused = ref(false)
const accountId = ref(null)

// Income fields
const incomeDescription = ref('')
const incomeAmount = ref(null)
const incomeCategoryId = ref(null)
const incomeCategoryInput = ref('')
const incomeCategoryFocused = ref(false)

const saveAsItem = ref(false)

const items = ref([
  {
    category_id: null,
    categoryInput: '',
    categoryFocused: false,
    description: '',
    descriptionFocused: false,
    amount: null
  }
])

const filteredLocations = computed(() => {
  if (!locationInput.value) return store.locations
  return store.locations.filter(loc =>
    loc.name.toLowerCase().includes(locationInput.value.toLowerCase())
  )
})

function filterLocations() {
  if (filteredLocations.value.length === 0 && locationInput.value.length > 0) {
    locationId.value = null
  }
}

function selectLocation(loc) {
  locationId.value = loc.id
  locationInput.value = loc.name
  locationFocused.value = false
}

async function selectOrCreateLocation() {
  if (!locationInput.value.trim()) return
  
  const existing = store.locations.find(l =>
    l.name.toLowerCase() === locationInput.value.toLowerCase()
  )
  
  if (existing) {
    locationId.value = existing.id
    locationInput.value = existing.name
  } else {
    const newLoc = await store.addLocation({ name: locationInput.value })
    locationId.value = newLoc.id
    locationInput.value = newLoc.name
  }
  locationFocused.value = false
}

// Item functions
function addItem() {
  items.value.push({
    category_id: null,
    categoryInput: '',
    categoryFocused: false,
    description: '',
    descriptionFocused: false,
    amount: null
  })
}

function removeItem(idx) {
  items.value.splice(idx, 1)
}

const uniqueDescriptions = computed(() => {
  const seen = new Set()
  return store.transactions
    .map(t => t.description)
    .filter(d => d && d.trim() && (seen.has(d.toLowerCase()) ? false : seen.add(d.toLowerCase())))
})

function getFilteredDescriptions(input) {
  if (!input) return uniqueDescriptions.value
  return uniqueDescriptions.value.filter(d =>
    d.toLowerCase().includes(input.toLowerCase())
  )
}

function selectDescription(idx, desc) {
  items.value[idx].description = desc
  items.value[idx].descriptionFocused = false
}

function selectOrKeepDescription(idx) {
  items.value[idx].descriptionFocused = false
}

function getFilteredItemCategories(input) {
  const cats = store.categories.filter(cat =>
    !cat.type || cat.type === 'expense'
  )
  if (!input) return cats
  return cats.filter(cat =>
    cat.name.toLowerCase().includes(input.toLowerCase())
  )
}

function filterItemCategories(idx) {
  const item = items.value[idx]
  const filtered = getFilteredItemCategories(item.categoryInput)
  if (filtered.length === 0 && item.categoryInput.length > 0) {
    item.category_id = null
  }
}

function selectItemCategory(idx, cat) {
  const item = items.value[idx]
  item.category_id = cat.id
  item.categoryInput = cat.name
  item.categoryFocused = false
}

async function selectOrCreateItemCategory(idx) {
  const item = items.value[idx]
  if (!item.categoryInput.trim()) return
  
  const existing = store.categories.find(c =>
    c.name.toLowerCase() === item.categoryInput.toLowerCase()
  )
  
  if (existing) {
    item.category_id = existing.id
    item.categoryInput = existing.name
  } else {
    const newCat = await store.addCategory({ name: item.categoryInput })
    item.category_id = newCat.id
    item.categoryInput = newCat.name
  }
  item.categoryFocused = false
}

const filteredIncomeCategories = computed(() => {
  const cats = store.categories.filter(cat =>
    !cat.type || cat.type === 'income'
  )
  if (!incomeCategoryInput.value) return cats
  return cats.filter(c =>
    c.name.toLowerCase().includes(incomeCategoryInput.value.toLowerCase())
  )
})

function filterIncomeCategories() {
  if (filteredIncomeCategories.value.length === 0 && incomeCategoryInput.value.length > 0) {
    incomeCategoryId.value = null
  }
}

function selectIncomeCategory(cat) {
  incomeCategoryId.value = cat.id
  incomeCategoryInput.value = cat.name
  incomeCategoryFocused.value = false
}

async function selectOrCreateIncomeCategory() {
  if (!incomeCategoryInput.value.trim()) return
  const existing = store.categories.find(c =>
    c.name.toLowerCase() === incomeCategoryInput.value.toLowerCase()
  )
  if (existing) {
    incomeCategoryId.value = existing.id
    incomeCategoryInput.value = existing.name
  } else {
    const newCat = await store.addCategory({ name: incomeCategoryInput.value })
    incomeCategoryId.value = newCat.id
    incomeCategoryInput.value = newCat.name
  }
  incomeCategoryFocused.value = false
}

async function submit() {
  isSubmitting.value = true
  try {
    if (txType.value === 'expense') {
      if (!locationId.value && locationInput.value.trim()) {
        await selectOrCreateLocation()
      }
      if (!locationId.value) {
        alert('Please specify a location')
        return
      }
      for (let i = 0; i < items.value.length; i++) {
        const item = items.value[i]
        if (!item.category_id && item.categoryInput && item.categoryInput.trim()) {
          await selectOrCreateItemCategory(i)
        }
      }
      for (let i = 0; i < items.value.length; i++) {
        const item = items.value[i]
        if (!item.category_id || !item.amount || !item.description) {
          alert(`Please fill in all fields for Item #${i + 1}`)
          return
        }
        if (item.amount < 0) {
          alert(`Amount cannot be negative for Item #${i + 1}`)
          return
        }
      }
      for (const item of items.value) {
        await store.addTransaction({
          date: date.value,
          location_id: locationId.value || null,
          category_id: item.category_id,
          description: item.description,
          amount: Number(item.amount),
          account_id: accountId.value || null,
          type: 'expense'
        })
      }
      if (saveAsItem.value) {
        for (const item of items.value) {
          await store.addItem({
            name: item.description,
            location_id: locationId.value || null,
            date: date.value,
            qty: 1,
            unit: 'pcs',
            price: Number(item.amount)
          })
        }
      }
    } else {
      if (!incomeCategoryId.value && incomeCategoryInput.value.trim()) {
        await selectOrCreateIncomeCategory()
      }
      if (!incomeDescription.value.trim() || !incomeAmount.value) {
        alert('Please fill in description and amount')
        return
      }
      if (incomeAmount.value < 0) {
        alert('Amount cannot be negative')
        return
      }
      await store.addTransaction({
        date: date.value,
        location_id: null,
        category_id: incomeCategoryId.value || null,
        description: incomeDescription.value,
        amount: Number(incomeAmount.value),
        account_id: accountId.value || null,
        type: 'income'
      })
    }
    emit('added')
  } catch (e) {
    alert('Error submitting transaction: ' + e.message)
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>
