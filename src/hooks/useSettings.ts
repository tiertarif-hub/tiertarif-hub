import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { TrendingLink } from "@/lib/schemas";
import { getCategoriesRoute, normalizeNavigableHref } from "@/lib/routes";
import { TIERTARIF_COMPARISON_LINKS, resolveTierTarifComparisonHref } from "@/lib/tiertarifLinks";
import { ABOUT_PAGE_SETTING_KEY } from "@/lib/aboutContent";
import { DEFAULT_BRAND_NAME, DEFAULT_SITE_DESCRIPTION } from "@/lib/constants";
import { useMemo } from "react";
export const PUBLIC_SETTINGS_KEYS = [
  "active_theme",
  "home_sections",
  "feature_toggles",
  "home_layout_v2",
  "home_content",
  "header_config",
  "footer_config",
  "scouty_config",
  "home_forum_teaser",
  "ads_sense_client_id",
  "ads_sense_slot_id",
  "ads_enabled",
  "ads_amazon_headline",
  "ads_amazon_text",
  "ads_amazon_button_text",
  "ads_amazon_link",
  "forum_banner_headline",
  "forum_banner_subheadline",
  "forum_banner_badge",
  "forum_ads",
  "site_title",
  "site_settings",
  "site_logo_url",
  "site_description",
  "hero_title",
  "hero_subtitle",
  "footer_designer_name",
  "footer_designer_url",
  "ticker_badge_text",
  "ticker_headline",
  "ticker_link_text",
  "trending_links",
  "compliance_config",
  "google_analytics_id",
  "google_search_console_verification",
  "forum_sidebar",
  "top_bar_text",
  "top_bar_link",
  "top_bar_active",
  "newsletter_active",
  "popup_active",
  ABOUT_PAGE_SETTING_KEY
];

const LEGACY_DEFAULT_BRAND_PATTERN = /Standard\s+Portal/g;

// --- HELPER FÜR TOXIC_WORD_ERROR ---
const getCleanToxicWordMessage = (rawMessage?: string) => {
  if (!rawMessage) return "Der Inhalt enthält einen blockierten Begriff.";

  const cleanMsg = rawMessage
    .replace(/^.*TOXIC_WORD_ERROR:\s*/i, "")
    .split("\n")[0]
    .trim();

  return cleanMsg || "Der Inhalt enthält einen blockierten Begriff.";
};

// --- TYPES ---
export type HomeSection = {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
};

export type FeatureToggles = {
  has_projects: boolean;
  has_pages: boolean;
  has_apps: boolean;
  has_forum: boolean;
  has_finance: boolean;
  has_mass_generator: boolean;
  has_ads: boolean;
  has_amazon: boolean;
  has_adsense: boolean;
  has_scouty: boolean;
  has_leads: boolean;
  has_redirects: boolean;
  has_footer_links: boolean;
  has_about: boolean;
  has_indexing_tools: boolean;
  has_analytics: boolean;
  has_magazine: boolean;
};

export const defaultFeatureToggles: FeatureToggles = {
  has_projects: true,
  has_pages: true,
  has_apps: false,
  has_forum: false,
  has_finance: false,
  has_mass_generator: false,
  has_ads: false,
  has_amazon: false,
  has_adsense: false,
  has_scouty: true,
  has_leads: false,
  has_redirects: true,
  has_footer_links: false,
  has_about: true,
  has_indexing_tools: false,
  has_analytics: true,
  has_magazine: true,
};

export function normalizeFeatureTogglesValue(raw?: Partial<FeatureToggles> | null): FeatureToggles {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

  return {
    ...defaultFeatureToggles,
    ...Object.fromEntries(
      Object.entries(source).filter(([, value]) => typeof value === "boolean")
    ),
  } as FeatureToggles;
}

export interface ForumAd {
  id: string;
  name: string;
  type: 'image' | 'code';
  enabled: boolean;
  image_url?: string;
  ad_image_alt?: string;
  link_url?: string;
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  html_code?: string;
  position?: string;
}

