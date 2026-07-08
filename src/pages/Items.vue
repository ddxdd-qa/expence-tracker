<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Items</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Record item prices and compare across locations</p>
      </div>
      <button
        v-if="!showForm"
        @click="openAddForm"
        class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base flex items-center gap-1.5"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add Item</span>
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showForm" ref="formRef" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4">{{ editingId ? 'Edit' : 'Add New' }} Item</h2>
      <form @submit.prevent="editingId ? saveEdit() : saveNew()" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
            <input v-model="form.date" type="date" required
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
            />
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
            <input v-model="form.name" @focus="nameFocused = true" @blur="setTimeout(() => nameFocused = false, 200)" @keydown.enter.prevent="nameFocused = false" type="text" placeholder="e.g., Beras 5kg, Minyak Goreng" required
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
            />
            <div v-if="nameFocused && form.name && filteredNames.length" class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl z-[60] max-h-40 overflow-y-auto shadow-xl py-1 divide-y divide-slate-100" @mousedown.prevent>
              <div v-for="n in filteredNames" :key="n" @mousedown.prevent.stop="form.name = n; nameFocused = false" class="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-700 transition">{{ n }}</div>
            </div>
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
            <input v-model="locationInput" @input="filterLocations" @keydown.enter.prevent="selectOrCreateLocation" @focus="locationFocused = true" @blur="setTimeout(() => locationFocused = false, 200)" type="text" placeholder="e.g., Supermarket ABC, Mall XYZ"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
            />
            <div v-if="locationFocused && locationInput && filteredLocations.length" class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl z-[60] max-h-40 overflow-y-auto shadow-xl py-1 divide-y divide-slate-100" @mousedown.prevent>
              <div v-for="loc in filteredLocations" :key="loc.id" @mousedown.prevent.stop="selectLocation(loc)" class="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-700 transition">{{ loc.name }}</div>
              <div @mousedown.prevent.stop="selectOrCreateLocation" class="px-4 py-2 bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-sm border-t border-slate-100 text-blue-700 font-bold">+ Create: "{{ locationInput }}"</div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Qty</label>
              <input v-model.number="form.qty" type="number" step="0.01" min="0.01" placeholder="1"
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unit</label>
              <input v-model="form.unit" type="text" placeholder="pcs"
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" placeholder="0" required
                class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit"
            class="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-500/10"
          >{{ editingId ? 'Save' : 'Add' }}</button>
          <button type="button" @click="cancelForm"
            class="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-semibold py-2.5 rounded-xl transition text-sm"
          >Cancel</button>
        </div>
      </form>
    </div>

    <!-- Tab Bar -->
    <div v-if="store.items.length" class="flex bg-slate-100 rounded-xl p-0.5">
      <button @click="activeTab = 'compare'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        :class="activeTab === 'compare' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >Compare</button>
      <button @click="activeTab = 'outlets'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        :class="activeTab === 'outlets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >Outlets</button>
    </div>

    <!-- Compare Tab -->
    <template v-if="activeTab === 'compare'">
      <!-- Price Chart -->
      <div v-if="store.items.length" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 class="text-base font-bold text-slate-900">Price Comparison Chart</h2>
          <select v-model="selectedItem"
            class="bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition-all duration-200"
          >
            <option value="">— Item —</option>
            <option v-for="name in itemNames" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div class="min-h-[250px] flex items-center justify-center">
          <ItemPriceChart :items="chartItems" :locations="store.locations" />
        </div>
      </div>

      <!-- Price Comparison Table -->
      <div v-if="groupedItems.length" class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900">Price Comparison by Location</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-slate-600">Item</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-600">Location</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-600">Qty</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-600">Unit</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-600">Price</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-600">Unit Price</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600">Date</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="group in groupedItems" :key="group.name">
                <tr class="bg-slate-50/50">
                  <td colspan="8" class="px-4 py-2 font-bold text-slate-800 text-xs uppercase tracking-wider">{{ group.name }}</td>
                </tr>
                <tr v-for="item in group.items" :key="item.id" class="hover:bg-slate-50/50 transition">
                  <td class="px-4 py-3 text-slate-800 font-medium">{{ item.name }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs font-semibold text-slate-600">{{ getLocationName(item.location_id) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right text-slate-700">{{ Number(item.qty).toLocaleString('id-ID') }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ item.unit }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-900">{{ formatCurrency(item.price) }}</td>
                  <td class="px-4 py-3 text-right text-slate-600">{{ formatCurrency(Number(item.price) / Number(item.qty)) }}/{{ item.unit }}</td>
                  <td class="px-4 py-3 text-center text-slate-400 text-xs whitespace-nowrap">{{ formatDate(item.date) }}</td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex gap-1 justify-center">
                      <button @click="startEdit(item)" class="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50/50 transition">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                      </button>
                      <button @click="confirmDelete(item.id)" class="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50/50 transition">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Outlets Tab -->
    <template v-if="activeTab === 'outlets'">
      <div v-if="store.items.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="outlet in outletSummary" :key="outlet.location_id"
          class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 transition hover:shadow-md cursor-pointer"
          :class="selectedOutlet === outlet.location_id ? 'ring-2 ring-blue-500 border-blue-200' : ''"
          @click="toggleOutlet(outlet.location_id)"
        >
          <p class="text-xs text-slate-400 font-semibold truncate">{{ outlet.location_name }}</p>
          <p class="text-lg font-extrabold text-slate-900 mt-1">{{ outlet.count }} item{{ outlet.count > 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div v-if="selectedOutlet && outletItems.length" ref="outletItemsRef" class="space-y-6">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">Items at {{ getLocationName(selectedOutlet) }}</h2>
            <select v-model="selectedOutletItem"
              class="bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none transition-all duration-200"
            >
              <option value="">— All items —</option>
              <option v-for="name in outletItemNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50/70 border-b border-slate-100">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Item</th>
                  <th class="px-4 py-3 text-right font-semibold text-slate-600">Qty</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Unit</th>
                  <th class="px-4 py-3 text-right font-semibold text-slate-600">Price</th>
                  <th class="px-4 py-3 text-right font-semibold text-slate-600">Unit Price</th>
                  <th class="px-4 py-3 text-center font-semibold text-slate-600">Date</th>
                  <th class="px-4 py-3 text-center font-semibold text-slate-600"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="item in outletItemsFiltered" :key="item.id" class="hover:bg-slate-50/50 transition">
                  <td class="px-4 py-3 text-slate-800 font-medium">{{ item.name }}</td>
                  <td class="px-4 py-3 text-right text-slate-700">{{ Number(item.qty).toLocaleString('id-ID') }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ item.unit }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-900">{{ formatCurrency(item.price) }}</td>
                  <td class="px-4 py-3 text-right text-slate-600">{{ formatCurrency(Number(item.price) / Number(item.qty)) }}/{{ item.unit }}</td>
                  <td class="px-4 py-3 text-center text-slate-400 text-xs whitespace-nowrap">{{ formatDate(item.date) }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="startEdit(item)" class="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50/50 transition">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="selectedOutletItem" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 class="text-sm font-bold text-slate-900 mb-4">Price History: {{ selectedOutletItem }} at {{ getLocationName(selectedOutlet) }}</h3>
          <div class="min-h-[200px] flex items-center justify-center">
            <ItemPriceHistoryChart :items="outletPriceHistory" />
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-if="store.items.length === 0 && !showForm" class="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
      <div class="text-5xl mb-4">📦</div>
      <h3 class="text-lg font-bold text-slate-900 mb-1">No Items Yet</h3>
      <p class="text-sm text-slate-500 max-w-sm mx-auto mb-6">Record items with their prices at different locations to compare and find the best deals.</p>
      <button @click="openAddForm"
        class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add Your First Item</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'
import ItemPriceChart from '../components/ItemPriceChart.vue'
import ItemPriceHistoryChart from '../components/ItemPriceHistoryChart.vue'

const store = useTransactionStore()
const formRef = ref(null)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ date: '', name: '', location_id: null, qty: 1, unit: 'pcs', price: '' })
const locationInput = ref('')
const locationFocused = ref(false)
const nameFocused = ref(false)
const activeTab = ref('compare')
const selectedItem = ref('')
const selectedOutlet = ref(null)
const selectedOutletItem = ref('')
const outletItemsRef = ref(null)

const itemNames = computed(() => [...new Set(store.items.map(i => i.name))].sort())

const chartItems = computed(() =>
  store.items.filter(i => i.name === selectedItem.value)
)

const outletSummary = computed(() => {
  const map = {}
  store.items.forEach(item => {
    if (item.location_id == null) return
    if (!map[item.location_id]) map[item.location_id] = new Set()
    map[item.location_id].add(item.name)
  })
  return Object.entries(map).map(([locId, names]) => ({
    location_id: Number(locId),
    location_name: getLocationName(locId),
    count: names.size
  })).sort((a, b) => b.count - a.count)
})

const priceHistory = computed(() =>
  store.items
    .filter(i => i.name === selectedItem.value && i.location_id === selectedOutlet.value)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
)

const outletItems = computed(() =>
  store.items.filter(i => i.location_id === selectedOutlet.value)
)

const outletItemNames = computed(() =>
  [...new Set(outletItems.value.map(i => i.name))].sort()
)

const outletItemsFiltered = computed(() =>
  selectedOutletItem.value
    ? outletItems.value.filter(i => i.name === selectedOutletItem.value)
    : outletItems.value
)

const outletPriceHistory = computed(() =>
  store.items
    .filter(i => i.name === selectedOutletItem.value && i.location_id === selectedOutlet.value)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
)

const filteredLocations = computed(() => {
  if (!locationInput.value) return store.locations
  return store.locations.filter(loc =>
    loc.name.toLowerCase().includes(locationInput.value.toLowerCase())
  )
})

const filteredNames = computed(() => {
  if (!form.value.name) return []
  const q = form.value.name.toLowerCase()
  const names = [...new Set(store.items.map(i => i.name))]
  return names.filter(n => n.toLowerCase().includes(q))
})

function toggleOutlet(id) {
  selectedOutlet.value = selectedOutlet.value === id ? null : id
  selectedOutletItem.value = ''
  if (selectedOutlet.value) {
    nextTick(() => outletItemsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}

function filterLocations() {
  if (filteredLocations.value.length === 0 && locationInput.value.length > 0) {
    form.value.location_id = null
  }
}

function selectLocation(loc) {
  form.value.location_id = loc.id
  locationInput.value = loc.name
  locationFocused.value = false
}

async function selectOrCreateLocation() {
  if (!locationInput.value.trim()) return
  const existing = store.locations.find(l =>
    l.name.toLowerCase() === locationInput.value.toLowerCase()
  )
  if (existing) {
    form.value.location_id = existing.id
    locationInput.value = existing.name
  } else {
    const newLoc = await store.addLocation({ name: locationInput.value })
    form.value.location_id = newLoc.id
    locationInput.value = newLoc.name
  }
  locationFocused.value = false
}

function resetForm() {
  form.value = { date: '', name: '', location_id: null, qty: 1, unit: 'pcs', price: '' }
  locationInput.value = ''
}

function openAddForm() {
  resetForm()
  form.value.date = new Date().toISOString().slice(0, 10)
  editingId.value = null
  showForm.value = true
  nextTick(() => formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}

function startEdit(item) {
  editingId.value = item.id
  form.value = {
    date: item.date?.slice(0, 10) || '',
    name: item.name,
    location_id: item.location_id,
    qty: Number(item.qty),
    unit: item.unit,
    price: Number(item.price)
  }
  locationInput.value = getLocationName(item.location_id)
  showForm.value = true
  nextTick(() => formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
  resetForm()
}

async function resolveLocation() {
  if (!locationInput.value.trim()) {
    form.value.location_id = null
    return
  }
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

async function saveNew() {
  if (!form.value.name.trim() || !form.value.date || form.value.price === '') return
  await resolveLocation()
  try {
    await store.addItem({
      name: form.value.name,
      location_id: form.value.location_id,
      date: form.value.date,
      qty: form.value.qty || 1,
      unit: form.value.unit || 'pcs',
      price: Number(form.value.price)
    })
    cancelForm()
  } catch (e) {
    alert('Error adding item: ' + e.message)
  }
}

async function saveEdit() {
  if (!form.value.name.trim() || !form.value.date || form.value.price === '') return
  await resolveLocation()
  try {
    await store.updateItem(editingId.value, {
      name: form.value.name,
      location_id: form.value.location_id,
      date: form.value.date,
      qty: form.value.qty || 1,
      unit: form.value.unit || 'pcs',
      price: Number(form.value.price)
    })
    cancelForm()
  } catch (e) {
    alert('Error updating item: ' + e.message)
  }
}

async function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await store.deleteItem(id)
    } catch (e) {
      alert('Error deleting item: ' + e.message)
    }
  }
}

const groupedItems = computed(() => {
  const map = {}
  store.items.forEach(item => {
    if (!map[item.name]) map[item.name] = []
    map[item.name].push(item)
  })
  return Object.keys(map).sort().map(name => ({
    name,
    items: map[name]
  }))
})

function getLocationName(id) {
  const loc = store.locations.find(l => String(l.id) === String(id))
  return loc?.name || '—'
}

function formatCurrency(value) {
  return 'Rp ' + Number(value).toLocaleString('id-ID')
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
