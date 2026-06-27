import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'

import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'

const blogImageModules = import.meta.glob('../blogs/**/*.{png,jpg,jpeg,webp,gif,svg}', {
  query: '?url',
  import: 'default',
  eager: true
})

const imageIndex = Object.entries(blogImageModules).reduce((index, [path, url]) => {
  const filename = path.split('/').pop()
  if (!index.has(filename)) index.set(filename, [])
  index.get(filename).push({ path, url })
  return index
}, new Map())

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const slugify = (text, counts = new Map()) => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    || 'section'

  const count = counts.get(base) || 0
  counts.set(base, count + 1)
  return count ? `${base}-${count + 1}` : base
}

const sourceHints = (sourcePath = '') => {
  const filename = sourcePath.split('/').pop() || ''
  const stem = filename.replace(/\.md$/, '')
  return [
    stem,
    stem.replace(/笔记$/, ''),
    stem.replace(/论文阅读报告$/, ''),
    stem.replace(/[《》]/g, '').replace(/笔记$/, '').replace(/论文阅读报告$/, ''),
    stem.replace(/\s+/g, '-')
  ].filter(Boolean)
}

const resolveImageUrl = (target, sourcePath) => {
  if (/^(https?:)?\/\//.test(target) || target.startsWith('/') || target.startsWith('.')) {
    return target
  }

  const filename = target.split('/').pop()
  const candidates = imageIndex.get(filename) || []
  if (!candidates.length) return encodeURI(target)

  const hints = sourceHints(sourcePath)
  const hinted = candidates.find(candidate => hints.some(hint => candidate.path.includes(`/images/${hint}/`)))
  if (hinted) return hinted.url

  const sourceDir = sourcePath.replace(/\/[^/]+$/, '/')
  const colocated = candidates.find(candidate => candidate.path.startsWith(sourceDir))
  return (colocated || candidates[0]).url
}

const normalizeObsidianEmbeds = (content, sourcePath) => content.replace(/!\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
  const [target] = rawTarget.split('|').map(part => part.trim())
  const src = resolveImageUrl(target, sourcePath)
  const alt = (target.split('/').pop() || target)
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')

  return `![${alt}](${src})`
})

const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token.attrGet('href') || ''

  if (/^https?:\/\//i.test(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }

  return defaultLinkOpen(tokens, idx, options, env, self)
}

const defaultImage = md.renderer.rules.image || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrSet('loading', 'lazy')
  token.attrSet('decoding', 'async')

  if (!token.attrGet('alt')) token.attrSet('alt', '')

  return defaultImage(tokens, idx, options, env, self)
}

const defaultHeadingOpen = md.renderer.rules.heading_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const title = tokens[idx + 1]?.content || ''
  const level = Number(token.tag.replace('h', ''))
  const id = slugify(title, env.headingCounts)

  token.attrSet('id', id)
  if (level >= 2 && level <= 3) {
    env.headings.push({ id, title, level })
  }

  return defaultHeadingOpen(tokens, idx, options, env, self)
}

export const renderMarkdown = (content, options = {}) => {
  const env = {
    headings: [],
    headingCounts: new Map()
  }
  const normalized = normalizeObsidianEmbeds(content, options.sourcePath)

  return {
    html: md.render(normalized, env),
    headings: env.headings
  }
}

export const enhanceMarkdownRoot = (root) => {
  if (!root) return

  Prism.highlightAllUnder(root)

  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'copy-btn'
    button.textContent = 'Copy'
    button.setAttribute('aria-label', 'Copy code block')

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent || ''

      try {
        await navigator.clipboard.writeText(code.trim())
        button.textContent = 'Copied'
      } catch (error) {
        button.textContent = 'Failed'
      }

      window.setTimeout(() => {
        button.textContent = 'Copy'
      }, 1800)
    })

    pre.appendChild(button)
  })

  root.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer')
  })
}
