export function StatsRow({ repos, skills }) {
  const totalStars = repos.reduce((s, r) => s + r.stars, 0)
  const years = skills.years.length
  const firstYear = skills.years[skills.years.length - 1]?.year

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-num">{repos.length}</div>
        <div className="stat-label">REPOS</div>
      </div>
      <div className="stat-card">
        <div className="stat-num">{skills.languages.length}</div>
        <div className="stat-label">LANGUAGES</div>
      </div>
      <div className="stat-card">
        <div className="stat-num">{skills.topics.length}</div>
        <div className="stat-label">TOPICS</div>
      </div>
      <div className="stat-card">
        <div className="stat-num">{years}</div>
        <div className="stat-label">YEARS</div>
      </div>
      {totalStars > 0 && (
        <div className="stat-card">
          <div className="stat-num">{totalStars}</div>
          <div className="stat-label">STARS</div>
        </div>
      )}
    </div>
  )
}
