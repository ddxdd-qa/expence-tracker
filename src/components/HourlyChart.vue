<template>
  <div>
    <BarChart v-if="chartData" :data="chartData" :options="options" />
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
  data: Object
})

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return 'Rp ' + value.toLocaleString('id-ID')
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Jam',
        font: { size: 11 }
      }
    }
  }
}

const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00')

const chartData = computed(() => {
  if (!props.data || Object.values(props.data).every(v => v === 0)) return null
  return {
    labels,
    datasets: [{
      label: 'Pengeluaran',
      data: labels.map((_, i) => props.data[i] || 0),
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      borderWidth: 1,
      borderRadius: 3
    }]
  }
})
</script>
