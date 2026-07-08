<template>
  <BarChart v-if="chartData" :data="chartData" :options="options" />
  <div v-else class="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">
    Select an item to view price comparison
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar as BarChart } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  items: Array,
  locations: Array
})

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(ctx) {
          return 'Rp ' + Number(ctx.raw).toLocaleString('id-ID')
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return 'Rp ' + value.toLocaleString('id-ID')
        }
      }
    }
  }
}

const chartData = computed(() => {
  if (!props.items || props.items.length === 0) return null

  const locMap = {}
  if (props.locations) {
    props.locations.forEach(l => { locMap[l.id] = l.name })
  }

  // Group by location, take latest entry per location
  const byLoc = {}
  props.items.forEach(item => {
    const locName = locMap[item.location_id] || 'Unknown'
    if (!byLoc[locName] || new Date(item.date) > new Date(byLoc[locName].date)) {
      byLoc[locName] = item
    }
  })

  const sorted = Object.entries(byLoc).sort((a, b) => Number(b[1].price) - Number(a[1].price))
  const labels = sorted.map(([loc]) => loc)
  const prices = sorted.map(([, item]) => Number(item.price))
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return {
    labels,
    datasets: [{
      label: 'Price',
      data: prices,
      backgroundColor: prices.map(p =>
        p === minPrice && prices.length > 1 ? '#10B981' :
        p === maxPrice && prices.length > 1 ? '#EF4444' : '#3B82F6'
      ),
      borderRadius: 6
    }]
  }
})
</script>
