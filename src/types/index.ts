// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
}

// 应用配置接口
export interface AppConfig {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  fontSize: number
}

// 响应数据接口
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Vuex 状态接口
export interface RootState {
  count: number
}

// 路由元数据接口
export interface RouteMeta {
  title: string
  requiresAuth: boolean
  icon?: string
}
