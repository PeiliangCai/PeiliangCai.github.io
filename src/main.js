import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const savedTheme = localStorage.getItem('theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

const app = createApp(App)
app.use(router)
app.mount('#app')