// --- CORE FETCHING ---
function readObjectSetting(value: Json | undefined): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, any>;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getPublicBrandNameFromSettings(settings?: Record<string, Json>): string {
  const siteSettings = readObjectSetting(settings?.site_settings);
  const footerConfig = readObjectSetting(settings?.footer_config);
  const siteTitle = readString(settings?.site_title);

  const fromSiteSettings = readString(siteSettings.name);
  const fromFooterConfig = readString(footerConfig.title);
  const fromSiteTitle = siteTitle ? siteTitle.split("|")[0].trim() : "";

  return fromSiteSettings || fromFooterConfig || fromSiteTitle || DEFAULT_BRAND_NAME;
}

async function fetchPublicSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", PUBLIC_SETTINGS_KEYS);

  if (error) throw error;

  const settings: Record<string, Json> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: fetchPublicSettings,
    staleTime: 5 * 60 * 1000,
  });
}
async function fetchAdminSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from("settings")
    .select("key, value");

  if (error) throw error;

  const settings: Record<string, Json> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["settings", "admin"],
    queryFn: fetchAdminSettings,
    staleTime: 1 * 60 * 1000,
  });
}

// Generic Hook zum Lesen
export function useSetting<T>(key: string, defaultValue: T): T {
  const { data: settings } = useSettings();
  if (!settings || settings[key] === undefined) return defaultValue;
  return settings[key] as T;
}

// Server-only Keys dürfen nicht mehr clientseitig gespeichert werden
const BLOCKED_SERVER_ONLY_KEYS = new Set(["bridge_key", "admin_pin"]);

// Generic Hook zum Schreiben
export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      if (BLOCKED_SERVER_ONLY_KEYS.has(key)) {
        throw new Error("Die Einstellung " + key + " darf nicht mehr clientseitig gespeichert werden.");
      }

      const { data, error } = await supabase.from("settings").upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      .select("key")
      .maybeSingle();

      if (error) {
        if (error.message?.includes("TOXIC_WORD_ERROR")) {
          const cleanMsg = getCleanToxicWordMessage(error.message);
          throw new Error(cleanMsg);
        }

        const status = (error as { status?: number; code?: string }).status;
        const code = (error as { code?: string }).code;

        if (status === 401 || status === 403 || code === "42501") {
          throw new Error("Fehler: Keine Admin-Rechte zum Speichern. Bitte DB-Rechte prüfen.");
        }

        throw new Error(error.message || "Einstellung konnte nicht gespeichert werden.");
      }

      if (!data?.key) {
        throw new Error("Setting " + key + " wurde von Supabase nicht bestätigt.");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"], refetchType: "all" });
    },
  });
}

// --- THEME HOOK ---
export function useActiveTheme() {
  return useSetting<string>("active_theme", "tiertarif");
}

// --- CMS DEFAULTS ---

export const defaultHomeSections: HomeSection[] = [
  { id: "hero", label: "Hero", enabled: true, order: 0 },
  { id: "how_it_works", label: "So funktioniert TierTarif", enabled: true, order: 1 },
  { id: "big_three", label: "Unsere Schwerpunkte", enabled: true, order: 2 },
  { id: "news", label: "Vergleiche / Vorschau-Karten", enabled: true, order: 3 },
  { id: "categories", label: "Vergleiche direkt öffnen", enabled: true, order: 4 },
  { id: "home_faq", label: "FAQ Startseite", enabled: true, order: 5 },
  { id: "seo", label: "Unsere Mission / SEO-Text", enabled: true, order: 6 },
];

export const defaultHomeLayout = {
  hero: true,
  trust: true,
  big_three: true,
  why_us: true,
  categories: true,
  news: true,
  forum_teaser: false,
  ads: false,
  seo_text: true
};

