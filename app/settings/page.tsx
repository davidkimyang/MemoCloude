"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-paper px-5 py-8 text-ink">
      <section className="mx-auto max-w-2xl rounded-[28px] border border-line bg-white p-6 shadow-soft">
        <button className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-2 text-sm" onClick={() => router.push("/app")} type="button">
          <ArrowLeft size={17} />
          앱으로 돌아가기
        </button>
        <h1 className="text-3xl font-semibold">설정</h1>
        <p className="mt-2 text-muted">계정 정보와 세션을 관리합니다.</p>
        <div className="mt-8 rounded-2xl bg-paper p-4">
          <p className="text-sm font-semibold">Supabase Auth</p>
          <p className="mt-2 text-sm leading-6 text-muted">로그인된 계정의 데이터는 RLS 정책에 따라 본인에게만 표시됩니다.</p>
        </div>
        <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 font-semibold text-white" onClick={logout} type="button">
          <LogOut size={18} />
          로그아웃
        </button>
      </section>
    </main>
  );
}

