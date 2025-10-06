<template>
  <div class="data-query">
    <!-- 查询控制区 -->
    <div class="query-controls">
      <div class="filter-group">
        <div class="filter-item">
          <label>发动机ID：</label>
          <input
            type="text"
            v-model="filters.engineId"
            placeholder="输入发动机编号"
            class="filter-input"
          />
        </div>
        
        <div class="filter-item">
          <label>健康状态：</label>
          <select v-model="filters.healthStatus" class="filter-select">
            <option value="">全部</option>
            <option value="normal">正常</option>
            <option value="warning">预警</option>
            <option value="error">故障</option>
          </select>
        </div>
        
        <button @click="resetFilters" class="reset-btn">重置筛选</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <table v-if="filteredEngines.length > 0">
        <thead>
          <tr>
            <th @click="sortBy('engine_id')">
              发动机ID
              <span v-if="sortKey === 'engine_id'" class="sort-icon">
                {{ sortOrder > 0 ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('health_status')">
              健康状态
              <span v-if="sortKey === 'health_status'" class="sort-icon">
                {{ sortOrder > 0 ? '↑' : '↓' }}
              </span>
            </th>
            <th>温度(s3)</th>
            <th>压力(s4)</th>
            <th>转速(s5)</th>
            <th>数据周期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="engine in paginatedData" :key="engine.engine_id">
            <td>#{{ engine.engine_id }}</td>
            <td :class="['status-cell', getHealthStatus(engine)]">
              {{ getHealthStatusText(engine) }}
            </td>
            <td>{{ getLatestSensor(engine, 'sensor3') }}</td>
            <td>{{ getLatestSensor(engine, 'sensor4') }}</td>
            <td>{{ getLatestSensor(engine, 'sensor5') }}</td>
            <td>{{ engine.data.length }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="no-data">
        <p>没有找到匹配的数据</p>
      </div>
      
      <!-- 分页控制 -->
      <div class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    // 数据状态
    const engines = ref([])
    const loading = ref(false)
    
    // 筛选条件
    const filters = ref({
      engineId: '',
      healthStatus: ''
    })
    
    // 排序控制
    const sortKey = ref('engine_id')
    const sortOrder = ref(1)
    
    // 分页控制
    const currentPage = ref(1)
    const pageSize = 10

    // 获取数据
    const fetchEngines = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:8081/api/engines')
    console.log('API响应数据:', response.data)
    engines.value = response.data.map(engine => ({
      ...engine,
      health_status: calculateHealthStatus(engine)
    }))
    console.log('处理后数据:', engines.value)
  } catch (error) {
    console.error('数据获取失败:', error)
    // 添加可视化错误提示
    alert(`数据加载失败: ${error.message}`) 
  } finally {
    loading.value = false
  }
}

            // 健康状态计算 2.0
        const calculateHealthStatus = (engine) => {
          if (!engine.data || engine.data.length === 0) return 'normal'

          const recentData = engine.data.slice(-5)
          
          const sensorStatus = {
            temp: analyzeTemperature(recentData),   
            press: analyzePressure(recentData),     
            speed: analyzeSpeedTrend(recentData)  
          }

          return evaluateEngineStatus(sensorStatus)
        }

        const analyzeTemperature = (data) => {
          const latestTemp = data[data.length-1].sensor3
          const avgTemp = data.reduce((sum, d) => sum + d.sensor3, 0) / data.length
          
          const tempThreshold = avgTemp + 2 * calculateStdDev(data.map(d => d.sensor3))
          
          return {
            current: latestTemp,
            threshold: tempThreshold,
            trend: latestTemp - data[0].sensor3  
          }
        }

        // --- 压力分析 ---
        const analyzePressure = (data) => {
          const latestPress = data[data.length-1].sensor4
          const pressThreshold = 0.85 * data[0].sensor4 
          
          return {
            current: latestPress,
            threshold: pressThreshold,
            stability: calculatePressureStability(data)
          }
        }

        // --- 转速趋势分析 ---
        const analyzeSpeedTrend = (data) => {
          const speedValues = data.map(d => d.sensor5)
          const trend = calculateLinearRegression(speedValues)
          
          return {
            current: speedValues[speedValues.length-1],
            trendSlope: trend.slope,
            fluctuation: calculateFluctuation(speedValues)
          }
        }

        // --- 综合评估算法 ---
        const evaluateEngineStatus = (sensors) => {
          // 严重故障条件（立即告警）
          const criticalConditions = [
            sensors.temp.current > sensors.temp.threshold * 1.2,
            sensors.press.current < sensors.press.threshold * 0.7,
            sensors.speed.fluctuation > 15
          ]
          if (criticalConditions.some(c => c)) return 'critical'

          // 多指标预警条件
          const warningPoints = [
            sensors.temp.current > sensors.temp.threshold ? 2 : 0,
            sensors.press.current < sensors.press.threshold ? 1.5 : 0,
            sensors.speed.trendSlope > 0.5 ? 1 : 0,
            sensors.temp.trend > 10 ? 1.5 : 0
          ].reduce((a, b) => a + b, 0)

          if (warningPoints >= 4) return 'warning'
          if (warningPoints >= 2) return 'attention' 
          
          return 'normal'
        }

        // 计算标准差
        const calculateStdDev = (values) => {
          const avg = values.reduce((a, b) => a + b) / values.length
          return Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)
        }

        // 计算压力稳定性（变异系数）
        const calculatePressureStability = (data) => {
          const pressures = data.map(d => d.sensor4)
          const avg = pressures.reduce((a, b) => a + b) / pressures.length
          const stdDev = calculateStdDev(pressures)
          return (stdDev / avg) * 100 // 返回波动百分比
        }

        // 计算线性趋势
        const calculateLinearRegression = (values) => {
          const n = values.length
          const xSum = values.reduce((a, _, i) => a + i, 0)
          const ySum = values.reduce((a, b) => a + b, 0)
          const xySum = values.reduce((a, b, i) => a + (i * b), 0)
          const xxSum = values.reduce((a, _, i) => a + (i * i), 0)
          
          const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum)
          return { slope }
        }

        // 计算波动率（最大值与最小值差异）
        const calculateFluctuation = (values) => {
          const max = Math.max(...values)
          const min = Math.min(...values)
          return ((max - min) / min) * 100
        }

    // 过滤后的数据
    const filteredEngines = computed(() => {
      return engines.value.filter(engine => {
        const matchesId = engine.engine_id.toString().includes(filters.value.engineId)
        const matchesStatus = !filters.value.healthStatus || 
                             engine.health_status === filters.value.healthStatus
        return matchesId && matchesStatus
      }).sort((a, b) => {
        if (a[sortKey.value] < b[sortKey.value]) return -1 * sortOrder.value
        if (a[sortKey.value] > b[sortKey.value]) return 1 * sortOrder.value
        return 0
      })
    })

    // 分页数据
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filteredEngines.value.slice(start, end)
    })

    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredEngines.value.length / pageSize)
    })

    // 获取最新传感器值
    const getLatestSensor = (engine, sensorKey) => {
      if (!engine.data || engine.data.length === 0) return 'N/A'
      const value = engine.data[engine.data.length - 1][sensorKey]
      return typeof value === 'number' ? value.toFixed(2) : value
    }

    // 健康状态文本
    const getHealthStatusText = (engine) => {
      return {
        normal: '正常',
        warning: '预警',
        error: '故障'
      }[engine.health_status]
    }

    // 排序方法
    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value *= -1
      } else {
        sortKey.value = key
        sortOrder.value = 1
      }
      currentPage.value = 1 // 排序后回到第一页
    }

    // 分页方法
    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }
    
    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    // 重置筛选
    const resetFilters = () => {
      filters.value = {
        engineId: '',
        healthStatus: ''
      }
      currentPage.value = 1
    }

    onMounted(() => {
      fetchEngines()
    })

    return {
      engines,
      loading,
      filters,
      filteredEngines,
      paginatedData,
      currentPage,
      totalPages,
      sortKey,
      sortOrder,
      getLatestSensor,
      getHealthStatus: calculateHealthStatus,
      getHealthStatusText,
      sortBy,
      nextPage,
      prevPage,
      resetFilters
    }
  }
}
</script>

<style scoped>
.data-query {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.query-controls {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-weight: 500;
  color: #495057;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-width: 200px;
  font-size: 14px;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.reset-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #5a6268;
}

.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  user-select: none;
}

th:hover {
  background: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
}

.status-cell {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-cell.normal {
  background: #e6ffed;
  color: #28a745;
}

.status-cell.warning {
  background: #fff3bf;
  color: #ffc107;
}

.status-cell.error {
  background: #ffe3e3;
  color: #dc3545;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  gap: 15px;
}

.page-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
}

.no-data {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>