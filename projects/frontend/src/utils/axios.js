import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8081/api', // 修改为只有一个/api
  withCredentials: true, // 保持启用凭据
  timeout: 10000
})

// 保留现有的请求和响应拦截器
instance.interceptors.request.use(config => {
  config.headers = config.headers || {};
  config.headers['Content-Type'] = 'application/json';
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export default instance