<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon, Home, BookOpen, User } from 'lucide-vue-next'

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
  <div class="bg-sparkle"></div>
  
  <nav class="navbar glass-effect">
    <div class="nav-content">
      <router-link to="/" class="logo">
        <span class="logo-dot"></span>
        Personal<span>Blog</span>
      </router-link>
      
      <div class="nav-links">
        <router-link to="/" class="nav-item">
          <Home :size="18" />
          <span>首页</span>
        </router-link>
        <router-link to="/posts" class="nav-item">
          <BookOpen :size="18" />
          <span>文章</span>
        </router-link>
        <router-link to="/about" class="nav-item">
          <User :size="18" />
          <span>关于我</span>
        </router-link>
      </div>
      
      <button @click="toggleTheme" class="theme-toggle" aria-label="Toggle Theme">
        <Moon v-if="isDark" :size="20" />
        <Sun v-else :size="20" />
      </button>
    </div>
  </nav>

  <main class="main-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="footer">
    <p>© {{ new Date().getFullYear() }} Personal Blog. Built with Vue 3.</p>
  </footer>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1000px;
  z-index: 1000;
  padding: 0.75rem 1.5rem;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo span {
  color: var(--accent-color);
}

.logo-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--accent-color);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-secondary);
  transition: all var(--transition-speed);
}

.nav-item:hover, .router-link-active {
  color: var(--accent-color);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 12px;
  background: var(--border-color);
  color: var(--text-primary);
  transition: all var(--transition-speed);
}

.theme-toggle:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.main-container {
  flex: 1;
  padding-top: 8rem;
  padding-bottom: 4rem;
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
