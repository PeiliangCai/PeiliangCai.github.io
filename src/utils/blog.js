export const parseFrontmatter = (content) => {
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

export const getBlogIdFromPath = (path) => path.split('/').pop().replace('.md', '')

export const createBlogLoadersById = (modules) => Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => [getBlogIdFromPath(path), loader])
)

export const loadBlogSummaries = async (modules) => {
  const postPromises = Object.entries(modules).map(async ([path, loader]) => {
    const rawContent = await loader()
    const { data } = parseFrontmatter(rawContent)
    const id = getBlogIdFromPath(path)
    return data.title ? { id, ...data } : null
  })

  const results = await Promise.all(postPromises)
  return results
    .filter(p => p !== null)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const loadMarkdownSummaries = loadBlogSummaries

export const getCategoriesFromPosts = (posts) => [
  '全部',
  ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))
]
