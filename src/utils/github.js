const BASE = "https://api.github.com";

async function ghFetch(url) {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (import.meta.env.VITE_GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
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
      } catch (_) {}
      return {
        name: repo.name,
        description: repo.description || "",
        url: repo.html_url,
        created: new Date(repo.created_at),
        updated: new Date(repo.updated_at),
        pushed: new Date(repo.pushed_at),
        topics: repo.topics || [],
        languages,
        primaryLang: repo.language || null,
        stars: repo.stargazers_count,
      };
    }),
  );
  onProgress("Languages loaded ✓");

  return enriched;
}
