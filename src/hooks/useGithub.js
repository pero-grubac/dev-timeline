import { useState, useCallback } from 'react'
import { fetchRepos } from '../utils/github'
import { aggregateSkills } from '../utils/aggregate'

const CACHE_KEY = 'skill-timeline-cache'
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

function loadCache(username) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-${username}`)
    if (!raw) return null
    const { ts, repos } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    // Rehydrate Date objects
    return repos.map(r => ({
      ...r,
      created: new Date(r.created),
      updated: new Date(r.updated),
      pushed: new Date(r.pushed),
    }))
  } catch {
    return null
  }
}

function saveCache(username, repos) {
  try {
    localStorage.setItem(`${CACHE_KEY}-${username}`, JSON.stringify({ ts: Date.now(), repos }))
  } catch {}
}

export function useGithub() {
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [repos, setRepos] = useState([])
  const [skills, setSkills] = useState(null)

  const load = useCallback(async (username, forceRefresh = false) => {
    setStatus({ type: 'loading', message: 'Starting...' })
    setRepos([])
    setSkills(null)

    try {
      let data = forceRefresh ? null : loadCache(username)

      if (data) {
        setStatus({ type: 'loading', message: 'Loaded from cache — computing stats...' })
      } else {
        data = await fetchRepos(username, msg => setStatus({ type: 'loading', message: msg }))
        saveCache(username, data)
      }

      setRepos(data)
      setSkills(aggregateSkills(data))
      setStatus({ type: 'success', message: `Loaded ${data.length} repositories` })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }, [])

  const refresh = useCallback((username) => load(username, true), [load])

  return { status, repos, skills, load, refresh }
}
