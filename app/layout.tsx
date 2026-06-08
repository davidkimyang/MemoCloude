import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemoCloud",
  description: "폴더, 검색, 고정, 휴지통을 갖춘 개인 메모 SaaS"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

