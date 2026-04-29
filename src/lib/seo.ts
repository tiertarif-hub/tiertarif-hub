import { DEFAULT_SITE_URL } from "@/lib/constants";
import { normalizeRoutePath } from "@/lib/routes";

export function buildCanonicalUrl(path: string, siteUrl: string = DEFAULT_SITE_URL): string {
  return `${String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "")}${normalizeRoutePath(path)}`;
}

export function buildCanonicalUrlFromLocation(pathname?: string | null): string {
  return buildCanonicalUrl(pathname || "/");
}

export function stripHtmlToPlainText(input?: string | null, maxLength?: number): string {
  if (!input) return "";

  const raw = String(input);
  const htmlFree = raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (!maxLength || htmlFree.length <= maxLength) {
    return htmlFree;
  }

  return `${htmlFree.slice(0, maxLength).trim()}…`;
}

export function sanitizeJsonForScript<T>(value: T): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
