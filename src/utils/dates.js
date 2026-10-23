const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Dates from GitHub are either 'YYYY-MM-DD' or full ISO timestamps. Both are
// read in UTC so the output doesn't shift with the visitor's time zone.
export function parseDay(value) {
  return new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
}

export function monthName(index) {
  return MONTHS[index]
}

// '2026-10-23' -> '23 Oct 2026'
export function formatDay(value) {
  const d = parseDay(value)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
