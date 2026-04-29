<script setup>
import { ref, watch, onUpdated } from 'vue'
import { ArrowLeft, ExternalLink } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import { createBlogLoadersById, parseFrontmatter } from '../utils/blog'

import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-bash'

const props = defineProps({
  id: String
})

const router = useRouter()
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const page = ref(null)
const htmlContent = ref('')
const modules = import.meta.glob('../wiki/*.md', { query: '?raw', import: 'default' })
const pagesById = createBlogLoadersById(modules)

const loadPage = async () => {
  try {
    const loader = pagesById[props.id]
    if (!loader) {
      page.value = null
      htmlContent.value = ''
      router.push('/wiki')
      return
    }

    const rawContent = await loader()
    const { data, content } = parseFrontmatter(rawContent)
    page.value = data
    htmlContent.value = md.render(content)
    setTimeout(() => Prism.highlightAll(), 0)
  } catch (error) {
    console.error('Error loading wiki page:', error)
    router.push('/wiki')
  }
}

watch(() => props.id, loadPage, { immediate: true })
onUpdated(() => {
  Prism.highlightAll()
})

const goBack = () => router.push('/wiki')
</script>

<template>
  <div v-if="page" class="wiki-detail-container animate-fade-in">
    <button @click="goBack" class="back-btn">
      <ArrowLeft :size="20" /> Back to Wiki
    </button>

    <header class="wiki-header">
      <div class="meta geek-font">
        <span>{{ page.category || 'Wiki' }}</span>
        <span v-if="page.updated" class="sep">/</span>
        <span v-if="page.updated">{{ page.updated }}</span>
      </div>
      <h1>{{ page.title }}</h1>
      <p v-if="page.summary">{{ page.summary }}</p>
      <a v-if="page.source" :href="page.source" target="_blank" class="source-link">
        <ExternalLink :size="16" /> Source
      </a>
    </header>

    <div class="markdown-body glass" v-html="htmlContent"></div>
  </div>
</template>

<style>
.wiki-detail-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 3rem;
  padding: 0.58rem 0.8rem;
  width: fit-content;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.25s var(--transition-smooth);
}

.back-btn:hover {
  color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.wiki-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.wiki-header .meta {
  color: var(--accent-secondary);
  font-size: 0.85rem;
  font-weight: 900;
  margin-bottom: 1rem;
}

.wiki-header .sep {
  margin: 0 0.75rem;
  opacity: 0.3;
}

.wiki-header h1 {
  font-size: clamp(2.2rem, 6vw, 4.2rem);
  font-weight: 950;
  line-height: 0.98;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
}

.wiki-header p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--accent-primary);
  font-weight: 800;
}

.markdown-body {
  padding: clamp(1.35rem, 4vw, 3rem);
  line-height: 1.8;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 800;
  color: var(--accent-primary);
}

.markdown-body p,
.markdown-body li {
  color: var(--text-secondary);
}

.markdown-body p {
  margin-bottom: 1.5rem;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.markdown-body code:not(pre code) {
  color: var(--accent-secondary);
  background: rgba(182, 255, 59, 0.08);
  border: 1px solid rgba(182, 255, 59, 0.18);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

@media (max-width: 640px) {
  .wiki-detail-container {
    padding-inline: 1rem;
  }
}
</style>
