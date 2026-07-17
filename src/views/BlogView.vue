<script setup>
import { computed, ref, onMounted } from 'vue'
import { Search, Calendar, ChevronRight } from 'lucide-vue-next'
import siteData from '../data/site.json'
import { filterContentItems, getCategoriesFromPosts, loadBlogSummaries } from '../utils/blog'

const blogs = ref([])
const categories = ref(['全部'])
const selectedCategory = ref('全部')
const searchQuery = ref('')

onMounted(async () => {
  const modules = import.meta.glob('../blogs/*.md', { query: '?raw', import: 'default' })
  blogs.value = await loadBlogSummaries(modules)
  categories.value = getCategoriesFromPosts(blogs.value)
})

const filteredBlogs = computed(() => filterContentItems(blogs.value, searchQuery.value, selectedCategory.value))
</script>

<template>
  <div class="blog-container animate-fade-in">
    <header class="page-header">
      <p class="page-kicker geek-font">{{ siteData.pages.blog.kicker }}</p>
      <h1 class="section-title">{{ siteData.pages.blog.title }}<span>.</span></h1>
      <div class="knowledge-switch">
        <router-link to="/blog" class="switch-link active">Articles</router-link>
        <router-link to="/wiki" class="switch-link">LLM Wiki</router-link>
      </div>
    </header>

    <div class="blog-layout">
      <!-- Sidebar / Filters -->
      <aside class="blog-sidebar">
        <div class="search-box glass">
          <Search :size="18" />
          <input v-model="searchQuery" type="text" placeholder="Search posts..." aria-label="Search blog posts" />
        </div>

        <div class="filter-section">
          <h4>Categories</h4>
          <div class="cat-list">
            <button 
              v-for="cat in categories" 
              :key="cat"
              @click="selectedCategory = cat"
              :class="{ 'active': selectedCategory === cat }"
              class="cat-item"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Feed -->
      <main class="blog-feed">
        <div class="feed-meta geek-font">{{ filteredBlogs.length }} POSTS INDEXED</div>
        <div v-if="filteredBlogs.length === 0" class="empty">No posts found.</div>
        
        <router-link 
          v-for="post in filteredBlogs" 
          :key="post.id"
          :to="`/blog/${post.id}`"
          class="post-card glass"
        >
          <div class="post-header">
            <span class="post-cat"># {{ post.category || 'Article' }}</span>
            <span v-if="post.date" class="post-date"><Calendar :size="14" /> {{ post.date }}</span>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
          <div v-if="post.tags?.length" class="post-tags">
            <span v-for="tag in post.tags || []" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="read-more">
            Read Post <ChevronRight :size="16" />
          </div>
        </router-link>
      </main>
    </div>
  </div>
</template>

<style scoped>
.blog-container {
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

.blog-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 4rem;
  margin-top: 3rem;
}

.blog-sidebar {
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

.blog-feed {
  min-width: 0;
}

.feed-meta {
  margin-bottom: 1rem;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.empty {
  padding: 2rem;
  color: var(--text-secondary);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  background: var(--surface-panel-soft);
}

.search-box input {
  background: none;
  border: none;
  color: var(--text-primary);
  outline: none;
  width: 100%;
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

.cat-item:hover, .cat-item.active {
  background: rgba(0, 229, 255, 0.07);
  border-color: var(--border-color);
  color: var(--accent-primary);
}

.post-card {
  display: block;
  position: relative;
  padding: 2rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s var(--transition-smooth);
}

.post-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--transition-smooth);
}

.post-card:hover {
  transform: translateX(8px);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.post-card:hover::after {
  transform: scaleX(1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.post-cat {
  color: var(--accent-primary);
  font-weight: 700;
}

.post-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.post-title {
  font-size: clamp(1.35rem, 3vw, 1.95rem);
  line-height: 1.16;
  font-weight: 800;
  margin-bottom: 0.9rem;
}

.post-summary {
  max-width: 720px;
  margin-bottom: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.35rem;
}

.tag {
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
  font-weight: 700;
  color: var(--accent-secondary);
  transition: transform 0.25s var(--transition-smooth);
}

.post-card:hover .read-more {
  transform: translateX(6px);
}

@media (max-width: 900px) {
  .blog-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .blog-sidebar {
    position: static;
    gap: 1.25rem;
  }
  .cat-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    scrollbar-width: thin;
  }
  .cat-item {
    flex: 0 0 auto;
    white-space: nowrap;
  }
  .post-header {
    flex-direction: column;
    gap: 0.45rem;
  }
}
</style>
