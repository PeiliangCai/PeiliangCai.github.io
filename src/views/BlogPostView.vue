<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import { ArrowLeft, Calendar, Tag, Clipboard, Check } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'

// Prism components
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

const post = ref(null)
const htmlContent = ref('')
const copied = ref({})

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
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim())
      }
      data[key.trim()] = val
    }
  })
  
  return { data, content: content.replace(fmRegex, '') }
}

const loadPost = async () => {
  try {
    const modules = import.meta.glob('../blogs/*.md', { query: '?raw', import: 'default' })
    const path = `../blogs/${props.id}.md`
    
    if (modules[path]) {
      const rawContent = await modules[path]()
      const { data, content } = parseFrontmatter(rawContent)
      post.value = data
      htmlContent.value = md.render(content)
      
      // Highlight code after next tick
      setTimeout(() => {
        Prism.highlightAll()
        attachCopyButtons()
      }, 0)
    } else {
      router.push('/blog')
    }
  } catch (e) {
    console.error('Error loading post:', e)
    router.push('/blog')
  }
}

const attachCopyButtons = () => {
  const preBlocks = document.querySelectorAll('pre')
  preBlocks.forEach((pre, index) => {
    if (pre.querySelector('.copy-btn')) return
    
    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.innerHTML = 'Copy'
    btn.onclick = () => copyCode(pre.textContent, index)
    pre.appendChild(btn)
  })
}

const copyCode = (text, index) => {
  navigator.clipboard.writeText(text.replace('Copy', '').trim())
  copied.value[index] = true
  setTimeout(() => copied.value[index] = false, 2000)
}

onMounted(loadPost)
onUpdated(() => {
  Prism.highlightAll()
})

const goBack = () => router.push('/blog')
</script>

<template>
  <div v-if="post" class="post-detail-container animate-fade-in">
    <button @click="goBack" class="back-btn">
      <ArrowLeft :size="20" /> Back to Feed
    </button>

    <header class="post-header">
      <div class="meta geek-font">
        <span class="cat">{{ post.category }}</span>
        <span class="sep">/</span>
        <span class="date">{{ post.date }}</span>
      </div>
      <h1 class="title">{{ post.title }}</h1>
      <div class="tags">
        <span v-for="tag in post.tags || []" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </header>

    <div class="markdown-body glass" v-html="htmlContent"></div>
  </div>
</template>

<style>
/* ... same styles as before ... */
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 3rem;
  transition: color 0.3s;
}

.back-btn:hover {
  color: var(--accent-primary);
}

.post-header {
  margin-bottom: 4rem;
}

.post-header .meta {
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.post-header .cat {
  color: var(--accent-primary);
  font-weight: 800;
}

.post-header .sep {
  margin: 0 0.75rem;
  opacity: 0.3;
}

.post-header .title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.post-header .tag {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-right: 1rem;
}

.markdown-body {
  padding: 3rem;
  line-height: 1.8;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.markdown-body p {
  margin-bottom: 1.5rem;
}

.markdown-body code:not(pre code) {
  background: var(--border-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

pre {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.6rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

pre:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: var(--accent-primary);
}
</style>
