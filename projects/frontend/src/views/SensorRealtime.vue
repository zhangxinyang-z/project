<template>
  <div class="dashboard-container">
    <!-- 数据看板头部 -->
    <div class="dashboard-header">
      <h1 class="title">
        <i class="fas fa-satellite-dish"></i>
        传感器监控中心
        <span class="subtitle">Sensor Monitoring Center</span>
      </h1>
      <div class="time-panel">
        <div class="system-time">{{ currentTime }}</div>
        <div class="update-time">
          最后更新: {{ formatTime(realtimeData.updateTime) || '--' }}
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="dashboard-main">
      <!-- 左区：实时数据 -->
      <div class="realtime-panel">
        <div class="status-cards">
          <!-- 温度卡片 -->
          <div class="metric-card temperature">
            <div class="card-header">
              <i class="fas fa-thermometer-half"></i>
              <h3>实时温度</h3>
            </div>
            <div class="card-body">
              <div class="value">{{ realtimeData.temperature ?? '--' }}</div>
              <div class="unit">℃</div>
              <div class="trend">
                <i class="fas fa-chart-line"></i>
                <span>24h趋势</span>
              </div>
            </div>
          </div>

          <!-- 湿度卡片 -->
          <div class="metric-card humidity">
            <div class="card-header">
              <i class="fas fa-tint"></i>
              <h3>环境湿度</h3>
            </div>
            <div class="card-body">
              <div class="value">{{ realtimeData.humidity ?? '--' }}</div>
              <div class="unit">%</div>
              <div class="trend">
                <i class="fas fa-chart-area"></i>
                <span>历史波动</span>
              </div>
            </div>
          </div>

          <!-- 距离卡片 -->
          <div class="metric-card distance">
            <div class="card-header">
              <i class="fas fa-ruler-combined"></i>
              <h3>超声测距</h3>
            </div>
            <div class="card-body">
              <div class="value">{{ realtimeData.ultrasonic ?? '--' }}</div>
              <div class="unit">cm</div>
              <div class="trend">
                <i class="fas fa-wave-square"></i>
                <span>动态范围</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时数据图表 -->
        <div class="realtime-chart">
          <div ref="realtimeChart" class="chart"></div>
        </div>
      </div>

      <!-- 右区：历史数据 -->
      <div class="history-panel">
        <div class="history-header">
          <h2><i class="fas fa-history"></i> 历史趋势分析</h2>
          <el-date-picker
            v-model="historyDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            @change="fetchHistoryData"
          />
        </div>
        <div ref="historyChart" class="chart"></div>
        <div class="data-table">
          <el-table :data="historyData" height="300">
            <el-table-column prop="time" label="时间" width="120" />
            <el-table-column prop="temperature" label="温度(℃)" />
            <el-table-column prop="humidity" label="湿度(%)" />
            <el-table-column prop="distance" label="距离(cm)" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getRealtimeData, getHistoryData } from '@/api/sensor'
