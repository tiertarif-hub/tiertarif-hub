import { DEFAULT_SITE_URL } from "@/lib/constants";

const LEGACY_ROUTE_REWRITES: Record<string, string> = {
  "/categories": "/kategorien",
  "/categories/software": "/kategorien",
  "/categories/finance": "/kategorien",
  "/categories/agency": "/kategorien",
  "/software": "/kategorien",
  "/finanzen": "/kategorien",
  "/dienstleistungen": "/kategorien",
};

const EXTERNAL_LINK_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

const RESERVED_TOP_LEVEL_SLUGS = new Set([
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "site.webmanifest",
  "manifest.json",
  "asset-manifest.json",
  "browserconfig.xml",
  "ads.txt",
  "security.txt",
]);

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

export function isExternalLinkTarget(rawTarget: string | null | undefined): boolean {
  const cleaned = String(rawTarget ?? "").trim();
  return EXTERNAL_LINK_PATTERN.test(cleaned);
}

export function isSpecialLinkTarget(rawTarget: string | null | undefined): boolean {
  const cleaned = String(rawTarget ?? "").trim();
  return cleaned.startsWith("#") || cleaned.startsWith("?");
}

export function normalizeNavigableHref(
  rawHref: string | null | undefined,
  fallback: string = "/",
): string {
  const cleaned = String(rawHref ?? "").trim();

  if (!cleaned) {
    return fallback;
  }

  if (isExternalLinkTarget(cleaned) || isSpecialLinkTarget(cleaned)) {
    return cleaned;
  }

  const normalized = normalizeRoutePath(cleaned);
  const legacyTarget = LEGACY_ROUTE_REWRITES[normalized.toLowerCase()];

  return legacyTarget ?? normalized;
}

export function normalizeInternalLinkTarget(
  rawTarget: string | null | undefined,
  fallback: string = "/",
): string {
  return normalizeNavigableHref(rawTarget, fallback);
}

export const normalizeInternalHref = normalizeInternalLinkTarget;

type LinkTreeNode = {
  url?: string | null;
  items?: LinkTreeNode[] | null;
  [key: string]: unknown;
};

type HeaderConfigLike = {
  button_url?: string | null;
  nav_links?: LinkTreeNode[] | null;
  hub_links?: LinkTreeNode[] | null;
  tools_links?: LinkTreeNode[] | null;
  [key: string]: unknown;
};

type FooterConfigLike = {
  legal_links?: LinkTreeNode[] | null;
  popular_links?: LinkTreeNode[] | null;
  tools_links?: LinkTreeNode[] | null;
  [key: string]: unknown;
};

export function normalizeLinkField<T extends Record<string, unknown>, K extends keyof T>(
  item: T,
  field: K,
  fallback: string = "/",
): T {
  const rawValue = item[field];
  const normalizedValue = normalizeNavigableHref(
    typeof rawValue === "string" ? rawValue : null,
    fallback,
  );

  return {
    ...item,
    [field]: normalizedValue,
  };
}

export function normalizeLinkTree<T extends LinkTreeNode>(links: T[] | null | undefined): T[] {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.map((link) => ({
    ...link,
    url: normalizeNavigableHref(link.url),
    items: Array.isArray(link.items) ? normalizeLinkTree(link.items) : link.items,
  })) as T[];
}

export function normalizeHeaderConfigLinks<T extends HeaderConfigLike>(config: T): T {
  return {
    ...config,
    button_url: normalizeNavigableHref(config.button_url),
    nav_links: normalizeLinkTree(config.nav_links),
    hub_links: normalizeLinkTree(config.hub_links),
    tools_links: normalizeLinkTree(config.tools_links),
  };
}

export function normalizeFooterConfigLinks<T extends FooterConfigLike>(config: T): T {
  return {
    ...config,
    legal_links: normalizeLinkTree(config.legal_links),
    popular_links: normalizeLinkTree(config.popular_links),
    tools_links: normalizeLinkTree(config.tools_links),
  };
}

export function isBlockedTopLevelSlug(rawSlug: string | null | undefined): boolean {
  const slug = sanitizeSlug(String(rawSlug ?? "")).toLowerCase();

  if (!slug) return true;
  if (RESERVED_TOP_LEVEL_SLUGS.has(slug)) return true;

  return /\.[a-z0-9]+$/i.test(slug);
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

export function getCategoryCanonicalUrl(
  slug: string,
  siteUrl: string = DEFAULT_SITE_URL,
): string {
  return buildAbsoluteSiteUrl(getCategoryRoute(slug), siteUrl);
}

export function getProjectRoute(slug: string): string {
  return normalizeRoutePath(`/go/${sanitizeSlug(slug)}`);
}

export function getProjectCanonicalUrl(
  slug: string,
  siteUrl: string = DEFAULT_SITE_URL,
): string {
  return buildAbsoluteSiteUrl(getProjectRoute(slug), siteUrl);
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

export function getCategoriesCanonicalUrl(siteUrl: string = DEFAULT_SITE_URL): string {
  return buildAbsoluteSiteUrl(getCategoriesRoute(), siteUrl);
}
