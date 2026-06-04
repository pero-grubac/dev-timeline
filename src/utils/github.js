const BASE = 'https://api.github.com'

async function ghFetch(url) {
  const headers = { Accept: 'application/vnd.github.v3+json' }
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const remaining = res.headers.get('X-RateLimit-Remaining')
    if (remaining === '0') throw new Error('GitHub rate limit reached (60 req/h). Try again later.')
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

async function fetchAllPages(path) {
  let results = [], page = 1
  while (true) {
    const sep = path.includes('?') ? '&' : '?'
    const data = await ghFetch(`${BASE}${path}${sep}per_page=100&page=${page}`)
    results = results.concat(data)
    if (data.length < 100) break
    page++
  }
  return results
}

export async function fetchRepos(username, onProgress) {
  onProgress('Fetching repositories...')
  const raw = await fetchAllPages(`/users/${username}/repos`)
  const repos = raw.filter(r => !r.fork)

  const enriched = []
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i]
    onProgress(`Scanning languages [${i + 1}/${repos.length}] — ${repo.name}`)

    let languages = {}
    try {
      languages = await ghFetch(repo.languages_url)
    } catch (_) {}

    enriched.push({
      name: repo.name,
      description: repo.description || '',
      url: repo.html_url,
      created: new Date(repo.created_at),
      updated: new Date(repo.updated_at),
      pushed: new Date(repo.pushed_at),
      topics: repo.topics || [],
      languages,
      primaryLang: repo.language || null,
      stars: repo.stargazers_count,
    })
  }

  return enriched
}
