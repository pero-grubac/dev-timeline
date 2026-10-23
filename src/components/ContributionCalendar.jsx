import { useEffect, useRef } from 'react'
import { layoutCalendar, dayTitle } from '../utils/contributions'

const LEVELS = [0, 1, 2, 3, 4]

export function ContributionCalendar({ calendar }) {
  const wrapRef = useRef(null)
  const { totalContributions: total, weeks } = calendar
  const layout = layoutCalendar(weeks)

  // On narrow screens the calendar scrolls; start at the most recent weeks.
  useEffect(() => {
    const el = wrapRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [weeks])

  const summary = `${total.toLocaleString('en-GB')} contribution${total === 1 ? '' : 's'} in the last year`

  return (
    <section className="calendar-section" aria-label="Contribution activity">
      <div className="section-title">contribution activity</div>
      <div className="calendar-wrap" ref={wrapRef}>
        <svg
          className="calendar"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label={summary}
        >
          {layout.months.map(m => (
            <text key={`${m.label}-${m.x}`} className="calendar-label" x={m.x} y={10}>{m.label}</text>
          ))}
          {layout.weekdays.map(d => (
            <text key={d.label} className="calendar-label" x={0} y={d.y}>{d.label}</text>
          ))}
          {layout.cells.map(c => (
            <rect
              key={c.date}
              className={`calendar-day lvl-${c.level}`}
              x={c.x}
              y={c.y}
              width={layout.cell}
              height={layout.cell}
              rx={2}
              data-date={c.date}
              data-count={c.count}
            >
              <title>{dayTitle({ date: c.date, contributionCount: c.count })}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="calendar-foot">
        <span className="calendar-total">{summary}</span>
        <span className="calendar-legend" aria-hidden="true">
          less
          {LEVELS.map(l => <span key={l} className={`calendar-swatch lvl-${l}`} />)}
          more
        </span>
      </div>
    </section>
  )
}
