<template>
  <div class="page-content">
    <div class="particles"></div>
    <h1 class="title">设备分析</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!devices.length" class="no-data">暂无设备数据</div>

    <div v-else class="device-grid">
      <div class="info-card" v-for="device in devices" :key="device.id">
        <div class="card-placeholder">
          <img :src="getDeviceImageUrl(device.id)" alt="设备图片" class="device-image" @error="handleImageError" />
        </div>
        <div class="card-content">
          <h3>设备编号: {{ device.id }}</h3>
          <p>设备名称: {{ device.name }}</p>
          <p :class="device.status === '正常' ? 'status-normal' : 'status-abnormal'">
            状态: {{ device.status || '未知' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRealtimeData } from '@/api/sensor';

export default {
  data() {
    return {
      devices: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.fetchDeviceData();
  },
  methods: {
    async fetchDeviceData() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getRealtimeData();
        console.log('接口返回的数据:', response);
        if (!response || typeof response !== 'object') {
          console.warn('无效的接口返回数据:', response);
          throw new Error('无效的接口返回数据');
        }
        const deviceIds = ['GW001', 'GW002', 'GW003', 'GW004', 'GW005', 'GW006', 'GW007', 'GW008'];
        const newDevices = deviceIds.map((id, index) => {
          const device = {
            id,
            name: `设备${String.fromCharCode(65 + index)}`,
            status: this.formatStatus(response)
          };
          console.log('设备数据:', device);
          return device;
        });
        this.devices = newDevices;
      } catch (err) {
        this.error = '获取数据失败，请稍后重试';
        console.error('接口错误:', err);
        const deviceIds = ['GW001', 'GW002', 'GW003', 'GW004', 'GW005', 'GW006', 'GW007', 'GW008'];
        this.devices = deviceIds.map((id, index) => ({
          id,
          name: `设备${String.fromCharCode(65 + index)}`,
          status: '错误'
        }));
      } finally {
        this.loading = false;
      }
    },
    formatStatus(data) {
      console.log('格式化状态 - 输入数据:', data);
      if (!data || typeof data !== 'object') {
        console.warn('格式化状态 - 无效输入:', data);
        return '未知';
      }
      const temp = data.temperature || 25;
      const humidity = data.humidity || 60;
      const status = (temp > 30 || humidity > 80) ? '异常' : '正常';
      console.log('格式化状态 - 结果:', status);
      return status;
    },
    getDeviceImageUrl(deviceId) {
      return `/images/devices/${deviceId}.png`;
    },
    handleImageError(event) {
      event.target.src = '/images/devices/default.png';
    }
  }
}
</script>

<style scoped>
.page-content {
  color: #374151; /* Soft dark gray for text */
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: #ffffff; /* Clean white background */
  min-height: 100vh;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: transparent url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="15" cy="15" r="1" fill="%2360a5fa" /><circle cx="55" cy="55" r="1.2" fill="%2360a5fa" /><circle cx="85" cy="25" r="0.8" fill="%2360a5fa" /><circle cx="30" cy="70" r="1.1" fill="%2360a5fa" /></svg>') repeat;
  z-index: -1;
  animation: pulse-particles 15s linear infinite;
  opacity: 0.5;
}

@keyframes pulse-particles {
  0% {
    opacity: 0.3;
    background-position: 0 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.3;
    background-position: 600px 600px;
    transform: scale(1);
  }
}

.title {
  text-align: center;
  margin-bottom: 20px;
  color: #1e293b; /* Dark slate for title */
  font-size: 2.2rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  transition: transform 0.4s ease, text-shadow 0.4s ease;
}

.title:hover {
  transform: scale(1.1) rotate(1deg); /* Zoom and slight tilt */
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.6), 0 0 25px rgba(59, 130, 246, 0.4);
  animation: vibrate-title 0.6s ease-in-out;
}

@keyframes vibrate-title {
  0% {
    transform: scale(1) rotate(0);
    text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% {
    transform: scale(1.15) rotate(2deg);
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.7);
  }
  100% {
    transform: scale(1.1) rotate(1deg);
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  }
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
}

.info-card {
  border: 1px solid #e5e7eb; /* Light gray border */
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55),
  box-shadow 0.5s ease,
  filter 0.5s ease;
  background: #f9fafb; /* Very light gray card background */
  position: relative;
  z-index: 1;
}

.info-card:hover {
  transform: translateY(-10px) rotate(2deg) scale(1.05); /* Lift, tilt, and scale */
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2);
  filter: brightness(1.1); /* Subtle brightness boost */
  animation: pulse-card 0.7s ease-out;
}

@keyframes pulse-card {
  0% {
    transform: translateY(0) rotate(0) scale(1);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  }
  50% {
    transform: translateY(-15px) rotate(3deg) scale(1.08);
    box-shadow: 0 18px 40px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.3);
  }
  100% {
    transform: translateY(-10px) rotate(2deg) scale(1.05);
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
  }
}

.card-placeholder {
  height: 180px;
  background-color: #e5e7eb; /* Light gray placeholder */
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image {
  color: #6b7280; /* Medium gray for no-image text */
  font-style: italic;
}

.card-content {
  padding: 12px;
}

.card-content h3 {
  margin: 0 0 8px;
  color: #1e293b; /* Dark slate for headers */
  font-size: 1.1rem;
  font-weight: 600;
}

.card-content p {
  margin: 4px 0;
  color: #374151; /* Soft dark gray for text */
  font-weight: 400;
}

.status-normal {
  color: #15803d !important; /* Muted green for normal status */
  transition: text-shadow 0.3s ease;
}

.status-normal:hover {
  text-shadow: 0 0 8px rgba(21, 128, 61, 0.5);
}

.status-abnormal {
  color: #b91c1c !important; /* Muted red for abnormal status */
  transition: text-shadow 0.3s ease;
}

.status-abnormal:hover {
  text-shadow: 0 0 8px rgba(185, 28, 28, 0.5);
}

.loading,
.no-data {
  text-align: center;
  color: #4b5563; /* Medium gray for loading/no-data */
  font-size: 16px;
  margin: 20px 0;
  position: relative;
  z-index: 1;
  transition: transform 0.4s ease, text-shadow 0.4s ease;
}

.loading:hover,
.no-data:hover {
  transform: scale(1.1) rotate(1deg); /* Zoom and slight tilt */
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.error {
  text-align: center;
  color: #b91c1c; /* Muted red for errors */
  font-size: 16px;
  margin: 20px 0;
  position: relative;
  z-index: 1;
  transition: transform 0.4s ease, text-shadow 0.4s ease;
}

.error:hover {
  transform: scale(1.1) rotate(1deg); /* Zoom and slight tilt */
  text-shadow: 0 0 10px rgba(185, 28, 28, 0.5);
}

.device-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.5s ease;
}

.device-image:hover {
  transform: scale(1.15) rotate(3deg); /* Bolder zoom and tilt */
  filter: brightness(1.1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
}
</style>