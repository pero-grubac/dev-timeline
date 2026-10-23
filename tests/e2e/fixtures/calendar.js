// A year of contributions in the shape the GraphQL API returns, from
// Sunday 19 Oct 2025 to Saturday 24 Oct 2026 (53 weeks, 371 days).
export function calendar() {
  const weeks = []
  let total = 0
  const d = new Date('2025-10-19T00:00:00Z')
  for (let i = 0; i < 371; i++) {
    if (d.getUTCDay() === 0) weeks.push({ contributionDays: [] })
    const weekday = d.getUTCDay()
    const count = weekday === 0 || weekday === 6 ? (i % 5 === 0 ? 2 : 0) : (i * 7) % 11
    total += count
    weeks.at(-1).contributionDays.push({
      date: d.toISOString().slice(0, 10),
      contributionCount: count,
      color: count ? '#40c463' : '#ebedf0',
    })
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return { totalContributions: total, weeks }
}
