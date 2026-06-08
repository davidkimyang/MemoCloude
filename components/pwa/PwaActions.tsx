"use client";

import { useEffect, useState } from "react";
import { Download, StickyNote } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaActionsProps = {
  compact?: boolean;
};

export function PwaActions({ compact = false }: PwaActionsProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The app still works online if service worker registration fails.
      });
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function openSticky() {
    const popup = window.open("/sticky", "memocloud-sticky", "width=420,height=560,menubar=no,toolbar=no,location=no,status=no");
    popup?.focus();
  }

  const buttonClass = compact
    ? "inline-flex items-center gap-2 rounded-lg border border-[#e6e1d9] px-3 py-2 text-sm font-semibold hover:bg-white"
    : "inline-flex items-center gap-2 rounded-lg border border-[#e6e1d9] px-4 py-2.5 font-semibold hover:bg-white";

  return (
    <div className="flex items-center gap-2">
      <button className={buttonClass} onClick={openSticky} type="button">
        <StickyNote size={compact ? 16 : 18} />
        <span>{compact ? "포스트잇" : "포스트잇 열기"}</span>
      </button>
      {installPrompt ? (
        <button className={buttonClass} onClick={installApp} type="button">
          <Download size={compact ? 16 : 18} />
          <span>{compact ? "설치" : "앱 설치"}</span>
        </button>
      ) : null}
    </div>
  );
}
