import Link from "next/link";
import { Cloud, FilePlus2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
      <header className="flex h-20 items-center justify-between px-8 lg:px-20">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00a82d] text-white">
            <Cloud size={24} />
          </span>
          <span className="text-3xl font-bold tracking-normal">MemoCloud</span>
        </Link>
        <nav className="flex items-center gap-8 text-base font-medium">
          <Link className="hidden hover:text-[#00a82d] sm:inline" href="/app">
            온라인 메모장
          </Link>
          <Link className="hover:text-[#00a82d]" href="/login">
            로그인
          </Link>
        </nav>
      </header>

      <section className="grid min-h-[calc(100vh-80px)] gap-2 px-2 pb-6 lg:grid-cols-[292px_1fr]">
        <aside className="rounded-xl border border-[#e6e1d9] bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">메모</h1>
            <span className="text-sm text-[#6f6258]">1 메모</span>
          </div>
          <Link className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#00a82d] font-bold text-white transition hover:bg-[#008f26]" href="/app">
            <FilePlus2 size={18} />새 메모 만들기
          </Link>

          <div className="mt-8 rounded-lg border border-[#6476ff] p-5">
            <h2 className="font-bold">온라인 메모장</h2>
            <p className="mt-2 text-sm text-[#6f6258]">마지막 동기화: 지금</p>
          </div>

        </aside>

        <section className="relative overflow-hidden rounded-xl border border-[#e6e1d9] bg-white shadow-sm">
          <div className="flex h-14 items-center gap-7 border-b border-[#eee9e2] px-5 text-sm text-[#6f6258]">
            <span className="inline-flex items-center gap-2">△ 저장되지 않음</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-6 w-10 rounded-full bg-[#d6d6d6]" />
              자동 저장
            </span>
          </div>
          <div className="mx-auto mt-32 max-w-[760px] px-8">
            <h2 className="text-center text-4xl font-black tracking-normal">온라인 메모장 ✨</h2>
            <p className="mt-6 text-center text-base leading-7 text-[#171717]">
              브레인스토밍, 인터뷰 기록, 기사 초안, 빠른 아이디어를 한 곳에 작성하세요. MemoCloud는 필요한 기능만 남긴
              깔끔한 온라인 메모장입니다.
            </p>
            <div className="mt-8 flex justify-center">
              <Link className="rounded-lg bg-[#00a82d] px-7 py-3 font-bold text-white transition hover:bg-[#008f26]" href="/app">
                바로 메모하기
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