// CONTENT DEFAULTS
export const defaultHomeContent = {
  seo_title: "",
  seo_description: "",
  
  hero: {
  badge: "TierTarif Vergleichsportal",
  headline: "Tierversicherung vergleichen",
  title: "Tierversicherung vergleichen",
  subtitle: "Prüfe Leistungen, Kosten, Wartezeiten und Erstattung sachlich für Hund, Katze und OP-Schutz.",
  subheadline: "Strukturiere Tierversicherungen nach Leistungen, Kostenpunkten, Wartezeiten und Erstattungslogik.",
  search_placeholder: "Hund, Katze oder OP-Versicherung suchen",
  search_label: "Vergleich starten",
  button_text: "Jetzt vergleichen",
  desktop_image_url: "",
  mobile_image_url: "",
  stats: [
    { title: "Transparent", label: "Leistungen prüfen" },
    { title: "Sachlich", label: "Kosten einordnen" },
    { title: "Sicher", label: "Wartezeiten beachten" }
  ]
},
  how_it_works: {
    badge: "In 3 Schritten zum Vergleich",
    headline: "So funktioniert TierTarif",
    subheadline: "In drei einfachen Schritten Leistungen, Kosten und Tarifdetails sachlich prüfen.",
    steps: [
      { title: "Bedarf wählen", text: "Wähle Hund, Katze oder OP-Schutz und starte mit deinem konkreten Versicherungsbedarf.", status: "Tierart oder Schutz wählen" },
      { title: "Leistungen prüfen", text: "Vergleiche Wartezeiten, Erstattung, Selbstbeteiligung und wichtige Leistungsgrenzen.", status: "Kriterien sachlich prüfen" },
      { title: "Entscheiden", text: "Öffne den passenden Vergleich und ordne verfügbare Tarifdetails in Ruhe ein.", status: "Zum Vergleich weitergehen" }
    ]
  },
  trust: {
    badge: "TierTarif Überblick",
    headline: "Tiergesundheit sachlich vergleichen",
    link_text: "Kategorien ansehen →",
    subheadline: "Hunde, Katzen und Pferde transparent prüfen"
  },
  big_three: { 
    headline: "Tierversicherung gezielt prüfen", 
    items: [
        { id: "1", title: "Hunde", desc: "Kranken- und OP-Schutz für Hunde strukturiert prüfen.", link: TIERTARIF_COMPARISON_LINKS.hunde, button_text: "Hunde prüfen", theme: "tiertarif", image_url: "/big-threes/tiertarif-tierversicherung-startseitenbild.webp", icon: "heart" },
        { id: "2", title: "Katzen", desc: "FORL, Zahn-OP, Wartezeiten und Erstattungsgrenzen besser verstehen.", link: TIERTARIF_COMPARISON_LINKS.katzen, button_text: "Katzen prüfen", theme: "tiertarif", image_url: "/big-threes/tiertarif-tierversicherung-startseitenbild.webp", icon: "star" },
        { id: "3", title: "Pferde", desc: "OP-Schutz, Kolik-OP und Pferdehaftpflicht sachlich einordnen.", link: TIERTARIF_COMPARISON_LINKS.pferde, button_text: "Pferde prüfen", theme: "tiertarif", image_url: "/big-threes/tiertarif-tierversicherung-startseitenbild.webp", icon: "shield" }
    ],
    finance_title: "Hundekrankenversicherung", finance_desc: "Leistungen, Erstattung und Kosten für Hunde prüfen.", finance_link: TIERTARIF_COMPARISON_LINKS.hunde, finance_button: "Hundeschutz prüfen", 
    software_title: "Katzenversicherung", software_desc: "OP-Schutz, Zahn-OP und Wartezeiten für Katzen einordnen.", software_link: TIERTARIF_COMPARISON_LINKS.katzen, software_button: "Katzenschutz prüfen", 
    services_title: "Pferde OP Versicherung", services_desc: "OP-Schutz, Kolik-OP und Pferdehaftpflicht sachlich prüfen.", services_link: TIERTARIF_COMPARISON_LINKS.pferde, services_button: "Pferde prüfen" 
  },
  why_us: {
    headline: "Warum TierTarif?",
    subheadline: "Eine ruhige Entscheidungshilfe für Tierhalter, die Leistungen und Kosten sauber einordnen möchten.",
    features: [
      { title: "Klare Kriterien", text: "Leistungen, Wartezeiten und Erstattungslogik verständlich strukturiert.", icon: "shield" },
      { title: "Tierhalter-Fokus", text: "Hund, Katze und OP-Schutz werden sachlich und alltagsnah betrachtet.", icon: "heart" },
      { title: "Mobile First", text: "Schnelle Orientierung auf Smartphone, Tablet und Desktop.", icon: "zap" },
      { title: "Laufende Pflege", text: "Ratgeber und Vergleichsinhalte werden fortlaufend verbessert.", icon: "chart" }
    ]
  },
  home_faq: {
    badge: "FAQ • TierTarif",
    headline: "Häufige Fragen zu TierTarif",
    subheadline: "Kompakte Antworten zu Tierversicherungen, Tierarztkosten und Vergleichsinhalten.",
    items: [
      {
        id: "home-faq-1",
        question: "Was ist TierTarif?",
        answer: "<p>TierTarif ist ein sachliches Informations- und Vergleichsportal für Tierhalter. Der Fokus liegt auf Tierkrankenversicherung, Hundeversicherung, Katzenversicherung und OP-Schutz.</p>",
      },
      {
        id: "home-faq-2",
        question: "Welche Themen finde ich auf TierTarif?",
        answer: "<p>Du findest Ratgeber und Vergleichsinhalte zu Leistungen, Kosten, Wartezeiten, Selbstbeteiligung, Erstattungsgrenzen, Zahn-OPs und wichtigen Tarifdetails für Hunde und Katzen.</p>",
      },
      {
        id: "home-faq-3",
        question: "Ist TierTarif ein Makler?",
        answer: "<p>TierTarif versteht sich als Informations- und Vergleichsportal. Die Inhalte ersetzen keine individuelle Versicherungsberatung, sondern helfen dir, Tarifdetails strukturierter zu prüfen.</p>",
      },
    ],
  },
  seo: {
    headline: "Über TierTarif",
    intro: "TierTarif bündelt Informationen rund um Tierversicherungen, Tierarztkosten und OP-Schutz für Hunde und Katzen.",
    block1_title: "Unser Ansatz", block1_text: "Wir strukturieren komplexe Tarifmerkmale wie Wartezeit, Selbstbeteiligung, Erstattung und Leistungsgrenzen verständlich und übersichtlich.",
    block2_title: "Laufende Pflege", block2_text: "Unsere Inhalte werden fortlaufend gepflegt, damit Tierhalter wichtige Unterschiede besser einordnen können.",
    long_text: ""
  },
  categories: { headline: "Alle TierTarif-Bereiche im Überblick", count: 6, button_more: "Alle Kategorien anzeigen", button_card: "Bereich erkunden" },
  news: { headline: "Beliebte Vergleiche", subheadline: "Aktive TierTarif-Vergleiche", count: 3, button_text: "Alle Vergleiche ansehen", button_url: "/kategorien", read_more: "Vergleich öffnen" },
  forum_teaser: { headline: "Tierhalter-Community", subheadline: "Tausche dich mit anderen Tierhaltern aus und teile Erfahrungen rund um Hunde, Katzen und Versicherungsschutz.", link_text: "Alle Foren anzeigen", mobile_button: "Zur Community" }
};

