import { createRouter, createWebHistory } from 'vue-router'

// 导入所有组件
import HomeView from '@/views/index/index.vue' // 首页
import UserView from '@/views/user/index.vue' // 个人信息
import CultureView from '@/views/culture/index.vue' // 文化
import SpecialtiesView from '@/views/specialties/index.vue' // 特产
import LayoutView from '@/views/layout/index.vue' // 带导航的全局布局
import AttractiontView from '@/views/attraction/index.vue' // 景区

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 全局布局：所有页面都嵌套在这个布局里（共享导航栏）
    {
      path: '/',
      component: LayoutView,
      redirect: '/index', // 根路径重定向到首页
      children: [
        // 首页（有轮播图）
        {
          path: '/index',
          name: 'index',
          component: HomeView
        },
        // 个人信息（无轮播图）
        {
          path: '/user',
          name: 'user',
          component: UserView
        },
        // 文化（无轮播图）
        {
          path: '/culture',
          name: 'culture',
          component: CultureView
        },
        // 特产（无轮播图）
        {
          path: '/specialties',
          name: 'specialties',
          component: SpecialtiesView
        },
        // 景区（无轮播图）
        {
          path: '/attraction',
          name: 'attraction',
          component: AttractiontView
        }
      ]
    }
  ]
})

export default router