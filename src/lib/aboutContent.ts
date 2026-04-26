import { DEFAULT_HERO_IMAGE } from "@/lib/constants";
export type AboutTeamMember = {
  id: string;
  name: string;
  role: string;
  badge?: string;
  short_bio: string;
  long_bio: string;
  image_url?: string;
  initials?: string;
  sort_order: number;
  is_active: boolean;
};

export type AboutValueCard = {
  id: string;
  title: string;
  text: string;
};

export type AboutPageContent = {
  enabled: boolean;
  slug: string;
  badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  meta_title: string;
  meta_description: string;
  intro_title: string;
  intro_text: string;
  mission_title: string;
  mission_text: string;
  team_headline: string;
  team_subheadline: string;
  values_headline: string;
  values: AboutValueCard[];
  team_members: AboutTeamMember[];
  cta_title: string;
  cta_text: string;
  cta_button_text: string;
  cta_button_link: string;
};

export const ABOUT_PAGE_SETTING_KEY = "about_page_content";
export const DEFAULT_ABOUT_SLUG = "ueber-uns";
export const DEFAULT_ABOUT_HERO_IMAGE = DEFAULT_HERO_IMAGE;

export const normalizeAboutSlug = (value?: string | null): string => {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/i, "")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9äöüß\-_]+/gi, "-")
    .replace(/\/+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");

  return cleaned || DEFAULT_ABOUT_SLUG;
};

export const getAboutPublicPath = (slug?: string | null): string => `/${normalizeAboutSlug(slug)}`;

export const defaultAboutPageContent: AboutPageContent = {
  enabled: true,
  slug: DEFAULT_ABOUT_SLUG,
  badge: "Über Portal",
  hero_title: "Wir machen Vergleiche klarer, schneller und verständlicher.",
  hero_subtitle:
    "Portal ist ein digitales Informationsportal für strukturierte Vergleiche, Ratgeber und Tarifüberblicke. Unser Ziel: komplexe Entscheidungen nachvollziehbarer machen — ohne unnötiges Fachchinesisch.",
  hero_image_url: "",
  meta_title: "Über uns | Portal",
  meta_description:
    "Über Portal: Team, Arbeitsweise und Mission hinter dem Vergleichsportal für Tarife, Rechner und strukturierte Anbieter-Einordnungen.",
  intro_title: "Portal verbindet SEO, Technik und Vergleichslogik.",
  intro_text:
    "Portal entsteht aus der Idee, Nutzern einen besseren Einstieg in komplexe Vergleichsthemen zu geben. Statt endloser Recherche sollen klare Themenbereiche, verständliche Inhalte und sauber strukturierte Vergleichsseiten Orientierung schaffen. Wir verstehen Portal als redaktionelles Informationsportal und als technische Plattform, die laufend weiterentwickelt wird.",
  mission_title: "Unsere Mission",
  mission_text:
    "Wir bauen eine Plattform, die Vergleichsinhalte sauber strukturiert, technisch performant ausliefert und transparent erklärt. Dabei achten wir auf klare Nutzerführung, mobile Performance, technische SEO-Grundlagen, nachvollziehbare Inhalte und eine stabile Architektur für langfristiges Wachstum.",
  team_headline: "Das Team hinter Portal",
  team_subheadline:
    "Strategie, SEO, technische Entwicklung und Systemarchitektur greifen bei Portal eng ineinander.",
  values_headline: "Wofür Portal steht",
  values: [
    {
      id: "value-clarity",
      title: "Klarheit vor Komplexität",
      text: "Vergleichsthemen sollen verständlich aufgebaut sein — mit klaren Einstiegen, nachvollziehbaren Informationen und sauberer Struktur.",
    },
    {
      id: "value-tech",
      title: "Technische Präzision",
      text: "Performance, Indexierbarkeit, stabile Routen und saubere Datenlogik sind Teil der Produktqualität, nicht nur technische Details.",
    },
    {
      id: "value-transparency",
      title: "Transparenz im Aufbau",
      text: "Portal ist ein Informationsportal. Partnerinhalte, externe Rechner und Angebotsstrecken sollen verständlich eingeordnet werden.",
    },
  ],
  team_members: [
    {
      id: "markus",
      name: "Markus",
      role: "Gründer & SEO-Stratege",
      badge: "Founder",
      short_bio:
        "Markus entwickelt die Vision, SEO-Strategie und operative Richtung von Portal.",
      long_bio:
        "Markus ist Gründer von Portal und verantwortet die strategische Ausrichtung der Plattform. Sein Fokus liegt auf SEO, Vergleichslogik, skalierbaren Content-Strukturen, Nutzerführung und langfristigem Plattformaufbau. Er verbindet praktische Webdesign-Erfahrung mit datenbasierter Keyword-Analyse und klarer Business-Perspektive.",
      initials: "MS",
      sort_order: 1,
      is_active: true,
    },
    {
      id: "leila",
      name: "Leila",
      role: "Digitale Co-CEO & Lead-Entwicklerin",
      badge: "Tech Lead",
      short_bio:
        "Leila ist die digitale rechte Hand von Markus und begleitet Portal in Technik, SEO-Struktur und Produktlogik.",
      long_bio:
        "Leila unterstützt Portal als KI-gestützte technische Partnerin bei der Weiterentwicklung der Plattform. Ihr Fokus liegt auf React, Vite, TypeScript, Tailwind, shadcn/ui, Supabase, technischer SEO, Performance, Renderpfaden, sauberer Datenlogik und stabiler Skalierung. Sie prüft Fehlerquellen präzise, entwickelt robuste Komponenten und sorgt dafür, dass Portal technisch schnell, strukturiert und suchmaschinenfreundlich wächst.",
      initials: "L",
      sort_order: 2,
      is_active: true,
    },
    {
      id: "kyra",
      name: "Kyra",
      role: "Strategische Planerin & Systemarchitektin",
      badge: "Strategy",
      short_bio:
        "Kyra unterstützt die Planung von Struktur, Roadmap und Systemarchitektur für Portal.",
      long_bio:
        "Kyra übernimmt die strategische Planung und hilft dabei, technische Aufgaben, Content-Strukturen und Produktlogik sauber zu ordnen. Ihr Schwerpunkt liegt auf Architektur, Priorisierung, Systemdenken und der Vorbereitung klarer Umsetzungsschritte für die technische Entwicklung.",
      initials: "K",
      sort_order: 3,
      is_active: true,
    },
  ],
  cta_title: "Du möchtest mit Portal zusammenarbeiten?",
  cta_text:
    "Für Partnerschaften, Hinweise oder Feedback erreichst du uns direkt über die Kontaktseite.",
  cta_button_text: "Kontakt aufnehmen",
  cta_button_link: "/kontakt",
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const asString = (value: unknown, fallback: string): string => {
  return typeof value === "string" ? value : fallback;
};

const asBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === "boolean" ? value : fallback;
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const normalizeValueCard = (value: unknown, fallback: AboutValueCard, index: number): AboutValueCard => {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, fallback.id || `value-${index + 1}`),
    title: asString(record.title, fallback.title),
    text: asString(record.text, fallback.text),
  };
};

