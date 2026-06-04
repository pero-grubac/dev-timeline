import { SkillBar } from './SkillBar'
import { LangHeatmap } from './LangHeatmap'
import { getLangColor, getTopicColor } from '../utils/colors'

export function SkillsTab({ skills }) {
  const { languages, topics, years } = skills
  const maxLang = languages[0]?.count || 1
  const maxTopic = topics[0]?.count || 1
  const topLangs = languages.slice(0, 8).map(l => l.name)

  return (
    <div>
      <div className="section-title">language proficiency</div>
      <div className="skill-grid">
        {languages.slice(0, 15).map(({ name, count }) => (
          <SkillBar key={name} name={name} count={count} max={maxLang} color={getLangColor(name)} />
        ))}
      </div>

      {topics.length > 0 && (
        <>
          <div className="section-title">tools &amp; frameworks</div>
          <div className="skill-grid">
            {topics.slice(0, 12).map(({ name, count }) => (
              <SkillBar key={name} name={name} count={count} max={maxTopic} color={getTopicColor(name)} />
            ))}
          </div>
        </>
      )}

      <div className="section-title">language × year</div>
      <LangHeatmap years={years} topLangs={topLangs} />
    </div>
  )
}
