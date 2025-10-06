<template>
  <div class="real-time-monitor">
    <!-- 顶部标题 -->
    <header class="monitor-header">
      <span>实时监控</span>
    </header>

    <!-- 主内容区域 -->
    <main class="monitor-main">
      <!-- 左侧模块 -->
      <div class="left-panel">
        <!-- 本月订单数 -->
        <div class="data-box">
          <span>本月订单数</span>
          <h2>{{ stats.orders }}</h2>
        </div>
        <!-- 本月新增会员 -->
        <div class="data-box">
          <span>本月新增会员</span>
          <h2>{{ stats.newMembers }}</h2>
        </div>
        <!-- 一次消费会员 -->
        <div class="data-box">
          <span>一次消费会员</span>
          <h2>{{ stats.oneTimeMembers }}</h2>
        </div>
      </div>

      <!-- 中间模块 -->
      <div class="center-panel">
        <!-- 设备数、上月设备增加数、增值率 -->
        <div class="stats-box">
          <div class="stat-item">
            <span>设备数</span>
            <h1>{{ stats.devices }}</h1>
          </div>
          <div class="stat-item">
            <span>上月设备增加数</span>
            <h1>{{ stats.deviceIncrease }}</h1>
          </div>
          <div class="stat-item">
            <span>增值率</span>
            <h1>{{ stats.growthRate }}%</h1>
          </div>
        </div>
        <!-- ECharts 图表 -->
        <div ref="chart1" class="echart" style="width: 100%; height: 300px;"></div>
      </div>

      <!-- 右侧模块 -->
      <div class="right-panel">
        <!-- 开关次数 -->
        <div class="switch-box">
          <span>开关次数</span>
          <h3>{{ stats.switchCount }}<span>次</span></h3>
        </div>
        <!-- 温度、湿度、信号、光线 -->
        <div class="sensor-box">
          <div class="sensor-item">
            <span>温度</span>
            <h2>{{ stats.temperature }}℃</h2>
          </div>
          <div class="sensor-item">
            <span>湿度</span>
            <h2>{{ stats.humidity }}RH</h2>
          </div>
          <div class="sensor-item">
            <span>信号</span>
            <h2>{{ stats.signal }}dBm</h2>
          </div>
          <div class="sensor-item">
            <span>光线</span>
            <h2>{{ stats.light }}LX</h2>
          </div>
        </div>
        <!-- ECharts 图表 -->
        <div ref="chart2" class="echart" style="width: 100%; height: 300px;"></div>
      </div>

      <!-- 底部模块 -->
      <div class="bottom-panel">
        <!-- ECharts 图表 -->
        <div ref="chart3" class="echart" style="width: 100%; height: 300px;"></div>
        <!-- 设备维保数据表格 -->
        <div class="maintenance-table">
          <h1>设备维保数据查看</h1>
          <table>
            <thead>
              <tr>
                <th>维护时间</th>
                <th>维保人</th>
                <th>维保电话</th>
                <th>更换水量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in maintenanceData" :key="index">
                <td>{{ item.date }}</td>
                <td>{{ item.person }}</td>
                <td>{{ item.phone }}</td>
                <td>{{ item.water }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      // 统计数据
      stats: {
        orders: 18000, // 本月订单数
        newMembers: 1000, // 本月新增会员
        oneTimeMembers: 600, // 一次消费会员
        devices: 500, // 设备数
        deviceIncrease: 30, // 上月设备增加数
        growthRate: 75, // 增值率
        switchCount: 15, // 开关次数
        temperature: 23, // 温度
        humidity: 56, // 湿度
        signal: -90, // 信号
        light: 250 // 光线
      },
      // 设备维保数据
      maintenanceData: [
        { date: '2018-02-06', person: '张伟', phone: '13111345462', water: '1000ml' },
        { date: '2018-02-06', person: '张伟', phone: '13111345462', water: '1000ml' },
        { date: '2018-02-06', person: '张伟', phone: '13111345462', water: '1000ml' },
        { date: '2018-02-06', person: '张伟', phone: '13111345462', water: '1000ml' },
        { date: '2018-02-06', person: '张伟', phone: '13111345462', water: '1000ml' }
      ]
    };
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    // 初始化图表
    initCharts() {
      // 图表1：设备数据趋势
      const chart1 = echarts.init(this.$refs.chart1);
      chart1.setOption({
        title: { text: '设备数据趋势', textStyle: { color: '#fff' } },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'], axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [{ data: [500, 530, 560, 580, 600], type: 'line', smooth: true, lineStyle: { color: '#00f7ff' } }]
      });

      // 图表2：环境数据分布
      const chart2 = echarts.init(this.$refs.chart2);
      chart2.setOption({
        title: { text: '环境数据分布', textStyle: { color: '#fff' } },
        series: [{
          type: 'pie',
          data: [
            { value: 23, name: '温度' },
            { value: 56, name: '湿度' }
          ],
          label: { color: '#fff' }
        }]
      });

      // 图表3：设备状态
      const chart3 = echarts.init(this.$refs.chart3);
      chart3.setOption({
        title: { text: '设备状态', textStyle: { color: '#fff' } },
        xAxis: { type: 'category', data: ['设备A', '设备B', '设备C', '设备D', '设备E'], axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [{ data: [15, 20, 25, 30, 35], type: 'bar', itemStyle: { color: '#00f7ff' } }]
      });
    }
  }
};
</script>

<style scoped>
.real-time-monitor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0a1a2f;
  color: #fff;
}

.monitor-header {
  padding: 20px;
  font-size: 24px;
  background-color: #1a2a3f;
}

.monitor-main {
  display: flex;
  flex: 1;
  padding: 20px;
}

.left-panel, .center-panel, .right-panel {
  flex: 1;
  margin: 10px;
  padding: 20px;
  background-color: #1a2a3f;
  border-radius: 10px;
}

.bottom-panel {
  display: flex;
  margin: 10px;
  padding: 20px;
  background-color: #1a2a3f;
  border-radius: 10px;
}

.data-box, .stat-item, .sensor-item {
  margin-bottom: 20px;
}

.echart {
  margin-top: 20px;
}

.maintenance-table {
  flex: 1;
  margin-left: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #444;
  color: #fff;
}

</style>