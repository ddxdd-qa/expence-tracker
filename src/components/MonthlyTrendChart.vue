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
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 11 }
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
  if (!props.data || Object.keys(props.data).length === 0) return null
  const labels = Object.keys(props.data)
  const incomes = labels.map(k => props.data[k].income)
  const expenses = labels.map(k => props.data[k].expense)
  return {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomes,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Expense',
        data: expenses,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }
})
</script>
