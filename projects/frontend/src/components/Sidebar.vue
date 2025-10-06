<template>
    <div class="sidebar">
      <nav>
        <router-link 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path"
          class="menu-item"
          active-class="active"
        >
          {{ item.title }}
        </router-link>
      </nav>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        menuItems: [
          { title: '用户信息', path: '/home/user-info' },
          { title: '数据查询', path: '/home/data-query' },
          { title: '实时监控', path: '/home/real-time-monitor' },
          { title: '未来预测', path: '/home/forecast' },
          { title: '设备分析', path: '/home/device-analysis' },
          { title: '传感器实时', path: '/home/sensor-realtime' },
          { title: '传感器历史', path: '/home/sensor-history' },
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 200px;
    height: 100vh;
    background: rgba(0, 0, 20, 0.9);
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 255, 255, 0.3);
  }
  
  .menu-item {
    display: block;
    padding: 12px;
    color: #0ff;
    text-decoration: none;
    margin: 10px 0;
    border-left: 3px solid transparent;
    transition: all 0.3s;
  }
  
  .menu-item:hover {
    background: rgba(0, 255, 255, 0.1);
    border-left-color: #f0f;
  }
  
  .active {
    border-left-color: #0ff;
    background: rgba(0, 255, 255, 0.05);
  }
  </style>