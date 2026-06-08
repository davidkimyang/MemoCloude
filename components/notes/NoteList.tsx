"use client";

import { Pin } from "lucide-react";
import type { Note } from "@/lib/types";
import { formatDate, previewText } from "@/lib/utils";
import { EmptyState } from "@/components/notes/EmptyState";

type NoteListProps = {
  notes: Note[];
  selectedNoteId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
};

export function NoteList({ notes, selectedNoteId, loading, onSelect }: NoteListProps) {
  if (loading) return <EmptyState title="메모를 불러오는 중입니다." />;
  if (!notes.length) return <EmptyState title="아직 메모가 없습니다." body="새 메모를 작성해보세요." />;

  return (
    <div className="h-full overflow-y-auto p-3">
      {notes.map((note) => (
        <button
          className={`mb-2 w-full rounded-[18px] p-4 text-left transition ${
            selectedNoteId === note.id ? "bg-white shadow-soft" : "hover:bg-white/70"
          }`}
          key={note.id}
          onClick={() => onSelect(note.id)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-semibold">{note.title || "새 메모"}</h3>
            {note.is_pinned ? <Pin size={15} className="fill-accent text-accent" /> : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{previewText(note.content)}</p>
          <p className="mt-3 text-xs text-muted">{formatDate(note.updated_at)}</p>
        </button>
      ))}
    </div>
  );
}

