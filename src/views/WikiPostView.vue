<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowLeft, ExternalLink } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { createWikiLoadersByRoutePath, parseFrontmatter } from '../utils/blog'
import { enhanceMarkdownRoot, renderMarkdown } from '../utils/markdown'

const props = defineProps({
  id: String,
  topic: String
})

const router = useRouter()
const page = ref(null)
const htmlContent = ref('')
const headings = ref([])
const contentRoot = ref(null)
const modules = import.meta.glob('../wiki/**/*.md', { query: '?raw', import: 'default' })
const pagesByRoutePath = createWikiLoadersByRoutePath(modules)

const sourceUrl = computed(() => page.value?.source || '')
const isExternalSource = computed(() => /^https?:\/\//i.test(sourceUrl.value))

const enhanceContent = async () => {
  await nextTick()
  enhanceMarkdownRoot(contentRoot.value)
}

const loadPage = async () => {
  try {
    const routePath = props.topic ? `${props.topic}/${props.id}` : props.id
    const entry = pagesByRoutePath[routePath]

    if (!entry) {
      page.value = null
      htmlContent.value = ''
      headings.value = []
      router.push('/wiki')
      return
    }

    const rawContent = await entry.loader()
    const { data, content } = parseFrontmatter(rawContent)
    const rendered = renderMarkdown(content, { sourcePath: entry.path })

    page.value = data
    htmlContent.value = rendered.html
    headings.value = rendered.headings
    await enhanceContent()
  } catch (error) {
    console.error('Error loading wiki page:', error)
    router.push('/wiki')
  }
}

watch(() => `${props.topic || ''}/${props.id || ''}`, loadPage, { immediate: true })

const goBack = () => router.push('/wiki')
</script>

<template>
  <div v-if="page" class="wiki-detail-container animate-fade-in">
    <button @click="goBack" class="back-btn" type="button">
      <ArrowLeft :size="20" /> Back to Wiki
    </button>

    <header class="wiki-hero">
      <div class="meta geek-font">
        <span>{{ page.category || 'Wiki' }}</span>
        <span v-if="page.updated" class="sep">/</span>
        <span v-if="page.updated">{{ page.updated }}</span>
      </div>
      <h1>{{ page.title }}</h1>
      <p v-if="page.summary">{{ page.summary }}</p>
      <a
        v-if="sourceUrl && isExternalSource"
        :href="sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="source-link"
      >
        <ExternalLink :size="16" /> Source
      </a>
      <router-link v-else-if="sourceUrl" :to="sourceUrl" class="source-link">
        <ExternalLink :size="16" /> Source
      </router-link>
    </header>

    <div class="content-layout" :class="{ 'has-toc': headings.length }">
      <article ref="contentRoot" class="markdown-body glass" v-html="htmlContent"></article>
      <aside v-if="headings.length" class="markdown-toc glass" aria-label="Table of contents">
        <div class="toc-title geek-font">ON THIS PAGE</div>
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="`level-${heading.level}`"
        >
          {{ heading.title }}
        </a>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.wiki-detail-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  margin-bottom: 3rem;
  padding: 0.58rem 0.8rem;
  color: var(--text-secondary);
  font-weight: 700;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.25s var(--transition-smooth);
}

.back-btn:hover {
  color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.wiki-hero {
  max-width: 860px;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.meta {
  margin-bottom: 1rem;
  color: var(--accent-secondary);
  font-size: 0.85rem;
  font-weight: 900;
}

.sep {
  margin: 0 0.75rem;
  opacity: 0.3;
}

.wiki-hero h1 {
  margin-bottom: 1.25rem;
  font-size: clamp(2.05rem, 6vw, 4rem);
  font-weight: 950;
  line-height: 1;
  letter-spacing: 0;
}

.wiki-hero p {
  max-width: 780px;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.8;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--accent-primary);
  font-weight: 800;
}

.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.content-layout.has-toc {
  grid-template-columns: minmax(0, 860px) 220px;
}

.markdown-toc {
  position: sticky;
  top: 7rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1rem;
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

@media (max-width: 980px) {
  .content-layout.has-toc {
    grid-template-columns: 1fr;
  }

  .markdown-toc {
    position: static;
    order: -1;
  }
}

@media (max-width: 640px) {
  .wiki-detail-container {
    padding-inline: 1rem;
  }

  .wiki-hero h1 {
    font-size: clamp(1.8rem, 12vw, 2.7rem);
  }
}
</style>
