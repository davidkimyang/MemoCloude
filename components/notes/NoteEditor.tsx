"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { FolderOpen, Pin, RotateCcw, Save, Trash2 } from "lucide-react";
import type { Folder, Note } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";

type SaveState = "idle" | "saving" | "saved" | "failed";

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

export function NoteEditor({ note, folders, trashMode, onBack, onUpdate, onDelete, onRestore, onPermanentDelete }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setSaveState("idle");
  }, [note?.id, note?.title, note?.content]);

  useEffect(() => {
    if (!note || trashMode) return;
    if (debouncedTitle === note.title && debouncedContent === (note.content || "")) return;

    let cancelled = false;
    setSaveState("saving");
    void onUpdate(note.id, { title: debouncedTitle || "새 메모", content: debouncedContent }).then((result) => {
      if (!cancelled) setSaveState(result ? "failed" : "saved");
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedContent, debouncedTitle, note, onUpdate, trashMode]);

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-muted">
        <div>
          <p className="font-medium text-ink">선택된 메모가 없습니다.</p>
          <p className="mt-2 text-sm">목록에서 메모를 선택하거나 새 메모를 만들어주세요.</p>
        </div>
      </div>
    );
  }

  function saveLabel() {
    if (saveState === "saving") return "저장 중...";
    if (saveState === "saved") return "저장됨";
    if (saveState === "failed") return "저장 실패";
    return "대기 중";
  }

  function changeFolder(event: ChangeEvent<HTMLSelectElement>) {
    if (!note) return;
    void onUpdate(note.id, { folder_id: event.target.value || null });
  }

  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex min-h-16 items-center gap-2 border-b border-line px-4">
        {onBack ? (
          <button className="rounded-xl border border-line px-3 py-2 text-sm md:hidden" onClick={onBack} type="button">
            목록
          </button>
        ) : null}
        <span className="inline-flex items-center gap-2 text-sm text-muted">
          <Save size={16} />
          {saveLabel()}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {!trashMode ? (
            <>
              <label className="hidden items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-muted sm:flex">
                <FolderOpen size={16} />
                <select className="bg-transparent outline-none" value={note.folder_id || ""} onChange={changeFolder}>
                  <option value="">폴더 없음</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="rounded-xl border border-line p-2 transition hover:bg-paper"
                onClick={() => void onUpdate(note.id, { is_pinned: !note.is_pinned })}
                title={note.is_pinned ? "고정 해제" : "메모 고정"}
                type="button"
              >
                <Pin size={18} className={note.is_pinned ? "fill-accent text-accent" : ""} />
              </button>
              <button className="rounded-xl border border-line p-2 transition hover:bg-paper" onClick={() => void onDelete(note.id)} title="휴지통으로 이동" type="button">
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <>
              <button className="rounded-xl border border-line p-2 transition hover:bg-paper" onClick={() => void onRestore?.(note.id)} title="복구" type="button">
                <RotateCcw size={18} />
              </button>
              <button className="rounded-xl border border-line p-2 text-red-600 transition hover:bg-red-50" onClick={() => void onPermanentDelete?.(note.id)} title="영구 삭제" type="button">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden px-5 py-4">
        <input
          className="w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-line"
          disabled={trashMode}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목 입력"
        />
        <textarea
          className="mt-5 flex-1 resize-none bg-transparent text-base leading-7 outline-none placeholder:text-line"
          disabled={trashMode}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="본문 입력"
        />
      </div>
    </section>
  );
}
