<template>
  <el-card shadow="never" class="sensor-card">
    <!-- 头部控制栏 -->
    <div class="control-header">
      <div class="header-left">
        <span class="title">传感器历史数据</span>
        <el-select 
          v-model="activeTab" 
          placeholder="数据类型"
          @change="handleTabChange"
          style="width: 120px; margin-left: 15px"
        >
          <el-option label="温度" value="temperature" />
          <el-option label="湿度" value="humidity" />
          <el-option label="距离" value="distance" />
        </el-select>
      </div>
      
      <el-date-picker
        v-model="queryDate"
        type="date"
        placeholder="选择日期"
        value-format="YYYY-MM-DD"
        @change="handleDateChange"
        class="date-picker"
      />
    </div>

    <!-- 统计指标 -->
    <div class="metric-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">当日峰值</div>
        <div class="metric-value">{{ maxValue }}{{ unit }}</div>
      </el-card>
      
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">平均值</div>
        <div class="metric-value">{{ averageValue }}{{ unit }}</div>
      </el-card>
      
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">采集次数</div>
        <div class="metric-value">{{ chartData.length }} 次</div>
      </el-card>
    </div>

    <!-- 数据展示区 -->
    <div class="data-container">
      <!-- 趋势图 -->
      <el-card shadow="never" class="chart-container">
        <line-chart 
          :chart-data="chartData" 
          :unit="unit"
          v-loading="loading"
          element-loading-text="数据加载中..."
        />
      </el-card>

      <!-- 数据表格 -->
      <el-card shadow="never" class="table-container">
        <el-table
          :data="chartData"
          height="400"
          stripe
          v-loading="loading"
        >
          <el-table-column prop="x" label="时间" width="110" />
          <el-table-column prop="y" :label="'测量值(' + unit + ')'" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.y)" 
                size="small"
              >
                {{ getStatusText(row.y) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </el-card>
</template>

<script>
import { getTempHistory, getHumidityHistory, getDistanceHistory } from '@/api/sensor'
import LineChart from '../components/LineChart.vue'
import moment from 'moment'
import _ from 'lodash'

export default {
  components: { LineChart },
  data() {
    return {
      queryDate: moment().format('YYYY-MM-DD'),
      activeTab: 'temperature',
      loading: false,
      chartData: []
    }
  },
  computed: {
    unit() {
      return {
        temperature: '℃',
        humidity: '%',
        distance: 'cm'
      }[this.activeTab]
    },
    maxValue() {
      if (!this.chartData.length) return '--'
      return Math.max(...this.chartData.map(d => d.y)).toFixed(1)
    },
    averageValue() {
      if (!this.chartData.length) return '--'
      const sum = this.chartData.reduce((acc, cur) => acc + cur.y, 0)
      return (sum / this.chartData.length).toFixed(1)
    }
  },
  methods: {
    getStatusType(value) {
      const ranges = {
        temperature: [null, 30],
        humidity: [30, 70],
        distance: [20, 100]
      }[this.activeTab]
      
      if (this.activeTab === 'temperature') return value > ranges[1] ? 'danger' : 'success'
      return (value < ranges[0] || value > ranges[1]) ? 'danger' : 'success'
    },

    getStatusText(value) {
      return this.getStatusType(value) === 'danger' ? '异常' : '正常'
    },

     fetchData: _.debounce(async function() {
  this.loading = true;
  try {
    const apiMap = {
      temperature: getTempHistory,
      humidity: getHumidityHistory,
      distance: getDistanceHistory
    };

    // 直接获取响应数据，不进行解构
    const rawData = await apiMap[this.activeTab](this.queryDate);

    // 调试：打印原始响应数据
    console.log('API响应原始数据:', rawData);

    // 处理空数据情况
    if (!rawData || !Array.isArray(rawData)) {
      throw new Error(`无效数据格式，期望数组，实际类型：${typeof rawData}`);
    }

    // 转换数据格式
    this.chartData = rawData
      .map(item => {
        try {
          return {
            x: moment(item.recordTime).format('HH:mm'), // 时间格式化
            y: Number(item.value) || 0 // 数值转换保护
          };
        } catch (e) {
          console.error('数据项解析失败:', item);
          return null;
        }
      })
      .filter(item => item !== null) // 过滤无效数据
      .sort((a, b) => a.x.localeCompare(b.x)); // 按时间排序

  } catch (error) {
    console.error('完整错误信息:', error);
    this.$message.error(`加载失败: ${error.message}`);
    this.chartData = [];
  } finally {
    this.loading = false;
  }
}, 500),

    handleDateChange() {
      this.fetchData()
    },
    handleTabChange() {
      this.fetchData()
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style scoped>
.sensor-card {
  border: none;
  background: transparent;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.date-picker {
  width: 200px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.metric-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-3px);
}

.metric-label {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
  color: #409EFF;
}

.data-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-container,
.table-container {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}
</style>