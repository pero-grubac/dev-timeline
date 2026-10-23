// Smoke tests against the production build. The snapshot and the GitHub API
// are both answered from fixtures, so nothing here needs the network.
import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { calendar } from './fixtures/calendar.js'

const fixture = name => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))

const CALENDAR = calendar()
const SNAPSHOT = { ...fixture('snapshot.json'), contributions: CALENDAR }
const OCTOCAT = fixture('octocat-repos.json')
const OCTOCAT_LANGS = {
  'Hello-World': {},
  linguist: { Ruby: 8000, JavaScript: 500 },
}

test.beforeEach(async ({ page }) => {
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => m.type() === 'error' && errors.push(m.text()))
  page.errors = errors
  page.apiCalls = []

  await page.route('**/data/*.json', route => route.fulfill({ json: SNAPSHOT }))
  await page.route('https://api.github.com/**', route => {
    const req = route.request()
    page.apiCalls.push({ url: req.url(), auth: req.headers().authorization })
    const { pathname } = new URL(req.url())
    if (pathname === '/users/octocat/repos') return route.fulfill({ json: OCTOCAT })
    const langs = pathname.match(/^\/repos\/octocat\/([^/]+)\/languages$/)
    if (langs) return route.fulfill({ json: OCTOCAT_LANGS[langs[1]] ?? {} })
    return route.fulfill({ status: 404, json: { message: 'Not Found' } })
  })
})

test.afterEach(async ({ page }) => {
  const allowed = page.allowedErrors || /$^/
  expect(page.errors.filter(e => !allowed.test(e)), 'no JavaScript errors').toEqual([])
})

const status = page => page.locator('.status-bar')
const stat = (page, label) => page.locator('.stat-card', { hasText: label }).locator('.stat-num')

test('the default profile loads from the snapshot, without calling the API', async ({ page }) => {
  await page.goto('./')
  await expect(status(page)).toContainText('Loaded 5 repositories')
  await expect(status(page)).toContainText('snapshot from 23 Oct 2026')
  await expect(stat(page, 'REPOS')).toHaveText('5')
  await expect(stat(page, 'STARS')).toHaveText('7')
  await expect(page.locator('.skill-name', { hasText: 'JavaScript' })).toBeVisible()
  expect(page.apiCalls).toEqual([])
})

test('the contribution heatmap shows the last year', async ({ page }) => {
  await page.goto('./')
  const total = `${CALENDAR.totalContributions.toLocaleString('en-GB')} contributions in the last year`
  const svg = page.getByRole('img', { name: total })
  await expect(svg).toBeVisible()
  await expect(page.locator('.calendar-total')).toHaveText(total)
  await expect(svg.locator('rect')).toHaveCount(371)
  expect(await svg.locator('.calendar-label').count()).toBeGreaterThanOrEqual(12 + 3)
  await expect(svg.locator('rect[data-date="2026-10-21"] title')).toHaveText(/contributions? on 21 Oct 2026$/)
  await expect(svg.locator('rect.lvl-4').first()).toBeAttached()
})

test('the timeline tab lists repositories by year', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('tab', { name: 'TIMELINE' }).click()
  await expect(page.locator('.year-label')).toHaveText(['2026', '2025', '2024'])
  await expect(page.locator('.year-block').first().locator('.repo-name')).toHaveText(['dev-timeline', 'yamb-table'])
  await expect(page.locator('.repo-card', { hasText: 'Snake' })).toHaveAttribute('href', 'https://github.com/pero-grubac/Snake')
})

test('another username is loaded live from the API, with no token', async ({ page }) => {
  await page.goto('./')
  await expect(status(page)).toContainText('snapshot from')

  const input = page.getByPlaceholder('username')
  await input.fill('octocat')
  await input.press('Enter')

  await expect(status(page)).toContainText('Loaded 2 repositories')
  await expect(status(page)).toContainText('live API')
  await expect(page.locator('.calendar')).toHaveCount(0)
  await expect(page.locator('.skill-name', { hasText: 'Ruby' })).toBeVisible()
  expect(page.apiCalls.length).toBeGreaterThan(0)
  expect(page.apiCalls.every(c => !c.auth), 'no Authorization header').toBe(true)
})

test('a missing snapshot falls back to the live API', async ({ page }) => {
  page.allowedErrors = /Failed to load resource.*404/
  await page.unroute('**/data/*.json')
  await page.route('**/data/*.json', route => route.fulfill({ status: 404, body: 'Not found' }))
  await page.route('https://api.github.com/users/pero-grubac/repos**', route =>
    route.fulfill({ json: OCTOCAT.map(r => ({ ...r, languages_url: r.languages_url.replace('octocat', 'pero-grubac') })) }))

  await page.goto('./')
  await expect(status(page)).toContainText('Loaded 2 repositories')
  await expect(status(page)).toContainText('live API')
  await expect(page.locator('.calendar')).toHaveCount(0)
})