export const defaultHeaderConfig = {
  button_text: "Jetzt vergleichen",
  button_url: "/#schwerpunkte",
  nav_links: [
    { label: "Hunde", url: TIERTARIF_COMPARISON_LINKS.hunde },
    { label: "Katzen", url: TIERTARIF_COMPARISON_LINKS.katzen },
    { label: "Pferde", url: TIERTARIF_COMPARISON_LINKS.pferde }
  ],
  hub_links: [
    { label: "Alle Kategorien", url: "/kategorien", icon: "LayoutGrid" },
    { label: "Ratgeber", url: "/kategorien", icon: "FileText" }
  ],
  tools_links: [{ label: "Wie wir vergleichen", url: "/wie-wir-vergleichen", icon: "ShieldCheck" }]
};

export const defaultFooterConfig = { 
  title: DEFAULT_BRAND_NAME, 
  text_checked: "Redaktioneller Überblick", 
  text_update: "Aktualisiert: 2026", 
  text_description: DEFAULT_SITE_DESCRIPTION, 
  copyright_text: `© 2026 ${DEFAULT_BRAND_NAME}. Alle Rechte vorbehalten.`, 
  made_with_text: "Made with", 
  made_in_text: "in Germany", 
  disclaimer: "*Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn du über einen Link auf dieser Seite einkaufst, erhalten wir möglicherweise eine Provision. Der Preis für dich ändert sich dabei nicht. Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt.", 
  legal_links: [
    { label: "Kontakt", url: "/kontakt" },
    { label: "Wie wir vergleichen", url: "/wie-wir-vergleichen" },
    { label: "Alle Kategorien", url: "/kategorien" },
    { label: "Impressum", url: "/impressum" },
    { label: "Datenschutz", url: "/datenschutz" },
    { label: "AGB", url: "/agb" },
    { label: "Über uns", url: "/ueber-uns" },
    { label: "Cookie-Einstellungen", url: "/cookie-einstellungen" }
  ], 
  popular_links: [
    { label: "Hundekrankenversicherung", url: TIERTARIF_COMPARISON_LINKS.hunde },
    { label: "Katzenversicherung", url: TIERTARIF_COMPARISON_LINKS.katzen },
    { label: "Pferde OP Versicherung", url: TIERTARIF_COMPARISON_LINKS.pferde }
  ],
  tools_links: [
    { label: "Alle Vergleiche", url: "/kategorien" },
    { label: "Wie wir vergleichen", url: "/wie-wir-vergleichen" },
    { label: "Kontakt", url: "/kontakt" },
    { label: "Cookie-Einstellungen", url: "/cookie-einstellungen" }
  ]
};

