const GITHUB_API_BASE = 'https://api.github.com'

const normalizeRepo = (repo, defaultOwner) => {
  if (!repo) return ''
  return repo.includes('/') ? repo : `${defaultOwner}/${repo}`
}

export const isGithubRepoEnabled = (project, config = {}) => Boolean(
  config.enabled && normalizeRepo(project.repo, config.owner)
)

export const fetchGithubRepo = async (repo, defaultOwner) => {
  const fullName = normalizeRepo(repo, defaultOwner)
  if (!fullName) return null

  const response = await fetch(`${GITHUB_API_BASE}/repos/${fullName}`, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  })

  if (!response.ok) {
    throw new Error(`GitHub repo fetch failed: ${fullName}`)
  }

  const data = await response.json()
  return {
    fullName: data.full_name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    url: data.html_url,
    homepage: data.homepage,
    updatedAt: data.updated_at
  }
}

export const attachGithubRepos = async (projects, config = {}) => Promise.all(
  projects.map(async (project) => {
    if (!isGithubRepoEnabled(project, config)) return project

    try {
      const github = await fetchGithubRepo(project.repo, config.owner)
      return { ...project, github }
    } catch (error) {
      console.warn(error)
      return project
    }
  })
)
