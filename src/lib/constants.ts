export const DEFAULT_BRAND_NAME = import.meta.env.VITE_BRAND_NAME || "Portal";

export const DEFAULT_SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://example.com";

export const DEFAULT_CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || "kontakt@example.com";

export const DEFAULT_SITE_DESCRIPTION =
  import.meta.env.VITE_SITE_DESCRIPTION ||
  "Ein modulares Vergleichsportal für Ratgeber, Rechner und strukturierte Angebotsübersichten.";

export const DEFAULT_AUTHOR_NAME = DEFAULT_BRAND_NAME;

export const DEFAULT_ASSISTANT_IMAGE =
  import.meta.env.VITE_ASSISTANT_IMAGE || "/brand/default-assistant.png";

export const DEFAULT_HERO_IMAGE =
  import.meta.env.VITE_DEFAULT_HERO_IMAGE || "/brand/default-hero.webp";

export function buildAbsoluteSiteUrl(path = "/", siteUrl = DEFAULT_SITE_URL) {
  const base = String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const rawPath = String(path || "/").trim();
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return `${base}${normalizedPath}`;
}
