export const parseFrontmatter = (content) => {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(fmRegex)
  if (!match) return { data: {}, content }

  const yamlStr = match[1]
  const data = {}
  yamlStr.split('\n').forEach(line => {
    if (!line.trim() || line.trim().startsWith('#')) return

    const [key, ...valParts] = line.split(':')
    if (key && valParts.length > 0) {
      let val = valParts.join(':').trim()
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
      } else {
        val = val.replace(/^['"]|['"]$/g, '')
      }
      data[key.trim()] = val
    }
  })

  return { data, content: content.replace(fmRegex, '') }
}

export const getBlogIdFromPath = (path) => path.split('/').pop().replace('.md', '')

const titleFromPath = (path) => {
  const rawStem = getBlogIdFromPath(path || '')
    .replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()

  try {
    return decodeURIComponent(rawStem)
  } catch (error) {
    return rawStem
  }
}

const cleanInlineMarkdown = (value = '') => value
  .replace(/!\[\[([^\]]+)\]\]/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/[*_`~>#]/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const firstHeadingFromContent = (content = '') => {
  const heading = content.match(/^\s*#\s+(.+)$/m)
  return heading ? cleanInlineMarkdown(heading[1]) : ''
}

const dateFromPath = (path = '') => {
  const match = getBlogIdFromPath(path).match(/(?:^|[^\d])(\d{4})[-_]?(\d{2})[-_]?(\d{2})(?:[^\d]|$)/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}

const stripMarkdown = (content = '') => content
  .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[\[[^\]]+\]\]/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[#>*_~|$[\]()`-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const inferSummary = (content = '') => {
  const lines = content
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .map(line => cleanInlineMarkdown(line.replace(/^\s*[-*+]\s+\[[ x]\]\s*/i, '')))
    .filter(line => line && !line.startsWith('---') && !line.match(/^#+\s/))

  const summary = lines.find(line => line.length >= 18) || stripMarkdown(content)
  return summary.length > 118 ? `${summary.slice(0, 118)}...` : summary
}

const inferCategory = (text = '') => {
  if (/暑研|research|benchmark|实验计划/i.test(text)) return '研究记录'
  if (/数据集|dataset|trainset|shard/i.test(text)) return '数据集'
  if (/课程|笔记|PPT|数据结构|软件分析|图机器学习/i.test(text)) return '课程笔记'
  if (/论文|paper|arxiv|IC3|IC3Syn|Invariant|Protocol|TLA\+/i.test(text)) return '论文阅读'
  if (/Agent|RAG|LLM|Memory|大模型/i.test(text)) return '大模型工程'
  return '技术笔记'
}

const tagRules = [
  ['AI-Agent', /AI[-\s]?Agent|Agentic|智能体/i],
  ['RAG', /\bRAG\b|检索增强/i],
  ['LLM', /\bLLM\b|大语言模型|大模型/i],
  ['Memory', /\bMemory\b|记忆/i],
  ['IC3Syn', /\bIC3Syn\b/i],
  ['IC3', /\bIC3\b/i],
  ['TLA+', /TLA\+|Apalache|TLC|TLAPS/i],
  ['Formal-Verification', /形式化|Safety|Invariant|verification|验证器|归纳不变量/i],
  ['Distributed-Systems', /distributed|分布式|protocol|协议/i],
  ['Dataset', /dataset|数据集|trainset|shard/i],
  ['Speech', /speech|语音|ASR|TTS|VAD/i],
  ['Dialogue', /dialogue|对话/i],
  ['Graph-Learning', /图机器学习|Graph Learning|Node Embedding|Random Walk/i],
  ['GNN', /\bGNN\b|GCN|GraphSAGE|GAT/i],
  ['Knowledge-Graph', /知识图谱|Knowledge Graph|TransE|TransR|ComplEx/i],
  ['Recommender-System', /推荐系统|Recommender/i],
  ['Data-Structure', /数据结构|Data Structure/i],
  ['Algorithm', /算法|Algorithm/i],
  ['Program-Analysis', /软件分析|Program Analysis/i],
  ['Static-Analysis', /静态分析|Static Analysis/i],
  ['Research', /暑研|research|benchmark/i],
  ['Course', /课程|PPT|期末|复习/i]
]

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
  }

  return []
}

const fallbackTagFromCategory = (category) => {
  const categoryTags = {
    大模型工程: 'LLM',
    课程笔记: 'Course',
    论文阅读: 'Paper',
    研究记录: 'Research',
    数据集: 'Dataset'
  }

  return categoryTags[category] || 'Notes'
}

const inferTags = ({ title, category, content }) => {
  const text = `${title}\n${category}\n${content}`
  const tags = tagRules
    .filter(([, pattern]) => pattern.test(text))
    .map(([tag]) => tag)

  return Array.from(new Set(tags.length ? tags : [fallbackTagFromCategory(category)])).slice(0, 6)
}

export const normalizeBlogMeta = (data = {}, content = '', path = '') => {
  const title = data.title || firstHeadingFromContent(content) || titleFromPath(path) || 'Untitled'
  const date = data.date || dateFromPath(path)
  const category = data.category || inferCategory(`${title}\n${content}`)
  const tags = normalizeTags(data.tags)
  const summary = data.summary || inferSummary(content)

  return {
    ...data,
    title,
    date,
    category,
    tags: tags.length ? tags : inferTags({ title, category, content }),
    summary
  }
}

export const getWikiMetaFromPath = (path) => {
  const segments = path.split('/')
  const filename = segments[segments.length - 1] || ''
  const id = filename.replace('.md', '')
  const wikiIndex = segments.lastIndexOf('wiki')
  const topic = wikiIndex !== -1 && segments.length > wikiIndex + 2
    ? segments[wikiIndex + 1]
    : ''

  return {
    id,
    topic,
    routePath: topic ? `${topic}/${id}` : id,
    isSystemPage: id === 'index' || id === 'log'
  }
}

export const createBlogLoadersById = (modules) => Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => [
    getBlogIdFromPath(path),
    { path, loader }
  ])
)

