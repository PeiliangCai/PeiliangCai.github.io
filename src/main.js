import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
    return 'dark'
  } catch (error) {
    return 'dark'
  }
}

document.documentElement.setAttribute('data-theme', getInitialTheme())

const app = createApp(App)
app.use(router)
app.mount('#app')
