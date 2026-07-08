<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Review your financial health at a glance</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="exportCSV"
          class="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold px-4 py-2 sm:py-2.5 rounded-xl transition text-sm flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span class="hidden sm:inline">Export CSV</span>
        </button>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base flex items-center gap-1.5"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>Add</span>
        </button>
      </div>
    </div>

    <!-- Accounts / Wallets Section -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>💳</span> My Wallets & Accounts
          </h2>
          <p class="text-xs text-slate-400">Manage your cash, cards, and e-wallets</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showTransferModal = true"
            class="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
          >
            Transfer
          </button>
          <button
            @click="toggleAddAccount"
            class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            {{ showAddAccount ? 'Close Form' : '+ Add Account' }}
          </button>
        </div>
      </div>

      <!-- Add Account Inline Form -->
      <div v-if="showAddAccount" class="bg-white border border-slate-200/85 rounded-2xl p-5 space-y-4 max-w-md shadow-sm">
        <h3 class="text-sm font-bold text-slate-700">{{ editingAccountId ? 'Edit Wallet' : 'New Account' }}</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Name</label>
            <input
              v-model="newAcc.name"
              type="text"
              placeholder="e.g., BCA, Cash"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none transition font-semibold"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
            <select
              v-model="newAcc.type"
              class="w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none transition font-semibold"
            >
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="createAccount"
            :disabled="isCreatingAccount"
            class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 disabled:bg-blue-400"
          >
            <svg v-if="isCreatingAccount" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ editingAccountId ? 'Save Changes' : 'Create Wallet' }}</span>
          </button>
          <button
            @click="cancelEditAccount"
            class="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Accounts List Horizontal Scroll -->
      <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <!-- Default Empty Card -->
        <div v-if="store.accounts.length === 0" class="flex-shrink-0 w-64 bg-white border border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
          <p class="text-sm font-semibold text-slate-400">No active accounts</p>
          <button @click="showAddAccount = true" class="text-xs text-blue-600 font-bold mt-1">Create one now</button>
        </div>

        <!-- Account Cards -->
        <div
          v-for="acc in store.accounts"
          :key="acc.id"
          @click="$router.push('/transactions?account=' + acc.id)"
          class="flex-shrink-0 w-64 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-blue-200 transition duration-300 cursor-pointer"
        >
          <!-- Background accent gradient -->
          <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div class="absolute top-3 right-3 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity" @click.stop>
            <!-- Edit Wallet -->
            <button
              @click="startEditAccount(acc)"
              class="text-slate-300 hover:text-blue-600 p-1 hover:bg-slate-50 rounded flex items-center justify-center transition"
              title="Edit Wallet"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
            <!-- Delete Wallet -->
            <button
              @click="deleteAccount(acc.id)"
              :disabled="isDeletingAccountId === acc.id"
              class="text-slate-300 hover:text-red-500 p-1 hover:bg-slate-50 rounded flex items-center justify-center transition disabled:opacity-100"
              title="Delete Wallet"
            >
              <svg v-if="isDeletingAccountId === acc.id" class="animate-spin h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>

          <div>
            <span class="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 mb-2">
              {{ acc.type }}
            </span>
            <h3 class="text-sm font-bold text-slate-800 tracking-tight">{{ acc.name }}</h3>
          </div>

          <div class="mt-4">
            <p class="text-xs text-slate-400 font-semibold">Balance</p>
            <p class="text-lg font-extrabold tracking-tight" :class="calcBalance(acc.id) >= 0 ? 'text-slate-900' : 'text-red-600'">
              Rp {{ calcBalance(acc.id).toLocaleString('id-ID') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Filter & Quick Range Options -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900">Filter Transactions</h2>
          <p class="text-xs text-slate-400">Choose a custom date range or select a quick option</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            @click="setWeekRange"
            class="px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200"
            :class="isWeekSelected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'"
          >
            Last 7 Days
          </button>
          <button
            @click="setMonthRange"
            class="px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200"
            :class="isMonthSelected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'"
          >
            This Month
          </button>
          <button
            @click="setYearRange"
            class="px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200"
            :class="isYearSelected ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'"
          >
            This Year
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">From Date</label>
          <input
            v-model="filterFrom"
            type="date"
            class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none transition-all duration-200"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">To Date</label>
          <input
            v-model="filterTo"
            type="date"
            class="appearance-none w-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none transition-all duration-200"
          />
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- Total Income Card -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/10 transition hover:scale-[1.01] hover:shadow-emerald-500/20 duration-300">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-9xl pointer-events-none">💰</div>
        <div class="flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-100">Total Income</h3>
          <span class="p-2 rounded-xl bg-white/10 text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></span>
        </div>
        <p class="text-3xl font-extrabold mt-4 tracking-tight">{{ formatCurrency(totalIncome) }}</p>
        <p class="text-[10px] text-emerald-200 mt-2 font-medium">For the selected filter period</p>
      </div>

      <!-- Total Spent Card -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.01] hover:shadow-blue-500/20 duration-300">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-9xl pointer-events-none">💳</div>
        <div class="flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-100">Total Spent</h3>
          <span class="p-2 rounded-xl bg-white/10 text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span>
        </div>
        <p class="text-3xl font-extrabold mt-4 tracking-tight">{{ formatCurrency(totalSpent) }}</p>
        <p class="text-[10px] text-blue-200 mt-2 font-medium flex items-center justify-between flex-wrap gap-2">
          <span>For the selected filter period</span>
          <span v-if="monthOverMonthChange !== null" class="font-extrabold px-2 py-0.5 rounded bg-white/20 text-white text-[9px] uppercase tracking-wider">
            {{ monthOverMonthChange > 0 ? '+' : '' }}{{ monthOverMonthChange }}% MoM
          </span>
        </p>
      </div>

      <!-- Transactions Count Card -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/10 transition hover:scale-[1.01] hover:shadow-emerald-500/20 duration-300">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-9xl pointer-events-none">📊</div>
        <div class="flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-100">Transactions</h3>
          <span class="p-2 rounded-xl bg-white/10 text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></span>
        </div>
        <p class="text-3xl font-extrabold mt-4 tracking-tight">{{ store.filteredTransactions.length }}</p>
        <p class="text-[10px] text-emerald-200 mt-2 font-medium">Recordings uploaded</p>
      </div>

      <!-- Avg per Transaction Card -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg shadow-purple-500/10 transition hover:scale-[1.01] hover:shadow-purple-500/20 duration-300">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-9xl pointer-events-none">💸</div>
        <div class="flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-100">Avg per Transaction</h3>
          <span class="p-2 rounded-xl bg-white/10 text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></span>
        </div>
        <p class="text-3xl font-extrabold mt-4 tracking-tight">{{ formatCurrency(avgPerTransaction) }}</p>
        <p class="text-[10px] text-purple-200 mt-2 font-medium">Average cost per purchase</p>
      </div>

      <!-- Total Subscription Card -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg shadow-amber-500/10 transition hover:scale-[1.01] hover:shadow-amber-500/20 duration-300">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-9xl pointer-events-none">🔄</div>
        <div class="flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-100">Subscriptions</h3>
          <span class="p-2 rounded-xl bg-white/10 text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></span>
        </div>
        <p class="text-3xl font-extrabold mt-4 tracking-tight">{{ formatCurrency(totalSubCost) }}</p>
        <p class="text-[10px] text-amber-200 mt-2 font-medium">{{ subscriptions.length }} active · monthly cost</p>
      </div>
    </div>

    <!-- Today's Transactions Summary -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span> Hari Ini
          </h2>
          <p class="text-xs text-slate-400">Rincian transaksi dan pengeluaran per kategori hari ini</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400 font-semibold">Net Hari Ini</p>
          <p class="text-base sm:text-lg font-extrabold" :class="todayNet >= 0 ? 'text-emerald-600' : 'text-blue-600'">
            {{ todayNet >= 0 ? '+' : '' }}Rp {{ Math.abs(todayNet).toLocaleString('id-ID') }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <!-- Today's Transactions List -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Belanja</h3>
          <div v-if="todayTransactions.length === 0" class="text-slate-400 text-xs py-4 text-center">
            Belum ada transaksi hari ini.
          </div>
            <div v-else class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="t in todayTransactions"
              :key="t.id"
              class="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100/70 transition duration-150"
            >
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                  <span
                    v-if="t.type === 'income'"
                    class="text-[9px] font-extrabold px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 flex-shrink-0"
                  >Income</span>
                  {{ t.description || 'Tanpa deskripsi' }}
                </p>
                <p class="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                  📍 {{ getLocationName(t.location_id) }} | 🏷️ {{ getCategoryName(t.category_id) }}
                </p>
              </div>
              <p class="text-xs font-extrabold flex-shrink-0 ml-2"
                :class="t.type === 'income' ? 'text-emerald-600' : 'text-slate-950'"
              >{{ t.type === 'income' ? '+' : '-' }}Rp {{ t.amount.toLocaleString('id-ID') }}</p>
            </div>
          </div>
        </div>

        <!-- Today's Categories Summary -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total per Kategori</h3>
          <div v-if="todayCategorySummary.length === 0" class="text-slate-400 text-xs py-4 text-center">
            Belum ada pengeluaran per kategori hari ini.
          </div>
          <div v-else class="space-y-3 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="cat in todayCategorySummary"
              :key="cat.id"
              class="space-y-1.5"
            >
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-slate-700 flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: cat.color }"></span>
                  {{ cat.name }}
                </span>
                <span class="text-slate-900 font-extrabold">
                  Rp {{ cat.amount.toLocaleString('id-ID') }} ({{ todayExpenseTotal > 0 ? ((cat.amount / todayExpenseTotal) * 100).toFixed(0) : 0 }}%)
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{ backgroundColor: cat.color, width: `${todayExpenseTotal > 0 ? (cat.amount / todayExpenseTotal) * 100 : 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Budgets & Subscriptions Tracker -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Category Budgets Card (Span 2) -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🎯</span> Monthly Category Budgets
            </h2>
            <p class="text-xs text-slate-400">Track and limit spending by category</p>
          </div>
          <button
            @click="toggleAddBudget"
            class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            {{ showAddBudget ? 'Close Form' : '+ Set Budget' }}
          </button>
        </div>

        <!-- Add/Edit Budget Form -->
        <div v-if="showAddBudget" class="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
          <h3 class="text-xs font-bold text-slate-700 uppercase">{{ editingBudgetId ? 'Edit Category Budget' : 'Set Category Budget' }}</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
              <select
                v-model.number="newBgt.category_id"
                class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none font-semibold"
              >
                <option value="">Select category</option>
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Budget Limit (IDR)</label>
              <input
                v-model.number="newBgt.amount"
                type="number"
                placeholder="0"
                class="w-full bg-white border border-slate-200/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none font-bold"
              />
            </div>
          </div>
          <div class="flex gap-2 justify-end pt-1">
            <button
              v-if="editingBudgetId"
              @click="cancelEditBudget"
              class="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              @click="createBudget"
              :disabled="isCreatingBudget"
              class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:bg-blue-400"
            >
              <svg v-if="isCreatingBudget" class="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ editingBudgetId ? 'Save Changes' : 'Save Budget' }}</span>
            </button>
          </div>
        </div>

        <!-- Budgets Progress Bars List -->
        <div class="space-y-4 max-h-80 overflow-y-auto pr-1">
          <div v-if="store.categories.length === 0" class="text-center py-6 text-slate-400 text-sm font-semibold">
            No categories defined yet
          </div>
          <div v-else-if="store.budgets.length === 0" class="text-center py-6 text-slate-400 text-sm font-semibold">
            No budgets defined yet. Click "+ Set Budget" above to set one.
          </div>
          
          <div
            v-for="bgt in store.budgets"
            :key="bgt.id"
            class="group relative space-y-1.5 p-2 rounded-xl hover:bg-slate-50/50 transition duration-200"
          >
            <div class="flex justify-between items-center text-xs pr-14">
              <span class="font-bold text-slate-700 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getCategoryColor(bgt.category_id) }"></span>
                {{ getCategoryName(bgt.category_id) }}
              </span>
              <span class="text-slate-500 font-semibold">
                Rp {{ getCategorySpent(bgt.category_id).toLocaleString('id-ID') }} / 
                <span class="font-extrabold text-slate-800">Rp {{ bgt.amount.toLocaleString('id-ID') }}</span>
              </span>
            </div>
            
            <div class="absolute right-2 top-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
              <!-- Edit Budget -->
              <button
                @click="startEditBudget(bgt)"
                class="text-slate-400 hover:text-blue-600 p-1 hover:bg-white rounded transition"
                title="Edit Budget"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <!-- Delete Budget -->
              <button
                @click="deleteBudget(bgt.id)"
                :disabled="isDeletingBudgetId === bgt.id"
                class="text-slate-400 hover:text-red-500 p-1 hover:bg-white rounded transition disabled:opacity-50"
                title="Delete Budget"
              >
                <svg v-if="isDeletingBudgetId === bgt.id" class="animate-spin h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getBudgetProgressClass(bgt.category_id, bgt.amount)"
                :style="{ width: `${Math.min(getBudgetPercent(bgt.category_id, bgt.amount), 100)}%` }"
              ></div>
            </div>

            <!-- Over budget warning -->
            <p v-if="getCategorySpent(bgt.category_id) > bgt.amount" class="text-[9px] text-red-500 font-extrabold flex items-center gap-0.5">
              <span>⚠️</span> Budget exceeded by Rp {{ (getCategorySpent(bgt.category_id) - bgt.amount).toLocaleString('id-ID') }}!
            </p>
          </div>
        </div>
      </div>

      <!-- Subscriptions Tracker Card -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🔄</span> Subscriptions
            </h2>
            <p class="text-xs text-slate-400">Track recurring bills</p>
          </div>
          <button
            @click="showAddSub = !showAddSub"
            class="text-xs text-blue-600 hover:text-blue-700 font-bold"
          >
            {{ showAddSub ? 'Close' : '+ Add' }}
          </button>
        </div>

        <!-- Add Subscription Form -->
        <div v-if="showAddSub" class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
          <input
            v-model="newSub.name"
            type="text"
            placeholder="e.g. Netflix, Spotify"
            class="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs outline-none font-semibold"
          />
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model.number="newSub.cost"
              type="number"
              placeholder="Cost (IDR)"
              class="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs outline-none font-bold"
            />
            <input
              v-model.number="newSub.dueDate"
              type="number"
              min="1"
              max="31"
              placeholder="Due Day (1-31)"
              class="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs outline-none font-semibold"
            />
          </div>
          <button
            @click="createSubscription"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
          >
            Add Subscription
          </button>
        </div>

        <!-- Subscriptions List -->
        <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
          <div v-if="subscriptions.length === 0" class="text-center py-6 text-slate-400 text-xs font-semibold">
            No active subscriptions tracked.
          </div>

          <div
            v-for="(sub, index) in subscriptions"
            :key="index"
            class="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2 relative"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-slate-700">{{ sub.name }}</h4>
                <p class="text-[9px] font-semibold flex flex-wrap items-center gap-1.5" :class="isOverdue(sub) ? 'text-red-500 font-bold' : 'text-slate-400'">
                  <span>Next Due: {{ getNextDueDate(sub) }}</span>
                  <span v-if="isOverdue(sub)" class="px-1 py-0.2 text-[8px] bg-red-100 text-red-600 rounded">Overdue</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-extrabold text-slate-900">Rp {{ sub.cost.toLocaleString('id-ID') }}</p>
                <div class="flex items-center gap-1.5 mt-1">
                  <button
                    @click="activePayIndex = activePayIndex === index ? null : index"
                    class="bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-lg transition"
                  >
                    Pay
                  </button>
                  <button
                    @click="deleteSubscription(index)"
                    class="text-slate-400 hover:text-red-500 transition p-1 rounded bg-slate-100 hover:bg-red-50 flex items-center justify-center"
                    title="Delete Subscription"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Pay Wallet Selector Inline -->
            <div v-if="activePayIndex === index" class="pt-2 border-t border-slate-200/60 flex items-center gap-2 justify-between">
              <select
                v-model="payWalletId"
                class="flex-1 bg-white border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg outline-none"
              >
                <option :value="null">Select Wallet</option>
                <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">
                  {{ acc.name }} (Rp {{ store.getAccountBalance(acc.id).toLocaleString('id-ID') }})
                </option>
              </select>
              <div class="flex items-center gap-1.5">
                <button
                  @click="paySubscription(sub, index)"
                  :disabled="isPayingSubscriptionIndex === index"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition flex items-center gap-1 disabled:bg-blue-400"
                >
                  <svg v-if="isPayingSubscriptionIndex === index" class="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Confirm</span>
                </button>
                <button
                  type="button"
                  @click="activePayIndex = null"
                  class="bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Total Monthly Subscriptions Cost -->
          <div v-if="subscriptions.length > 0" class="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Monthly Commitment:</span>
            <span class="text-slate-900 font-extrabold">Rp {{ totalSubCost.toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md duration-300">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="text-blue-500 font-extrabold">📍</span> Spending by Location
        </h2>
        <div class="w-full min-h-[250px] flex items-center justify-center">
          <MonthlyChart :data="store.groupedByLocation" />
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md duration-300">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="text-emerald-500 font-extrabold">🏷️</span> Spending by Category
        </h2>
        <div class="w-full min-h-[250px] flex items-center justify-center">
          <CategoryChart :data="store.groupedByCategory" />
        </div>
      </div>
    </div>

    <!-- Monthly Income vs Expense Chart -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md duration-300">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span class="text-emerald-500 font-extrabold">📊</span> Monthly Income vs Expense
      </h2>
      <div class="w-full min-h-[250px] flex items-center justify-center">
        <MonthlyTrendChart :data="store.groupedByMonth" />
      </div>
    </div>

    <!-- Daily Spending Line Chart -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md duration-300">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span class="text-purple-500 font-extrabold">📈</span> Daily Spending
      </h2>
      <div class="w-full min-h-[250px] flex items-center justify-center">
        <DailyTrendChart :data="store.groupedByDay" />
      </div>
    </div>

    <!-- Hourly Spending Bar Chart -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition hover:shadow-md duration-300">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span class="text-purple-500 font-extrabold">🕐</span> Spending by Hour
      </h2>
      <div class="w-full min-h-[250px] flex items-center justify-center">
        <HourlyChart :data="store.groupedByHour" />
      </div>
    </div>

    <AddTransactionModal v-if="showAddModal" @close="showAddModal = false" @added="showAddModal = false" />
    <TransferModal v-if="showTransferModal" @close="showTransferModal = false" @done="showTransferModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '../stores/transactionStore'
import DailyTrendChart from '../components/DailyTrendChart.vue'
import MonthlyTrendChart from '../components/MonthlyTrendChart.vue'
import HourlyChart from '../components/HourlyChart.vue'
import MonthlyChart from '../components/MonthlyChart.vue'
import CategoryChart from '../components/CategoryChart.vue'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import TransferModal from '../components/TransferModal.vue'

const store = useTransactionStore()
const router = useRouter()

function calcBalance(accountId) {
  return store.getAccountBalance(accountId)
}
const showAddModal = ref(false)
const showTransferModal = ref(false)
// ponytail: toLocaleDateString('en-CA') returns YYYY-MM-DD in local timezone, avoids UTC off-by-one
function toLocalDate(d) { return d.toLocaleDateString('en-CA') }
const filterFrom = ref(toLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
const filterTo = ref(toLocalDate(new Date()))

const isWeekSelected = ref(false)
const isMonthSelected = ref(true)
const isYearSelected = ref(false)

// Advanced features states
const showAddAccount = ref(false)
const showAddBudget = ref(false)
const showAddSub = ref(false)

const newAcc = ref({
  name: '',
  type: 'Cash'
})

const newBgt = ref({
  category_id: '',
  amount: null,
  period: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-01'
})

const newSub = ref({
  name: '',
  cost: null,
  dueDate: null
})

const subscriptions = ref([])
const activePayIndex = ref(null)
const payWalletId = ref(null)
const isCreatingAccount = ref(false)
const isDeletingAccountId = ref(null)
const isCreatingBudget = ref(false)
const isPayingSubscriptionIndex = ref(null)

const editingAccountId = ref(null)
const editingBudgetId = ref(null)
const isDeletingBudgetId = ref(null)

function toggleAddAccount() {
  if (showAddAccount.value) {
    cancelEditAccount()
  } else {
    showAddAccount.value = true
  }
}

function startEditAccount(acc) {
  editingAccountId.value = acc.id
  newAcc.value = { name: acc.name, type: acc.type }
  showAddAccount.value = true
}

function cancelEditAccount() {
  newAcc.value = { name: '', type: 'Cash' }
  editingAccountId.value = null
  showAddAccount.value = false
}

function startEditBudget(bgt) {
  editingBudgetId.value = bgt.id
  newBgt.value = { category_id: bgt.category_id, amount: bgt.amount, period: bgt.period }
  showAddBudget.value = true
}

function cancelEditBudget() {
  newBgt.value = { 
    category_id: '', 
    amount: null, 
    period: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-01' 
  }
  editingBudgetId.value = null
  showAddBudget.value = false
}

function toggleAddBudget() {
  if (showAddBudget.value) {
    cancelEditBudget()
  } else {
    showAddBudget.value = true
  }
}

onMounted(() => {
  const saved = localStorage.getItem('financial_subscriptions')
  if (saved) {
    subscriptions.value = JSON.parse(saved)
  }
})

const totalIncome = computed(() => {
  return store.filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
})

const totalSpent = computed(() => {
  return store.filteredTransactions.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0)
})

const avgPerTransaction = computed(() => {
  return store.filteredTransactions.length > 0 ? totalSpent.value / store.filteredTransactions.length : 0
})

const expenseCategories = computed(() =>
  store.categories.filter(cat => !cat.type || cat.type === 'expense')
)

const totalSubCost = computed(() => {
  return subscriptions.value.reduce((sum, s) => sum + s.cost, 0)
})

const monthOverMonthChange = computed(() => {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const currentMonthSpent = store.transactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= currentMonthStart && d <= now && t.type !== 'income'
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthSpent = store.transactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= lastMonthStart && d <= lastMonthEnd && t.type !== 'income'
    })
    .reduce((sum, t) => sum + t.amount, 0)

  if (lastMonthSpent === 0) return null
  const percentChange = ((currentMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
  return percentChange.toFixed(0)
})

const todayTransactions = computed(() => {
  const localToday = new Date().toLocaleDateString('en-CA')
  return store.transactions.filter(t => {
    if (!t.date) return false
    const tDate = new Date(t.date).toLocaleDateString('en-CA')
    return tDate === localToday
  })
})

const todayCategorySummary = computed(() => {
  const summary = {}
  todayTransactions.value.filter(t => t.type !== 'income').forEach(t => {
    const catId = t.category_id
    if (!summary[catId]) {
      summary[catId] = {
        id: catId,
        name: getCategoryName(catId),
        color: getCategoryColor(catId),
        amount: 0
      }
    }
    summary[catId].amount += Number(t.amount)
  })
  return Object.values(summary).sort((a, b) => b.amount - a.amount)
})

const todayExpenseTotal = computed(() => {
  return todayTransactions.value.filter(t => t.type !== 'income').reduce((sum, t) => sum + Number(t.amount), 0)
})

const todayNet = computed(() => {
  return todayTransactions.value.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
})

function getLocationName(id) {
  const loc = store.locations.find(l => String(l.id) === String(id))
  return loc ? loc.name : 'Unknown'
}

function formatCurrency(value) {
  if (value >= 1_000_000_000) {
    return 'Rp ' + (value / 1_000_000_000).toFixed(1).replace('.', ',') + 'M';
  } else if (value >= 1_000_000) {
    return 'Rp ' + (value / 1_000_000).toFixed(1).replace('.', ',') + 'jt';
  } else if (value >= 1_000) {
    return 'Rp ' + (value / 1_000).toFixed(0) + 'rb';
  }
  return 'Rp ' + value.toLocaleString('id-ID');
}

function setWeekRange() {
  isWeekSelected.value = true
  isMonthSelected.value = false
  isYearSelected.value = false
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  filterFrom.value = toLocalDate(weekAgo)
  filterTo.value = toLocalDate(today)
}

function setMonthRange() {
  isWeekSelected.value = false
  isMonthSelected.value = true
  isYearSelected.value = false
  const today = new Date()
  const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1)
  filterFrom.value = toLocalDate(monthAgo)
  filterTo.value = toLocalDate(today)
}

function setYearRange() {
  isWeekSelected.value = false
  isMonthSelected.value = false
  isYearSelected.value = true
  const today = new Date()
  const yearAgo = new Date(today.getFullYear(), 0, 1)
  filterFrom.value = toLocalDate(yearAgo)
  filterTo.value = toLocalDate(today)
}

watch([filterFrom, filterTo], () => {
  store.setDateFilter(new Date(filterFrom.value), new Date(filterTo.value))
})

// Advanced finance operations
// Advanced finance operations
async function createAccount() {
  if (!newAcc.value.name) return
  isCreatingAccount.value = true
  try {
    if (editingAccountId.value) {
      await store.updateAccount(editingAccountId.value, {
        name: newAcc.value.name,
        type: newAcc.value.type
      })
      cancelEditAccount()
    } else {
      await store.addAccount({
        name: newAcc.value.name,
        type: newAcc.value.type,
        balance: 0
      })
      newAcc.value = { name: '', type: 'Cash' }
      showAddAccount.value = false
    }
  } catch (e) {
    alert('Error saving wallet: ' + e.message)
  } finally {
    isCreatingAccount.value = false
  }
}

async function deleteAccount(id) {
  if (confirm('Are you sure you want to delete this wallet?')) {
    isDeletingAccountId.value = id
    try {
      await store.deleteAccount(id)
    } catch (e) {
      alert('Error deleting wallet: ' + e.message)
    } finally {
      isDeletingAccountId.value = null
    }
  }
}

async function createBudget() {
  if (!newBgt.value.category_id || !newBgt.value.amount) return
  isCreatingBudget.value = true
  try {
    if (editingBudgetId.value) {
      await store.updateBudget(editingBudgetId.value, {
        category_id: newBgt.value.category_id,
        amount: Number(newBgt.value.amount),
        period: newBgt.value.period
      })
      cancelEditBudget()
    } else {
      await store.addBudget({
        category_id: newBgt.value.category_id,
        amount: Number(newBgt.value.amount),
        period: newBgt.value.period
      })
      newBgt.value.category_id = ''
      newBgt.value.amount = null
      showAddBudget.value = false
    }
  } catch (e) {
    alert('Error saving budget: ' + e.message)
  } finally {
    isCreatingBudget.value = false
  }
}

async function deleteBudget(id) {
  if (confirm('Are you sure you want to delete this budget?')) {
    isDeletingBudgetId.value = id
    try {
      await store.deleteBudget(id)
    } catch (e) {
      alert('Error deleting budget: ' + e.message)
    } finally {
      isDeletingBudgetId.value = null
    }
  }
}

function createSubscription() {
  if (!newSub.value.name || !newSub.value.cost || !newSub.value.dueDate) return
  subscriptions.value.push({
    name: newSub.value.name,
    cost: Number(newSub.value.cost),
    dueDate: Number(newSub.value.dueDate),
    lastPaidMonth: null
  })
  localStorage.setItem('financial_subscriptions', JSON.stringify(subscriptions.value))
  newSub.value = { name: '', cost: null, dueDate: null }
  showAddSub.value = false
}

function deleteSubscription(index) {
  subscriptions.value.splice(index, 1)
  localStorage.setItem('financial_subscriptions', JSON.stringify(subscriptions.value))
}

async function paySubscription(sub, index) {
  if (!payWalletId.value) {
    alert('Please select a wallet to pay with')
    return
  }

  isPayingSubscriptionIndex.value = index
  // Find or create "Subscriptions" category
  let subCat = store.categories.find(c => c.name.toLowerCase() === 'subscriptions' || c.name.toLowerCase() === 'subscription')
  if (!subCat) {
    subCat = await store.addCategory({ name: 'Subscriptions', color: '#8B5CF6' })
  }

  // Find or create "Online" location
  let subLoc = store.locations.find(l => l.name.toLowerCase() === 'online' || l.name.toLowerCase() === 'digital')
  if (!subLoc) {
    subLoc = await store.addLocation({ name: 'Online' })
  }

  try {
    await store.addTransaction({
      date: new Date().toISOString().split('T')[0],
      location_id: subLoc.id,
      category_id: subCat.id,
      description: `Payment for ${sub.name}`,
      amount: Number(sub.cost),
      account_id: payWalletId.value
    })

    // Update last paid month
    sub.lastPaidMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
    localStorage.setItem('financial_subscriptions', JSON.stringify(subscriptions.value))

    alert(`Successfully logged payment of Rp ${sub.cost.toLocaleString('id-ID')} for ${sub.name}!`)
    activePayIndex.value = null
    payWalletId.value = null
  } catch (e) {
    alert('Error logging subscription payment: ' + e.message)
  } finally {
    isPayingSubscriptionIndex.value = null
  }
}

function getNextDueDate(sub) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  let lastPaidYear = 0
  let lastPaidMonthVal = -1
  if (sub.lastPaidMonth) {
    const parts = sub.lastPaidMonth.split('-')
    lastPaidYear = parseInt(parts[0], 10)
    lastPaidMonthVal = parseInt(parts[1], 10) - 1
  }

  let targetYear = currentYear
  let targetMonth = currentMonth

  const alreadyPaid = (lastPaidYear === currentYear && lastPaidMonthVal === currentMonth) || 
                      (lastPaidYear > currentYear || (lastPaidYear === currentYear && lastPaidMonthVal > currentMonth))

  if (alreadyPaid) {
    targetMonth += 1
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear += 1
    }
  }

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const targetDay = Math.min(sub.dueDate, daysInMonth)
  const dueDateObj = new Date(targetYear, targetMonth, targetDay)

  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  return dueDateObj.toLocaleDateString('id-ID', options)
}

function isOverdue(sub) {
  const now = new Date()
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let lastPaidYear = 0
  let lastPaidMonthVal = -1
  if (sub.lastPaidMonth) {
    const parts = sub.lastPaidMonth.split('-')
    lastPaidYear = parseInt(parts[0], 10)
    lastPaidMonthVal = parseInt(parts[1], 10) - 1
  }

  let targetYear = now.getFullYear()
  let targetMonth = now.getMonth()

  const alreadyPaid = (lastPaidYear === targetYear && lastPaidMonthVal === targetMonth) || 
                      (lastPaidYear > targetYear || (lastPaidYear === targetYear && lastPaidMonthVal > targetMonth))

  if (alreadyPaid) {
    targetMonth += 1
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear += 1
    }
  }

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const targetDay = Math.min(sub.dueDate, daysInMonth)
  const dueDateObj = new Date(targetYear, targetMonth, targetDay)

  return dueDateObj < todayDate
}

function getCategoryName(id) {
  if (id == null) return '—'
  const cat = store.categories.find(c => String(c.id) === String(id))
  return cat ? cat.name : '—'
}

function getCategoryColor(id) {
  if (id == null) return '#cbd5e1'
  const cat = store.categories.find(c => String(c.id) === String(id))
  return cat ? cat.color : '#cbd5e1'
}

function getCategorySpent(catId) {
  return store.filteredTransactions
    .filter(t => t.type !== 'income' && String(t.category_id) === String(catId))
    .reduce((sum, t) => sum + t.amount, 0)
}

function getBudgetPercent(catId, budgetAmount) {
  if (!budgetAmount) return 0
  const spent = getCategorySpent(catId)
  return (spent / budgetAmount) * 100
}

function getBudgetProgressClass(catId, budgetAmount) {
  const percent = getBudgetPercent(catId, budgetAmount)
  if (percent >= 100) return 'bg-red-500'
  if (percent >= 80) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function exportCSV() {
  const transactions = store.filteredTransactions
  if (transactions.length === 0) {
    alert('No transactions to export')
    return
  }

  // Header row
  let csv = 'Date,Description,Category,Location,Amount\n'

  // Item rows
  transactions.forEach(t => {
    const cat = store.categories.find(c => c.id === t.category_id)?.name || 'Unknown'
    const loc = store.locations.find(l => l.id === t.location_id)?.name || 'Unknown'
    const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : ''
    csv += `${t.date},${desc},"${cat}","${loc}",${t.amount}\n`
  })

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
