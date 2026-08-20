import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import HomeView from '../views/HomeView.vue'

const siteTitle = 'Cai Peiliang (蔡沛良)'

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
    component: HomeView,
    meta: { title: siteTitle }
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    redirect: '/'
  },
  {
    path: '/research',
    name: 'research',
    component: () => import('../views/ResearchView.vue'),
    meta: { title: `Research | ${siteTitle}` }
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('../views/BlogView.vue'),
    meta: { title: `Blog | ${siteTitle}` }
  },
  {
    path: '/blog/:id',
    name: 'blog-post',
    component: () => import('../views/BlogPostView.vue'),
    props: true,
    meta: { title: `Article | ${siteTitle}` }
  },
  {
    path: '/wiki',
    name: 'wiki',
    component: () => import('../views/WikiView.vue'),
    meta: { title: `LLM Wiki | ${siteTitle}` }
  },
  {
    path: '/wiki/:topic/:id',
    name: 'wiki-topic-post',
    component: () => import('../views/WikiPostView.vue'),
    props: true,
    meta: { title: `Wiki | ${siteTitle}` }
  },
  {
    path: '/wiki/:id',
    name: 'wiki-post',
    component: () => import('../views/WikiPostView.vue'),
    props: true,
    meta: { title: `Wiki | ${siteTitle}` }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
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
router.afterEach((to) => {
  NProgress.done()
  document.title = to.meta.title || siteTitle
})

export default router
