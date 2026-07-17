import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeBlogMeta, parseFrontmatter } from '../src/utils/blog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const blogDir = path.join(rootDir, 'src', 'blogs')
const requiredFields = ['title', 'date', 'category', 'tags', 'summary']
const mode = process.argv.includes('--write') ? 'write' : 'check'

const hasFrontmatter = (content) => /^---\s*\n[\s\S]*?\n---\s*\n/.test(content)

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const quoteString = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''
  if (/[:#,[\]{}]|^\s|[\n\r]/.test(text)) {
    return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return text
}

const formatValue = (value) => {
  if (Array.isArray(value)) return `[${value.map(quoteString).join(', ')}]`
  return quoteString(value)
}

const renderFrontmatter = (meta, originalData) => {
  const extraFields = Object.keys(originalData).filter(field => !requiredFields.includes(field))
  const orderedFields = [...requiredFields, ...extraFields]

  return `${orderedFields
    .map(field => `${field}: ${formatValue(meta[field])}`)
    .join('\n')}\n`
}

const replaceFrontmatter = (rawContent, frontmatter) => {
  if (hasFrontmatter(rawContent)) {
    return rawContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, `---\n${frontmatter}---\n\n`)
  }

  return `---\n${frontmatter}---\n\n${rawContent.replace(/^\s+/, '')}`
}

const getMarkdownFiles = async () => {
  const entries = await readdir(blogDir, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => path.join(blogDir, entry.name))
}

const getMissingFields = (data) => requiredFields.filter((field) => {
  if (field === 'tags') return !Array.isArray(data.tags) || data.tags.length === 0
  return !data[field]
})

const processFile = async (filePath) => {
  const rawContent = await readFile(filePath, 'utf8')
  const { data, content } = parseFrontmatter(rawContent)
  const fileStat = await stat(filePath)
  const sourcePath = `../blogs/${path.basename(filePath)}`
  const normalized = normalizeBlogMeta(data, content, sourcePath)
  const meta = {
    ...normalized,
    date: normalized.date || formatDate(fileStat.mtime)
  }
  const missingFields = getMissingFields(data)

  if (!missingFields.length) return null

  if (mode === 'write') {
    const nextContent = replaceFrontmatter(rawContent, renderFrontmatter(meta, data))
    await writeFile(filePath, nextContent, 'utf8')
  }

  return {
    file: path.relative(rootDir, filePath),
    missingFields,
    meta
  }
}

const files = await getMarkdownFiles()
const changed = (await Promise.all(files.map(processFile))).filter(Boolean)

if (!changed.length) {
  console.log('All blog posts already have complete frontmatter.')
  process.exit(0)
}

changed.forEach(({ file, missingFields, meta }) => {
  const action = mode === 'write' ? 'updated' : 'needs'
  console.log(`${file}: ${action} ${missingFields.join(', ')} -> ${meta.title}`)
})

if (mode === 'check') {
  console.log('\nRun `npm run blog:frontmatter` to write inferred metadata.')
  process.exit(1)
}
