import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aggregateSkills } from '../src/utils/aggregate.js'

const repo = (name, created, languages = {}, extra = {}) => ({
  name,
  created: new Date(created),
  languages,
  topics: [],
  primaryLang: null,
  ...extra,
})

const repos = [
  repo('a', '2024-03-01', { JavaScript: 900, CSS: 100 }, { topics: ['react', 'vite'] }),
  repo('b', '2024-07-15', { JavaScript: 500 }, { topics: ['react'] }),
  repo('c', '2023-01-10', { 'C#': 1000 }),
  repo('d', '2023-05-05', {}, { primaryLang: 'Python' }),
]

test('languages are counted per repository and sorted by count', () => {
  const { languages } = aggregateSkills(repos)
  assert.deepEqual(languages[0], { name: 'JavaScript', count: 2 })
  assert.deepEqual(
    languages.map(l => l.name).sort(),
    ['C#', 'CSS', 'JavaScript', 'Python'],
  )
})

test('a repository without language data falls back to its primary language', () => {
  const { languages } = aggregateSkills(repos)
  assert.ok(languages.some(l => l.name === 'Python' && l.count === 1))
})

test('topics are counted and sorted', () => {
  const { topics } = aggregateSkills(repos)
  assert.deepEqual(topics, [
    { name: 'react', count: 2 },
    { name: 'vite', count: 1 },
  ])
})

test('years are newest first, with repositories newest first inside each year', () => {
  const { years } = aggregateSkills(repos)
  assert.deepEqual(years.map(y => y.year), [2024, 2023])
  assert.deepEqual(years[0].repos.map(r => r.name), ['b', 'a'])
  assert.deepEqual(years[0].langs, { JavaScript: 2, CSS: 1 })
})

test('no repositories gives empty results', () => {
  assert.deepEqual(aggregateSkills([]), { languages: [], topics: [], years: [] })
})
