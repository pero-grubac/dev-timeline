import { RepoCard } from './RepoCard'

export function TimelineTab({ skills }) {
  return (
    <div>
      <div className="section-title">repository timeline</div>
      {skills.years.map(({ year, repos }) => (
        <div key={year} className="year-block">
          <div className="year-header">
            <span className="year-label">{year}</span>
            <span className="year-count">{repos.length} repo{repos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="repo-list">
            {repos.map(repo => (
              <RepoCard key={repo.name} repo={repo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
