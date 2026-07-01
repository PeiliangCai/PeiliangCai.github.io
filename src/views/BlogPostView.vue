<script setup>
import { nextTick, onActivated, onDeactivated, ref, watch } from 'vue'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { createBlogLoadersById, parseFrontmatter } from '../utils/blog'
import { enhanceMarkdownRoot, renderMarkdown } from '../utils/markdown'

const props = defineProps({
  id: String
})

const router = useRouter()
const post = ref(null)
const htmlContent = ref('')
const headings = ref([])
const contentRoot = ref(null)
const isTocOpen = ref(false)
const isPageActive = ref(true)
const modules = import.meta.glob('../blogs/*.md', { query: '?raw', import: 'default' })
const postsById = createBlogLoadersById(modules)

const enhanceContent = async () => {
  await nextTick()
  enhanceMarkdownRoot(contentRoot.value)
}

const loadPost = async () => {
  try {
    const entry = postsById[props.id]

    if (!entry) {
      post.value = null
      htmlContent.value = ''
      headings.value = []
      router.push('/blog')
      return
    }

    const rawContent = await entry.loader()
    const { data, content } = parseFrontmatter(rawContent)
    const rendered = renderMarkdown(content, {
      sourcePath: entry.path,
      headingLevels: [1, 2, 3]
    })

    post.value = data
    htmlContent.value = rendered.html
    headings.value = rendered.headings
    isTocOpen.value = false
    await enhanceContent()
  } catch (error) {
    console.error('Error loading post:', error)
    router.push('/blog')
  }
}

watch(() => props.id, loadPost, { immediate: true })

onActivated(() => {
  isPageActive.value = true
})

onDeactivated(() => {
  isPageActive.value = false
  isTocOpen.value = false
})

const closeToc = () => {
  isTocOpen.value = false
}

const goBack = () => router.push('/blog')
</script>

<template>
  <div v-if="post" class="post-detail-container animate-fade-in">
    <header class="post-hero">
      <div class="meta geek-font">
        <span class="cat">{{ post.category || 'Article' }}</span>
        <span v-if="post.date" class="sep">/</span>
        <span v-if="post.date" class="date">{{ post.date }}</span>
      </div>
      <h1 class="title">{{ post.title }}</h1>
      <p v-if="post.summary" class="summary">{{ post.summary }}</p>
      <div class="tags">
        <span v-for="tag in post.tags || []" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </header>

    <div class="content-layout">
      <article ref="contentRoot" class="markdown-body glass" v-html="htmlContent"></article>
    </div>
  </div>

  <teleport to="body">
    <button v-if="post && isPageActive" @click="goBack" class="back-btn" type="button">
      <ArrowLeft :size="20" /> Back to Feed
    </button>

    <div v-if="post && isPageActive && headings.length" class="toc-dock" :class="{ 'is-open': isTocOpen }">
      <button
        class="toc-toggle"
        type="button"
        aria-controls="article-toc"
        :aria-expanded="isTocOpen"
        :aria-label="isTocOpen ? 'Hide table of contents' : 'Show table of contents'"
        @click="isTocOpen = !isTocOpen"
      >
        <ChevronRight v-if="isTocOpen" :size="18" />
        <ChevronLeft v-else :size="18" />
      </button>

      <aside id="article-toc" class="markdown-toc glass" aria-label="Table of contents">
        <div class="toc-title geek-font">ON THIS PAGE</div>
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="`level-${heading.level}`"
          @click="closeToc"
        >
          {{ heading.title }}
        </a>
      </aside>
    </div>
  </teleport>
</template>

<style scoped>
.post-detail-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
}

.back-btn {
  --floating-bottom: max(1rem, env(safe-area-inset-bottom));
  position: fixed;
  left: max(1rem, env(safe-area-inset-left));
  bottom: var(--floating-bottom);
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  padding: 0.58rem 0.8rem;
  color: var(--text-secondary);
  font-weight: 700;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card-strong);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.2);
  transition: all 0.25s var(--transition-smooth);
}

