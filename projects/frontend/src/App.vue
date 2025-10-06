<template>
  <!-- 导航栏 -->
  <nav class="navbar">
    <router-link to="/" class="nav-logo">
      <img alt="Vue logo" src="./assets/logo_new.png" class="logo">
      <title>zxy的设备监测平台</title>
    </router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link">首页</router-link>
      <router-link to="/login" class="nav-link">登录</router-link>
      <router-link to="/register" class="nav-link">注册</router-link>
    </div>
  </nav>

  <!-- 页面内容区域 -->
  <div class="content">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh; 
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.7); 
  background-image: url('~@/assets/background.jpg'); 
  background-position: center;
  background-size: cover;
  background-attachment: fixed; 
  background-repeat: no-repeat;
}



.navbar {
  background: rgba(248, 249, 250, 0.9); 
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; 
  z-index: 1000;
}

.nav-logo .logo {
  height: 40px;
  transition: transform 0.3s ease; 
}

.nav-logo:hover .logo {
  transform: scale(1.05); 
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease; 
}

.nav-link:hover {
  background: rgba(233, 236, 239, 0.8); 
  transform: translateY(-2px); 
}

.router-link-exact-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}
</style>