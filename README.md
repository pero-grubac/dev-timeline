<div align="center">

# 📈 Dev Timeline

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![GitHub API](https://img.shields.io/badge/GitHub-REST_API-181717?style=flat-square&logo=github&logoColor=white)
![No Backend](https://img.shields.io/badge/Backend-None-3dd68c?style=flat-square)
![localStorage](https://img.shields.io/badge/Cache-localStorage-f5a623?style=flat-square)

[![Live Demo](https://img.shields.io/badge/📈_Live_Demo-dev--timeline-7c6cf5?style=for-the-badge)](https://pero-grubac.github.io/dev-timeline/)

</div>

---

## 📌 Project Overview

**Dev Timeline** is a GitHub repository skill tracker built as a single-page React app. It reads any public GitHub profile via the GitHub REST API, analyses language usage and repo topics across all repositories, and renders a visual skill timeline — showing what you knew, when you knew it, and how much you used it. No backend. No auth. No tracking. Everything runs in your browser, with results cached in `localStorage` for one hour.

---

## ✨ Features

- ⚡ **Auto-loads on open** — your profile scans immediately on first visit, no button press needed
- 📊 **Skills Map** — language proficiency bars, tools & frameworks bars, and a language × year heatmap
- 🗂️ **Timeline view** — all repos grouped by creation year, with tags, descriptions, and direct links
- 💾 **1-hour cache** — GitHub API results stored in `localStorage`, refresh button available to bypass
- 🎨 **Futuristic dark UI** — grid background, scan-line animation, Space Mono + Syne typography
- 🔍 **Any public profile** — type any GitHub username and press SCAN to switch profiles

---

## 📊 What It Analyses

| View | Description |
|------|-------------|
| **Language bars** | How many repos use each language, sorted by frequency |
| **Topic bars** | Frameworks and tools extracted from repo topics |
| **Language × Year heatmap** | Which languages appeared in which years — intensity reflects usage |
| **Repository timeline** | Every repo grouped by creation year — name, description, language, topics, stars |

---

## ⚙️ How It Works

```
App.jsx  →  useGithub() hook
                ↓
         fetchRepos()  →  GitHub REST API
         /users/{username}/repos  +  /repos/{owner}/{repo}/languages
                ↓
         aggregateSkills()  →  langMap / topicMap / yearData
                ↓
         SkillsTab  +  TimelineTab
```

### Data flow

```
GitHub API  →  useGithub hook  →  aggregateSkills util  →  UI components
                    ↓
              localStorage cache (1h TTL)
```

### Caching

```
useGithub.js  →  loadCache(username)   — check localStorage, reject if >1h old
              →  saveCache(username)   — store after successful fetch
              →  refresh()            — force bypass: skip cache, re-fetch all
```

---

## 📁 Project Structure

```
dev-timeline/
├── index.html
├── vite.config.js                        # base: '/dev-timeline/'
├── package.json
└── src/
    ├── main.jsx                          # Entry point
    ├── App.jsx                           # Shell — auto-loads default profile on mount
    ├── index.css                         # All global styles — single source of truth
    │
    ├── hooks/
    │   └── useGithub.js                  # Fetch, cache, aggregate — all data logic
    │
    ├── utils/
    │   ├── github.js                     # fetchRepos() — paginated GitHub API calls
    │   ├── aggregate.js                  # aggregateSkills() — langMap / topicMap / yearData
    │   └── colors.js                     # getLangColor() / getTopicColor() — deterministic palette
    │
    └── components/
        ├── StatsRow.jsx                  # Summary metric cards (repos, languages, topics, years, stars)
        ├── SkillBar.jsx                  # Single animated skill bar row
        ├── SkillsTab.jsx                 # Language bars + topic bars + heatmap
        ├── LangHeatmap.jsx               # Language × year table with alpha-scaled colored cells
        ├── TimelineTab.jsx               # Repos grouped by year
        └── RepoCard.jsx                  # Individual repo card with tags and link
```

---

## 🚀 Setup & Run

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/pero-grubac/dev-timeline.git
cd dev-timeline
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🌍 Deploy to GitHub Pages

`vite.config.js` already has the correct base path:

```js
export default defineConfig({
  plugins: [react()],
  base: '/dev-timeline/',
})
```

The included `.github/workflows/deploy.yml` automatically builds and deploys on every push to `main`.

**One-time setup:** go to **Settings → Pages → Source** and select **GitHub Actions**.

Site will be live at `https://pero-grubac.github.io/dev-timeline/`

---

## ⚠️ Limitations

| Limitation | Detail |
|-----------|--------|
| **Public repos only** | GitHub REST API without a token returns public repositories only |
| **Rate limit** | 60 requests/hour per IP — sufficient for most profiles; 1h cache minimises re-fetching |
| **Topics required** | Framework detection depends on repo topics being set in GitHub settings |
| **Language detection** | Based on GitHub's byte-count heuristic, not actual lines written |

---

## 🏗️ Tech Stack

| Tool | Version | Role |
|------|---------|------|
| React | 19 | UI framework |
| Vite | 8 | Dev server & bundler |
| GitHub REST API | v3 | Repo and language data |
| localStorage | — | 1-hour result cache |

No external UI libraries. No CSS frameworks. No state management libraries.

---

_All data is fetched directly from the GitHub public API. Nothing is stored server-side._