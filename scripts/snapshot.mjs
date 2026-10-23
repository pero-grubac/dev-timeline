// Builds public/data/<user>.json at deploy time, so the browser never needs
// a GitHub token. Node 22, no dependencies.
//
//   GITHUB_TOKEN=github_pat_xxx npm run snapshot
//   SNAPSHOT_USER=someone npm run snapshot      (default: pero-grubac)
//
// Without a token it still works, unauthenticated (60 requests/hour), and
// skips the contribution calendar, which needs the GraphQL API.
import { mkdir, writeFile } from 'node:fs/promises'
import { DEFAULT_USERNAME, normalizeRepo } from '../src/utils/snapshot.js'

const API = 'https://api.github.com'
const token = process.env.GITHUB_TOKEN?.trim()
const user = (process.env.SNAPSHOT_USER?.trim() || DEFAULT_USERNAME).toLowerCase()

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'dev-timeline-snapshot',
  ...(token && { Authorization: `Bearer ${token}` }),
}

async function rest(url) {
  const res = await fetch(url.startsWith('http') ? url : `${API}${url}`, { headers })
  if (!res.ok) {
    const limited = res.headers.get('x-ratelimit-remaining') === '0'
    const err = new Error(`${res.status} ${res.statusText} for ${url}${limited ? ' (rate limit reached)' : ''}`)
    err.limited = limited
    throw err
  }
  return res.json()
}

async function fetchRepos() {
  let all = []
  for (let page = 1; ; page++) {
    const data = await rest(`/users/${user}/repos?per_page=100&page=${page}`)
    all = all.concat(data)
    if (data.length < 100) break
  }
  const own = all.filter(r => !r.fork)
  return Promise.all(own.map(async repo => {
    let languages = {}
    try {
      languages = await rest(repo.languages_url)
    } catch (err) {
      // Better no snapshot (the last deploy stays up) than one with holes.
      if (err.limited) throw err
      console.warn(`  languages for ${repo.name} skipped: ${err.message}`)
    }
    return normalizeRepo(repo, languages)
  }))
}

const CALENDAR_QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount color } }
      }
    }
  }
}`

// Last year of contributions. Any problem here only drops the calendar.
async function fetchContributions() {
  try {
    const res = await fetch(`${API}/graphql`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: CALENDAR_QUERY, variables: { login: user } }),
    })
    const body = await res.json()
    if (!res.ok || body.errors) {
      throw new Error(body.errors?.[0]?.message || `${res.status} ${res.statusText}`)
    }
    return body.data.user.contributionsCollection.contributionCalendar
  } catch (err) {
    console.warn(`! contribution calendar skipped: ${err.message}`)
    return null
  }
}

if (!token) {
  console.warn('! GITHUB_TOKEN is not set: running unauthenticated (60 requests/hour)')
  console.warn('  and skipping the contribution calendar, which needs a token.')
}

try {
  console.log(`Snapshot for ${user}...`)
  const repos = await fetchRepos()
  const contributions = token ? await fetchContributions() : null

  const snapshot = {
    user,
    generatedAt: new Date().toISOString(),
    repos,
    contributions,
  }

  const dir = new URL('../public/data/', import.meta.url)
  await mkdir(dir, { recursive: true })
  const file = new URL(`${user}.json`, dir)
  await writeFile(file, JSON.stringify(snapshot) + '\n')

  console.log(`  ${repos.length} repositories`)
  console.log(contributions
    ? `  ${contributions.totalContributions} contributions in the last year`
    : '  no contribution calendar')
  console.log(`  written to public/data/${user}.json`)
} catch (err) {
  console.error(`Snapshot failed: ${err.message}`)
  process.exit(1)
}
