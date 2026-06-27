import Link from "next/link";
import { Cloud, FilePlus2, LogIn } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
      <header className="flex min-h-16 items-center justify-between px-5 py-3 lg:px-10">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00a82d] text-white">
            <Cloud size={22} />
          </span>
          <span className="text-2xl font-bold tracking-normal">MemoCloud</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link className="hover:text-[#00a82d]" href="/login">
            로그인
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center px-5 pb-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00a82d] text-white shadow-[0_18px_50px_rgba(0,168,45,0.25)]">
          <Cloud size={34} />
        </div>
        <h1 className="mt-8 text-4xl font-black tracking-normal sm:text-5xl">MemoCloud</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#4f4f4f]">
          빠른 아이디어, 회의 기록, 해야 할 일을 바로 적고 어디서든 이어서 확인하세요.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#00a82d] px-7 py-3 font-bold text-white transition hover:bg-[#008f26]" href="/app">
            <FilePlus2 size={18} />
            바로 메모하기
          </Link>
          <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#e6e1d9] bg-white px-7 py-3 font-bold transition hover:bg-[#fbfaf7]" href="/login">
            <LogIn size={18} />
            로그인
          </Link>
        </div>
        <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
          {["빠른 작성", "자동 저장", "계정 동기화"].map((item) => (
            <div className="rounded-lg border border-[#e6e1d9] bg-white p-4 text-sm font-semibold text-[#4f4f4f]" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
