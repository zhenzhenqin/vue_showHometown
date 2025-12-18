import { createRouter, createWebHistory } from 'vue-router'

// 导入所有组件
import HomeView from '@/views/index/index.vue'
import UserView from '@/views/user/index.vue'
import CultureView from '@/views/culture/index.vue'
import SpecialtiesView from '@/views/specialties/index.vue'
import LayoutView from '@/views/layout/index.vue' 
import AttractiontView from '@/views/attraction/index.vue'
import LoginView from '@/views/login/index.vue' 
import MapView from '@/views/map/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 2. 新增登录路由
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    // 全局布局
    {
      path: '/',
      component: LayoutView,
      redirect: '/index',
      children: [
        { path: '/index', name: 'index', component: HomeView },
        { 
          path: '/user', 
          name: 'user', 
          component: UserView,
          // 路由守卫：未登录拦截
          beforeEnter: (to, from, next) => {
            if (!localStorage.getItem('token')) {
              next('/login')
            } else {
              next()
            }
          }
        },
        { path: '/culture', name: 'culture', component: CultureView },
        { path: '/specialties', name: 'specialties', component: SpecialtiesView },
        { path: '/attraction', name: 'attraction', component: AttractiontView },
        { path: '/map', name: 'map', component: MapView }
      ]
    }
  ]
})

export default router