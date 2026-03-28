import { STORAGE_KEYS } from "../constants";

// ─── Helpers bas niveau ─────────────────────────────────────────────

function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    console.warn(`[storage] Lecture échouée pour la clé "${key}"`);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] Écriture échouée pour la clé "${key}"`);
  }
}

// ─── API publique ────────────────────────────────────────────────────

export const storage = {
  // Profil
  getProfile:      ()      => read(STORAGE_KEYS.PROFILE, null),
  setProfile:      (v)     => write(STORAGE_KEYS.PROFILE, v),

  // Axes
  getAxesSessions: ()      => read(STORAGE_KEYS.AXES_SESSIONS, []),
  setAxesSessions: (v)     => write(STORAGE_KEYS.AXES_SESSIONS, v),

  getFavAxes:      ()      => read(STORAGE_KEYS.FAV_AXES, []),
  setFavAxes:      (v)     => write(STORAGE_KEYS.FAV_AXES, v),

  getSelectedAxes: ()      => read(STORAGE_KEYS.SELECTED_AXES, []),
  setSelectedAxes: (v)     => write(STORAGE_KEYS.SELECTED_AXES, v),

  // Roadmaps
  getRoadmaps:     ()      => read(STORAGE_KEYS.ROADMAPS, []),
  setRoadmaps:     (v)     => write(STORAGE_KEYS.ROADMAPS, v),

  getActiveRmId:   ()      => read(STORAGE_KEYS.ACTIVE_RM_ID, null),
  setActiveRmId:   (v)     => write(STORAGE_KEYS.ACTIVE_RM_ID, v),

  getPubWeeks:     ()      => new Set(read(STORAGE_KEYS.PUB_WEEKS, [])),
  setPubWeeks:     (set)   => write(STORAGE_KEYS.PUB_WEEKS, [...set]),

  // Posts
  getPosts:        ()      => read(STORAGE_KEYS.POSTS, []),
  setPosts:        (v)     => write(STORAGE_KEYS.POSTS, v),

  // Insights
  getInsights:     ()      => read(STORAGE_KEYS.INSIGHTS, []),
  setInsights:     (v)     => write(STORAGE_KEYS.INSIGHTS, v),

  // Purge complète (déconnexion)
  clear: () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
