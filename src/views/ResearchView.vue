<script setup>
import { computed, ref } from 'vue'
import { BookText, ChevronDown, ChevronUp, ExternalLink, Quote } from 'lucide-vue-next'
import researchData from '../data/research.json'

const iconMap = {
  book: BookText,
  quote: Quote
}

const papers = researchData.papers
const validScholarLinks = computed(() => researchData.header.links.filter(link => link.url && link.url !== '#'))

const hasValidPdf = (paper) => paper.pdfUrl && paper.pdfUrl !== '#'
const getAuthorName = (author) => author.replace(/\*+$/, '')
const isCoFirstAuthor = (paper, author) => paper.coFirstAuthors?.includes(getAuthorName(author)) || author.endsWith('*')
const shouldHighlightAuthor = (author) => getAuthorName(author) === researchData.header.name

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
      <p class="lab-code geek-font">{{ researchData.header.kicker }}</p>
      <h1 class="scholar-name">{{ researchData.header.name }}</h1>
      <p class="affiliation">{{ researchData.header.affiliation }}</p>
      <div v-if="validScholarLinks.length" class="scholar-links">
        <a v-for="link in validScholarLinks" :key="link.label" :href="link.url" target="_blank">
          <component :is="iconMap[link.icon] || ExternalLink" :size="14" /> {{ link.label }}
        </a>
      </div>
    </header>

    <section class="publications">
      <h3 class="section-subtitle">{{ researchData.sectionTitle }}</h3>
      
      <div class="paper-card" v-for="paper in papers" :key="paper.id">
        <div class="paper-main">
          <div class="paper-content">
            <h4 class="paper-title">{{ paper.title }}</h4>
            <div class="authors">
              <span v-for="(author, idx) in paper.authors" :key="author" :class="{ 'me': shouldHighlightAuthor(author) }">
                {{ getAuthorName(author) }}<sup v-if="isCoFirstAuthor(paper, author)">*</sup>{{ idx < paper.authors.length - 1 ? ', ' : '' }}
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
              <a v-if="hasValidPdf(paper)" :href="paper.pdfUrl" target="_blank" class="action-btn"><ExternalLink :size="16" /> PDF</a>
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
  max-width: 980px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
}

.academic-header {
  position: relative;
  padding: 2rem;
  margin-bottom: 4rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(0, 229, 255, 0.09), transparent 42%),
    var(--surface-panel);
  box-shadow: var(--shadow-cyber);
}

.lab-code {
  color: var(--accent-secondary);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  margin-bottom: 1rem;
}

.scholar-name {
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 950;
  line-height: 0.92;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
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
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-control);
  transition: all 0.25s var(--transition-smooth);
}

.scholar-links a:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-primary);
  border-left: 4px solid var(--accent-secondary);
  padding-left: 1rem;
  margin-bottom: 2.5rem;
  letter-spacing: 0.08em;
}

.paper-card {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid rgba(0, 229, 255, 0.12);
  border-radius: 8px;
  background: var(--surface-panel-soft);
  transition: all 0.3s var(--transition-smooth);
}

.paper-card:hover {
  border-color: var(--border-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-cyber);
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
  font-size: 1.35rem;
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
  color: var(--accent-secondary);
}

.paper-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-tag {
  background: rgba(0, 229, 255, 0.08);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 229, 255, 0.18);
  padding: 0.16rem 0.55rem;
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
  transition: all 0.25s var(--transition-smooth);
}

.action-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.paper-visual {
  width: 180px;
  height: 118px;
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
  background: rgba(0, 0, 0, 0.72);
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
  background: rgba(0, 229, 255, 0.045);
}

.large-img {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

@media (max-width: 600px) {
  .paper-main {
    flex-direction: column-reverse;
  }
  .paper-visual {
    width: 100%;
    height: 150px;
  }
  .scholar-links {
    flex-wrap: wrap;
  }
}
</style>
