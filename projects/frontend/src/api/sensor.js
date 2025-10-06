// src/api/sensor.js
import request from '@/utils/axios'  // 确保导入的是正确的axios实例

// 新增：获取所有历史数据（聚合接口）
export function getHistoryData(date) {
  return Promise.all([
    getTempHistory(date),
    getHumidityHistory(date),
    getDistanceHistory(date)
  ]).then(([tempRes, humidityRes, distanceRes]) => {
    // 数据合并逻辑
    const resultMap = new Map()

    // 处理温度数据
    tempRes.forEach(item => {
      const key = item.recordTime
      resultMap.set(key, {
        time: key,
        temperature: item.value
      })
    })

    // 处理湿度数据
    humidityRes.forEach(item => {
      const key = item.recordTime
      if (resultMap.has(key)) {
        resultMap.get(key).humidity = item.value
      } else {
        resultMap.set(key, {
          time: key,
          humidity: item.value
        })
      }
    })

    // 处理距离数据
    distanceRes.forEach(item => {
      const key = item.recordTime
      if (resultMap.has(key)) {
        resultMap.get(key).distance = item.value
      } else {
        resultMap.set(key, {
          time: key,
          distance: item.value
        })
      }
    })

    // 转换为数组并按时间排序
    return Array.from(resultMap.values())
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(item => ({
        ...item,
        time: this.formatTime(item.time, 'HH:mm') // 需要在前端组件中定义formatTime方法
      }))
  })
}

// 获取实时传感器数据
export function getRealtimeData() {
  return request({
    url: '/sensor/realtime', // 对应后端接口
    method: 'get'
  }).then(response => {
    // 统一响应结构处理
    return response.data || {}
  })
}

// 获取温度历史数据
export function getTempHistory(date) {
  return request({
    url: '/sensor/history/temperature', // 移除开头的/api，因为baseURL已包含
    method: 'get',
    params: { 
      date: date // 确保日期格式为YYYY-MM-DD
    }
  }).then(response => {
    // 统一响应数据结构，确保返回数组
    return response.data || []
  })
}

// 获取湿度历史数据
export function getHumidityHistory(date) {
  return request({
    url: '/sensor/history/humidity',
    method: 'get',
    params: { date }
  }).then(response => response.data || [])
}

// 获取距离历史数据
export function getDistanceHistory(date) {
  return request({
    url: '/sensor/history/distance',
    method: 'get',
    params: { date }
  }).then(response => response.data || [])
}