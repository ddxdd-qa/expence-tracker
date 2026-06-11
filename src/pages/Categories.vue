<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Categories</h1>
      <button
        @click="showAddForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Add Category
      </button>
    </div>

    <div v-if="showAddForm" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">Add New Category</h2>
      <form @submit.prevent="addCategory" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="e.g., Groceries, Dining, Transport"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="color in colors"
              :key="color"
              type="button"
              @click="newCategoryColor = color"
              :style="{ backgroundColor: color }"
              :class="newCategoryColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''"
              class="w-10 h-10 rounded-full transition"
            />
          </div>
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
        v-for="category in store.categories"
        :key="category.id"
        class="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded-full"
            :style="{ backgroundColor: category.color }"
          />
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
            <p class="text-sm text-gray-500">{{ countTransactions(category.id) }} transactions</p>
          </div>
        </div>
        <button
          @click="confirmDeleteCategory(category.id)"
          class="text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      </div>
    </div>

    <div v-if="store.categories.length === 0 && !showAddForm" class="bg-gray-100 rounded-lg p-8 text-center">
      <p class="text-gray-600">No categories yet. Add one to get started!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactionStore } from '../stores/transactionStore'

const store = useTransactionStore()
const showAddForm = ref(false)
const newCategoryName = ref('')
const newCategoryColor = ref('#3B82F6')

const colors = [
  '#EF4444', '#F97316', '#FBBF24', '#34D399', '#3B82F6',
  '#8B5CF6', '#EC4899', '#64748B', '#6366F1', '#06B6D4'
]

function countTransactions(categoryId) {
  return store.transactions.filter(t => t.category_id === categoryId).length
}

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  try {
    await store.addCategory({
      name: newCategoryName.value,
      color: newCategoryColor.value
    })
    newCategoryName.value = ''
    newCategoryColor.value = '#3B82F6'
    showAddForm.value = false
  } catch (e) {
    alert('Error adding category: ' + e.message)
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