export const defaultScoutyConfig = {
  bubble_intro: "Hi, ich bin Scouty! Ich helfe dir, TierTarif schneller zu verstehen. 🐾",
  bubble_exit: "Kurz bevor du gehst: Möchtest du noch die wichtigsten Vergleichspunkte prüfen?",
  bubble_newsletter: "Neue Ratgeber und Tarif-Updates per Mail?",
  powered_by: `Powered by ${DEFAULT_BRAND_NAME}`
};

type LinkConfigItem = { url?: string | null; [key: string]: any };

function normalizeLinkConfigItems<T extends LinkConfigItem>(items: T[] | undefined | null): T[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    url: resolveTierTarifComparisonHref(String(item?.url ?? ""), [item?.label, item?.title, item?.description]),
  }));
}

export function normalizeHeaderConfigValue(config: any = {}) {
  return {
    ...config,
    button_url: normalizeNavigableHref(String(config?.button_url ?? getCategoriesRoute())),
    nav_links: normalizeLinkConfigItems(config?.nav_links),
    hub_links: normalizeLinkConfigItems(config?.hub_links),
    tools_links: normalizeLinkConfigItems(config?.tools_links),
  };
}

export function normalizeFooterConfigValue(config: any = {}) {
  return {
    ...config,
    legal_links: normalizeLinkConfigItems(config?.legal_links),
    popular_links: normalizeLinkConfigItems(config?.popular_links),
    tools_links: normalizeLinkConfigItems(config?.tools_links),
  };
}

export function normalizeBigThreeItemsValue(items: any[] | undefined | null) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    link: resolveTierTarifComparisonHref(String(item?.link ?? ""), [item?.title, item?.desc, item?.button_text]),
  }));
}

export const defaultHomeForumTeaser = { 
  headline: "Community Hub", 
  subheadline: "Tauche in beliebte Themenbereiche ein und teile deine Erfahrungen mit der Community.", 
  link_text: "Alle Foren anzeigen", 
  mobile_button: "Zum Community Forum" 
};

function cloneHomeSections(sections: HomeSection[]) {
  return sections.map((section) => ({ ...section }));
}

function createHomeSection(sectionId: string) {
  const fallback = defaultHomeSections.find((section) => section.id === sectionId);

  if (fallback) {
    return { ...fallback };
  }

  return {
    id: sectionId,
    label: sectionId,
    enabled: true,
    order: 0,
  } as HomeSection;
}

export const HOME_SECTION_IDS = new Set(defaultHomeSections.map((section) => section.id));

