<template>
  <div>
    <LineChart v-if="chartData" :data="chartData" :options="options" />
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
  Legend
} from 'chart.js'
import { Line as LineChart } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  transactions: Array
})

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true
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
  if (!props.transactions || props.transactions.length === 0) {
    return null
  }

  const dailyData = {}
  props.transactions.forEach(t => {
    const date = new Date(t.date).toLocaleDateString('id-ID')
    if (!dailyData[date]) dailyData[date] = 0
    dailyData[date] += t.amount
  })

  const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b))
  let cumulative = 0
  const cumulativeData = sortedDates.map(date => {
    cumulative += dailyData[date]
    return cumulative
  })

  return {
    labels: sortedDates,
    datasets: [
      {
        label: 'Cumulative Spending',
        data: cumulativeData,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})
</script>
