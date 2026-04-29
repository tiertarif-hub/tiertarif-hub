import { normalizeNavigableHref } from "@/lib/routes";

export const TIERTARIF_COMPARISON_LINKS = {
  hunde: "/hundekrankenversicherung-vergleich",
  katzen: "/katzenversicherung-vergleich",
  pferde: "/pferde-op-versicherung-vergleich",
} as const;

const GENERIC_CATEGORY_TARGETS = new Set(["", "/", "/kategorien", "/categories"]);

const normalizeNeedleText = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9äöüß\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export function getTierTarifComparisonLinkFromText(...parts: unknown[]): string | null {
  const haystack = normalizeNeedleText(parts.filter(Boolean).join(" "));

  if (!haystack) return null;

  if (/(pferd|pferde|pferde-op|kolik|chips|ocd|pferdehaftpflicht)/i.test(haystack)) {
    return TIERTARIF_COMPARISON_LINKS.pferde;
  }

  if (/(katze|katzen|katzenschutz|forl|zahn-op|zahn)/i.test(haystack)) {
    return TIERTARIF_COMPARISON_LINKS.katzen;
  }

  if (/(hund|hunde|hundeschutz|hundekranken|hunde-op)/i.test(haystack)) {
    return TIERTARIF_COMPARISON_LINKS.hunde;
  }

  return null;
}

export function resolveTierTarifComparisonHref(
  rawHref: string | null | undefined,
  textParts: unknown[] = [],
  fallback = "/kategorien",
): string {
  const normalizedHref = normalizeNavigableHref(rawHref, fallback);
  const mappedHref = getTierTarifComparisonLinkFromText(...textParts);

  if (mappedHref && GENERIC_CATEGORY_TARGETS.has(normalizedHref.toLowerCase())) {
    return mappedHref;
  }

  return normalizedHref;
}
