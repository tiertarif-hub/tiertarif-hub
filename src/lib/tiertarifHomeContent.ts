export type TierTarifHomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const TIERTARIF_HOME_TRUST_ITEMS = [
  "Kostenfrei starten",
  "Kostenpunkte vorher prüfen",
  "Wartezeiten beachten",
  "Für Hunde, Katzen & Pferde",
] as const;

export const TIERTARIF_HOME_FAQ_ITEMS: TierTarifHomeFaqItem[] = [
  {
    id: "was-ist-tiertarif",
    question: "Was ist TierTarif?",
    answer:
      "TierTarif ist ein Informations- und Vergleichsportal für Tierhalter. Die Seite bündelt Inhalte zu Hunde-, Katzen- und Pferdeversicherungen und hilft dabei, Leistungen, Wartezeiten, Kostenpunkte und Erstattungsregeln sachlich einzuordnen.",
  },
  {
    id: "ist-tiertarif-ein-makler",
    question: "Ist TierTarif ein Makler?",
    answer:
      "Nein. TierTarif versteht sich als Informationsgeber und Tippgeber. Die Inhalte ersetzen keine individuelle Versicherungsberatung. Nutzer können sich orientieren, Tarifmerkmale vergleichen und anschließend eigenständig prüfen, welche Bedingungen zu ihrer Situation passen.",
  },
  {
    id: "welche-tierversicherungen",
    question: "Welche Tierversicherungen kann ich vergleichen?",
    answer:
      "Auf TierTarif stehen zunächst Hundeversicherungen, Katzenversicherungen und Pferdeversicherungen im Fokus. Je nach Tierart geht es um Krankenversicherung, OP-Schutz, Zahn- und Vorsorgeleistungen, Kolik-OP, Haftpflichtthemen oder wichtige Tarifgrenzen.",
  },
  {
    id: "unterschied-op-schutz-krankenversicherung",
    question: "Was ist der Unterschied zwischen OP-Schutz und Tierkrankenversicherung?",
    answer:
      "OP-Schutz bezieht sich in der Regel auf operative Eingriffe und damit verbundene Leistungen wie Narkose, Klinikaufenthalt oder Nachsorge. Eine Tierkrankenversicherung kann je nach Tarif zusätzlich ambulante Behandlungen, Diagnostik, Medikamente, Vorsorge oder Zahnleistungen umfassen.",
  },
  {
    id: "risiken-hund-katze-pferd",
    question: "Warum unterscheiden sich Hunde-, Katzen- und Pferdeversicherungen?",
    answer:
      "Die Risiken unterscheiden sich deutlich. Bei Hunden spielen Rasse, Gelenkerkrankungen, OP-Schutz und Vollschutz eine große Rolle. Bei Katzen sind Zahn-OPs, FORL, Wartezeiten und chronische Erkrankungen wichtig. Bei Pferden stehen häufig OP-Risiken wie Kolik, Gelenke, Klinikwahl und Standgeld im Vordergrund.",
  },
  {
    id: "got-bedeutung-tierarztkosten",
    question: "Was bedeutet GOT bei Tierarztkosten?",
    answer:
      "GOT steht für Gebührenordnung für Tierärzte. Sie bildet den Rahmen, nach dem tierärztliche Leistungen abgerechnet werden. Für Versicherungsvergleiche ist wichtig, bis zu welchem GOT-Satz ein Tarif erstattet und wie Notdienst, Klinikbehandlungen oder erhöhte Gebührensätze geregelt sind.",
  },
  {
    id: "vergleichsrechner-kostenpflichtig",
    question: "Sind die Vergleichsrechner kostenpflichtig?",
    answer:
      "Die Nutzung der verlinkten Vergleichsrechner ist für Nutzer in der Regel kostenfrei. TierTarif kann über Partnerlinks eine Vergütung erhalten, wenn über einen Link ein Abschluss zustande kommt. Der Preis für Nutzer ändert sich dadurch nicht.",
  },
  {
    id: "worauf-vor-tarifabschluss-achten",
    question: "Worauf sollte ich vor dem Tarifabschluss achten?",
    answer:
      "Vor einem Abschluss sollten Tierhalter vor allem Leistungsumfang, Wartezeiten, Selbstbeteiligung, Jahreshöchstleistung, GOT-Erstattung, Ausschlüsse, Vorerkrankungen und Kündigungsregeln prüfen. Entscheidend sind immer die konkreten Versicherungsbedingungen des jeweiligen Tarifs.",
  },
];

export const TIERTARIF_HOME_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TIERTARIF_HOME_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};