export const createWikiLoadersByRoutePath = (modules) => Object.fromEntries(
  Object.entries(modules)
    .filter(([path]) => !getWikiMetaFromPath(path).isSystemPage)
    .map(([path, loader]) => [
      getWikiMetaFromPath(path).routePath,
      { path, loader }
    ])
)

export const loadBlogSummaries = async (modules) => {
  const postPromises = Object.entries(modules).map(async ([path, loader]) => {
    const rawContent = await loader()
    const { data, content } = parseFrontmatter(rawContent)
    const id = getBlogIdFromPath(path)
    return { id, sourcePath: path, ...normalizeBlogMeta(data, content, path) }
  })

  const results = await Promise.all(postPromises)
  return results
    .sort((a, b) => {
      const dateA = Number.isNaN(new Date(a.date).getTime()) ? 0 : new Date(a.date).getTime()
      const dateB = Number.isNaN(new Date(b.date).getTime()) ? 0 : new Date(b.date).getTime()
      return dateB - dateA
    })
}

export const loadWikiSummaries = async (modules) => {
  const pagePromises = Object.entries(modules)
    .filter(([path]) => !getWikiMetaFromPath(path).isSystemPage)
    .map(async ([path, loader]) => {
      const rawContent = await loader()
      const { data } = parseFrontmatter(rawContent)
      const meta = getWikiMetaFromPath(path)
      return data.title ? { ...meta, sourcePath: path, ...data } : null
    })

  const results = await Promise.all(pagePromises)
  return results
    .filter(page => page !== null)
    .sort((a, b) => new Date(b.updated || b.date || 0) - new Date(a.updated || a.date || 0))
}

export const loadMarkdownSummaries = loadBlogSummaries

export const getCategoriesFromPosts = (posts) => [
  '全部',
  ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))
]

export const getContentSearchText = (item) => [
  item.title,
  item.summary,
  item.category,
  item.date,
  item.updated,
  ...(Array.isArray(item.tags) ? item.tags : [item.tags].filter(Boolean))
]
  .filter(Boolean)
  .join(' ')
  .toLowerCase()

export const filterContentItems = (items, query, category) => {
  const normalizedQuery = query.trim().toLowerCase()

  return items.filter(item => {
    const matchesSearch = !normalizedQuery || getContentSearchText(item).includes(normalizedQuery)
    const matchesCategory = category === '全部' || item.category === category
    return matchesSearch && matchesCategory
  })
}
