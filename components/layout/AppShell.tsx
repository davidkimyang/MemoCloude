"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CalendarDays, Clock3, Cloud, FilePlus2, Pin, RotateCcw, Search, Settings, Star, StickyNote, Trash2 } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteList } from "@/components/notes/NoteList";
import { PwaActions } from "@/components/pwa/PwaActions";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { addRecentSearch, readImportantNoteIds, readRecentSearches, toggleImportantNoteId } from "@/lib/noteFlags";
import { useFolders } from "@/hooks/useFolders";
import { useNotes } from "@/hooks/useNotes";
import type { FolderFilter, Note } from "@/lib/types";

type AppShellProps = {
  initialTrash?: boolean;
};

type DeletedToast = {
  note: Note;
};

const filters: Array<{ id: FolderFilter; label: string; icon: typeof Clock3 }> = [
  { id: "all", label: "전체", icon: Clock3 },
  { id: "today", label: "오늘", icon: CalendarDays },
  { id: "recent", label: "최근", icon: Clock3 },
  { id: "pinned", label: "고정", icon: Pin },
  { id: "important", label: "중요", icon: Star },
  { id: "trash", label: "휴지통", icon: Trash2 }
];

export function AppShell({ initialTrash = false }: AppShellProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FolderFilter>(initialTrash ? "trash" : "all");
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [importantNoteIds, setImportantNoteIds] = useState<string[]>([]);
  const [deletedToast, setDeletedToast] = useState<DeletedToast | null>(null);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const { folders } = useFolders(user);
  const dataFilter = selectedFilter === "important" ? "all" : selectedFilter;
  const notesApi = useNotes(user, dataFilter, search);
  const trashMode = selectedFilter === "trash";
  const isGuest = !user;

  const visibleNotes = useMemo(() => {
    if (selectedFilter !== "important") return notesApi.notes;
    return notesApi.notes.filter((note) => importantNoteIds.includes(note.id));
  }, [importantNoteIds, notesApi.notes, selectedFilter]);

  const selectedNote = useMemo(() => {
    if (!notesApi.selectedNote) return null;
    if (selectedFilter === "important" && !importantNoteIds.includes(notesApi.selectedNote.id)) return visibleNotes[0] || null;
    return notesApi.selectedNote;
  }, [importantNoteIds, notesApi.selectedNote, selectedFilter, visibleNotes]);

  useEffect(() => {
    setImportantNoteIds(readImportantNoteIds());
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        void createNote();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const selectedFolderId = useMemo(() => null, []);

  async function createNote(initial?: Partial<Pick<Note, "title" | "content">>) {
    const note = await notesApi.createNote(selectedFolderId, initial);
    if (note) {
      setSelectedFilter("all");
      notesApi.setSelectedNoteId(note.id);
      setMobileEditorOpen(true);
    }
  }

  async function deleteNote(id: string) {
    const deleted = await notesApi.moveToTrash(id);
    if (deleted) {
      setDeletedToast({ note: deleted });
      window.setTimeout(() => setDeletedToast(null), 6000);
    }
  }

  async function restoreDeleted() {
    if (!deletedToast) return;
    await notesApi.restoreNote(deletedToast.note.id);
    notesApi.setSelectedNoteId(deletedToast.note.id);
    setSelectedFilter("all");
    setDeletedToast(null);
  }

  function toggleImportant(id: string) {
    setImportantNoteIds(toggleImportantNoteId(id));
  }

  function commitSearch(term = search) {
    const next = addRecentSearch(term);
    setRecentSearches(next);
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") commitSearch();
  }

  function selectNote(id: string) {
    notesApi.setSelectedNoteId(id);
    setMobileEditorOpen(true);
  }

  async function logout() {
    if (isGuest) {
      window.location.href = "/login";
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] text-[#6f6258]">인증 상태 확인 중...</main>;
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
      <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#eee9e2] bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00a82d] text-white">
            <Cloud size={22} />
          </span>
          <span className="text-2xl font-bold tracking-normal">MemoCloud</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-semibold">
          <div className="hidden sm:block">
            <PwaActions compact />
          </div>
          <span className="hidden max-w-[240px] truncate text-[#6f6258] sm:inline" title={isGuest ? "비회원 모드" : user?.email || ""}>
            {isGuest ? "비회원 모드" : user?.email}
          </span>
          <Link className="rounded-lg p-2 hover:bg-white" href="/settings" title="설정">
            <Settings size={19} />
          </Link>
          <button className="rounded-lg px-2 py-2 hover:text-[#00a82d]" onClick={logout} type="button">
            {isGuest ? "로그인" : "로그아웃"}
          </button>
        </nav>
      </header>

      <section className="grid min-h-[calc(100vh-65px)] gap-2 px-2 pb-4 pt-2 md:grid-cols-[320px_1fr] lg:px-4">
        <aside className={`${mobileEditorOpen ? "hidden md:flex" : "flex"} min-h-[calc(100vh-88px)] flex-col rounded-xl border border-[#e6e1d9] bg-white p-4 shadow-sm md:min-h-0 md:p-5`}>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-xl font-bold">메모</h1>
            <span className="text-sm text-[#6f6258]">{visibleNotes.length} 메모</span>
          </div>

          <button className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00a82d] font-bold text-white transition hover:bg-[#008f26]" onClick={() => void createNote()} type="button">
            <FilePlus2 size={18} />
            새 메모 만들기
          </button>

          <div className="mt-4 rounded-xl bg-[#f5f5f7] px-3 py-2">
            <div className="flex items-center gap-2">
              <Search size={17} className="text-[#6f6258]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9b9b9b]"
                value={search}
                onBlur={() => commitSearch()}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="제목과 본문 검색"
              />
              {search ? (
                <button className="text-xs font-bold text-[#6f6258]" onClick={() => setSearch("")} type="button">
                  지우기
                </button>
              ) : null}
            </div>
          </div>

          {recentSearches.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button className="rounded-full bg-[#fbfaf7] px-3 py-1 text-xs font-semibold text-[#6f6258] hover:bg-[#efeae1]" key={term} onClick={() => setSearch(term)} type="button">
                  {term}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const active = selectedFilter === filter.id;
              return (
                <button
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    active ? "border-[#00a82d] bg-[#edfff2] text-[#007f22]" : "border-[#e6e1d9] text-[#4f4f4f] hover:bg-[#fbfaf7]"
                  }`}
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  type="button"
                >
                  <Icon size={16} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-hidden">
            <NoteList
              notes={visibleNotes}
              selectedNoteId={selectedNote?.id || notesApi.selectedNoteId}
              loading={notesApi.loading}
              searchTerm={search}
              importantNoteIds={importantNoteIds}
              onSelect={selectNote}
            />
          </div>

        </aside>

        <section className={`${mobileEditorOpen ? "block" : "hidden md:block"} min-h-[calc(100vh-88px)] overflow-hidden rounded-xl border border-[#e6e1d9] bg-white shadow-sm md:min-h-[680px]`}>
          {notesApi.error ? <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{notesApi.error}</div> : null}
          <NoteEditor
            note={selectedNote}
            folders={folders}
            trashMode={trashMode}
            important={selectedNote ? importantNoteIds.includes(selectedNote.id) : false}
            onBack={() => setMobileEditorOpen(false)}
            onToggleImportant={toggleImportant}
            onUpdate={notesApi.updateNote}
            onDelete={deleteNote}
            onRestore={notesApi.restoreNote}
            onPermanentDelete={notesApi.permanentlyDeleteNote}
          />
        </section>
      </section>

      <button
        className={`${mobileEditorOpen ? "hidden md:flex" : "flex"} fixed bottom-5 right-5 z-20 h-14 w-14 items-center justify-center rounded-full bg-[#00a82d] text-white shadow-[0_16px_40px_rgba(0,168,45,0.35)] transition hover:bg-[#008f26]`}
        onClick={() => void createNote()}
        title="빠른 메모"
        type="button"
      >
        <StickyNote size={24} />
      </button>

      {deletedToast ? (
        <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          <span className="max-w-[260px] truncate">삭제됨: {deletedToast.note.title || "새 메모"}</span>
          <button className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[#171717]" onClick={() => void restoreDeleted()} type="button">
            <RotateCcw size={14} />
            복구
          </button>
        </div>
      ) : null}
    </main>
  );
}
