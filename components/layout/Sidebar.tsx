"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Edit3, Folder, FolderPlus, LogIn, LogOut, Pin, Settings, Trash2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Folder as FolderType, FolderFilter } from "@/lib/types";

type SidebarProps = {
  folders: FolderType[];
  selectedFilter: FolderFilter;
  isGuest: boolean;
  userEmail?: string | null;
  onSelect: (filter: FolderFilter) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
};

export function Sidebar({ folders, selectedFilter, isGuest, userEmail, onSelect, onCreateFolder, onRenameFolder, onDeleteFolder }: SidebarProps) {
  const router = useRouter();
  const [folderName, setFolderName] = useState("");

  async function submitFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateFolder(folderName);
    setFolderName("");
  }

  async function logout() {
    if (isGuest) {
      router.push("/login");
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
  }

  const baseItems = [
    { id: "all", label: "전체 메모", icon: Edit3 },
    { id: "pinned", label: "고정 메모", icon: Pin },
    { id: "recent", label: "최근 메모", icon: Clock },
    { id: "trash", label: "휴지통", icon: Trash2 }
  ];

  return (
    <aside className="flex h-full flex-col border-r border-line bg-paper/80 p-4">
      <div className="mb-5">
        <button className="text-left" onClick={() => router.push("/")} title="홈으로 이동" type="button">
          <h1 className="text-2xl font-semibold tracking-normal transition hover:text-accent">MemoCloud</h1>
        </button>
        <p className="mt-1 text-sm text-muted">개인 메모 워크스페이스</p>
      </div>

      <nav className="space-y-1">
        {baseItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${
                selectedFilter === item.id ? "bg-white shadow-sm" : "hover:bg-white/70"
              }`}
              key={item.id}
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">폴더</p>
      </div>

      <form className="mt-3 flex gap-2" onSubmit={submitFolder}>
        <input
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          value={folderName}
          onChange={(event) => setFolderName(event.target.value)}
          placeholder="새 폴더"
        />
        <button className="rounded-xl bg-ink p-2 text-white" title="폴더 추가" type="submit">
          <FolderPlus size={18} />
        </button>
      </form>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {folders.length ? (
          folders.map((folder) => (
            <div className="group mb-1 flex items-center gap-1" key={folder.id}>
              <button
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                  selectedFilter === folder.id ? "bg-white shadow-sm" : "hover:bg-white/70"
                }`}
                onClick={() => onSelect(folder.id)}
                type="button"
              >
                <Folder size={18} />
                <span className="truncate">{folder.name}</span>
              </button>
              <button
                className="rounded-xl p-2 text-muted opacity-0 transition hover:bg-white group-hover:opacity-100"
                onClick={() => {
                  const name = window.prompt("폴더 이름", folder.name);
                  if (name) void onRenameFolder(folder.id, name);
                }}
                title="폴더 이름 변경"
                type="button"
              >
                <Edit3 size={15} />
              </button>
              <button
                className="rounded-xl p-2 text-muted opacity-0 transition hover:bg-white group-hover:opacity-100"
                onClick={() => {
                  if (window.confirm("폴더를 삭제할까요? 메모는 삭제되지 않습니다.")) void onDeleteFolder(folder.id);
                }}
                title="폴더 삭제"
                type="button"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white/60 px-3 py-4 text-sm text-muted">폴더가 없습니다. 새 폴더를 만들어보세요.</p>
        )}
      </div>

      <section className="mt-4 rounded-2xl border border-line bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-muted">
            <UserRound size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">{isGuest ? "비회원 모드" : "로그인됨"}</p>
            <p className="truncate text-sm font-medium" title={isGuest ? "로그인하면 메모를 계정에 저장할 수 있습니다." : userEmail || ""}>
              {isGuest ? "로컬 저장 중" : userEmail || "이메일 없음"}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm" onClick={() => router.push("/settings")} type="button">
            <Settings size={16} />
            설정
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white" onClick={logout} type="button">
            {isGuest ? <LogIn size={16} /> : <LogOut size={16} />}
            {isGuest ? "로그인" : "로그아웃"}
          </button>
        </div>
      </section>
    </aside>
  );
}

