export function aggregateSkills(repos) {
  const langMap = {}
  const topicMap = {}
  const yearData = {}

  repos.forEach(repo => {
    const year = repo.created.getFullYear()
    if (!yearData[year]) yearData[year] = { repos: [], langs: {} }
    yearData[year].repos.push(repo)

    const langs = Object.keys(repo.languages)
    if (langs.length === 0 && repo.primaryLang) langs.push(repo.primaryLang)

    langs.forEach(lang => {
      langMap[lang] = (langMap[lang] || 0) + 1
      yearData[year].langs[lang] = (yearData[year].langs[lang] || 0) + 1
    })

    repo.topics.forEach(t => {
      topicMap[t] = (topicMap[t] || 0) + 1
    })
  })

  const languages = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  const topics = Object.entries(topicMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  const years = Object.entries(yearData)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, data]) => ({
      year: Number(year),
      repos: data.repos.sort((a, b) => b.created - a.created),
      langs: data.langs,
    }))

  return { languages, topics, years }
}
