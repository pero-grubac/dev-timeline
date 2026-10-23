import { normalizeRepo, reviveRepo } from "./snapshot.js";

const BASE = "https://api.github.com";

// No token here on purpose: anything the browser sends is readable in DevTools.
// The default profile comes from a snapshot built at deploy time instead.
async function ghFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) {
    const remaining = res.headers.get("X-RateLimit-Remaining");
    if (remaining === "0")
      throw new Error("GitHub rate limit reached (60 req/h). Try again later.");
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function fetchAllPages(path) {
  let results = [],
    page = 1;
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const data = await ghFetch(`${BASE}${path}${sep}per_page=100&page=${page}`);
    results = results.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return results;
}

// The JSON written by scripts/snapshot.mjs, served next to the app.
// Returns null when it is missing or unreadable, so the caller can go live.
export async function fetchSnapshot(username) {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${username}.json`);
    if (!res.ok) return null;
    const snapshot = await res.json();
    if (!Array.isArray(snapshot.repos)) return null;
    return { ...snapshot, repos: snapshot.repos.map(reviveRepo) };
  } catch {
    return null;
  }
}

export async function fetchRepos(username, onProgress) {
  onProgress("Fetching repositories...");
  const raw = await fetchAllPages(`/users/${username}/repos`);
  const repos = raw.filter((r) => !r.fork);

  onProgress(`Scanning ${repos.length} repositories...`);
  const enriched = await Promise.all(
    repos.map(async (repo) => {
      let languages = {};
      try {
        languages = await ghFetch(repo.languages_url);
      } catch {
        // A repo without language data still shows up, using its primary language.
      }
      return reviveRepo(normalizeRepo(repo, languages));
    }),
  );
  onProgress("Languages loaded ✓");

  return enriched;
}
