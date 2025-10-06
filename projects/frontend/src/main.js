import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 导入路由
import axios from '@/utils/axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 将 axios 实例添加到全局属性中，方便在任何组件中通过 this.$axios 访问
app.config.globalProperties.$axios = axios

// 使用 Element Plus 插件
app.use(ElementPlus)

// 使用路由
app.use(router)

// 挂载应用实例到 DOM 中
app.mount('#app')