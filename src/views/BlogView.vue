<script setup>
import { ref, onMounted } from 'vue'
import { Search, Tag, Calendar, ChevronRight } from 'lucide-vue-next'

const blogs = ref([])
const categories = ref(['全部', '大模型工程', '前端架构', '踩坑记录'])
const selectedCategory = ref('全部')
const searchQuery = ref('')

// Utility: Lightweight frontmatter parser (Browser-safe)
const parseFrontmatter = (content) => {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(fmRegex)
  if (!match) return { data: {}, content }
  
  const yamlStr = match[1]
  const data = {}
  yamlStr.split('\n').forEach(line => {
    const [key, ...valParts] = line.split(':')
    if (key && valParts.length > 0) {
      let val = valParts.join(':').trim()
      // Basic array parsing [a, b, c]
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim())
      }
      data[key.trim()] = val
    }
  })
  
  return { data, content: content.replace(fmRegex, '') }
}

onMounted(async () => {
  const modules = import.meta.glob('../blogs/*.md', { query: '?raw', import: 'default' })
  
  // Load all raw content in parallel
  const postPromises = Object.entries(modules).map(async ([path, loader]) => {
    const rawContent = await loader()
    const { data } = parseFrontmatter(rawContent)
    const id = path.split('/').pop().replace('.md', '')
    return data.title ? { id, ...data } : null
  })
  
  const results = await Promise.all(postPromises)
  blogs.value = results.filter(p => p !== null).sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filteredBlogs = () => {
  return blogs.value.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === '全部' || post.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
}
</script>

<template>
  <div class="blog-container animate-fade-in">
    <header class="page-header">
      <h1 class="section-title">Knowledge Base<span>.</span></h1>
    </header>

    <div class="blog-layout">
      <!-- Sidebar / Filters -->
      <aside class="blog-sidebar">
        <div class="search-box glass">
          <Search :size="18" />
          <input v-model="searchQuery" type="text" placeholder="Search posts..." />
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
        <div v-if="filteredBlogs().length === 0" class="empty">No posts found.</div>
        
        <router-link 
          v-for="post in filteredBlogs()" 
          :key="post.id"
          :to="`/blog/${post.id}`"
          class="post-card glass"
        >
          <div class="post-header">
            <span class="post-cat"># {{ post.category }}</span>
            <span class="post-date"><Calendar :size="14" /> {{ post.date }}</span>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <div class="post-tags">
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
  padding: 2rem;
}

.blog-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 4rem;
  margin-top: 3rem;
}

.blog-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
}

.search-box input {
  background: none;
  border: none;
  color: var(--text-primary);
  outline: none;
  width: 100%;
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
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.3s;
}

.cat-item:hover, .cat-item.active {
  background: var(--border-color);
  color: var(--accent-primary);
}

.post-card {
  display: block;
  padding: 2.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s var(--transition-smooth);
}

.post-card:hover {
  transform: translateX(10px);
  border-color: var(--accent-primary);
}

.post-header {
  display: flex;
  justify-content: space-between;
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
}

.post-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
}

.post-tags {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  color: var(--accent-secondary);
}

@media (max-width: 900px) {
  .blog-layout {
    grid-template-columns: 1fr;
  }
}
</style>