import moment from 'moment'
export default {
  data() {
    return {
      currentTime: '',
      historyDate: moment().format('YYYY-MM-DD'),
      realtimeData: {
        temperature: null,
        humidity: null,
        ultrasonic: null,
        updateTime: null
      },
      historyData: [],
      realtimeChart: null,
      historyChart: null,
      pollingInterval: null
    }
  },
  mounted() {
    this.initCharts()
    this.startPolling()
    this.updateSystemTime()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    clearInterval(this.pollingInterval)
    clearInterval(this.timeInterval) // 清理时间更新定时器
    window.removeEventListener('resize', this.handleResize)
    this.realtimeChart?.dispose()
    this.historyChart?.dispose()
  },
  methods: {
    // 初始化图表
    initCharts() {
      this.realtimeChart = echarts.init(this.$refs.realtimeChart)
      this.historyChart = echarts.init(this.$refs.historyChart)
      
      const commonOption = {
        grid: { top: 40, right: 30, bottom: 30, left: 50 },
        tooltip: { trigger: 'axis' }
      }

      // 实时图表配置
      this.realtimeChart.setOption({
        ...commonOption,
        title: { text: '实时数据流', left: 'center' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [{
          name: '传感器值',
          type: 'line',
          smooth: true,
          itemStyle: { color: '#36a3f7' },
          areaStyle: { color: 'rgba(54, 163, 247, 0.1)' }
        }]
      })

      // 历史图表配置
      this.historyChart.setOption({
        ...commonOption,
        title: { text: '历史趋势', left: 'center' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [
          { name: '温度', type: 'line', smooth: true, showSymbol: false },
          { name: '湿度', type: 'line', smooth: true, showSymbol: false },
          { name: '距离', type: 'line', smooth: true, showSymbol: false }
        ]
      })
    },

    // 获取实时数据
    async fetchRealtimeData() {
      try {
        const { data } = await getRealtimeData()
        this.realtimeData = data || {}
        
        // 模拟数据（当无真实数据时）
        if (!data) {
          this.realtimeData = {
            temperature: (Math.random() * 50).toFixed(1),
            humidity: (Math.random() * 100).toFixed(1),
            ultrasonic: (Math.random() * 200).toFixed(1),
            updateTime: new Date().toISOString()
          }
        }

        this.updateRealtimeChart()
      } catch (error) {
        console.error('实时数据获取失败:', error)
      }
    },

    // 获取历史数据
    async fetchHistoryData() {
      try {
        const data = await getHistoryData(this.historyDate)
        
        // 数据格式化
        this.historyData = data.map(item => ({
          time: this.formatTime(item.time, 'HH:mm'),
          temperature: item.temperature ?? '--',
          humidity: item.humidity ?? '--',
          distance: item.distance ?? '--'
        }))

        this.updateHistoryChart()
      } catch (error) {
        console.error('历史数据获取失败:', error)
        this.historyData = []
      }
    },

    // 新增：启动轮询
    startPolling() {
      this.fetchRealtimeData() // 立即获取一次数据
      this.pollingInterval = setInterval(() => {
        this.fetchRealtimeData()
      }, 2000) // 每2秒轮询一次
    },

    // 新增：更新时间
    updateSystemTime() {
      this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
      this.timeInterval = setInterval(() => {
        this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
      }, 1000)
    },
    // 更新实时图表
    updateRealtimeChart() {
      const option = {
        xAxis: { data: [...this.historyData.map(d => d.time), this.formatTime(this.realtimeData.updateTime, 'HH:mm:ss')] },
        series: [{
          data: [...this.historyData.map(d => d.temperature), this.realtimeData.temperature]
        }]
      }
      this.realtimeChart.setOption(option)
    },

    // 更新历史图表
    updateHistoryChart() {
      const option = {
        xAxis: { data: this.historyData.map(d => d.time) },
        series: [
          { 
            name: '温度',
            data: this.historyData.map(d => d.temperature),
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: { color: '#ff4757' }
          },
          { 
            name: '湿度',
            data: this.historyData.map(d => d.humidity),
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: { color: '#2ed573' }
          },
          { 
            name: '距离',
            data: this.historyData.map(d => d.distance),
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: { color: '#3742fa' }
          }
        ]
      }
      this.historyChart.setOption(option)
    },

    // 格式化时间
    formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
      if (!time) return '--'
      return moment(time).format(format)
    },

    // 响应窗口大小变化
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  height: 100vh;
  padding: 20px;
  background: #0a1630;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  margin-bottom: 20px;

  .title {
    font-size: 24px;
    letter-spacing: 2px;
    
    .subtitle {
      font-size: 14px;
      color: #7d8ea3;
      margin-left: 15px;
    }
  }

  .time-panel {
    text-align: right;
    
    .system-time {
      font-size: 18px;
      color: #00ff88;
    }
    
    .update-time {
      font-size: 12px;
      color: #7d8ea3;
    }
  }
}

.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 140px);
}

.metric-card {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    i {
      font-size: 24px;
      margin-right: 10px;
    }
  }

  .card-body {
    .value {
      font-size: 36px;
      font-family: 'Orbitron', sans-serif;
      color: #00ff88;
    }

    .unit {
      color: #7d8ea3;
      margin: 5px 0;
    }

    .trend {
      color: #7d8ea3;
      font-size: 12px;
      
      i {
        margin-right: 5px;
      }
    }
  }

  &.temperature { border-left: 4px solid #ff4757; }
  &.humidity { border-left: 4px solid #2ed573; }
  &.distance { border-left: 4px solid #3742fa; }
}

.chart {
  height: 400px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
}

.history-panel {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .data-table {
    margin-top: 20px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
  }
}

::v-deep .el-table {
  background: transparent;
  color: #fff;

  th {
    background: rgba(255,255,255,0.05) !important;
    color: #00ff88 !important;
  }

  tr {
    background: transparent !important;
    
    &:hover td {
      background: rgba(255,255,255,0.02) !important;
    }
  }

  td {
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  }
}
</style>