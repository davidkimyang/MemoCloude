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
      setMessage(".env.local에 Supabase URL과 anon key를 먼저 설정해주세요.");
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
      setMessage("가입이 완료되었습니다. 이메일 확인 설정이 켜져 있다면 메일함을 확인해주세요.");
      return;
    }

    router.push("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12 text-ink">
      <section className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-soft">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
            <Cloud size={22} />
          </div>
          <div>
            <p className="text-sm text-muted">MemoCloud</p>
            <h1 className="text-2xl font-semibold">{isSignup ? "회원가입" : "로그인"}</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium">이메일</span>
            <input
              className="mt-2 w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-accent"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">비밀번호</span>
            <input
              className="mt-2 w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-accent"
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {isSignup ? (
            <label className="block">
              <span className="text-sm font-medium">비밀번호 확인</span>
              <input
                className="mt-2 w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-accent"
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>
          ) : null}

          {message ? <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-muted">{message}</p> : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-black disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {isSignup ? "계정 만들기" : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? "이미 계정이 있나요?" : "처음 사용하시나요?"}{" "}
          <Link className="font-semibold text-ink" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "로그인" : "회원가입"}
          </Link>
        </p>
      </section>
    </main>
  );
}

