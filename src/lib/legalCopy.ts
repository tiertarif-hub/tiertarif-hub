export const TIERTARIF_BLOCKED_COPY_TERMS = [
  "beste",
  "besten",
  "empfehlen",
  "empfehlung",
  "testsieger",
  "makler",
  "beratung",
  "berater",
  "experte",
  "experten",
  "perfekt",
  "perfekte",
  "perfekten",
  "garantiert",
] as const;

function normalizeCopy(value?: string | null): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss");
}

function normalizeTerm(term: string): string {
  return normalizeCopy(term);
}

export function findBlockedTierTarifCopyTerms(input?: string | null): string[] {
  const normalizedInput = normalizeCopy(input);
  if (!normalizedInput.trim()) return [];

  return Array.from(
    new Set(
      TIERTARIF_BLOCKED_COPY_TERMS.filter((term) => {
        const normalizedTerm = normalizeTerm(term);
        const matcher = new RegExp(`(^|[^a-z0-9])${normalizedTerm}([^a-z0-9]|$)`, "i");
        return matcher.test(normalizedInput);
      })
    )
  );
}

export function hasBlockedTierTarifCopyTerms(input?: string | null): boolean {
  return findBlockedTierTarifCopyTerms(input).length > 0;
}