function normalizeHomeSectionsValue(rawSections?: HomeSection[] | null): HomeSection[] {
  const savedSections = Array.isArray(rawSections) ? rawSections : [];

  const sortedSavedSections = savedSections
    .filter((section): section is HomeSection => Boolean(section?.id) && HOME_SECTION_IDS.has(section.id))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((section) => {
      const fallback = defaultHomeSections.find((entry) => entry.id === section.id);

      return {
        ...(fallback || {}),
        ...section,
        // Labels bleiben codegeführt, damit alte DB-Beschriftungen wie "News" nicht wieder auftauchen.
        label: fallback?.label || section.label || section.id,
        enabled: typeof section.enabled === "boolean" ? section.enabled : fallback?.enabled ?? true,
      } as HomeSection;
    });

  defaultHomeSections.forEach((defaultSection) => {
    if (!sortedSavedSections.some((section) => section.id === defaultSection.id)) {
      sortedSavedSections.push({ ...defaultSection });
    }
  });

  return sortedSavedSections.map((section, index) => ({
    ...section,
    order: index,
  }));
}

// --- CONFIG HOOKS ---

export function useFeatureToggles() {
  const { data: settings } = useSettings();

  return useMemo(
    () => normalizeFeatureTogglesValue(settings?.feature_toggles as Partial<FeatureToggles> | undefined),
    [settings?.feature_toggles]
  );
}

export function useHomeLayout() { 
  const { data: settings } = useSettings(); 

  return useMemo(() => {
    const rawSections = settings?.home_sections as HomeSection[] | undefined;
    const legacyLayout = settings?.home_layout_v2 as typeof defaultHomeLayout | undefined;
    const hasNewStructure = Array.isArray(rawSections) && rawSections.length > 0;

    let sections = normalizeHomeSectionsValue(rawSections);

    // Einmaliger Fallback für alte Installationen: Wenn noch keine home_sections existieren,
    // werden die alten home_layout_v2-Werte übernommen. Sobald der Struktur Manager speichert,
    // ist home_sections die einzige Quelle der Wahrheit.
    if (!hasNewStructure && legacyLayout) {
      sections = sections.map((section) => {
        const legacyEnabled =
          section.id === "hero" ? legacyLayout.hero :
          section.id === "big_three" ? legacyLayout.big_three :
          section.id === "categories" ? legacyLayout.categories :
          section.id === "news" ? legacyLayout.news :
          section.id === "seo" ? legacyLayout.seo_text :
          undefined;

        return typeof legacyEnabled === "boolean" ? { ...section, enabled: legacyEnabled } : section;
      });
    }

    const layout = {
      hero: sections.find((section) => section.id === "hero")?.enabled ?? true,
      trust: false,
      big_three: sections.find((section) => section.id === "big_three")?.enabled ?? true,
      why_us: sections.find((section) => section.id === "how_it_works")?.enabled ?? true,
      categories: sections.find((section) => section.id === "categories")?.enabled ?? true,
      news: sections.find((section) => section.id === "news")?.enabled ?? true,
      forum_teaser: false,
      ads: false,
      seo_text: sections.find((section) => section.id === "seo")?.enabled ?? true,
    };

    return { sections, layout }; 
  }, [settings?.home_layout_v2, settings?.home_sections]);
}

export function useHeaderConfig() {
  const { data } = useSettings();
  return useMemo(
    () => normalizeHeaderConfigValue({ ...defaultHeaderConfig, ...(data?.header_config as any || {}) }),
    [data?.header_config]
  );
}
export function useFooterConfig() {
  const { data } = useSettings();
  return useMemo(() => {
    const brandName = getPublicBrandNameFromSettings(data);
    const fallbackConfig = {
      ...defaultFooterConfig,
      title: brandName,
      copyright_text: `© 2026 ${brandName}. Alle Rechte vorbehalten.`,
    };

    return normalizeFooterConfigValue({ ...fallbackConfig, ...(data?.footer_config as any || {}) });
  }, [data?.footer_config, data?.site_settings, data?.site_title]);
}
export function useScoutyConfig() {
  const { data } = useSettings();
  return useMemo(
    () => ({ ...defaultScoutyConfig, ...(data?.scouty_config as any || {}) }),
    [data?.scouty_config]
  );
}
export function useHomeForumTeaser() {
  const { data } = useSettings();
  return useMemo(
    () => ({ ...defaultHomeForumTeaser, ...(data?.home_forum_teaser as any || {}) }),
    [data?.home_forum_teaser]
  );
}

