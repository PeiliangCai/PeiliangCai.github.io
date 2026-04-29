<script setup>
import { onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules'
import { Github, X, ChevronRight } from 'lucide-vue-next'
import projectsData from '../data/projects.json'
import { attachGithubRepos } from '../utils/github'

import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const modules = [EffectCoverflow, Pagination, Navigation]
const coreProjects = ref(projectsData.coreProjects)
const otherProjects = projectsData.otherProjects

const selectedProject = ref(null)

const openProject = (project) => {
  selectedProject.value = project
}

const closeProject = () => {
  selectedProject.value = null
}

onMounted(async () => {
  coreProjects.value = await attachGithubRepos(projectsData.coreProjects, projectsData.github)
})
</script>

<template>
  <div class="portfolio-container animate-fade-in">
    <header class="page-header">
      <p class="page-kicker geek-font">{{ projectsData.page.kicker }}</p>
      <h1 class="section-title">{{ projectsData.page.title }}<span>.</span></h1>
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
              <span class="project-code geek-font">PROJECT_0{{ p.id }}</span>
              <h3>{{ p.title }}</h3>
              <div class="tags">
                <span v-for="tag in p.tags" :key="tag">{{ tag }}</span>
              </div>
              <div v-if="p.github" class="github-meta geek-font">
                <span v-if="p.github.language">{{ p.github.language }}</span>
                <span v-if="p.github.stars !== null">★ {{ p.github.stars }}</span>
                <span v-if="p.github.forks !== null">⑂ {{ p.github.forks }}</span>
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
            <div v-if="selectedProject.github" class="panel-section">
              <h4>Repository</h4>
              <a :href="selectedProject.github.url" target="_blank" class="repo-link glass">
                <Github :size="16" />
                <span>{{ selectedProject.github.fullName }}</span>
              </a>
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
  padding: 3rem 2rem 5rem;
}

.page-header {
  margin-bottom: 1rem;
}

.page-kicker {
  color: var(--accent-secondary);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  margin-bottom: 0.75rem;
}

.swiper-wrapper {
  padding: 3rem 0 4.5rem;
  border-block: 1px solid rgba(0, 229, 255, 0.1);
}

.project-slide {
  width: min(410px, 76vw);
  height: 520px;
}

.card {
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.35s var(--transition-smooth), border-color 0.35s var(--transition-smooth);
  background: var(--surface-media);
}

.card:hover {
  transform: translateY(-10px);
  border-color: var(--border-hot);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.52;
  filter: saturate(1.2) contrast(1.15);
  transition: transform 0.7s var(--transition-smooth), opacity 0.35s var(--transition-smooth);
}

.card:hover .card-img {
  opacity: 0.66;
  transform: scale(1.06);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  color: #f2fbff;
  background: linear-gradient(to top, rgba(2, 4, 9, 0.98), rgba(2, 4, 9, 0.62), transparent);
}

.project-code {
  display: inline-flex;
  margin-bottom: 0.8rem;
  color: var(--accent-secondary);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.card-overlay h3 {
  font-size: 1.65rem;
  line-height: 1.05;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.card-overlay p {
  color: #c8d7e2;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tags span {
  font-size: 0.7rem;
  padding: 0.24rem 0.52rem;
  color: var(--accent-primary);
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 4px;
  font-weight: 800;
}

.github-meta {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-bottom: 0.9rem;
  color: var(--accent-secondary);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  color: var(--accent-secondary);
  font-weight: bold;
  font-size: 0.9rem;
  transition: transform 0.25s var(--transition-smooth);
}

.card:hover .expand-btn {
  transform: translateX(6px);
}

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
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: grid;
  place-items: center;
  transition: all 0.25s var(--transition-smooth);
}

.close-panel:hover {
  color: var(--danger-glow);
  border-color: var(--danger-glow);
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
  background: var(--surface-inset);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px dashed var(--border-hot);
  font-size: 0.85rem;
  color: var(--accent-secondary);
  overflow-wrap: anywhere;
}

.repo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  color: var(--accent-primary);
  font-size: 0.9rem;
  transition: all 0.25s var(--transition-smooth);
}

.repo-link:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
  transform: translateY(-2px);
}

.video-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background:
    linear-gradient(135deg, rgba(0, 229, 255, 0.13), transparent),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 12px),
    var(--surface-media);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

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
  min-height: 4.25rem;
  transition: all 0.3s var(--transition-smooth);
}

.work-link:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-hot);
}

@media (max-width: 900px) {
  .panel-content {
    grid-template-columns: 1fr;
  }
  .project-slide {
    width: min(330px, 82vw);
    height: 460px;
  }
}
</style>
