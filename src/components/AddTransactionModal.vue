<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
    <div class="bg-white rounded-t-lg sm:rounded-lg shadow-xl p-4 sm:p-6 w-full sm:max-w-md">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Add Transaction</h2>
      <form @submit.prevent="submit" class="space-y-3 sm:space-y-4 max-h-[70vh] sm:max-h-none overflow-y-auto overflow-x-visible">
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
          <div class="relative">
            <input
              v-model="locationInput"
              @input="filterLocations"
              @keydown.enter="selectOrCreateLocation"
              type="text"
              placeholder="Type location..."
              class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <div v-if="locationInput && filteredLocations.length > 0" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-50 max-h-40 overflow-y-auto pointer-events-auto shadow-lg">
              <div
                v-for="loc in filteredLocations"
                :key="loc.id"
                @mousedown.prevent="form.location_id = loc.id; locationInput = loc.name; locationInput = ''"
                class="px-3 sm:px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              >
                {{ loc.name }}
              </div>
              <div
                @mousedown.prevent="selectOrCreateLocation"
                class="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 cursor-pointer text-sm border-t border-gray-200 text-green-700 font-medium"
              >
                + Create: {{ locationInput }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
          <div class="relative">
            <input
              v-model="categoryInput"
              @input="filterCategories"
              @keydown.enter="selectOrCreateCategory"
              type="text"
              placeholder="Type category..."
              class="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <div v-if="categoryInput && filteredCategories.length > 0" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-50 max-h-40 overflow-y-auto pointer-events-auto shadow-lg">
              <div
                v-for="cat in filteredCategories"
                :key="cat.id"
                @mousedown.prevent="form.category_id = cat.id; categoryInput = cat.name; categoryInput = ''"
                class="px-3 sm:px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              >
                {{ cat.name }}
              </div>
              <div
                @mousedown.prevent="selectOrCreateCategory"
                class="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 cursor-pointer text-sm border-t border-gray-200 text-green-700 font-medium"
              >
                + Create: {{ categoryInput }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Description</label>
          <input
            v-model="form.description"
            type="text"
            placeholder="Groceries, Fuel, etc."
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
            Add
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
import { ref, computed } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()
const emit = defineEmits(['close', 'added'])

const today = new Date().toISOString().split('T')[0]
const locationInput = ref('')
const categoryInput = ref('')

const form = ref({
  date: today,
  location_id: null,
  category_id: null,
  description: '',
  amount: null
})

const filteredLocations = computed(() => {
  if (!locationInput.value) return store.locations
  return store.locations.filter(loc =>
    loc.name.toLowerCase().includes(locationInput.value.toLowerCase())
  )
})

const filteredCategories = computed(() => {
  if (!categoryInput.value) return store.categories
  return store.categories.filter(cat =>
    cat.name.toLowerCase().includes(categoryInput.value.toLowerCase())
  )
})

function filterLocations() {
  if (filteredLocations.value.length === 0 && locationInput.value.length > 0) {
    form.value.location_id = null
  }
}

function filterCategories() {
  if (filteredCategories.value.length === 0 && categoryInput.value.length > 0) {
    form.value.category_id = null
  }
}

async function selectOrCreateLocation() {
  if (!locationInput.value.trim()) return
  
  const existing = store.locations.find(l =>
    l.name.toLowerCase() === locationInput.value.toLowerCase()
  )
  
  if (existing) {
    form.value.location_id = existing.id
  } else {
    const newLoc = await store.addLocation({ name: locationInput.value })
    form.value.location_id = newLoc.id
  }
}

async function selectOrCreateCategory() {
  if (!categoryInput.value.trim()) return
  
  const existing = store.categories.find(c =>
    c.name.toLowerCase() === categoryInput.value.toLowerCase()
  )
  
  if (existing) {
    form.value.category_id = existing.id
  } else {
    const newCat = await store.addCategory({ name: categoryInput.value })
    form.value.category_id = newCat.id
  }
}

async function submit() {
  if (!form.value.location_id || !form.value.category_id || !form.value.amount) {
    alert('Please fill in all fields')
    return
  }

  try {
    await store.addTransaction({
      date: form.value.date,
      location_id: form.value.location_id,
      category_id: form.value.category_id,
      description: form.value.description,
      amount: form.value.amount
    })
    emit('added')
  } catch (e) {
    alert('Error adding transaction: ' + e.message)
  }
}
</script>
