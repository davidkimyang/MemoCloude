"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Cloud, FilePlus2, Sparkles } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteList } from "@/components/notes/NoteList";
import { PwaActions } from "@/components/pwa/PwaActions";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { useFolders } from "@/hooks/useFolders";
import { useNotes } from "@/hooks/useNotes";
import type { FolderFilter } from "@/lib/types";

type AppShellProps = {
  initialTrash?: boolean;
};

export function AppShell({ initialTrash = false }: AppShellProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedFilter] = useState<FolderFilter>(initialTrash ? "trash" : "all");
  const { folders } = useFolders(user);
  const notesApi = useNotes(user, selectedFilter, "");
  const trashMode = selectedFilter === "trash";
  const isGuest = !user;

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

  const selectedFolderId = useMemo(() => null, []);

  async function createNote() {
    const note = await notesApi.createNote(selectedFolderId);
    if (note) notesApi.setSelectedNoteId(note.id);
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

      <section className="grid min-h-[calc(100vh-80px)] gap-2 px-2 pb-6 lg:grid-cols-[292px_1fr]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-[#e6e1d9] bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">메모</h1>
            <span className="text-sm text-[#6f6258]">{notesApi.notes.length} 메모</span>
          </div>
          <button className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00a82d] font-bold text-white transition hover:bg-[#008f26]" onClick={createNote} type="button">
            <FilePlus2 size={18} />
            새 메모 만들기
          </button>

          <div className="mt-8 min-h-0 flex-1 overflow-hidden">
            <NoteList notes={notesApi.notes} selectedNoteId={notesApi.selectedNoteId} loading={notesApi.loading} onSelect={notesApi.setSelectedNoteId} />
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
            note={notesApi.selectedNote}
            folders={folders}
            trashMode={trashMode}
            onUpdate={notesApi.updateNote}
            onDelete={notesApi.moveToTrash}
            onRestore={notesApi.restoreNote}
            onPermanentDelete={notesApi.permanentlyDeleteNote}
          />
        </section>
      </section>
    </main>
  );
}
