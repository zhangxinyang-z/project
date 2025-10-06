<template>
  <div class="home-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">智能分析平台</h2>
      </div>
      <nav>
        <template v-for="item in menuItems" :key="item.path">
          <a
            v-if="item.isExternal"
            :href="item.path"
            class="menu-item"
            @click.prevent="handleExternalLink(item.path)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-title">{{ item.title }}</span>
          </a>
          <router-link
            v-else
            :to="item.path"
            class="menu-item"
            active-class="active"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-title">{{ item.title }}</span>
          </router-link>
        </template>
      </nav>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="header">
        <h1>欢迎, {{ username }}!</h1>
        <button @click="handleLogout" class="logout-button">退出登录</button>
      </div>

      <!-- 子页面内容（全屏区域） -->
      <div class="fullscreen-view">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: localStorage.getItem('username') || '用户',
      menuItems: [
        { title: '用户信息', path: '/home/user-info', icon: '👤' },
        { title: '数据查询', path: '/home/data-query', icon: '🔍' },
        { 
          title: '实时监控', 
          path: '/echarts_index.html', 
          icon: '📊', 
          isExternal: true
        },
        { title: '未来预测', path: '/home/future-forecast', icon: '🔮' },
        { title: '设备分析', path: '/home/device-analysis', icon: '📡' },
        { title: '传感器实时', 
          path: '/myecharts.html', 
          icon: '⏱️',
          isExternal: true 
        },
        { title: '传感器历史', path: '/home/sensor-history', icon: '📅' }
      ]
    };
  },
  methods: {
    handleExternalLink(url) {
      window.location.href = url;
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.home-container {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  color: #2c3e50;
  font-family: 'Arial', sans-serif;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #ffffff;
  padding: 20px 0;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-title {
  margin: 0;
  font-size: 1.5rem;
  color: #42b983;
  text-align: center;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 8px 0;
  border-left: 4px solid transparent;
}

.menu-item:hover {
  background: rgba(66, 185, 131, 0.1);
  border-left: 4px solid #42b983;
  color: #2c3e50;
}

.menu-item .menu-icon {
  margin-right: 12px;
  font-size: 1.2rem;
  color: #42b983;
}

.menu-item .menu-title {
  font-size: 14px;
  font-weight: 500;
}

.active {
  background: rgba(66, 185, 131, 0.1);
  border-left: 4px solid #42b983;
  color: #2c3e50;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.fullscreen-view {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #ffffff;
  border-radius: 10px;
  margin: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 999;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.logout-button {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.logout-button:hover {
  background: #bb2d3b;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .sidebar-title {
    display: none;
  }

  .menu-item .menu-title {
    display: none;
  }

  .main-content {
    margin-left: 60px;
  }
}
</style>