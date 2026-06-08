"use client";

import { Menu, PlusCircle, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

type TopbarProps = {
  search: string;
  onSearch: (value: string) => void;
  onNewNote: () => void;
  onOpenMobileNav: () => void;
};

export function Topbar({ search, onSearch, onNewNote, onOpenMobileNav }: TopbarProps) {
  const router = useRouter();

  return (
    <header className="flex min-h-16 items-center gap-3 border-b border-line bg-white px-4">
      <button className="shrink-0 rounded-xl border border-line p-2 lg:hidden" onClick={onOpenMobileNav} title="메뉴" type="button">
        <Menu size={19} />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-paper px-3 py-2">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="메모 검색"
        />
      </div>
      <button
        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        onClick={onNewNote}
        title="새 메모 작성"
        type="button"
      >
        <PlusCircle size={19} />
        <span>새 메모</span>
      </button>
      <button className="shrink-0 rounded-xl border border-line p-2" onClick={() => router.push("/settings")} title="설정" type="button">
        <Settings size={18} />
      </button>
    </header>
  );
}

