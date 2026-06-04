export function SkillBar({ name, count, max, color }) {
  const pct = Math.round((count / max) * 100)
  return (
    <div className="skill-row">
      <span className="skill-dot" style={{ background: color }} />
      <span className="skill-name" title={name}>{name}</span>
      <div className="skill-bar-wrap">
        <div
          className="skill-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
      </div>
      <span className="skill-count">{count} repo{count !== 1 ? 's' : ''}</span>
    </div>
  )
}
