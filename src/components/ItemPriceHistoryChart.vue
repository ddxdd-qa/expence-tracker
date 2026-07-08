<template>
  <LineChart v-if="chartData" :data="chartData" :options="options" />
  <div v-else class="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">
    No price records found
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line as LineChart } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend)

const props = defineProps({
  items: Array
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
  const sorted = [...props.items].sort((a, b) => new Date(a.date) - new Date(b.date))
  return {
    labels: sorted.map(i => new Date(i.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: '2-digit' })),
    datasets: [{
      label: 'Price',
      data: sorted.map(i => Number(i.price)),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: sorted.length > 1,
      tension: 0.3,
      pointBackgroundColor: '#3B82F6',
      pointRadius: sorted.length === 1 ? 6 : 4
    }]
  }
})
</script>
