"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cloud, Copy, Eraser, Save, WifiOff } from "lucide-react";

const STICKY_KEY = "memocloud:sticky:note";
const STICKY_UPDATED_KEY = "memocloud:sticky:updated";

function formatUpdated(value: string | null) {
  if (!value) return "아직 저장 전";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function StickyPage() {
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContent(window.localStorage.getItem(STICKY_KEY) || "");
    setUpdatedAt(window.localStorage.getItem(STICKY_UPDATED_KEY));
  }, []);

  useEffect(() => {
    const nextUpdatedAt = new Date().toISOString();
    window.localStorage.setItem(STICKY_KEY, content);
    window.localStorage.setItem(STICKY_UPDATED_KEY, nextUpdatedAt);
    setUpdatedAt(nextUpdatedAt);
  }, [content]);

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  async function copyText() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  function clearSticky() {
    if (!content || window.confirm("포스트잇 내용을 비울까요?")) {
      setContent("");
    }
  }

  return (
    <main className="min-h-screen bg-[#fff3a8] text-[#1d1d1f]">
      <header className="flex h-16 items-center justify-between border-b border-[#e6d66d] bg-[#fff7c7] px-4">
        <Link className="flex items-center gap-2 font-black" href="/app">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a82d] text-white">
            <Cloud size={19} />
          </span>
          MemoCloud
        </Link>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-[#d7c75f] bg-white/60 p-2 hover:bg-white" onClick={copyText} title="복사" type="button">
            <Copy size={17} />
          </button>
          <button className="rounded-lg border border-[#d7c75f] bg-white/60 p-2 hover:bg-white" onClick={clearSticky} title="비우기" type="button">
            <Eraser size={17} />
          </button>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-64px)] flex-col p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6a5b14]">
          <span className="inline-flex items-center gap-1">
            <Save size={14} />
            자동 저장
          </span>
          <span className="inline-flex items-center gap-1">
            <WifiOff size={14} />
            오프라인 가능
          </span>
          <span>{formatUpdated(updatedAt)}</span>
          <span className="ml-auto">{wordCount} 단어</span>
        </div>

        <textarea
          className="min-h-[420px] flex-1 resize-none rounded-2xl border border-[#e6d66d] bg-[#fff9bf] p-5 text-lg leading-8 shadow-[0_18px_50px_rgba(92,76,0,0.12)] outline-none placeholder:text-[#9f8c34]"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="빠르게 적어둘 내용을 입력하세요."
          autoFocus
        />

        <p className="mt-3 text-center text-xs font-semibold text-[#6a5b14]">{copied ? "복사했습니다." : "인터넷이 끊겨도 이 화면에서 작성한 내용은 이 기기에 저장됩니다."}</p>
      </section>
    </main>
  );
}