.back-btn:hover {
  color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.post-hero {
  max-width: 860px;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.meta {
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.cat {
  color: var(--accent-secondary);
  font-weight: 900;
}

.sep {
  margin: 0 0.75rem;
  opacity: 0.3;
}

.title {
  margin-bottom: 1.35rem;
  font-size: clamp(2.05rem, 6vw, 4rem);
  font-weight: 950;
  line-height: 1;
  letter-spacing: 0;
}

.summary {
  max-width: 780px;
  margin-bottom: 1.25rem;
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.8;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.tag {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.content-layout {
  max-width: 860px;
}

.toc-dock {
  --toc-top-safe: 7rem;
  --toc-bottom-safe: 1rem;
  position: fixed;
  top: calc(var(--toc-top-safe) + (100vh - var(--toc-top-safe) - var(--toc-bottom-safe)) / 2);
  right: max(1rem, env(safe-area-inset-right));
  z-index: 880;
  width: 270px;
  max-height: calc(100vh - var(--toc-top-safe) - var(--toc-bottom-safe));
  transform: translateY(-50%);
}

.markdown-toc {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
  max-height: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary) transparent;
}

.toc-toggle {
  display: none;
}

.toc-title {
  color: var(--accent-secondary);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.markdown-toc a {
  color: var(--text-secondary);
  font-size: 0.84rem;
  line-height: 1.45;
  transition: color 0.2s var(--transition-smooth);
}

.markdown-toc a:hover {
  color: var(--accent-primary);
}

.markdown-toc .level-1 {
  color: var(--text-primary);
  font-weight: 900;
}

.markdown-toc .level-2 {
  padding-left: 0.55rem;
}

.markdown-toc .level-3 {
  padding-left: 0.8rem;
  font-size: 0.78rem;
  opacity: 0.86;
}

.markdown-body {
  min-width: 0;
  padding: clamp(1.35rem, 4vw, 3rem);
  color: var(--text-primary);
  font-size: 1.05rem;
  line-height: 1.85;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  scroll-margin-top: 7rem;
  margin-top: 2.6rem;
  margin-bottom: 1.3rem;
  color: var(--accent-primary);
  font-weight: 850;
  line-height: 1.2;
}

.markdown-body :deep(h1:first-child) {
  margin-top: 0;
}

.markdown-body :deep(p),
.markdown-body :deep(li) {
  color: var(--text-secondary);
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol),
.markdown-body :deep(blockquote),
.markdown-body :deep(table) {
  margin-bottom: 1.5rem;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5rem;
}

.markdown-body :deep(a) {
  color: var(--accent-primary);
  border-bottom: 1px solid rgba(0, 229, 255, 0.35);
}

.markdown-body :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-media);
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--border-color);
}

.markdown-body :deep(code:not(pre code)) {
  color: var(--accent-secondary);
  background: rgba(182, 255, 59, 0.08);
  border: 1px solid rgba(182, 255, 59, 0.18);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  position: relative;
  overflow: auto;
}

.markdown-body :deep(.copy-btn) {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  padding: 0.28rem 0.65rem;
  color: var(--accent-primary);
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s var(--transition-smooth), background 0.2s var(--transition-smooth);
}

.markdown-body :deep(pre:hover .copy-btn),
.markdown-body :deep(.copy-btn:focus-visible) {
  opacity: 1;
}

.markdown-body :deep(.copy-btn:hover) {
  color: #020409;
  background: var(--accent-primary);
}

@media (max-width: 1280px) {
  .toc-dock {
    --toc-drawer-width: min(22rem, calc(100vw - 3.5rem));
    right: 0;
    width: var(--toc-drawer-width);
    transform: translate(100%, -50%);
    transition: transform 0.28s var(--transition-smooth);
  }

  .toc-dock.is-open {
    transform: translate(0, -50%);
  }

  .markdown-toc {
    border-radius: 8px 0 0 8px;
  }

  .toc-toggle {
    position: absolute;
    top: 50%;
    left: -2.35rem;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 2.35rem;
    height: 3.1rem;
    color: var(--accent-primary);
    background: var(--bg-card-strong);
    border: 1px solid var(--border-color);
    border-right: 0;
    border-radius: 6px 0 0 6px;
    box-shadow: var(--shadow-cyber);
    transform: translateY(-50%);
    transition:
      color 0.2s var(--transition-smooth),
      border-color 0.2s var(--transition-smooth);
  }

  .toc-toggle:hover {
    color: var(--accent-secondary);
    border-color: var(--border-hot);
  }

}

@media (max-width: 640px) {
  .post-detail-container {
    padding-inline: 1rem;
  }

  .back-btn {
    padding: 0.5rem 0.65rem;
    font-size: 0.82rem;
  }

  .title {
    font-size: clamp(1.8rem, 12vw, 2.7rem);
  }
}
</style>
