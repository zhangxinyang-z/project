<template>
  <div class="register-container">
    <!-- 左侧信息面板 -->
    <div class="info-panels">
      <div 
        v-for="(panel, index) in infoPanels" 
        :key="index" 
        class="info-panel"
        :style="{ 'transition-delay': index * 0.3 + 's' }"
      >
        <div class="panel-icon">{{ panel.icon }}</div>
        <div class="panel-content">
          <h3>{{ panel.title }}</h3>
          <p>{{ panel.content }}</p>
        </div>
      </div>
    </div>

    <!-- 右侧注册表单 -->
    <div class="register-form">
      <h1 class="form-title">用户注册</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <input 
            v-model="username" 
            type="text" 
            required 
            class="form-input"
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="password" 
            type="password" 
            required 
            class="form-input"
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" class="submit-button">
          <span class="button-text">立即注册</span>
          <span class="button-icon">→</span>
        </button>
        <div class="form-footer">
          <p>已有账号？<router-link to="/login" class="login-link">去登录</router-link></p>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
      infoPanels: [
        {
          icon: '🚀',
          title: '快速注册',
          content: '只需几步，即可开启智能数据分析之旅'
        },
        {
          icon: '🔒',
          title: '安全保障',
          content: '采用多重加密技术，确保您的数据安全'
        },
        {
          icon: '📈',
          title: '立即体验',
          content: '注册后即可享受实时监控和趋势预测功能'
        }
      ]
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await axios.post('http://localhost:8081/api/register', {
          username: this.username,
          password: this.password,
        });
        alert('注册成功！用户ID：' + response.data.userId);
        this.$router.push('/login');
      } catch (err) {
        this.error = '注册失败：' + (err.response?.data?.message || '网络错误');
      }
    },
  },
  mounted() {
    // 触发动画
    setTimeout(() => {
      document.querySelector('.info-panels').classList.add('active');
      document.querySelector('.register-form').classList.add('active');
    }, 100);
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); /* 浅色渐变背景 */
  padding: 0 10%;
  overflow: hidden;
}

/* 左侧信息面板动画 */
.info-panels {
  width: 45%;
  transform: translateX(-100%);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-panels.active {
  transform: translateX(0);
}

.info-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  transform: translateX(-50px);
  opacity: 0;
  transition: all 0.8s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.info-panel:nth-child(1) { transition-delay: 0.3s; }
.info-panel:nth-child(2) { transition-delay: 0.6s; }
.info-panel:nth-child(3) { transition-delay: 0.9s; }

.info-panels.active .info-panel {
  transform: translateX(0);
  opacity: 1;
}

.panel-icon {
  font-size: 2.5rem;
  margin-right: 20px;
  color: #42b983; /* 绿色图标 */
}

.panel-content h3 {
  color: #2c3e50;
  margin: 0 0 10px;
  font-size: 1.4rem;
}

.panel-content p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 右侧注册表单动画 */
.register-form {
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  transform: translateX(100%);
  opacity: 0;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.register-form.active {
  transform: translateX(0);
  opacity: 1;
}

.form-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2rem;
  position: relative;
}

.form-title::after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background: #42b983;
  margin: 15px auto 0;
}

.form-group {
  margin-bottom: 25px;
}

.form-input {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box; /* 确保输入框宽度一致 */
}

.form-input:focus {
  border-color: #42b983;
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.2);
  outline: none;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #42b983 0%, #369f6e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  box-sizing: border-box; /* 确保按钮宽度一致 */
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(66, 185, 131, 0.3);
}

.button-text {
  font-weight: 500;
}

.button-icon {
  font-size: 1.2rem;
  transform: translateX(-5px);
  transition: transform 0.3s ease;
}

.submit-button:hover .button-icon {
  transform: translateX(0);
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.login-link {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #369f6e;
  text-decoration: underline;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
    padding: 30px;
  }

  .info-panels {
    width: 100%;
    margin-bottom: 30px;
  }

  .register-form {
    width: 100%;
  }
}
</style>