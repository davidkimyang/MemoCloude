import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemoCloud",
  description: "폴더, 검색, 고정, 휴지통과 포스트잇 메모를 갖춘 개인 메모 앱",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
