"use client";

import { Home, LogIn, LogOut, Menu, Plus, Search, Settings, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type TopbarProps = {
  search: string;
  isGuest: boolean;
  userEmail?: string | null;
  onSearch: (value: string) => void;
  onNewNote: () => void;
  onOpenMobileNav: () => void;
};

export function Topbar({ search, isGuest, userEmail, onSearch, onNewNote, onOpenMobileNav }: TopbarProps) {
  const router = useRouter();

  async function logout() {
    if (isGuest) {
      router.push("/login");
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex min-h-16 items-center gap-3 border-b border-line bg-white px-4">
      <button className="rounded-xl border border-line p-2 lg:hidden" onClick={onOpenMobileNav} title="메뉴" type="button">
        <Menu size={19} />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-paper px-3 py-2">
        <Search size={18} className="text-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="메모 검색"
        />
      </div>
      <span
        className="hidden max-w-[220px] items-center gap-2 truncate rounded-xl bg-paper px-3 py-2 text-xs font-semibold text-muted sm:inline-flex"
        title={isGuest ? "비회원 모드" : userEmail || "로그인됨"}
      >
        <UserRound size={15} />
        <span className="truncate">{isGuest ? "비회원 모드" : userEmail || "로그인됨"}</span>
      </span>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-ink" onClick={onNewNote} type="button">
        <Plus size={18} />
        <span className="hidden sm:inline">새 메모</span>
      </button>
      <button className="rounded-xl border border-line p-2" onClick={() => router.push("/")} title="홈으로 이동" type="button">
        <Home size={18} />
      </button>
      <button className="rounded-xl border border-line p-2" onClick={() => router.push("/settings")} title="설정" type="button">
        <Settings size={18} />
      </button>
      <button className="rounded-xl border border-line p-2" onClick={logout} title={isGuest ? "로그인" : "로그아웃"} type="button">
        {isGuest ? <LogIn size={18} /> : <LogOut size={18} />}
      </button>
    </header>
  );
}

