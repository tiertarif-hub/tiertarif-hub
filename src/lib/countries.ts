export type CountryMeta = {
  code: string;
  name: string;
  flag: string;
  isUnknown: boolean;
};

const COUNTRY_NAMES: Record<string, string> = {
  AT: "Österreich",
  DE: "Deutschland",
  CH: "Schweiz",
  IT: "Italien",
  FR: "Frankreich",
  ES: "Spanien",
  GB: "Vereinigtes Königreich",
  US: "USA",
  NL: "Niederlande",
  BE: "Belgien",
  PL: "Polen",
  CZ: "Tschechien",
  HU: "Ungarn",
  SI: "Slowenien",
  SK: "Slowakei",
  HR: "Kroatien",
  RO: "Rumänien",
  BG: "Bulgarien",
  PT: "Portugal",
  SE: "Schweden",
  NO: "Norwegen",
  DK: "Dänemark",
  FI: "Finnland",
  IE: "Irland",
  CA: "Kanada",
  AU: "Australien",
};

const UNKNOWN_VALUES = new Set([
  "",
  "UNKNOWN",
  "UNBEKANNT",
  "NULL",
  "N/A",
  "--",
  "XX",
]);

export function normalizeCountryCode(raw?: string | null): string {
  const value = (raw ?? "").trim().toUpperCase();

  if (!value || UNKNOWN_VALUES.has(value)) {
    return "UNKNOWN";
  }

  const firstToken = value.split(",")[0]?.trim() || "";

  if (!/^[A-Z]{2}$/.test(firstToken)) {
    return "UNKNOWN";
  }

  return firstToken;
}

export function countryCodeToFlag(code: string): string {
  if (code === "UNKNOWN") return "🌍";

  return String.fromCodePoint(
    ...code.split("").map((char) => 127397 + char.charCodeAt(0))
  );
}

export function getCountryMeta(raw?: string | null): CountryMeta {
  const code = normalizeCountryCode(raw);

  if (code === "UNKNOWN") {
    return {
      code: "UNKNOWN",
      name: "Unbekannt",
      flag: "🌍",
      isUnknown: true,
    };
  }

  return {
    code,
    name: COUNTRY_NAMES[code] ?? code,
    flag: countryCodeToFlag(code),
    isUnknown: false,
  };
}