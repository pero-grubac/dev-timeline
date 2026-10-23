import { formatDay } from './dates.js'

// The profile that ships with a pre-built snapshot (see scripts/snapshot.mjs).
export const DEFAULT_USERNAME = 'pero-grubac'

export function isDefaultUser(username) {
  return username.trim().toLowerCase() === DEFAULT_USERNAME
}

// One repository from the REST API, reduced to what the app uses.
// Dates stay ISO strings so the result can be written to JSON as is.
export function normalizeRepo(repo, languages = {}) {
  return {
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    created: repo.created_at,
    updated: repo.updated_at,
    pushed: repo.pushed_at,
    topics: repo.topics || [],
    languages,
    primaryLang: repo.language || null,
    stars: repo.stargazers_count || 0,
  }
}

// Turns the ISO strings from JSON (snapshot or cache) back into Dates.
export function reviveRepo(repo) {
  return {
    ...repo,
    created: new Date(repo.created),
    updated: new Date(repo.updated),
    pushed: new Date(repo.pushed),
  }
}

// Where the data on screen came from, for the status bar.
export function sourceLabel(source) {
  if (!source) return ''
  if (source.type === 'snapshot') return `snapshot from ${formatDay(source.generatedAt)}`
  if (source.type === 'cache') return 'live API (cached)'
  return 'live API'
}
