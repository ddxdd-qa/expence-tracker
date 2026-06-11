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
    legend: {
      display: false
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
  if (!props.data || Object.keys(props.data).length === 0) {
    return null
  }

  return {
    labels: Object.keys(props.data),
    datasets: [
      {
        label: 'Total Spent',
        data: Object.values(props.data),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }
    ]
  }
})
</script>
