<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Organize spending with custom color-coded categories</p>
      </div>
      <button
        v-if="!showAddForm"
        @click="showAddForm = true"
        class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base flex items-center gap-1.5"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add Category</span>
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" ref="formRef" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 transition-all duration-300">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4">{{ editingId ? 'Edit' : 'Add New' }} Category</h2>
      <form @submit.prevent="editingId ? updateCategory() : addCategory()" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Name</label>
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="e.g., Groceries, Dining, Transport"
            class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
          <div class="flex bg-slate-100 rounded-xl p-0.5">
            <button
              type="button"
              @click="newCategoryType = 'expense'"
              class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
              :class="newCategoryType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'"
            >Expense</button>
            <button
              type="button"
              @click="newCategoryType = 'income'"
              class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
              :class="newCategoryType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'"
            >Income</button>
            <button
              type="button"
              @click="newCategoryType = null"
              class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
              :class="newCategoryType === null ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'"
            >Both</button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Theme Color</label>
          <div class="flex gap-3 flex-wrap mt-1">
            <button
              v-for="color in colors"
              :key="color"
              type="button"
              @click="newCategoryColor = color"
              :style="{ backgroundColor: color }"
              :class="newCategoryColor === color ? 'ring-4 ring-offset-2 ring-slate-400 scale-105 shadow' : 'hover:scale-105'"
              class="w-9 h-9 rounded-full transition-all duration-150 shadow-sm"
            />
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            class="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-500/10"
          >
            {{ editingId ? 'Save' : 'Add' }}
          </button>
          <button
            type="button"
            @click="cancelForm"
            class="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-semibold py-2.5 rounded-xl transition text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="category in store.categories"
        :key="category.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between transition hover:shadow-md duration-200 group"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
            :style="{ backgroundColor: category.color }"
          />
          <div class="space-y-0.5">
            <h3 class="font-bold text-slate-800 group-hover:text-blue-600 transition duration-150 flex items-center gap-1.5">
              {{ category.name }}
              <span
                v-if="category.type"
                class="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                :class="category.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
              >{{ category.type }}</span>
              <span
                v-if="category.system_key"
                class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700"
              >System</span>
            </h3>
            <p class="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <span>{{ countTransactions(category.id) }} transactions</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button
            v-if="!category.system_key"
            @click="startEdit(category)"
            class="text-blue-500 hover:text-blue-700 font-bold text-xs flex items-center gap-0.5 p-2 rounded-lg hover:bg-blue-50/50 transition"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
          </button>
          <button
            v-if="!category.system_key"
            @click="confirmDeleteCategory(category.id)"
            class="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-0.5 p-2 rounded-lg hover:bg-red-50/50 transition"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            <span class="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="store.categories.length === 0 && !showAddForm" class="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
      <div class="text-5xl mb-4">🏷️</div>
      <h3 class="text-lg font-bold text-slate-900 mb-1">No Categories Yet</h3>
      <p class="text-sm text-slate-500 max-w-sm mx-auto mb-6">Create custom categories to categorize your transactions (e.g. Groceries, Entertainment, Education, Transports).</p>
      <button
        @click="showAddForm = true"
        class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add Your First Category</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()
const formRef = ref(null)
const showAddForm = ref(false)
const editingId = ref(null)
const newCategoryName = ref('')
const newCategoryColor = ref('#EF4444')
const newCategoryType = ref('expense')

const colors = [
  '#EF4444', '#F97316', '#FBBF24', '#34D399', '#3B82F6',
  '#8B5CF6', '#EC4899', '#64748B', '#6366F1', '#06B6D4'
]

function countTransactions(categoryId) {
  return store.transactions.filter(t => t.category_id === categoryId).length
}

function startEdit(category) {
  editingId.value = category.id
  newCategoryName.value = category.name
  newCategoryColor.value = category.color
  newCategoryType.value = category.type || null
  showAddForm.value = true
  nextTick(() => formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}

function cancelForm() {
  showAddForm.value = false
  editingId.value = null
  newCategoryName.value = ''
  newCategoryColor.value = '#EF4444'
  newCategoryType.value = 'expense'
}

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  try {
    await store.addCategory({
      name: newCategoryName.value,
      color: newCategoryColor.value,
      type: newCategoryType.value
    })
    cancelForm()
  } catch (e) {
    alert('Error adding category: ' + e.message)
  }
}

async function updateCategory() {
  if (!newCategoryName.value.trim()) return
  try {
    await store.updateCategory(editingId.value, {
      name: newCategoryName.value,
      color: newCategoryColor.value,
      type: newCategoryType.value
    })
    cancelForm()
  } catch (e) {
    alert('Error updating category: ' + e.message)
  }
}

async function confirmDeleteCategory(id) {
  if (confirm('Are you sure? This will not delete related transactions.')) {
    try {
      await store.deleteCategory(id)
    } catch (e) {
      alert('Error deleting category: ' + e.message)
    }
  }
}
</script>