export function useHomeContent() { 
  const { data: settings } = useSettings(); 

  return useMemo(() => {
    const brandName = getPublicBrandNameFromSettings(settings);
    const settingsContent = (settings?.home_content as any || {});
    
    const content = { 
      ...defaultHomeContent, 
      ...settingsContent,
      seo: {
        ...defaultHomeContent.seo,
        ...(settingsContent.seo || {})
      }
    }; 
    
    content.big_three = { ...defaultHomeContent.big_three, ...(content.big_three || {}) };
    content.big_three.items = normalizeBigThreeItemsValue(content.big_three.items || defaultHomeContent.big_three.items);
    content.big_three.finance_link = normalizeNavigableHref(String(content.big_three.finance_link || defaultHomeContent.big_three.finance_link || "/"));
    content.big_three.software_link = normalizeNavigableHref(String(content.big_three.software_link || defaultHomeContent.big_three.software_link || "/"));
    content.big_three.services_link = normalizeNavigableHref(String(content.big_three.services_link || defaultHomeContent.big_three.services_link || "/"));
    
    content.why_us = { ...defaultHomeContent.why_us, ...(content.why_us || {}) };
    content.home_faq = { ...defaultHomeContent.home_faq, ...(content.home_faq || {}) };
    content.home_faq.items = Array.isArray(content.home_faq.items) && content.home_faq.items.length > 0
      ? content.home_faq.items
      : defaultHomeContent.home_faq.items;
    content.home_faq.items = content.home_faq.items.map((item: any) => ({
      ...item,
      question: typeof item.question === "string" ? item.question.replace(LEGACY_DEFAULT_BRAND_PATTERN, brandName) : item.question,
      answer: typeof item.answer === "string" ? item.answer.replace(LEGACY_DEFAULT_BRAND_PATTERN, brandName) : item.answer,
    }));
    content.categories = { ...defaultHomeContent.categories, ...content.categories }; 
    content.news = { ...defaultHomeContent.news, ...content.news }; 
    content.news.button_url = normalizeNavigableHref(String(content.news.button_url || defaultHomeContent.news.button_url || getCategoriesRoute()));
    content.trust = { ...defaultHomeContent.trust, ...content.trust }; 
    content.hero = { ...defaultHomeContent.hero, ...content.hero };
    content.hero.stats = Array.isArray(content.hero.stats) && content.hero.stats.length > 0
      ? content.hero.stats
      : defaultHomeContent.hero.stats;
    content.how_it_works = { ...defaultHomeContent.how_it_works, ...(content.how_it_works || {}) };
    content.how_it_works.steps = Array.isArray(content.how_it_works.steps) && content.how_it_works.steps.length > 0
      ? content.how_it_works.steps
      : defaultHomeContent.how_it_works.steps;
    
    return { content }; 
  }, [settings?.home_content, settings?.footer_config, settings?.site_settings, settings?.site_title]);
}

export function useAdSenseConfig() { const { data: settings } = useSettings(); return { clientId: (settings?.ads_sense_client_id as string) || "", defaultSlotId: (settings?.ads_sense_slot_id as string) || "", enabled: (settings?.ads_enabled as boolean) || false }; }
export function useAmazonConfig() { const { data: settings } = useSettings(); return { headline: (settings?.ads_amazon_headline as string) || "", text: (settings?.ads_amazon_text as string) || "", buttonText: (settings?.ads_amazon_button_text as string) || "Zum Angebot", link: (settings?.ads_amazon_link as string) || "", enabled: (settings?.ads_enabled as boolean) || false }; }
export function useForumBannerConfig() {
  const { data: settings } = useSettings();
  return useMemo(
    () => ({
      headline: (settings?.forum_banner_headline as string) || "Diskussionen & Erfahrungen",
      subheadline: (settings?.forum_banner_subheadline as string) || "Tausche dich mit anderen aus, stelle Fragen und teile deine Erfahrungen",
      badge: (settings?.forum_banner_badge as string) || "Community Forum",
      enabled: true,
    }),
    [settings?.forum_banner_headline, settings?.forum_banner_subheadline, settings?.forum_banner_badge]
  );
}


