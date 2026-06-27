"use client";

import { useEffect, useRef, useState } from "react";
import { Pin, Save, Star, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Folder, Note } from "@/lib/types";
import { titleFromContent } from "@/lib/utils";

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
  important?: boolean;
  onBack?: () => void;
  onToggleImportant?: (id: string) => void;
  onUpdate: (id: string, values: Partial<Pick<Note, "title" | "content" | "folder_id" | "is_pinned">>) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
  onPermanentDelete?: (id: string) => Promise<void>;
};

function normalizeHtml(value: string | null | undefined) {
  return (value || "").replace(/\sdata-placeholder="[^"]*"/g, "").trim();
}

function shouldAutoTitle(title: string) {
  return !title.trim() || title.trim() === "새 메모";
}

function sanitizeEditorHtml(html: string) {
  if (typeof window === "undefined") return html;

  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, style, iframe, object, embed").forEach((node) => node.remove());

  template.content.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      const allowedHref = element.tagName.toLowerCase() === "a" && name === "href" && !value.startsWith("javascript:");

      if (name.startsWith("on") || (!["href", "target", "rel", "class"].includes(name) && !name.startsWith("data-")) || (name === "href" && !allowedHref)) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName.toLowerCase() === "a") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer");
    }
  });

  return template.innerHTML.trim();
}

export function NoteEditor({
  note,
  trashMode,
  important = false,
  onBack,
  onUpdate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onToggleImportant
}: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [draftNoteId, setDraftNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debouncedDraft = useDebounce<DebouncedDraft>({ noteId: draftNoteId, title, content }, 500);

  useEffect(() => {
    const nextNoteId = note?.id || null;
    const nextContent = sanitizeEditorHtml(note?.content || "");
    setDraftNoteId(nextNoteId);
    setTitle(note?.title || "");
    setContent(nextContent);
    setSaveState("idle");

    if (editorRef.current) {
      editorRef.current.innerHTML = nextContent;
    }
  }, [note?.id]);

  useEffect(() => {
    if (!note || trashMode) return;
    if (debouncedDraft.noteId !== note.id) return;

    const nextContent = normalizeHtml(debouncedDraft.content);
    const nextTitle = shouldAutoTitle(debouncedDraft.title) ? titleFromContent(nextContent) : debouncedDraft.title.trim();
    if (nextTitle === note.title && nextContent === normalizeHtml(note.content)) return;

    let cancelled = false;
    setSaveState("saving");
    void onUpdate(note.id, { title: nextTitle, content: nextContent }).then((result) => {
      if (cancelled) return;
      setSaveState(result ? "failed" : "saved");
      if (!result && shouldAutoTitle(title) && nextTitle !== title) setTitle(nextTitle);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedDraft, note, onUpdate, title, trashMode]);

  function saveLabel() {
    if (saveState === "saving") return "저장 중";
    if (saveState === "saved") return "저장됨";
    if (saveState === "failed") return "저장 실패";
    return "대기 중";
  }

  function syncEditorContent() {
    const html = sanitizeEditorHtml(editorRef.current?.innerHTML || "");
    setContent(html);
  }

  if (!note) {
    return (
      <section className="flex h-full items-center justify-center bg-white px-6 text-center">
        <div>
          <h2 className="text-3xl font-black tracking-normal">온라인 메모장을 시작하세요</h2>
          <p className="mt-4 max-w-xl leading-7 text-[#4f4f4f]">왼쪽에서 새 메모 만들기를 눌러 바로 작성해보세요.</p>
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
              <button className="rounded-lg border border-[#e6e1d9] p-2 hover:bg-[#fbfaf7]" onClick={() => onToggleImportant?.(note.id)} title="중요" type="button">
                <Star size={17} className={important ? "fill-[#f4b400] text-[#f4b400]" : ""} />
              </button>
              <button className="rounded-lg border border-[#e6e1d9] p-2 hover:bg-[#fbfaf7]" onClick={() => void onUpdate(note.id, { is_pinned: !note.is_pinned })} title="고정" type="button">
                <Pin size={17} className={note.is_pinned ? "fill-[#00a82d] text-[#00a82d]" : ""} />
              </button>
              <button className="rounded-lg border border-[#e6e1d9] p-2 hover:bg-[#fbfaf7]" onClick={() => void onDelete(note.id)} title="삭제" type="button">
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

      <div className="mx-auto flex w-full max-w-[820px] flex-1 flex-col overflow-hidden px-8 py-20">
        <input
          className="w-full bg-transparent text-4xl font-black tracking-normal outline-none placeholder:text-[#d8d8d8]"
          disabled={trashMode}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
        />
        <div
          ref={editorRef}
          className="rich-editor mt-8 flex-1 overflow-y-auto text-lg leading-8 outline-none empty:before:text-[#d8d8d8] empty:before:content-[attr(data-placeholder)]"
          contentEditable={!trashMode}
          data-placeholder="본문 입력"
          onInput={syncEditorContent}
          onBlur={syncEditorContent}
          role="textbox"
          aria-label="메모 본문"
          suppressContentEditableWarning
        />
      </div>
    </section>
  );
}
