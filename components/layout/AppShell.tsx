"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { EmptyState } from "@/components/notes/EmptyState";
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
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FolderFilter>(initialTrash ? "trash" : "all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { folders, createFolder, renameFolder, deleteFolder } = useFolders(user);
  const notesApi = useNotes(user, selectedFilter, search);
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

  const selectedFolderId = useMemo(() => {
    if (["all", "pinned", "recent", "trash"].includes(selectedFilter)) return null;
    return selectedFilter;
  }, [selectedFilter]);

  async function createNote() {
    const note = await notesApi.createNote(selectedFolderId);
    if (note && trashMode) setSelectedFilter("all");
  }

  function selectFilter(filter: FolderFilter) {
    setSelectedFilter(filter);
    setMobileNavOpen(false);
  }

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-paper text-muted">인증 상태 확인 중...</main>;
  }

  return (
    <main className="h-screen overflow-hidden bg-paper text-ink">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_minmax(310px,420px)_1fr]">
        <div className="hidden min-h-0 lg:block">
          <Sidebar
            folders={folders}
            selectedFilter={selectedFilter}
            isGuest={isGuest}
            userEmail={user?.email}
            onSelect={selectFilter}
            onCreateFolder={createFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
          />
        </div>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-40 bg-black/20 lg:hidden">
            <div className="h-full w-[min(88vw,320px)] bg-paper shadow-soft">
              <div className="flex justify-end p-3">
                <button className="rounded-xl border border-line bg-white p-2" onClick={() => setMobileNavOpen(false)} title="닫기" type="button">
                  <X size={18} />
                </button>
              </div>
              <div className="h-[calc(100%-56px)]">
                <Sidebar
                  folders={folders}
                  selectedFilter={selectedFilter}
                  isGuest={isGuest}
                  userEmail={user?.email}
                  onSelect={selectFilter}
                  onCreateFolder={createFolder}
                  onRenameFolder={renameFolder}
                  onDeleteFolder={deleteFolder}
                />
              </div>
            </div>
          </div>
        ) : null}

        <section className={`${notesApi.selectedNote ? "hidden md:grid" : "grid"} min-h-0 grid-rows-[64px_1fr] border-r border-line`}>
          <Topbar
            search={search}
            onSearch={setSearch}
            onNewNote={createNote}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
          <NoteList notes={notesApi.notes} selectedNoteId={notesApi.selectedNoteId} loading={notesApi.loading} onSelect={notesApi.setSelectedNoteId} />
        </section>

        <section className={`${notesApi.selectedNote ? "block" : "hidden md:block"} min-h-0 bg-white`}>
          {notesApi.error ? <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{notesApi.error}</div> : null}
          {notesApi.notes.length || notesApi.selectedNote ? (
            <NoteEditor
              note={notesApi.selectedNote}
              folders={folders}
              trashMode={trashMode}
              onBack={() => notesApi.setSelectedNoteId(null)}
              onUpdate={notesApi.updateNote}
              onDelete={notesApi.moveToTrash}
              onRestore={notesApi.restoreNote}
              onPermanentDelete={notesApi.permanentlyDeleteNote}
            />
          ) : (
            <EmptyState title="검색 결과가 없습니다." />
          )}
        </section>
      </div>
    </main>
  );
}
