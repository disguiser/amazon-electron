import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  // 使用 hash 模式构建路由（electron 中推荐使用 hash 模式）
  history: createWebHashHistory(),
  routes
})

export default router
