import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import HomeView from '../views/HomeView.vue'

// NProgress Configuration
NProgress.configure({ 
  showSpinner: false, // 禁用右上角的加载圈，保持极简
  speed: 400,
  minimum: 0.2
})

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: () => import('../views/PortfolioView.vue')
  },
  {
    path: '/research',
    name: 'research',
    component: () => import('../views/ResearchView.vue')
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('../views/BlogView.vue')
  },
  {
    path: '/blog/:id',
    name: 'blog-post',
    component: () => import('../views/BlogPostView.vue'),
    props: true
  },
  {
    path: '/wiki',
    name: 'wiki',
    component: () => import('../views/WikiView.vue')
  },
  {
    path: '/wiki/:id',
    name: 'wiki-post',
    component: () => import('../views/WikiPostView.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由钩子：开始加载条
router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    NProgress.start()
  }
  next()
})

// 路由钩子：结束加载条
router.afterEach(() => {
  NProgress.done()
})

export default router
