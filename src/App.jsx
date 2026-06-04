import { useState, useEffect } from 'react'
import { useGithub } from './hooks/useGithub'
import { StatsRow } from './components/StatsRow'
import { SkillsTab } from './components/SkillsTab'
import { TimelineTab } from './components/TimelineTab'

const DEFAULT_USERNAME = 'pero-grubac'

export default function App() {
  const [username, setUsername] = useState(DEFAULT_USERNAME)
  const [activeTab, setActiveTab] = useState('skills')
  const { status, repos, skills, load, refresh } = useGithub()

  // Auto-load default profile on first render
  useEffect(() => {
    load(DEFAULT_USERNAME)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScan = () => load(username)
  const handleRefresh = () => refresh(username)

  const isLoading = status.type === 'loading'
  const hasData = skills !== null

  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />

      <div className="container">
        <header>
          <p className="header-tag">// skill_matrix v1.0</p>
          <h1>DEV TIMELINE</h1>
          <p className="subtitle">github repository skill tracker</p>

          <div className="search-row">
            <div className="input-wrap">
              <span className="input-prefix">github.com /</span>
              <input
                className="username-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isLoading && handleScan()}
                placeholder="username"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <button
              className="btn"
              onClick={handleScan}
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? 'SCANNING...' : 'SCAN'}
            </button>
            {hasData && (
              <button
                className="btn btn-ghost"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Force refresh (bypass cache)"
              >
                ↺
              </button>
            )}
          </div>
        </header>

        <div className={`status-bar status-${status.type}`}>
          {isLoading && <span className="spinner" aria-hidden="true" />}
          {status.message}
        </div>

        {hasData && (
          <>
            <StatsRow repos={repos} skills={skills} />

            <div className="tabs" role="tablist">
              {['skills', 'timeline'].map(tab => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === 'skills' && <SkillsTab skills={skills} />}
            {activeTab === 'timeline' && <TimelineTab skills={skills} />}
          </>
        )}
      </div>
    </>
  )
}
