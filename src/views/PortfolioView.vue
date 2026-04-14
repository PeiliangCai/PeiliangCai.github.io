<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules'
import { Github, ExternalLink, X, ChevronRight } from 'lucide-vue-next'

import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const modules = [EffectCoverflow, Pagination, Navigation]

const coreProjects = [
  {
    id: 1,
    title: 'Agentic RAG Engine',
    desc: '基于多智能体协作的检索增强生成系统，支持动态规划与自我反思。',
    tags: ['Python', 'LangChain', 'Vue 3'],
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    details: {
      logic: '通过递归式推理引擎替代传统的单次检索，大幅提升复杂问题的回答准确率。',
      arch: 'Multi-Agent Orchestration -> Shared Memory -> Self-RAG loop',
      videoUrl: '#'
    }
  },
  {
    id: 2,
    title: 'Neo-Vite Dashboard',
    desc: '自研的高性能前端监控与性能仪表盘，支持实时日志流分析。',
    tags: ['Vite', 'Three.js', 'WebWorker'],
    img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
    details: {
      logic: '利用 OffscreenCanvas 和 WebWorkers 处理高频数据渲染，确保 60FPS 的平滑体验。',
      arch: 'Event Bus -> Data Processing Worker -> Canvas Renderer',
      videoUrl: '#'
    }
  }
]

const otherProjects = [
  { title: 'Mini-Search Engine', link: 'https://github.com' },
  { title: 'Concurrent TCP Server', link: 'https://github.com' },
  { title: 'Image Transformer', link: 'https://github.com' }
]

const selectedProject = ref(null)

const openProject = (project) => {
  selectedProject.value = project
}

const closeProject = () => {
  selectedProject.value = null
}
</script>

<template>
  <div class="portfolio-container animate-fade-in">
    <header class="page-header">
      <h1 class="section-title">Core Projects<span>.</span></h1>
    </header>

    <!-- Core Rotating Carousel -->
    <div class="swiper-wrapper">
      <swiper
        :effect="'coverflow'"
        :grabCursor="true"
        :centeredSlides="true"
        :slidesPerView="'auto'"
        :coverflowEffect="{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }"
        :pagination="true"
        :navigation="true"
        :modules="modules"
        class="mySwiper"
      >
        <swiper-slide v-for="p in coreProjects" :key="p.id" class="project-slide">
          <div class="card glass" @click="openProject(p)">
            <img :src="p.img" alt="Project cover" class="card-img" />
            <div class="card-overlay">
              <h3>{{ p.title }}</h3>
              <div class="tags">
                <span v-for="tag in p.tags" :key="tag">{{ tag }}</span>
              </div>
              <p>{{ p.desc }}</p>
              <button class="expand-btn">查看详情 <ChevronRight :size="16" /></button>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Expanding Panel -->
    <transition name="expand">
      <div v-if="selectedProject" class="detail-panel glass">
        <button class="close-panel" @click="closeProject"><X :size="20" /></button>
        <div class="panel-content">
          <div class="panel-main">
            <h2>{{ selectedProject.title }}</h2>
            <div class="panel-section">
              <h4>业务逻辑 (Business Logic)</h4>
              <p>{{ selectedProject.details.logic }}</p>
            </div>
            <div class="panel-section">
              <h4>架构路径 (Architecture)</h4>
              <div class="arch-box geek-font">{{ selectedProject.details.arch }}</div>
            </div>
          </div>
          <div class="panel-visual">
            <div class="video-placeholder">
              <span>实机演示视频 (Video Demo)</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Other Works -->
    <section class="other-works">
      <h2 class="sub-title">Other Works</h2>
      <div class="works-grid">
        <a v-for="w in otherProjects" :key="w.title" :href="w.link" target="_blank" class="work-link glass">
          <span>{{ w.title }}</span>
          <Github :size="16" />
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.portfolio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.swiper-wrapper {
  padding: 4rem 0;
}

.project-slide {
  width: 400px;
  height: 500px;
}

.card {
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
}

.card-overlay h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tags span {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: var(--accent-primary);
  border-radius: 4px;
  font-weight: 600;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  color: var(--accent-secondary);
  font-weight: bold;
  font-size: 0.9rem;
}

/* Detail Panel */
.detail-panel {
  position: relative;
  margin-top: 2rem;
  padding: 3rem;
  animation: slideDown 0.5s var(--transition-smooth);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.close-panel {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--text-secondary);
}

.panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.panel-section {
  margin-top: 2rem;
}

.panel-section h4 {
  color: var(--accent-secondary);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.arch-box {
  background: #000;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px dashed var(--border-color);
  font-size: 0.85rem;
  color: var(--accent-secondary);
}

.video-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: #1a1b26;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

/* Other Works */
.other-works {
  margin-top: 6rem;
}

.sub-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.work-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  transition: all 0.3s;
}

.work-link:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

@media (max-width: 900px) {
  .panel-content {
    grid-template-columns: 1fr;
  }
  .project-slide {
    width: 300px;
  }
}
</style>