export type ForumSidebarConfig = {
  hot_comparison_ids: string[];
  popular_comparison_ids: string[];
  show_hot: boolean;
  show_popular: boolean;
  show_random: boolean;
  random_count: number;
  hot_title?: string;
  popular_title?: string;
  random_title?: string;
};

export const defaultForumSidebarConfig: ForumSidebarConfig = {
  hot_comparison_ids: [],
  popular_comparison_ids: [],
  show_hot: true,
  show_popular: true,
  show_random: true,
  random_count: 2,
  hot_title: "Heiße Vergleiche",
  popular_title: "Beliebte Vergleiche",
  random_title: "Zufällige Vergleiche",
};

export function useForumSidebarConfig() {
  const { data } = useSettings();

  return useMemo(() => {
    const config = (data?.forum_sidebar as Partial<ForumSidebarConfig> | undefined) || {};

    return {
      ...defaultForumSidebarConfig,
      ...config,
      hot_comparison_ids: Array.isArray(config.hot_comparison_ids) ? config.hot_comparison_ids : [],
      popular_comparison_ids: Array.isArray(config.popular_comparison_ids) ? config.popular_comparison_ids : [],
      random_count: Number.isFinite(Number(config.random_count)) ? Math.max(0, Number(config.random_count)) : defaultForumSidebarConfig.random_count,
    } as ForumSidebarConfig;
  }, [data?.forum_sidebar]);
}

export function useForumAds() { 
  const { data } = useSettings(); 
  return useMemo(() => (data?.forum_ads as ForumAd[]) || [], [data?.forum_ads]);
}

export function useSiteTitle() { return useSetting<string>("site_title", ""); }
export function useSiteBrandName() {
  const { data } = useSettings();
  return useMemo(() => getPublicBrandNameFromSettings(data), [data?.footer_config, data?.site_settings, data?.site_title]);
}
export function useSiteLogo() { return useSetting<string | null>("site_logo_url", null); }
export function useSiteDescription() { return useSetting<string>("site_description", ""); }
export function useHeroTitle() { return useSetting<string>("hero_title", "Entdecke strukturierte Vergleiche"); }
export function useHeroSubtitle() { return useSetting<string>("hero_subtitle", "Wir strukturieren Daten, damit du die richtige Wahl triffst"); }
export function useAdsEnabled() { return useSetting<boolean>("ads_enabled", false); }
export function useGlobalAnalyticsCode() { return useSetting<string>("global_analytics_code", ""); }
export function useNavLinks() { const c = useHeaderConfig(); return c.nav_links; }
export function useFooterLinks() { const c = useFooterConfig(); return c.popular_links; }
export function useFooterSiteName() { const c = useFooterConfig(); return c.title; }
export function useFooterCopyright() { const c = useFooterConfig(); return c.copyright_text; }
export function useFooterDesignerName() { return useSetting<string>("footer_designer_name", "Digital-Perfect"); }
export function useFooterDesignerUrl() { return useSetting<string>("footer_designer_url", "https://digital-perfect.com"); }

export function useTickerConfig() {
  const { data: settings } = useSettings();
  return {
    badge: (settings?.ticker_badge_text as string) || "TierTarif Überblick",
    headline: (settings?.ticker_headline as string) || "Beliebte TierTarif-Bereiche",
    linkText: (settings?.ticker_link_text as string) || "Alle Bereiche ansehen →"
  };
}

export function useTrendingLinks() {
  return useSetting<TrendingLink[]>("trending_links", []);
}
// --- COMPLIANCE MANAGER HOOKS ---
type ComplianceConfig = {
  mode: "strict" | "warn" | "off";
  exempt_slugs: string;
};

export function useComplianceConfig() {
  return useSetting<ComplianceConfig>("compliance_config", {
    mode: "strict",
    exempt_slugs: ""
  });
}

export function useUpdateComplianceConfig() {
  const updateSetting = useUpdateSetting();
  return (config: { mode: string; exempt_slugs: string }) =>
    updateSetting.mutateAsync({
      key: "compliance_config",
      value: config as unknown as Json
    });
}