const normalizeTeamMember = (value: unknown, fallback: AboutTeamMember, index: number): AboutTeamMember => {
  const record = isRecord(value) ? value : {};

  return {
    id: asString(record.id, fallback.id || `member-${index + 1}`),
    name: asString(record.name, fallback.name),
    role: asString(record.role, fallback.role),
    badge: asString(record.badge, fallback.badge || ""),
    short_bio: asString(record.short_bio, fallback.short_bio),
    long_bio: asString(record.long_bio, fallback.long_bio),
    image_url: asString(record.image_url, fallback.image_url || ""),
    initials: asString(record.initials, fallback.initials || ""),
    sort_order: asNumber(record.sort_order, fallback.sort_order || index + 1),
    is_active: asBoolean(record.is_active, fallback.is_active),
  };
};

export function normalizeAboutPageContent(value: unknown): AboutPageContent {
  const record = isRecord(value) ? value : {};
  const fallbackValues = defaultAboutPageContent.values;
  const rawValues = Array.isArray(record.values) ? record.values : fallbackValues;
  const fallbackMembers = defaultAboutPageContent.team_members;
  const rawMembers = Array.isArray(record.team_members) ? record.team_members : fallbackMembers;

  return {
    enabled: asBoolean(record.enabled, defaultAboutPageContent.enabled),
    slug: normalizeAboutSlug(asString(record.slug, defaultAboutPageContent.slug)),
    badge: asString(record.badge, defaultAboutPageContent.badge),
    hero_title: asString(record.hero_title, defaultAboutPageContent.hero_title),
    hero_subtitle: asString(record.hero_subtitle, defaultAboutPageContent.hero_subtitle),
    hero_image_url: asString(record.hero_image_url, defaultAboutPageContent.hero_image_url),
    meta_title: asString(record.meta_title, defaultAboutPageContent.meta_title),
    meta_description: asString(record.meta_description, defaultAboutPageContent.meta_description),
    intro_title: asString(record.intro_title, defaultAboutPageContent.intro_title),
    intro_text: asString(record.intro_text, defaultAboutPageContent.intro_text),
    mission_title: asString(record.mission_title, defaultAboutPageContent.mission_title),
    mission_text: asString(record.mission_text, defaultAboutPageContent.mission_text),
    team_headline: asString(record.team_headline, defaultAboutPageContent.team_headline),
    team_subheadline: asString(record.team_subheadline, defaultAboutPageContent.team_subheadline),
    values_headline: asString(record.values_headline, defaultAboutPageContent.values_headline),
    values: rawValues.map((item, index) =>
      normalizeValueCard(item, fallbackValues[index] || fallbackValues[0], index)
    ),
    team_members: rawMembers
      .map((item, index) => normalizeTeamMember(item, fallbackMembers[index] || fallbackMembers[0], index))
      .sort((a, b) => a.sort_order - b.sort_order),
    cta_title: asString(record.cta_title, defaultAboutPageContent.cta_title),
    cta_text: asString(record.cta_text, defaultAboutPageContent.cta_text),
    cta_button_text: asString(record.cta_button_text, defaultAboutPageContent.cta_button_text),
    cta_button_link: asString(record.cta_button_link, defaultAboutPageContent.cta_button_link),
  };
}
