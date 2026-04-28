import { describe, expect, it } from "vitest";
import { findBlockedTierTarifCopyTerms, hasBlockedTierTarifCopyTerms } from "@/lib/legalCopy";

describe("TierTarif Legal Copy Guard", () => {
  it("akzeptiert neutrale Tippgeber-Sprache", () => {
    const copy = "Tarifmerkmale sachlich prüfen, Kosten einordnen und Wartezeiten vergleichen.";
    expect(hasBlockedTierTarifCopyTerms(copy)).toBe(false);
  });

  it("findet riskante Makler- und Empfehlungsbegriffe", () => {
    const copy = "Wir empfehlen die beste Versicherung vom Testsieger.";
    expect(findBlockedTierTarifCopyTerms(copy)).toEqual(
      expect.arrayContaining(["beste", "empfehlen", "testsieger"])
    );
  });
});
