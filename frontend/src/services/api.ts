import axios from 'axios'
import type { App } from '../store/appStore'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const appApi = {
  // 获取所有应用
  getApps: (): Promise<App[]> => {
    return api.get('/apps')
  },
  
  // 创建应用
  createApp: (data: { name: string; description: string }): Promise<App> => {
    return api.post('/apps', data)
  },
  
  // 删除应用
  deleteApp: (id: string): Promise<void> => {
    return api.delete(`/apps/${id}`)
  },
  
  // 获取单个应用
  getApp: (id: string): Promise<App> => {
    return api.get(`/apps/${id}`)
  },
  
  // 更新应用
  updateApp: (id: string, data: Partial<App>): Promise<App> => {
    return api.put(`/apps/${id}`, data)
  }
}

export default api