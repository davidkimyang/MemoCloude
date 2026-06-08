const IMPORTANT_NOTES_KEY = "memocloud:important-note-ids";
const RECENT_SEARCHES_KEY = "memocloud:recent-searches";

function readStringArray(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeStringArray(key: string, values: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(values));
}

export function readImportantNoteIds() {
  return readStringArray(IMPORTANT_NOTES_KEY);
}

export function toggleImportantNoteId(id: string) {
  const current = readImportantNoteIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  writeStringArray(IMPORTANT_NOTES_KEY, next);
  return next;
}

export function readRecentSearches() {
  return readStringArray(RECENT_SEARCHES_KEY);
}

export function addRecentSearch(term: string) {
  const normalized = term.trim();
  if (!normalized) return readRecentSearches();
  const next = [normalized, ...readRecentSearches().filter((item) => item !== normalized)].slice(0, 5);
  writeStringArray(RECENT_SEARCHES_KEY, next);
  return next;
}
