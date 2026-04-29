export const DEFAULT_SITE_URL = Deno.env.get("SITE_URL")?.trim() || "https://tiertarif.com";

function sanitizeSlug(rawSlug: string): string {
  return String(rawSlug ?? "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function normalizeRoutePath(rawPath: string): string {
  const cleaned = String(rawPath ?? "").trim();

  if (!cleaned || cleaned === "/") {
    return "/";
  }

  const withLeadingSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const collapsed = withLeadingSlash.replace(/\/+/g, "/");

  return collapsed.length > 1 && collapsed.endsWith("/")
    ? collapsed.slice(0, -1)
    : collapsed;
}

export function buildAbsoluteSiteUrl(
  path: string,
  siteUrl: string = DEFAULT_SITE_URL,
): string {
  return `${String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "")}${normalizeRoutePath(path)}`;
}

export function getCategoriesRoute(): string {
  return "/kategorien";
}

export function getCategoryRoute(slug: string): string {
  return normalizeRoutePath(`/${sanitizeSlug(slug)}`);
}

export function getProjectRoute(slug: string): string {
  return normalizeRoutePath(`/go/${sanitizeSlug(slug)}`);
}

export function getForumIndexRoute(): string {
  return "/forum";
}

export function getForumCategoryRoute(slug: string): string {
  return normalizeRoutePath(`/forum/kategorie/${sanitizeSlug(slug)}`);
}

export function getForumThreadRoute(slug: string): string {
  return normalizeRoutePath(`/forum/${sanitizeSlug(slug)}`);
}
