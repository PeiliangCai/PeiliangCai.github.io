<script setup>
import { Search, Filter, Calendar, Clock, ArrowRight } from 'lucide-vue-next'
import { ref, computed } from 'vue'

const posts = [
  {
    id: 1,
    title: '深入理解 Vue 3 组合式 API 的优势',
    excerpt: '组合式 API 不仅提供了更好的逻辑复用，还让大型项目的代码组织变得更加清晰。通过将功能相关的代码组织在一起，开发者可以更轻松地阅读和维护代码。',
    date: '2024-04-14',
    readTime: '8 min read',
    category: '技术',
    tags: ['Vue 3', 'Composition API']
  },
  {
    id: 2,
    title: '科研心得：如何高效阅读计算机顶会论文',
    excerpt: '作为本科生，面对复杂的顶会论文往往感到无从下手。本文总结了我一年多来的论文阅读经验，从三轮阅读法到如何构建自己的知识图谱。',
    date: '2024-04-10',
    readTime: '12 min read',
    category: '科研',
    tags: ['学术', '论文阅读']
  },
  {
    id: 3,
    title: '我的考研复习路线与心态建设',
    excerpt: '面对未来可能的学术深造，考研是一条重要的道路。这里记录了我准备基础数学与专业课的过程，以及如何在压力下保持良好的心态。',
    date: '2024-03-28',
    readTime: '15 min read',
    category: '生活',
    tags: ['考研', '成长']
  }
]

const searchQuery = ref('')
const selectedCategory = ref('全部')

const categories = ['全部', '技术', '科研', '生活']

const filteredPosts = computed(() => {
  return posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === '全部' || post.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <div class="posts-view">
    <header class="posts-header section">
      <h1 class="title">文章归档<span>.</span></h1>
      <p class="subtitle">记录学习，思考人生。</p>
    </header>

    <div class="posts-filter-bar section">
      <div class="search-box glass-effect">
        <Search :size="18" />
        <input v-model="searchQuery" type="text" placeholder="搜索文章标题或内容..." />
      </div>
      
      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="selectedCategory = cat"
          :class="{ active: selectedCategory === cat }"
          class="cat-tab"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="posts-list">
      <transition-group name="list">
        <article 
          v-for="post in filteredPosts" 
          :key="post.id" 
          class="post-item glass-effect"
        >
          <div class="post-meta">
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date"><Calendar :size="14" /> {{ post.date }}</span>
            <span class="post-time"><Clock :size="14" /> {{ post.readTime }}</span>
          </div>
          
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.excerpt }}</p>
          
          <div class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
          
          <div class="post-footer">
            <button class="read-more">
              阅读全文
              <ArrowRight :size="16" />
            </button>
          </div>
        </article>
      </transition-group>
      
      <div v-if="filteredPosts.length === 0" class="no-results">
        <p>没有找到相关文章，换个关键词试试吧。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.posts-header {
  margin-bottom: 3rem;
}

.title {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.title span {
  color: var(--accent-color);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.posts-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 4rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
  height: 3.5rem;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.category-tabs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cat-tab {
  padding: 0.6rem 1.5rem;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-speed);
}

.cat-tab:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.cat-tab.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  box-shadow: 0 5px 15px var(--accent-glow);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.post-item {
  padding: 2.5rem;
  transition: all var(--transition-speed);
}

.post-item:hover {
  transform: translateX(10px);
  border-color: var(--accent-color);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.post-category {
  color: var(--accent-color);
  font-weight: 700;
  text-transform: uppercase;
}

.post-date, .post-time {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.post-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.post-excerpt {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

.post-tags {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tag {
  font-size: 0.85rem;
  color: var(--accent-color);
  background: var(--accent-glow);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-color);
  font-weight: 600;
  font-size: 1rem;
}

.read-more:hover {
  gap: 0.8rem;
}

.no-results {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.5rem;
  }
}
</style>
