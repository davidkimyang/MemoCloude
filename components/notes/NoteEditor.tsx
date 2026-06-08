"use client";

import { useEffect, useState } from "react";
import { AlignLeft, Bold, CheckCircle2, Italic, Link2, List, Mic, MoreHorizontal, Pin, Save, Trash2, Underline } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Folder, Note } from "@/lib/types";

type SaveState = "idle" | "saving" | "saved" | "failed";

type DebouncedDraft = {
  noteId: string | null;
  title: string;
  content: string;
};

type NoteEditorProps = {
  note: Note | null;
  folders: Folder[];
  trashMode?: boolean;
  onBack?: () => void;
  onUpdate: (id: string, values: Partial<Pick<Note, "title" | "content" | "folder_id" | "is_pinned">>) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
  onPermanentDelete?: (id: string) => Promise<void>;
};

export function NoteEditor({ note, trashMode, onBack, onUpdate, onDelete, onRestore, onPermanentDelete }: NoteEditorProps) {
  const [draftNoteId, setDraftNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debouncedDraft = useDebounce<DebouncedDraft>({ noteId: draftNoteId, title, content }, 500);

  useEffect(() => {
    setDraftNoteId(note?.id || null);
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setSaveState("idle");
  }, [note?.id, note?.title, note?.content]);

  useEffect(() => {
    if (!note || trashMode) return;
    if (debouncedDraft.noteId !== note.id) return;
    if (debouncedDraft.title === note.title && debouncedDraft.content === (note.content || "")) return;

    let cancelled = false;
    setSaveState("saving");
    void onUpdate(note.id, { title: debouncedDraft.title || "새 메모", content: debouncedDraft.content }).then((result) => {
      if (!cancelled) setSaveState(result ? "failed" : "saved");
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedDraft, note, onUpdate, trashMode]);

  function saveLabel() {
    if (saveState === "saving") return "저장 중";
    if (saveState === "saved") return "저장됨";
    if (saveState === "failed") return "저장 실패";
    return "대기 중";
  }

  if (!note) {
    return (
      <section className="flex h-full items-center justify-center bg-white px-6 text-center">
        <div>
          <h2 className="text-3xl font-black tracking-normal">온라인 메모장 ✨</h2>
          <p className="mt-4 max-w-xl leading-7 text-[#4f4f4f]">왼쪽의 새 메모 만들기를 눌러 바로 작성해보세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex h-12 items-center gap-6 border-b border-[#eee9e2] px-5 text-sm text-[#6f6258]">
        {onBack ? (
          <button className="rounded-md border border-[#e6e1d9] px-3 py-1.5 md:hidden" onClick={onBack} type="button">
            목록
          </button>
        ) : null}
        <span className="inline-flex items-center gap-2">
          <Save size={16} />
          {saveLabel()}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-5 w-9 rounded-full bg-[#d6d6d6]" />
          자동 저장
        </span>
        <div className="ml-auto flex items-center gap-2">
          {!trashMode ? (
            <>
              <button className="rounded-lg border border-[#e6e1d9] p-2 hover:bg-[#fbfaf7]" onClick={() => void onUpdate(note.id, { is_pinned: !note.is_pinned })} title="고정" type="button">
                <Pin size={17} className={note.is_pinned ? "fill-[#00a82d] text-[#00a82d]" : ""} />
              </button>
              <button className="rounded-lg border border-[#e6e1d9] p-2 hover:bg-[#fbfaf7]" onClick={() => void onDelete(note.id)} title="휴지통" type="button">
                <Trash2 size={17} />
              </button>
            </>
          ) : (
            <>
              <button className="rounded-lg border border-[#e6e1d9] px-3 py-2 text-sm hover:bg-[#fbfaf7]" onClick={() => void onRestore?.(note.id)} type="button">
                복구
              </button>
              <button className="rounded-lg border border-[#e6e1d9] px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => void onPermanentDelete?.(note.id)} type="button">
                영구 삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex h-12 items-center gap-4 border-b border-[#f1eee8] px-5 text-[#9b9b9b]">
        <span className="text-sm">삽입</span>
        <Mic size={17} />
        <CheckCircle2 size={17} />
        <span className="h-5 w-px bg-[#dedbd5]" />
        <Bold size={17} />
        <Italic size={17} />
        <Underline size={17} />
        <List size={17} />
        <Link2 size={17} />
        <AlignLeft size={17} />
        <MoreHorizontal size={17} />
      </div>

      <div className="mx-auto flex w-full max-w-[820px] flex-1 flex-col overflow-hidden px-8 py-20">
        <input
          className="w-full bg-transparent text-4xl font-black tracking-normal outline-none placeholder:text-[#d8d8d8]"
          disabled={trashMode}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
        />
        <textarea
          className="mt-8 flex-1 resize-none bg-transparent text-lg leading-8 outline-none placeholder:text-[#d8d8d8]"
          disabled={trashMode}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="본문 입력"
        />
      </div>
    </section>
  );
}

