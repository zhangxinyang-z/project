<template>
  <div ref="chart" style="height: 400px;"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    chartData: {
      type: Array,
      required: true
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.initChart()
      }
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      const chart = echarts.init(this.$refs.chart)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.chartData.map(item => item.x)
        },
        yAxis: {
          type: 'value',
          name: this.getYAxisName()
        },
        series: [{
          data: this.chartData.map(item => item.y),
          type: 'line',
          smooth: true
        }]
      }
      chart.setOption(option)
      window.addEventListener('resize', chart.resize)
    },
    getYAxisName() {
      switch (this.$parent.activeTab) {
        case 'temperature':
          return '温度 (℃)'
        case 'humidity':
          return '湿度 (%)'
        case 'distance':
          return '距离 (cm)'
        default:
          return '值'
      }
    }
  }
}
</script>