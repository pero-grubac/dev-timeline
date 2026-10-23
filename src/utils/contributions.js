import { parseDay, monthName, formatDay } from './dates.js'

// 0 = no contributions, 1-4 = quarters of the busiest day, like GitHub.
export function contributionLevel(count, max) {
  if (!count || !max) return 0
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)))
}

export function dayTitle({ date, contributionCount: n }) {
  const what = n === 0 ? 'No contributions' : `${n} contribution${n === 1 ? '' : 's'}`
  return `${what} on ${formatDay(date)}`
}

// Lays out GitHub's contribution calendar: one column per week, one row per
// weekday (Sunday on top). Returns SVG coordinates for every day, the month
// labels along the top and the weekday labels on the left.
export function layoutCalendar(weeks, { cell = 10, gap = 3, top = 16, left = 30 } = {}) {
  const step = cell + gap
  const days = weeks.flatMap(w => w.contributionDays)
  const max = Math.max(0, ...days.map(d => d.contributionCount))

  const cells = []
  const months = []
  let lastMonth = null

  weeks.forEach((week, col) => {
    const x = left + col * step
    week.contributionDays.forEach(day => {
      const row = parseDay(day.date).getUTCDay()
      cells.push({
        x,
        y: top + row * step,
        date: day.date,
        count: day.contributionCount,
        level: contributionLevel(day.contributionCount, max),
      })
    })

    const first = week.contributionDays[0]
    if (!first) return
    const month = parseDay(first.date).getUTCMonth()
    if (month !== lastMonth) {
      months.push({ label: monthName(month), x, col })
      lastMonth = month
    }
  })

  // A partial first month would put two labels on top of each other.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift()

  const weekdays = [
    { label: 'Mon', y: top + 1 * step + cell - 1 },
    { label: 'Wed', y: top + 3 * step + cell - 1 },
    { label: 'Fri', y: top + 5 * step + cell - 1 },
  ]

  return {
    width: left + weeks.length * step - gap,
    height: top + 7 * step - gap,
    cell,
    max,
    cells,
    months: months.map(({ label, x }) => ({ label, x })),
    weekdays,
  }
}
