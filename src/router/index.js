import { createRouter, createWebHistory } from 'vue-router'
import request from '@/utils/request'

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


// 作用：每次路由跳转结束时，默默向后端发一个请求，触发拦截器统计 PV/UV
router.afterEach((to, from) => {
  // 如果不是去登录页，就进行统计
  if (to.path !== '/login') {
    // 调用后端的心跳接口 (需要在后端 DailyVisitController 加一个 ping 接口)
    // catch 捕获异常，防止统计失败影响页面报错
    request.get('/dailyVisit/ping').catch(() => {})
  }
})

export default router