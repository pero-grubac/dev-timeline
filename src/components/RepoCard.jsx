import { getLangColor, getTopicColor } from '../utils/colors'

export function RepoCard({ repo }) {
  const color = repo.primaryLang ? getLangColor(repo.primaryLang) : '#63b3ed'
  const dateStr = repo.created.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const tags = [
    repo.primaryLang,
    ...repo.topics.slice(0, 3),
  ].filter(Boolean).slice(0, 4)

  return (
    <a
      className="repo-card"
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="repo-dot" style={{ background: color }} />
      <div className="repo-info">
        <div className="repo-name">{repo.name}</div>
        {repo.description && <div className="repo-desc">{repo.description}</div>}
        <div className="repo-tags">
          {tags.map(tag => {
            const tc = tag === repo.primaryLang ? getLangColor(tag) : getTopicColor(tag)
            return (
              <span
                key={tag}
                className="tag"
                style={{ color: tc, borderColor: `${tc}33`, background: `${tc}11` }}
              >
                {tag}
              </span>
            )
          })}
          {repo.stars > 0 && (
            <span className="tag tag-star">★ {repo.stars}</span>
          )}
        </div>
      </div>
      <span className="repo-date">{dateStr}</span>
    </a>
  )
}
