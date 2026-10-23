import { useState, useCallback } from "react";
import { fetchRepos, fetchSnapshot } from "../utils/github";
import { aggregateSkills } from "../utils/aggregate";
import { isDefaultUser, reviveRepo } from "../utils/snapshot";

const CACHE_KEY = "dev-timeline-cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function loadCache(username) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-${username}`);
    if (!raw) return null;
    const { ts, repos } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return repos.map(reviveRepo);
  } catch {
    return null;
  }
}

function saveCache(username, repos) {
  try {
    localStorage.setItem(
      `${CACHE_KEY}-${username}`,
      JSON.stringify({ ts: Date.now(), repos }),
    );
  } catch {
    // Storage full or blocked: the app still works, just without a cache.
  }
}

export function useGithub() {
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [repos, setRepos] = useState([]);
  const [skills, setSkills] = useState(null);
  const [source, setSource] = useState(null);
  const [contributions, setContributions] = useState(null);

  // Default profile: deploy-time snapshot first. Anyone else, a missing
  // snapshot or a forced refresh: cache, then the live API (no token).
  const load = useCallback(async (username, forceRefresh = false) => {
    username = username.trim();
    setStatus({ type: "loading", message: "Starting..." });
    setRepos([]);
    setSkills(null);
    setSource(null);
    setContributions(null);

    try {
      let data = null;
      let from = null;
      let calendar = null;

      if (!forceRefresh && isDefaultUser(username)) {
        setStatus({ type: "loading", message: "Loading snapshot..." });
        const snapshot = await fetchSnapshot(username.toLowerCase());
        if (snapshot) {
          data = snapshot.repos;
          calendar = snapshot.contributions || null;
          from = { type: "snapshot", generatedAt: snapshot.generatedAt };
        }
      }

      if (!data && !forceRefresh) {
        data = loadCache(username);
        if (data) {
          from = { type: "cache" };
          setStatus({
            type: "loading",
            message: "Loaded from cache — computing stats...",
          });
        }
      }

      if (!data) {
        data = await fetchRepos(username, (msg) =>
          setStatus({ type: "loading", message: msg }),
        );
        saveCache(username, data);
        from = { type: "live" };
      }

      setRepos(data);
      setSkills(aggregateSkills(data));
      setSource(from);
      setContributions(calendar);
      setStatus({
        type: "success",
        message: `Loaded ${data.length} repositories`,
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }, []);

  const refresh = useCallback((username) => load(username, true), [load]);

  return { status, repos, skills, source, contributions, load, refresh };
}
