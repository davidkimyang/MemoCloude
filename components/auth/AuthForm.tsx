"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!hasSupabaseEnv) {
      setMessage("Supabase 환경 변수를 먼저 설정해주세요.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isSignup) {
      setMessage("가입이 완료되었습니다. 바로 로그인하거나 이메일 확인이 필요한 경우 메일함을 확인해주세요.");
      return;
    }

    router.push("/app");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-[#171717]">
      <div className="pointer-events-none absolute right-[-90px] top-[-80px] h-72 w-72 rounded-full bg-[#c78df2]" />
      <div className="pointer-events-none absolute bottom-[-110px] right-[70px] h-64 w-64 rounded-full bg-[#ff9d21]" />
      <div className="pointer-events-none absolute left-[58%] top-[-70px] h-44 w-44 rotate-45 bg-[#8bd33f]" />
      <div className="grid min-h-screen lg:grid-cols-[minmax(420px,720px)_1fr]">
        <section className="flex items-center justify-center px-6 py-14">
          <div className="w-full max-w-[520px]">
            <Link className="mb-16 inline-flex items-center gap-3" href="/">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00a82d] text-white">
                <Cloud size={25} />
              </span>
              <span className="text-2xl font-bold">MemoCloud</span>
            </Link>

            <h1 className="text-4xl font-bold tracking-normal">{isSignup ? "MemoCloud에 오신 것을 환영합니다!" : "다시 오신 것을 환영합니다!"}</h1>
            <p className="mt-4 text-base text-[#4f4f4f]">{isSignup ? "가입하여 메모를 계정에 안전하게 저장하세요." : "로그인하여 저장된 메모를 이어서 작성하세요."}</p>

            <form className="mt-9 space-y-4" onSubmit={onSubmit}>
              <input
                className="h-14 w-full rounded-md border border-[#5f6cff] bg-white px-4 text-base outline-none focus:ring-2 focus:ring-[#5f6cff]/20"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일 주소"
                required
              />
              <input
                className="h-14 w-full rounded-md border border-[#d8d8d8] bg-white px-4 text-base outline-none focus:border-[#5f6cff]"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
                required
              />
              {isSignup ? (
                <input
                  className="h-14 w-full rounded-md border border-[#d8d8d8] bg-white px-4 text-base outline-none focus:border-[#5f6cff]"
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="비밀번호 확인"
                  required
                />
              ) : null}

              {message ? <p className="rounded-lg bg-white px-4 py-3 text-sm text-[#4f4f4f] shadow-sm">{message}</p> : null}

              <button
                className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#171717] font-bold text-white transition hover:bg-black disabled:bg-[#c9c9c9]"
                disabled={loading}
                type="submit"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {isSignup ? "계속" : "로그인"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-6 text-sm text-[#777]">
              <span className="h-px flex-1 bg-[#cfcfcf]" />
              또는
              <span className="h-px flex-1 bg-[#cfcfcf]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button className="h-12 rounded-md border border-[#d8d8d8] bg-white font-semibold text-[#333]" type="button">
                Google 계정으로 계속하기
              </button>
              <button className="h-12 rounded-md border border-[#d8d8d8] bg-white font-semibold text-[#333]" type="button">
                Apple 계속
              </button>
            </div>

            <p className="mt-9 text-center text-sm text-[#777]">
              {isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}{" "}
              <Link className="font-bold text-[#405cff]" href={isSignup ? "/login" : "/signup"}>
                {isSignup ? "로그인" : "회원가입"}
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden items-center justify-center px-10 lg:flex">
          <div className="max-w-[560px]">
            <p className="text-[96px] font-black leading-[0.98] tracking-normal xl:text-[112px]">
              Your
              <br />
              <span className="bg-[#d9f8b5] px-3">second</span>
              <br />
              brain
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

