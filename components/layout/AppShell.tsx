"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CalendarDays, Clock3, Cloud, FilePlus2, Pin, RotateCcw, Search, Sparkles, Star, StickyNote, Trash2 } from "lucide-react";
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
      <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-20">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00a82d] text-white">
            <Cloud size={24} />
          </span>
          <span className="text-3xl font-bold tracking-normal">MemoCloud</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-base font-medium">
          <PwaActions compact />
          <span className="hidden max-w-[240px] truncate text-[#6f6258] sm:inline" title={isGuest ? "비회원 모드" : user?.email || ""}>
            {isGuest ? "비회원 모드" : user?.email}
          </span>
          <button className="rounded-lg px-2 py-2 hover:text-[#00a82d]" onClick={logout} type="button">
            {isGuest ? "로그인" : "로그아웃"}
          </button>
        </nav>
      </header>

      <section className="grid min-h-[calc(100vh-80px)] gap-2 px-2 pb-6 lg:grid-cols-[320px_1fr]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-[#e6e1d9] bg-white p-5 shadow-sm">
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
              onSelect={notesApi.setSelectedNoteId}
            />
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold text-[#6f6258]">추가 기능</p>
            <div className="rounded-xl border border-[#e6e1d9] bg-white p-4 shadow-sm">
              <Sparkles className="text-[#289fd7]" size={18} />
              <h3 className="mt-2 text-sm font-bold">AI 편집</h3>
              <p className="mt-2 text-xs leading-5 text-[#4f4f4f]">작성한 메모를 다듬는 기능은 다음 단계에서 제공됩니다.</p>
            </div>
          </div>
        </aside>

        <section className="min-h-[680px] overflow-hidden rounded-xl border border-[#e6e1d9] bg-white shadow-sm">
          {notesApi.error ? <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{notesApi.error}</div> : null}
          <NoteEditor
            note={selectedNote}
            folders={folders}
            trashMode={trashMode}
            important={selectedNote ? importantNoteIds.includes(selectedNote.id) : false}
            onToggleImportant={toggleImportant}
            onUpdate={notesApi.updateNote}
            onDelete={deleteNote}
            onRestore={notesApi.restoreNote}
            onPermanentDelete={notesApi.permanentlyDeleteNote}
          />
        </section>
      </section>

      <button
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#00a82d] text-white shadow-[0_16px_40px_rgba(0,168,45,0.35)] transition hover:bg-[#008f26]"
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
