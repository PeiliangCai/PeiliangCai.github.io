<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon, Terminal, Layout, Microscope, Edit3 } from 'lucide-vue-next'

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  isDark.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
})
</script>

<template>
  <header class="header glass">
    <nav class="nav">
      <router-link to="/" class="nav-brand geek-font">
        PEILIANG.<span>CAI</span>
      </router-link>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <Terminal :size="18" /> <span>HOME</span>
        </router-link>
        <router-link to="/portfolio" class="nav-link">
          <Layout :size="18" /> <span>PORTFOLIO</span>
        </router-link>
        <router-link to="/research" class="nav-link">
          <Microscope :size="18" /> <span>RESEARCH</span>
        </router-link>
        <router-link to="/blog" class="nav-link">
          <Edit3 :size="18" /> <span>BLOG</span>
        </router-link>
      </div>

      <button @click="toggleTheme" class="theme-btn">
        <Moon v-if="isDark" :size="20" />
        <Sun v-else :size="20" />
      </button>
    </nav>
  </header>

  <main class="main">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>

<style scoped>
.header {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  z-index: 1000;
  padding: 0.75rem 2rem;
  border-radius: 20px;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.nav-brand span {
  color: var(--accent-primary);
}

.pulse {
  width: 10px;
  height: 10px;
  background-color: var(--accent-secondary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--accent-secondary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.nav-links {
  display: flex;
  gap: 2.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.nav-link:hover, .router-link-active {
  color: var(--accent-primary);
}

.theme-btn {
  padding: 0.5rem;
  border-radius: 10px;
  color: var(--text-primary);
  background: var(--glass-bg);
  transition: all 0.2s;
}

.theme-btn:hover {
  background: var(--border-color);
  transform: translateY(-2px);
}

.main {
  padding-top: 6rem;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .nav-links span {
    display: none;
  }
  .nav-links {
    gap: 1.5rem;
  }
}
</style>
