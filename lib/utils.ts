import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function previewText(content: string | null | undefined) {
  const text = plainText(content);

  return text ? text.slice(0, 90) : "내용 없음";
}

export function plainText(content: string | null | undefined) {
  return (
    content
      ?.replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|li|blockquote|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim() || ""
  );
}

export function titleFromContent(content: string | null | undefined) {
  const firstLine =
    content
      ?.replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|li|blockquote|h[1-6])>/gi, "\n")
      .split("\n")
      .map((line) => plainText(line))
      .find(Boolean) || "";
  return firstLine ? firstLine.slice(0, 36) : "새 메모";
}
