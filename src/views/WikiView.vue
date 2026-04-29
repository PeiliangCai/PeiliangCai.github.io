<script setup>
import { ref, onMounted } from 'vue'
import { BookOpen, Calendar, ChevronRight, Search } from 'lucide-vue-next'
import { getCategoriesFromPosts, loadMarkdownSummaries } from '../utils/blog'

const pages = ref([])
const categories = ref(['全部'])
const selectedCategory = ref('全部')
const searchQuery = ref('')

onMounted(async () => {
  const modules = import.meta.glob('../wiki/*.md', { query: '?raw', import: 'default' })
  pages.value = await loadMarkdownSummaries(modules)
  categories.value = getCategoriesFromPosts(pages.value)
})

const filteredPages = () => pages.value.filter(page => {
  const query = searchQuery.value.toLowerCase()
  const matchesSearch = page.title?.toLowerCase().includes(query) || page.summary?.toLowerCase().includes(query)
  const matchesCategory = selectedCategory.value === '全部' || page.category === selectedCategory.value
  return matchesSearch && matchesCategory
})
</script>

<template>
  <div class="wiki-container animate-fade-in">
    <header class="page-header">
      <p class="page-kicker geek-font">LLM-WIKI // KNOWLEDGE GRAPH</p>
      <h1 class="section-title">Wiki<span>.</span></h1>
      <div class="knowledge-switch">
        <router-link to="/blog" class="switch-link">Articles</router-link>
        <router-link to="/wiki" class="switch-link active">LLM Wiki</router-link>
      </div>
    </header>

    <div class="wiki-layout">
      <aside class="wiki-sidebar">
        <div class="search-box glass">
          <Search :size="18" />
          <input v-model="searchQuery" type="text" placeholder="Search wiki..." />
        </div>

        <div class="filter-section">
          <h4>Categories</h4>
          <div class="cat-list">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="{ active: selectedCategory === cat }"
              class="cat-item"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </aside>

      <main class="wiki-feed">
        <div v-if="filteredPages().length === 0" class="empty">No wiki pages found.</div>

        <router-link
          v-for="page in filteredPages()"
          :key="page.id"
          :to="`/wiki/${page.id}`"
          class="wiki-card glass"
        >
          <div class="wiki-card-meta">
            <span class="wiki-cat"><BookOpen :size="14" /> {{ page.category || 'Wiki' }}</span>
            <span v-if="page.updated" class="wiki-date"><Calendar :size="14" /> {{ page.updated }}</span>
          </div>
          <h2>{{ page.title }}</h2>
          <p v-if="page.summary">{{ page.summary }}</p>
          <div class="wiki-tags">
            <span v-for="tag in page.tags || []" :key="tag">{{ tag }}</span>
          </div>
          <div class="read-more">
            Open Node <ChevronRight :size="16" />
          </div>
        </router-link>
      </main>
    </div>
  </div>
</template>

<style scoped>
.wiki-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
}

.page-kicker {
  color: var(--accent-secondary);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  margin-bottom: 0.75rem;
}

.knowledge-switch {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.3rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-control);
}

.switch-link {
  padding: 0.55rem 0.85rem;
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 800;
  font-size: 0.85rem;
  transition: all 0.25s var(--transition-smooth);
}

.switch-link:hover,
.switch-link.active {
  color: var(--accent-primary);
  background: rgba(0, 229, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(0, 229, 255, 0.16);
}

.wiki-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 4rem;
  margin-top: 3rem;
}

.wiki-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: sticky;
  top: 7rem;
  align-self: start;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  color: var(--accent-primary);
}

.search-box input {
  width: 100%;
  color: var(--text-primary);
  background: none;
  border: 0;
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.filter-section h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cat-item {
  text-align: left;
  padding: 0.72rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: all 0.25s var(--transition-smooth);
}

.cat-item:hover,
.cat-item.active {
  background: rgba(0, 229, 255, 0.07);
  border-color: var(--border-color);
  color: var(--accent-primary);
}

.wiki-card {
  display: block;
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s var(--transition-smooth);
}

.wiki-card:hover {
  transform: translateX(8px);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.wiki-card-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.wiki-cat,
.wiki-date {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.wiki-cat {
  color: var(--accent-primary);
  font-weight: 800;
}

.wiki-card h2 {
  font-size: clamp(1.35rem, 3vw, 1.95rem);
  line-height: 1.16;
  margin-bottom: 1rem;
}

.wiki-card p {
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.wiki-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.wiki-tags span {
  font-size: 0.75rem;
  padding: 0.24rem 0.6rem;
  color: var(--accent-secondary);
  background: rgba(182, 255, 59, 0.055);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 800;
  color: var(--accent-secondary);
}

@media (max-width: 900px) {
  .wiki-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .wiki-sidebar {
    position: static;
  }
}
</style>
