<template>
  <div>
    <DoughnutChart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut as DoughnutChart } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: Object
})

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.label + ': Rp ' + context.parsed.toLocaleString('id-ID')
        }
      }
    }
  }
}

const chartData = computed(() => {
  if (!props.data || Object.keys(props.data).length === 0) {
    return null
  }

  const labels = Object.keys(props.data)
  return {
    labels,
    datasets: [
      {
        data: labels.map(label => props.data[label].total),
        backgroundColor: labels.map(label => props.data[label].color),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  }
})
</script>
