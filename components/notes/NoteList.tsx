"use client";

import { Pin } from "lucide-react";
import { EmptyState } from "@/components/notes/EmptyState";
import type { Note } from "@/lib/types";
import { formatDate, previewText } from "@/lib/utils";

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
    <div className="h-full overflow-y-auto">
      {notes.map((note) => (
        <button
          className={`mb-3 w-full rounded-lg border p-5 text-left transition ${
            selectedNoteId === note.id ? "border-[#6476ff] bg-white shadow-sm" : "border-transparent bg-white hover:border-[#e6e1d9]"
          }`}
          key={note.id}
          onClick={() => onSelect(note.id)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-bold">{note.title || "새 메모"}</h3>
            {note.is_pinned ? <Pin size={15} className="fill-[#00a82d] text-[#00a82d]" /> : null}
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-[#6f6258]">{previewText(note.content)}</p>
          <p className="mt-4 text-xs text-[#6f6258]">{formatDate(note.updated_at)}</p>
        </button>
      ))}
    </div>
  );
}

