/* Guest data kept in this browser only: settings, favourites, recently played,
   best scores and daily challenge results. Nothing here is sent anywhere, and
   clearing the browser's site data erases it. */
const KEY = 'digikhelo.v1';
const DEFAULTS = { settings: { sound: true, motion: 'auto' }, favourites: [], recent: [], best: {}, plays: {}, daily: {} };

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    return raw ? { ...structuredClone(DEFAULTS), ...raw, settings: { ...DEFAULTS.settings, ...(raw.settings || {}) } } : structuredClone(DEFAULTS);
  } catch (e) { return structuredClone(DEFAULTS); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked: keep working in memory */ }
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  setting(name, value) { if (value === undefined) return state.settings[name]; state.settings[name] = value; save(); },
  isFavourite: (id) => state.favourites.includes(id),
  toggleFavourite(id) {
    state.favourites = state.favourites.includes(id) ? state.favourites.filter((x) => x !== id) : [id, ...state.favourites];
    save(); return state.favourites.includes(id);
  },
  played(id) {
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 12);
    state.plays[id] = (state.plays[id] || 0) + 1; save();
  },
  best: (id) => state.best[id],
  // Records a result; returns true when it is a new personal best.
  record(id, score, lowerIsBetter) {
    if (typeof score !== 'number' || !isFinite(score)) return false;
    const prev = state.best[id];
    const better = prev === undefined || (lowerIsBetter ? score < prev.score : score > prev.score);
    if (better) { state.best[id] = { score, at: Date.now() }; save(); }
    return better;
  },
  dailyResult: (day) => state.daily[day],
  setDaily(day, result) { state.daily[day] = result; save(); },
  clear() { state = structuredClone(DEFAULTS); save(); }
};

export const reducedMotion = () => {
  const m = state.settings.motion;
  return m === 'reduce' || (m === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches);
};
