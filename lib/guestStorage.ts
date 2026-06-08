import type { Folder, Note } from "@/lib/types";

const GUEST_FOLDERS_KEY = "memocloud:guest:folders";
const GUEST_NOTES_KEY = "memocloud:guest:notes";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readGuestFolders() {
  if (typeof window === "undefined") return [];
  return safeParse<Folder[]>(window.localStorage.getItem(GUEST_FOLDERS_KEY), []);
}

export function writeGuestFolders(folders: Folder[]) {
  window.localStorage.setItem(GUEST_FOLDERS_KEY, JSON.stringify(folders));
}

export function readGuestNotes() {
  if (typeof window === "undefined") return [];
  return safeParse<Note[]>(window.localStorage.getItem(GUEST_NOTES_KEY), []);
}

export function writeGuestNotes(notes: Note[]) {
  window.localStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(notes));
}

export function createGuestFolder(name: string, sortOrder: number): Folder {
  const now = new Date().toISOString();
  return {
    id: makeId("folder"),
    user_id: "guest",
    name,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now
  };
}

export function createGuestNote(folderId: string | null): Note {
  const now = new Date().toISOString();
  return {
    id: makeId("note"),
    user_id: "guest",
    folder_id: folderId,
    title: "새 메모",
    content: "",
    is_pinned: false,
    is_deleted: false,
    deleted_at: null,
    created_at: now,
    updated_at: now
  };
}
