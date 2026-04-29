<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon, Home, FolderKanban, GraduationCap, BookOpenText } from 'lucide-vue-next'
import Starfield from './components/Starfield.vue'

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
  <Starfield />

  <header class="header glass">
    <nav class="nav">
      <router-link to="/" class="nav-brand geek-font">
        <span class="brand-mark"></span>
        <span class="brand-text">PEILIANG.<b>CAI</b></span>
      </router-link>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <Home :size="18" /> <span>HOME</span>
        </router-link>
        <router-link to="/portfolio" class="nav-link">
          <FolderKanban :size="18" /> <span>PORTFOLIO</span>
        </router-link>
        <router-link to="/research" class="nav-link">
          <GraduationCap :size="18" /> <span>RESEARCH</span>
        </router-link>
        <router-link to="/blog" class="nav-link">
          <BookOpenText :size="18" /> <span>BLOG</span>
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
  top: 1.1rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(92%, 1180px);
  z-index: 1000;
  padding: 0.55rem;
  border-radius: 8px;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.5rem 0.8rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.brand-mark {
  width: 0.72rem;
  height: 0.72rem;
  background: var(--accent-secondary);
  box-shadow: 0 0 18px var(--accent-secondary), 0 0 42px rgba(182, 255, 59, 0.42);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  animation: signal 2.2s ease-in-out infinite;
}

.brand-text b {
  color: var(--accent-primary);
  font-weight: 900;
}

@keyframes signal {
  0%, 100% { opacity: 0.65; transform: scale(0.9) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.12) rotate(45deg); }
}

.nav-links {
  display: flex;
  gap: 0.35rem;
  padding: 0.25rem;
  background: var(--surface-control);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.45rem;
  padding: 0 0.85rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  transition: all 0.25s var(--transition-smooth);
}

.nav-link:hover, .router-link-active {
  color: var(--accent-primary);
  background: rgba(0, 229, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(0, 229, 255, 0.18), 0 0 22px rgba(0, 229, 255, 0.08);
}

.theme-btn {
  display: grid;
  place-items: center;
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 6px;
  color: var(--text-primary);
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  transition: all 0.25s var(--transition-smooth);
}

.theme-btn:hover {
  color: var(--accent-secondary);
  border-color: var(--border-hot);
  transform: translateY(-2px);
  box-shadow: 0 0 24px rgba(182, 255, 59, 0.14);
}

.main {
  padding-top: 6.6rem;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .header {
    top: 0.75rem;
    width: calc(100% - 1rem);
  }
  .brand-text {
    display: none;
  }
  .nav-links span {
    display: none;
  }
  .nav-links {
    gap: 0.2rem;
  }
  .nav-link {
    padding: 0 0.65rem;
  }
  .main {
    padding-top: 5.8rem;
  }
}
</style>
