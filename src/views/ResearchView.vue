<script setup>
import { ref } from 'vue'
import { BookText, ChevronDown, ChevronUp, ExternalLink, Quote } from 'lucide-vue-next'

const papers = [
  {
    id: 1,
    title: 'Optimizing Retrieval-Augmented Generation with Agentic Self-Reflection Patterns',
    authors: ['Peiliang Cai', 'Zhang San', 'Li Si'],
    status: 'Under Review at ACM TOSEM',
    year: '2024',
    archImg: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
    abstract: '本文提出了一种新型的 Agentic RAG 框架，通过引入自我反思与动态规划机制，显著降低了幻觉率。实验结果表明，在复杂问答任务中准确率提升了 15.6%。'
  },
  {
    id: 2,
    title: 'A Survey on Modern Frontend Architectures for AI-Native Applications',
    authors: ['Wang Wu', 'Peiliang Cai'],
    status: 'Published in IEEE Software',
    year: '2023',
    archImg: 'https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=400',
    abstract: '探讨了在大模型时代，前端架构如何演进以适配高延迟、流式输出与本地推理等新特性。'
  }
]

const expandedAbstracts = ref(new Set())

const toggleAbstract = (id) => {
  if (expandedAbstracts.value.has(id)) {
    expandedAbstracts.value.delete(id)
  } else {
    expandedAbstracts.value.add(id)
  }
}

const showModal = ref(false)
const modalImg = ref('')

const openImage = (url) => {
  modalImg.value = url
  showModal.value = true
}
</script>

<template>
  <div class="research-container animate-fade-in">
    <header class="academic-header">
      <h1 class="scholar-name">Peiliang Cai (蔡培梁)</h1>
      <p class="affiliation">Undergraduate Student @ Computer Science</p>
      <div class="scholar-links">
        <a href="#"><Quote :size="14" /> Google Scholar</a>
        <a href="#"><BookText :size="14" /> DBLP</a>
      </div>
    </header>

    <section class="publications">
      <h3 class="section-subtitle">Selected Publications</h3>
      
      <div class="paper-card" v-for="paper in papers" :key="paper.id">
        <div class="paper-main">
          <div class="paper-content">
            <h4 class="paper-title">{{ paper.title }}</h4>
            <div class="authors">
              <span v-for="(author, idx) in paper.authors" :key="author" :class="{ 'me': author === 'Peiliang Cai' }">
                {{ author }}{{ idx < paper.authors.length - 1 ? ', ' : '' }}
              </span>
            </div>
            <div class="paper-meta">
              <span class="status-tag">{{ paper.status }}</span>
              <span class="year">{{ paper.year }}</span>
            </div>
            
            <div class="paper-actions">
              <button @click="toggleAbstract(paper.id)" class="action-btn">
                Abstract 
                <ChevronDown v-if="!expandedAbstracts.has(paper.id)" :size="16" />
                <ChevronUp v-else :size="16" />
              </button>
              <a href="#" class="action-btn"><ExternalLink :size="16" /> PDF</a>
            </div>
          </div>

          <div class="paper-visual" @click="openImage(paper.archImg)">
            <img :src="paper.archImg" alt="Architecture" />
            <div class="zoom-overlay">🔍 核心架构 (Overview)</div>
          </div>
        </div>

        <transition name="collapse">
          <div v-if="expandedAbstracts.has(paper.id)" class="abstract-body glass">
            {{ paper.abstract }}
          </div>
        </transition>
      </div>
    </section>

    <!-- Image Modal -->
    <teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content animate-fade-in">
          <img :src="modalImg" class="large-img" />
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.research-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.academic-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2rem;
  margin-bottom: 4rem;
}

.scholar-name {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.affiliation {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.scholar-links {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.scholar-links a {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-left: 4px solid var(--accent-primary);
  padding-left: 1rem;
  margin-bottom: 2.5rem;
}

.paper-card {
  margin-bottom: 3rem;
}

.paper-main {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.paper-content {
  flex: 1;
}

.paper-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.authors {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.me {
  font-weight: 800;
  text-decoration: underline;
  color: var(--text-primary);
}

.paper-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-tag {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-primary);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
}

.year {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.paper-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.paper-visual {
  width: 150px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: zoom-in;
  border: 1px solid var(--border-color);
}

.paper-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.zoom-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.paper-visual:hover .zoom-overlay {
  opacity: 1;
}

.paper-visual:hover img {
  transform: scale(1.1);
}

.abstract-body {
  margin-top: 1rem;
  padding: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.large-img {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 12px;
}

@media (max-width: 600px) {
  .paper-main {
    flex-direction: column-reverse;
  }
  .paper-visual {
    width: 100%;
    height: 150px;
  }
}
</style>
