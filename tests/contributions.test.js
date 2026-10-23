import { test } from 'node:test'
import assert from 'node:assert/strict'
import { layoutCalendar, contributionLevel, dayTitle } from '../src/utils/contributions.js'

// Weeks the way GitHub returns them: Sunday first, the first week may be partial.
function weeksFrom(start, days, count = () => 0) {
  const weeks = []
  const d = new Date(`${start}T00:00:00Z`)
  for (let i = 0; i < days; i++) {
    if (!weeks.length || d.getUTCDay() === 0) weeks.push({ contributionDays: [] })
    const date = d.toISOString().slice(0, 10)
    weeks.at(-1).contributionDays.push({ date, contributionCount: count(i, date), color: '#ebedf0' })
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return weeks
}

test('levels split the busiest day into quarters', () => {
  assert.equal(contributionLevel(0, 8), 0)
  assert.equal(contributionLevel(1, 8), 1)
  assert.equal(contributionLevel(2, 8), 1)
  assert.equal(contributionLevel(3, 8), 2)
  assert.equal(contributionLevel(6, 8), 3)
  assert.equal(contributionLevel(8, 8), 4)
  assert.equal(contributionLevel(5, 0), 0)
})

test('each week is a column and each weekday a row, Sunday on top', () => {
  // 2026-10-21 is a Wednesday, so the first week has 4 days.
  const weeks = weeksFrom('2026-10-21', 11)
  const { cells, width, height } = layoutCalendar(weeks, { cell: 10, gap: 3, top: 16, left: 30 })
  assert.equal(cells.length, 11)
  const wed = cells.find(c => c.date === '2026-10-21')
  assert.deepEqual([wed.x, wed.y], [30, 16 + 3 * 13])
  const sun = cells.find(c => c.date === '2026-10-25')
  assert.deepEqual([sun.x, sun.y], [30 + 13, 16])
  assert.equal(width, 30 + 2 * 13 - 3)
  assert.equal(height, 16 + 7 * 13 - 3)
})

test('cells carry their count and level', () => {
  const weeks = weeksFrom('2026-01-04', 7, i => i)
  const { cells, max } = layoutCalendar(weeks)
  assert.equal(max, 6)
  assert.deepEqual(cells.map(c => c.level), [0, 1, 2, 2, 3, 4, 4])
  assert.equal(cells[3].count, 3)
})

test('a month label sits above the first week that starts in it', () => {
  const weeks = weeksFrom('2026-01-04', 7 * 9)
  const { months } = layoutCalendar(weeks, { cell: 10, gap: 3, left: 30 })
  assert.deepEqual(months.map(m => m.label), ['Jan', 'Feb', 'Mar'])
  // 2026-02-01 is a Sunday, the fifth week.
  assert.equal(months[1].x, 30 + 4 * 13)
})

test('a short partial first month is dropped so labels never overlap', () => {
  const weeks = weeksFrom('2026-01-25', 7 * 6)
  const { months } = layoutCalendar(weeks)
  assert.deepEqual(months.map(m => m.label), ['Feb', 'Mar'])
})

test('a full year lays out 53 columns', () => {
  const weeks = weeksFrom('2025-10-19', 371)
  const { cells, months, width } = layoutCalendar(weeks, { cell: 10, gap: 3, left: 30 })
  assert.equal(weeks.length, 53)
  assert.equal(cells.length, 371)
  assert.equal(width, 30 + 53 * 13 - 3)
  assert.ok(months.length >= 12 && months.length <= 13)
})

test('an empty calendar does not throw', () => {
  const { cells, months, max } = layoutCalendar([])
  assert.deepEqual([cells, months, max], [[], [], 0])
})

test('day titles read like GitHub tooltips', () => {
  assert.equal(dayTitle({ date: '2026-10-05', contributionCount: 0 }), 'No contributions on 5 Oct 2026')
  assert.equal(dayTitle({ date: '2026-10-05', contributionCount: 1 }), '1 contribution on 5 Oct 2026')
  assert.equal(dayTitle({ date: '2026-12-31', contributionCount: 7 }), '7 contributions on 31 Dec 2026')
})
