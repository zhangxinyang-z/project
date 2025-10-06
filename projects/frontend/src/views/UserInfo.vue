<template>
  <div class="user-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- 用户信息展示 -->
    <template v-if="!loading && !error">
      <!-- 用户概览 -->
      <div class="user-profile">
        <div class="avatar-section">
          <div class="avatar">
            <span class="initials">{{ userInitials }}</span>
          </div>
          <h2 class="username">{{ userData.name }}</h2>
          <p class="user-role">{{ roleMapping[userData.role] }}</p>
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-label">账户状态</div>
            <div :class="['stat-value', accountStatusClass]">
              {{ accountStatusText }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">系统权限</div>
            <div class="permission-level">
              <div 
                v-for="n in 5" 
                :key="n" 
                :class="['permission-dot', { active: n <= userData.accessLevel }]"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息卡片 -->
      <div class="info-grid">
        <!-- 基本信息卡片 -->
        <div class="info-card basic-info">
          <h3 class="card-title">
            <i class="icon-user"></i>基本信息
          </h3>
          <div class="info-item">
            <label>用户ID:</label>
            <span class="monospace">{{ userData.userId }}</span>
          </div>
          <div class="info-item">
            <label>注册时间:</label>
            <span>{{ formatDate(userData.registerTime) }}</span>
          </div>
          <div class="info-item">
            <label>最后登录:</label>
            <span>{{ formatDate(userData.lastLogin) }}</span>
          </div>
        </div>

        <!-- 权限管理卡片 -->
        <div class="info-card access-info">
          <h3 class="card-title">
            <i class="icon-shield"></i>权限管理
          </h3>
          <div class="access-list">
            <div 
              v-for="(perm, index) in defaultPermissions"
              :key="index"
              class="access-item"
            >
              <div class="perm-name">{{ perm.name }}</div>
              <div class="perm-status">
                <span class="status-dot" :class="{ active: perm.enabled }"></span>
                <span class="status-text">{{ perm.enabled ? '已启用' : '已禁用' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作记录图表 -->
        <div class="info-card activity-card">
          <h3 class="card-title">
            <i class="icon-activity"></i>操作记录
          </h3>
          <div class="activity-chart">
            <canvas ref="activityChart"></canvas>
          </div>
          <div class="activity-legend">
            <div v-for="(item, index) in activityTypes" :key="index" class="legend-item">
              <span class="color-block" :style="{ backgroundColor: chartColors[index] }"></span>
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import axios from '@/utils/axios'

export default {
  setup() {
    const userData = ref({
      userId: '',
      name: '', 
      role:'',
      accessLevel: '',
      registerTime: '',
      lastLogin: ''
    })
    
    // 默认权限列表（因为API未返回权限数据）
    const defaultPermissions = ref([
      { name: '实时监控', enabled: true },
      { name: '历史查询', enabled: true },
      { name: '参数配置', enabled: false },
      { name: '系统管理', enabled: false }
    ])


  const updatePermissions = (accessLevel) => {
  const permissions = defaultPermissions.value
  
  if (accessLevel >= 1) {
    permissions[0].enabled = true 
    permissions[1].enabled = true 
  }
  
  if (accessLevel >= 3) {
    permissions[2].enabled = true 
  }
  
  if (accessLevel >= 5) {
    permissions[3].enabled = true 
  }
}
    
    // 默认操作记录数据（因为API未返回活动数据）
    const defaultActivityLog = ref([
      { type: 'query', count: 45 },
      { type: 'config', count: 12 },
      { type: 'alert', count: 8 }
    ])
    
    const loading = ref(true)
    const error = ref(null)
    const activityChart = ref(null)
    const chartColors = ['#4CAF50', '#2196F3', '#FF9800']
    const activityTypes = ['数据查询', '参数调整', '告警处理']

    const fetchUserData = async () => {
  try {
    loading.value = true;
    const { data } = await axios.get('/users/me') 
    console.log('API响应:', data)
    // 确保数据结构匹配
    userData.value = {
          userId: data.userId,
          name: data.name,
          role: data.role,
          accessLevel: data.accessLevel,
          registerTime: data.registerTime,
          lastLogin: data.lastLogin
        }
        updatePermissions(data.accessLevel)
      } catch (err) {
        console.error('请求失败:', err)
        error.value = err.response?.data?.message || '加载失败'
      } finally {
        loading.value = false
      }
  };
    const formatDate = (dateStr) => {
      if (!dateStr) return '未知'
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const initChart = () => {
      if (!activityChart.value) return
      
      const ctx = activityChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: activityTypes,
          datasets: [{
            data: defaultActivityLog.value.map(i => i.count),
            backgroundColor: chartColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  return `${label}: ${value}次操作`
                }
              }
            }
          }
        }
      })
    }

    onMounted(() => {
      fetchUserData().then(() => {
        console.log('最终用户数据:', userData.value);
        initChart()
      })
    })

    return {
      userData,
      defaultPermissions,
      loading,
      error,
      activityChart,
      chartColors,
      activityTypes,
      formatDate
    }
  },
  computed: {
    userInitials() {
      return this.userData.name?.charAt(0).toUpperCase() || 'U';
    },
    roleMapping() {
      return {
        user: '普通用户',
        engineer: '监测工程师',
        admin: '系统管理员',
        viewer: '观察员'
      }
    },
    accountStatusClass() {
      return this.userData.accessLevel > 2 ? 'status-active' : 'status-limited'
    },
    accountStatusText() {
      return this.userData.accessLevel > 2 ? '激活状态' : '受限状态'
    }
  }
}
</script>

<style scoped>
/* 原有样式保持不变 */
.user-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.user-profile {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.avatar-section {
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #2196F3;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.initials {
  font-size: 2.5rem;
  color: white;
  font-weight: 500;
}

.username {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #1a237e;
}

.user-role {
  color: #666;
  font-size: 0.9rem;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.stat-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.status-active { color: #4CAF50; }
.status-limited { color: #FF9800; }

.permission-level {
  display: flex;
  gap: 8px;
}

.permission-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e0e0;
}

.permission-dot.active {
  background: #4CAF50;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 1.1rem;
  color: #1a237e;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-user::before { content: "👤"; }
.icon-shield::before { content: "🛡️"; }
.icon-activity::before { content: "📊"; }

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}

.info-item label {
  color: #666;
}

.monospace {
  font-family: monospace;
  color: #2196F3;
}

.access-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
  margin-right: 6px;
}

.status-dot.active {
  background: #4CAF50;
}

.activity-chart {
  height: 200px;
  position: relative;
}

.activity-legend {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
}

.color-block {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #f44336;
  padding: 1rem;
  background: #ffebee;
  border-radius: 4px;
  margin: 1rem 0;
}
</style>