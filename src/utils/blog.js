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
        val = val.slice(1, -1).split(',').map(s => s.trim())
      } else {
        val = val.replace(/^['"]|['"]$/g, '')
      }
      data[key.trim()] = val
    }
  })

  return { data, content: content.replace(fmRegex, '') }
}

export const getBlogIdFromPath = (path) => path.split('/').pop().replace('.md', '')

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
    const { data } = parseFrontmatter(rawContent)
    const id = getBlogIdFromPath(path)
    return data.title ? { id, sourcePath: path, ...data } : null
  })

  const results = await Promise.all(postPromises)
  return results
    .filter(p => p !== null)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
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
