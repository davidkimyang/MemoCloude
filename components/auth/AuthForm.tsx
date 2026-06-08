"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Apple, Cloud, Loader2 } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.94a5.08 5.08 0 0 1-2.2 3.33v2.72h3.56c2.08-1.92 3.3-4.74 3.3-8.04Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.3-2.73l-3.56-2.72c-.98.66-2.23 1.05-3.74 1.05-2.87 0-5.3-1.93-6.16-4.53H2.18v2.81A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.07A6.61 6.61 0 0 1 5.5 12c0-.72.12-1.42.34-2.07V7.12H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.88l3.66-2.81Z" />
      <path fill="#EA4335" d="M12 5.4c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.12 14.97 1 12 1A11 11 0 0 0 2.18 7.12l3.66 2.81C6.7 7.33 9.13 5.4 12 5.4Z" />
    </svg>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null);
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
    const result = isSignup ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isSignup) {
      setMessage("가입이 완료되었습니다. 이메일 확인이 필요한 경우 메일함을 확인해주세요.");
      return;
    }

    router.push("/app");
  }

  async function signInWithProvider(provider: Provider) {
    setMessage(null);

    if (!hasSupabaseEnv) {
      setMessage("Supabase 환경 변수를 먼저 설정해주세요.");
      return;
    }

    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });

    if (error) {
      setOauthLoading(null);
      setMessage(error.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-5 py-12 text-[#171717]">
      <section className="w-full max-w-[540px]">
        <Link className="mx-auto mb-12 flex w-fit items-center gap-3" href="/">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00a82d] text-white">
            <Cloud size={25} />
          </span>
          <span className="text-2xl font-bold">MemoCloud</span>
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#e6e1d9]">
          <h1 className="text-center text-4xl font-bold tracking-normal">{isSignup ? "MemoCloud에 오신 것을 환영합니다!" : "다시 오신 것을 환영합니다!"}</h1>
          <p className="mt-4 text-center text-base text-[#4f4f4f]">{isSignup ? "가입하고 메모를 계정에 저장하세요." : "로그인하여 저장된 메모를 이어서 작성하세요."}</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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

            {message ? <p className="rounded-lg bg-[#fbfaf7] px-4 py-3 text-sm text-[#4f4f4f]">{message}</p> : null}

            <button
              className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#171717] font-bold text-white transition hover:bg-black disabled:bg-[#c9c9c9]"
              disabled={loading || Boolean(oauthLoading)}
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
            <button
              className="flex h-12 items-center justify-center gap-3 rounded-md border border-[#d8d8d8] bg-white font-semibold text-[#333] transition hover:bg-[#fbfaf7] disabled:opacity-60"
              disabled={loading || Boolean(oauthLoading)}
              onClick={() => void signInWithProvider("google")}
              type="button"
            >
              {oauthLoading === "google" ? <Loader2 className="animate-spin" size={18} /> : <GoogleMark />}
              Google로 계속하기
            </button>
            <button
              className="flex h-12 items-center justify-center gap-3 rounded-md border border-[#d8d8d8] bg-white font-semibold text-[#333] transition hover:bg-[#fbfaf7] disabled:opacity-60"
              disabled={loading || Boolean(oauthLoading)}
              onClick={() => void signInWithProvider("apple")}
              type="button"
            >
              {oauthLoading === "apple" ? <Loader2 className="animate-spin" size={18} /> : <Apple size={20} fill="currentColor" />}
              Apple로 계속하기
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[#777]">
            {isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}{" "}
            <Link className="font-bold text-[#405cff]" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "로그인" : "회원가입"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
