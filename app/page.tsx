import Link from "next/link";
import { ArrowRight, Cloud, Folder, Search, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent">
              <Cloud size={21} />
            </div>
            <span className="text-lg font-semibold">MemoCloud</span>
          </div>
          <Link className="rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white" href="/login">
            로그인
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_520px]">
          <div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">MemoCloud</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              폴더, 검색, 고정 메모, 휴지통과 자동 저장을 갖춘 개인 메모 서비스입니다. 빠르게 적고 필요한 순간 바로 찾을 수 있게 설계했습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-ink" href="/app">
                시작하기 <ArrowRight size={18} />
              </Link>
              <Link className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 font-semibold" href="/login">
                이미 계정이 있어요
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-4 shadow-soft">
            <div className="grid h-[440px] grid-cols-[150px_1fr] overflow-hidden rounded-[22px] border border-line bg-paper">
              <div className="border-r border-line p-3">
                {[
                  ["전체 메모", Folder],
                  ["검색", Search],
                  ["보안", ShieldCheck]
                ].map(([label, Icon]) => (
                  <div className="mb-2 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm" key={label as string}>
                    <Icon size={16} />
                    {label as string}
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="mb-3 h-10 rounded-2xl bg-white" />
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-semibold">제품 아이디어</p>
                    <p className="mt-2 text-sm leading-6 text-muted">고객 피드백, 출시 체크리스트, 다음 액션 정리</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-semibold">고정 메모</p>
                    <p className="mt-2 text-sm leading-6 text-muted">중요한 메모는 목록 상단에 유지</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-semibold">자동 저장</p>
                    <p className="mt-2 text-sm leading-6 text-muted">입력 후 500ms 뒤 저장 상태 표시</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
