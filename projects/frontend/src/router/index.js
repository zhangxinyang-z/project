import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import DataQuery from '../views/DataQuery.vue'
import RealTimeMonitor from '../views/RealTimeMonitor.vue'
import FutureForecas from '../views/FutureForecas.vue'
import DeviceAnalysis from '../views/DeviceAnalysis.vue'
import SensorRealtime from '../views/SensorRealtime.vue'
import SensorHistory from '../views/SensorHistory.vue'

const routes = [
  {
    path: '/',
    redirect: '/login' // 默认跳转到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }, // 需要认证
    children: [
      {
        path: 'user-info',
        name: 'UserInfo',
        component: () => import('../views/UserInfo.vue'),
        meta: { 
          requiresAuth: true,
          title: '用户信息',
          icon: '👤'
        } 
      },
      {
        path: 'data-query',
        name: 'DataQuery',
        component: DataQuery,
        meta: {
          title: '数据查询',
          icon: '🔍'
        }
      },
      {
        path: 'real-time-monitor',
        name: 'RealTimeMonitor',
        component: RealTimeMonitor,
        meta: {
          title: '实时监控',
          icon: '📊'
        }
      },
      {
        path: 'future-forecast',
        name: 'FutureForecast',
        component: FutureForecas,
        meta: {
          title: '未来预测',
          icon: '🔮'
        }
      },
      {
        path: 'device-analysis',
        name: 'DeviceAnalysis',
        component: DeviceAnalysis,
        meta: {
          title: '设备分析',
          icon: '📡'
        }
      },
      
      {
        path: 'sensor-realtime',
        name: 'SensorRealtime',
        component: SensorRealtime,
        meta: {
          title: '传感器实时',
          icon: '⏱️'
        }
      },
      {
        path: 'sensor-history',
        name: 'SensorHistory',
        component:SensorHistory,
        meta: {
          title: '传感器历史',
          icon: '📅'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 增强版路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  // 需要登录但无token
  if (to.meta.requiresAuth && !token) {
    return next('/login?redirect=' + encodeURIComponent(to.fullPath))
  }

  // 已登录却访问guest页面
  if (to.meta.guestOnly && token) {
    return next('/home')
  }

  // 角色权限检查
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    return next('/home')  // 或跳转到无权限页面
  }

  next()
})

export default router