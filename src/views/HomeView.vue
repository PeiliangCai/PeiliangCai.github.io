<script setup>
import { ArrowRight, Code, GraduationCap, Github } from 'lucide-vue-next'
</script>

<template>
  <div class="home-view">
    <header class="hero section">
      <div class="hero-image-wrapper">
        <div class="hero-image-glow"></div>
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" class="hero-avatar" />
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title">
          你好，我是<span>开发者</span>
        </h1>
        <p class="hero-subtitle">
          专注前端开发与算法研究，目前就读于本科。在这里分享我的学术心得与技术实践。
        </p>
        
        <div class="hero-actions">
          <router-link to="/posts" class="btn btn-primary">
            阅读文章
            <ArrowRight :size="18" />
          </router-link>
          <router-link to="/about" class="btn btn-secondary">
            关于我
          </router-link>
        </div>
      </div>
    </header>

    <section class="quick-stats section">
      <div class="stat-card glass-effect">
        <GraduationCap :size="24" class="stat-icon" />
        <div class="stat-info">
          <h3>本科在读</h3>
          <p>计算机科学与技术</p>
        </div>
      </div>
      <div class="stat-card glass-effect">
        <Code :size="24" class="stat-icon" />
        <div class="stat-info">
          <h3>技术栈</h3>
          <p>Vue 3, React, Node.js</p>
        </div>
      </div>
      <div class="stat-card glass-effect">
        <Github :size="24" class="stat-icon" />
        <div class="stat-info">
          <h3>开源贡献</h3>
          <p>分享与成长</p>
        </div>
      </div>
    </section>

    <section class="recent-posts section">
      <div class="section-header">
        <h2>最新文章</h2>
        <router-link to="/posts" class="view-all">查看全部</router-link>
      </div>
      
      <div class="post-grid">
        <div class="post-card glass-effect" v-for="i in 2" :key="i">
          <div class="post-tag">技术</div>
          <h3>深入理解 Vue 3 组合式 API 的优势</h3>
          <p>组合式 API 不仅提供了更好的逻辑复用，还让大型项目的代码组织变得更加清晰...</p>
          <div class="post-footer">
            <span>2024-04-14</span>
            <ArrowRight :size="16" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 4rem;
  margin-bottom: 6rem;
}

.hero-image-wrapper {
  position: relative;
  flex-shrink: 0;
}

.hero-avatar {
  width: 180px;
  height: 180px;
  border-radius: 40px;
  background: var(--card-bg);
  padding: 1rem;
  border: 4px solid var(--border-color);
  position: relative;
  z-index: 2;
}

.hero-image-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140%;
  height: 140%;
  background: var(--accent-glow);
  filter: blur(40px);
  border-radius: 50%;
  z-index: 1;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.hero-title span {
  background: linear-gradient(135deg, var(--accent-color), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all var(--transition-speed);
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  box-shadow: 0 10px 20px var(--accent-glow);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px var(--accent-glow);
}

.btn-secondary {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-color);
  transform: translateY(-3px);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 6rem;
}

.stat-card {
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  color: var(--accent-color);
  background: var(--accent-glow);
  padding: 0.75rem;
  box-sizing: content-box;
  border-radius: 12px;
}

.stat-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.stat-info p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.view-all {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.post-card {
  padding: 2rem;
  transition: all var(--transition-speed);
  position: relative;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-color);
}

.post-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--accent-glow);
  color: var(--accent-color);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.post-card h3 {
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.post-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
  .quick-stats {
    grid-template-columns: 1fr;
  }
  .post-grid {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>
