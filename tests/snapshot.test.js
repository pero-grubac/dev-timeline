import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRepo, reviveRepo, sourceLabel, isDefaultUser, DEFAULT_USERNAME } from '../src/utils/snapshot.js'

const apiRepo = {
  name: 'dev-timeline',
  description: null,
  html_url: 'https://github.com/pero-grubac/dev-timeline',
  created_at: '2024-03-01T10:00:00Z',
  updated_at: '2026-10-20T08:00:00Z',
  pushed_at: '2026-10-21T09:30:00Z',
  language: 'JavaScript',
  stargazers_count: 3,
  fork: false,
  owner: { login: 'pero-grubac' },
}

test('a repository is reduced to what the app needs, as plain JSON', () => {
  const repo = normalizeRepo(apiRepo, { JavaScript: 900, CSS: 100 })
  assert.deepEqual(repo, {
    name: 'dev-timeline',
    description: '',
    url: 'https://github.com/pero-grubac/dev-timeline',
    created: '2024-03-01T10:00:00Z',
    updated: '2026-10-20T08:00:00Z',
    pushed: '2026-10-21T09:30:00Z',
    topics: [],
    languages: { JavaScript: 900, CSS: 100 },
    primaryLang: 'JavaScript',
    stars: 3,
  })
  assert.deepEqual(JSON.parse(JSON.stringify(repo)), repo)
})

test('missing fields get safe defaults', () => {
  const repo = normalizeRepo({ ...apiRepo, language: null, stargazers_count: undefined })
  assert.equal(repo.primaryLang, null)
  assert.equal(repo.stars, 0)
  assert.deepEqual(repo.languages, {})
})

test('reviving turns dates back into Date objects', () => {
  const repo = reviveRepo(normalizeRepo(apiRepo))
  assert.ok(repo.created instanceof Date)
  assert.equal(repo.created.getUTCFullYear(), 2024)
  assert.equal(repo.pushed.toISOString(), '2026-10-21T09:30:00.000Z')
})

test('a repository survives the cache round trip', () => {
  const repo = reviveRepo(normalizeRepo(apiRepo))
  const back = reviveRepo(JSON.parse(JSON.stringify(repo)))
  assert.deepEqual(back, repo)
})

test('the status bar names the data source', () => {
  assert.equal(sourceLabel({ type: 'snapshot', generatedAt: '2026-10-23T04:17:00Z' }), 'snapshot from 23 Oct 2026')
  assert.equal(sourceLabel({ type: 'live' }), 'live API')
  assert.equal(sourceLabel({ type: 'cache' }), 'live API (cached)')
  assert.equal(sourceLabel(null), '')
})

test('only the default profile uses the snapshot', () => {
  assert.equal(isDefaultUser(DEFAULT_USERNAME), true)
  assert.equal(isDefaultUser('  Pero-Grubac '), true)
  assert.equal(isDefaultUser('octocat'), false)
})
