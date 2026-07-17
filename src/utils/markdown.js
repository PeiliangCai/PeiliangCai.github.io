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

const normalizeWikiLinkTarget = (target = '') => {
  const filename = target
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/\.md$/i, '')

  try {
    return decodeURIComponent(filename).normalize('NFKC')
  } catch (error) {
    return filename.normalize('NFKC')
  }
}

const createInternalLinkIndex = (targets = []) => new Map(
  targets.map(target => [normalizeWikiLinkTarget(target).toLocaleLowerCase(), target])
)

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

md.inline.ruler.before('link', 'obsidian_wiki_link', (state, silent) => {
  if (state.src.charCodeAt(state.pos) !== 0x5B || state.src.charCodeAt(state.pos + 1) !== 0x5B) {
    return false
  }

  const end = state.src.indexOf(']]', state.pos + 2)
  if (end === -1) return false

  const rawLink = state.src.slice(state.pos + 2, end).trim()
  if (!rawLink || rawLink.includes('\n')) return false

  const [rawDestination, ...aliasParts] = rawLink.split('|')
  const destination = rawDestination.trim()
  const hashIndex = destination.indexOf('#')
  const rawTarget = hashIndex === -1 ? destination : destination.slice(0, hashIndex)
  const heading = hashIndex === -1 ? '' : destination.slice(hashIndex + 1).trim()
  const targetKey = normalizeWikiLinkTarget(rawTarget).toLocaleLowerCase()
  const resolvedTarget = rawTarget ? state.env.internalLinkIndex?.get(targetKey) : ''

  if (rawTarget && !resolvedTarget) {
    if (!silent) {
      const token = state.push('text', '', 0)
      token.content = state.src.slice(state.pos, end + 2)
    }
    state.pos = end + 2
    return true
  }

  if (!resolvedTarget && !heading) return false

  if (!silent) {
    const route = resolvedTarget
      ? `${state.env.internalLinkBase}${encodeURIComponent(resolvedTarget)}`
      : ''
    const href = heading ? `${route}#${slugify(heading)}` : route
    const label = aliasParts.join('|').trim()
      || (rawTarget ? normalizeWikiLinkTarget(rawTarget) : heading)
    const open = state.push('link_open', 'a', 1)

    open.attrSet('href', href)
    open.attrSet('class', 'internal-link')
    open.attrSet('data-internal-link', '')

    const text = state.push('text', '', 0)
    text.content = label

    state.push('link_close', 'a', -1)
  }

  state.pos = end + 2
  return true
})

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
  if (env.headingLevels.includes(level)) {
    env.headings.push({ id, title, level })
  }

  return defaultHeadingOpen(tokens, idx, options, env, self)
}

export const renderMarkdown = (content, options = {}) => {
  const env = {
    headings: [],
    headingCounts: new Map(),
    headingLevels: options.headingLevels || [2, 3],
    internalLinkBase: options.internalLinkBase || '',
    internalLinkIndex: createInternalLinkIndex(options.internalLinkTargets)
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
