import { describe, expect, it } from "vitest";
import { normalizeNavigableHref } from "@/lib/routes";

describe("routes", () => {
  it("erhält Startseiten-Anker für den Header-CTA", () => {
    expect(normalizeNavigableHref("/#schwerpunkte")).toBe("/#schwerpunkte");
  });

  it("normalisiert interne Pfade mit Slash", () => {
    expect(normalizeNavigableHref("hundekrankenversicherung-vergleich")).toBe("/hundekrankenversicherung-vergleich");
  });

  it("erhält externe URLs unverändert", () => {
    const url = "https://partner.example.com/tarif";
    expect(normalizeNavigableHref(url)).toBe(url);
  });
});
