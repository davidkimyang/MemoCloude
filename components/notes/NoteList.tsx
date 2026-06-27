"use client";

import { Pin, Star } from "lucide-react";
import { EmptyState } from "@/components/notes/EmptyState";
import type { Note } from "@/lib/types";
import { formatDate, previewText } from "@/lib/utils";

type NoteListProps = {
  notes: Note[];
  selectedNoteId: string | null;
  loading: boolean;
  searchTerm?: string;
  importantNoteIds?: string[];
  onSelect: (id: string) => void;
};

function highlight(text: string, term: string) {
  const query = term.trim();
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-[#fff1a8] px-0.5 text-inherit">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function NoteList({ notes, selectedNoteId, loading, searchTerm = "", importantNoteIds = [], onSelect }: NoteListProps) {
  if (loading) return <EmptyState title="메모를 불러오는 중입니다." />;
  if (!notes.length) return <EmptyState title="아직 메모가 없습니다." body={searchTerm ? "검색 결과가 없습니다." : "새 메모를 작성해보세요."} />;

  return (
    <div className="h-full overflow-y-auto">
      {notes.map((note) => {
        const preview = previewText(note.content);
        const isImportant = importantNoteIds.includes(note.id);

        return (
          <button
            className={`mb-2 w-full rounded-lg border p-4 text-left transition sm:mb-3 sm:p-5 ${
              selectedNoteId === note.id ? "border-[#6476ff] bg-white shadow-sm" : "border-transparent bg-white hover:border-[#e6e1d9]"
            }`}
            key={note.id}
            onClick={() => onSelect(note.id)}
            type="button"
          >
            <div className="flex items-center gap-2">
              <h3 className="min-w-0 flex-1 truncate font-bold">{highlight(note.title || "새 메모", searchTerm)}</h3>
              {isImportant ? <Star size={15} className="fill-[#f4b400] text-[#f4b400]" /> : null}
              {note.is_pinned ? <Pin size={15} className="fill-[#00a82d] text-[#00a82d]" /> : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6258] sm:mt-3">{highlight(preview, searchTerm)}</p>
            <p className="mt-3 text-xs text-[#6f6258] sm:mt-4">{formatDate(note.updated_at)}</p>
          </button>
        );
      })}
    </div>
  );
}
