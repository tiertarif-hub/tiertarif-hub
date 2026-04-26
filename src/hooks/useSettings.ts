import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { TrendingLink } from "@/lib/schemas";
import { getCategoriesRoute, normalizeNavigableHref } from "@/lib/routes";
import { ABOUT_PAGE_SETTING_KEY } from "@/lib/aboutContent";
import { DEFAULT_BRAND_NAME, DEFAULT_SITE_DESCRIPTION } from "@/lib/constants";
import { useMemo } from "react";
export const PUBLIC_SETTINGS_KEYS = [
  "active_theme",
  "home_sections",
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
        console.error("Supabase Error:", error);

        if (error.message?.includes("TOXIC_WORD_ERROR")) {
          const cleanMsg = getCleanToxicWordMessage(error.message);
          throw new Error(cleanMsg);
        }

        throw error;
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
  return useSetting<string>("active_theme", "navy");
}

// --- CMS DEFAULTS ---

export const defaultHomeSections: HomeSection[] = [
  { id: "hero", label: "Hero Sektion", enabled: true, order: 0 },
  { id: "how_it_works", label: "So funktioniert das Portal", enabled: true, order: 1 },
  { id: "news", label: "News / Magazin", enabled: true, order: 2 },
  { id: "big_three", label: "Big Three (Main Links)", enabled: true, order: 3 },
  { id: "forum", label: "Forum Teaser", enabled: true, order: 4 },
  { id: "trust", label: "Trust & Siegel", enabled: true, order: 5 },
  { id: "categories", label: "Kategorien Slider", enabled: true, order: 6 },
  { id: "amazon_top", label: "Amazon Banner (Top)", enabled: true, order: 7 },
  { id: "adsense_middle", label: "Google AdSense", enabled: true, order: 8 },
  { id: "home_faq", label: "FAQ Startseite", enabled: true, order: 9 },
  { id: "seo", label: "SEO Text (Unten)", enabled: true, order: 10 },
  { id: "mascot", label: "Scouty Maskottchen", enabled: true, order: 11 },
];

export const defaultHomeLayout = {
  hero: true,
  trust: true,
  big_three: true,
  why_us: true, 
  categories: true,
  news: true,
  forum_teaser: true,
  ads: false,
  seo_text: true
};

// CONTENT DEFAULTS
export const defaultHomeContent = {
  seo_title: "",
  seo_description: "",
  
  hero: {
  badge: "NEU: Das Portal ist live",
  headline: "Dein zentraler Vergleichs-Hub",
  title: "Dein zentraler Vergleichs-Hub",
  subtitle: "Suche & finde passende Tools für deinen Erfolg.",
  subheadline: "Suche & finde passende Tools für deinen Erfolg. Vergleiche, entdecke und nutze etablierte Angebote aus KI, Software und Lifestyle. Transparent eingeordnet.",
  search_placeholder: "Was suchst du heute? (z.B. 'KI Tools', 'Dating')",
  search_label: "Finden",
  button_text: "Jetzt vergleichen",
  stats: [
    { title: "Viele", label: "Kategorien" },
    { title: "Aktive", label: "Community" },
    { title: "Laufend", label: "Aktualisiert" }
  ]
},
  how_it_works: {
    headline: "So funktioniert das Portal",
    subheadline: "In drei einfachen Schritten zur besten Entscheidung.",
    steps: [
      { title: "Suchen", text: "Wähle deine Kategorie oder suche direkt nach deinem Bedarf." },
      { title: "Vergleichen", text: "Unsere KI-gestützten Daten zeigen dir Stärken, Schwächen und Preise auf einen Blick." },
      { title: "Entscheiden", text: "Vergleiche passende Angebote und prüfe verfügbare Vorteile." }
    ]
  },
  trust: { 
    badge: "Live: Trend Apps letzte 24h",
    headline: "Top Apps & Deals",
    link_text: "Alle Trends ansehen →",
    subheadline: "Top Apps & Deals"
  },
  big_three: { 
    headline: "Wähle deinen Bereich", 
    items: [
        { id: "1", title: "Versicherungen", desc: "Tarife, Leistungen und Policen im Überblick.", link: getCategoriesRoute(), button_text: "Vergleichen", theme: "blue", image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85" },
        { id: "2", title: "Finanzen & Krypto", desc: "Broker, Kredite & Geschäftskonten im Überblick.", link: getCategoriesRoute(), button_text: "Vergleichen", theme: "gold", image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" },
        { id: "3", title: "KI & Software", desc: "Tools und Softwarelösungen im Überblick.", link: getCategoriesRoute(), button_text: "Tools finden", theme: "dark", image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b" }
    ],
    finance_title: "Finanzen & Krypto", finance_desc: "Broker, Kredite & Geschäftskonten im Überblick.", finance_link: getCategoriesRoute(), finance_button: "Jetzt vergleichen", 
    software_title: "KI & Software", software_desc: "Tools und Softwarelösungen im Überblick.", software_link: getCategoriesRoute(), software_button: "Tools finden", 
    services_title: "Versicherungen", services_desc: "Tarife, Leistungen und Policen im Überblick.", services_link: getCategoriesRoute(), services_button: "Zum Vergleich" 
  },
  why_us: {
    headline: "Warum dieses Vergleichsportal?",
    subheadline: "Wir sind deine intelligente Entscheidungshilfe.",
    features: [
      { title: "Hohe Performance", text: "Schnelle Ladezeiten, klare Fakten.", icon: "zap" },
      { title: "Transparente Kriterien", text: "Nachvollziehbare Vergleiche.", icon: "shield" },
      { title: "Global & Lokal", text: "Von International bis Regional.", icon: "globe" },
      { title: "Laufende Updates", text: "Regelmäßig frische Daten.", icon: "chart" }
    ]
  },
  home_faq: {
    badge: "FAQ • Startseite",
    headline: "Häufige Fragen zum Vergleichsportal",
    subheadline: "Hier findest du kompakte Antworten zu Vergleichen, Rechnern, Ratgebern und Partner-Anfragen auf diesem Portal.",
    items: [
      {
        id: "home-faq-1",
        question: "Was ist dieses Vergleichsportal?",
        answer: "<p>Dieses Vergleichsportal ist eine Plattform für Vergleiche, Rechner und Ratgeber zu Themen wie Finanzen, Versicherungen, Energie, Internet, Software und digitalen Diensten.</p>",
      },
      {
        id: "home-faq-2",
        question: "Welche Themen finde ich auf diesem Portal?",
        answer: "<p>Du findest Vergleiche, redaktionelle Einordnungen und praktische Rechner zu Alltags- und Digitalthemen – von Versicherung über Kredit bis hin zu Software und Internet.</p>",
      },
      {
        id: "home-faq-3",
        question: "Warum lohnt sich ein regelmäßiger Tarifvergleich?",
        answer: "<p>Konditionen ändern sich laufend. Ein regelmäßiger Vergleich hilft dir, Preise, Leistungen und Vertragsdetails sauber einzuordnen und Sparpotenziale zu erkennen.</p>",
      },
    ],
  },
  seo: { 
    headline: "Über unseren Vergleichs-Hub", 
    intro: "Willkommen auf Ihrem Vergleichsportal. Wir bringen Licht in den Dschungel digitaler Dienstleistungen.", 
    block1_title: "Unser Ansatz", block1_text: "Wir strukturieren komplexe Angebote und bereiten Konditionen verständlich und übersichtlich auf.", 
    block2_title: "Laufende Pflege", block2_text: "Unsere Redaktion überprüft den Markt regelmäßig auf neue Entwicklungen und Tarifänderungen.",
    long_text: "" 
  },
  categories: { headline: "Alle Kategorien im Überblick", count: 6, button_more: "Alle Kategorien anzeigen", button_card: "Bereich erkunden" },
  news: { headline: "Aktuelles & Ratgeber", subheadline: "News & Updates", count: 3, button_text: "Alle Vergleiche ansehen", button_url: "/kategorien", read_more: "Artikel lesen" },
  forum_teaser: { headline: "Community Hub", subheadline: "Tauche in beliebte Themenbereiche ein und teile deine Erfahrungen mit der Community.", link_text: "Alle Foren anzeigen", mobile_button: "Zum Community Forum" }
};

export const defaultHeaderConfig = { 
  button_text: "Jetzt vergleichen", 
  button_url: getCategoriesRoute(), 
  nav_links: [{ label: "Versicherungen", url: getCategoriesRoute() }, { label: "Finanzen & Krypto", url: getCategoriesRoute() }, { label: "KI & Software", url: getCategoriesRoute() }], 
  hub_links: [{ label: "Vergleichs-Hub", url: "/kategorien", icon: "LayoutGrid" }, { label: "Arcade", url: "/arcade", icon: "Gamepad2" }, { label: "Brain-Boost", url: "/brain-boost", icon: "BrainCircuit" }, { label: "Community", url: "/forum", icon: "Users" }],
  tools_links: [{ label: "Kündigung Vorlage", url: "/kuendigung-vorlage", icon: "FileText" }] 
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
  popular_links: [{ label: "Versicherungen", url: getCategoriesRoute() }, { label: "Finanzen & Krypto", url: getCategoriesRoute() }, { label: "KI & Software", url: getCategoriesRoute() }],
  tools_links: [{ label: "Kündigung Vorlage", url: "/kuendigung-vorlage" }, { label: "Alle Vergleiche", url: "/kategorien" }, { label: "Wie wir vergleichen", url: "/wie-wir-vergleichen" }, { label: "Kontakt", url: "/kontakt" }, { label: "Cookie-Einstellungen", url: "/cookie-einstellungen" }] 
};

export const defaultScoutyConfig = { 
  bubble_intro: "Hi, ich bin Scouty! Ich finde passende Angebote für dich! 🔭", 
  bubble_exit: "Warte! 🛑 Bevor du gehst: Ich habe gerade einen passenden Vorschlag gefunden. Willst du ihn sehen?", 
  bubble_newsletter: "Spannende Deals per Mail?", 
  powered_by: `Powered by ${DEFAULT_BRAND_NAME}` 
};

type LinkConfigItem = { url?: string | null; [key: string]: any };

function normalizeLinkConfigItems<T extends LinkConfigItem>(items: T[] | undefined | null): T[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    url: normalizeNavigableHref(String(item?.url ?? "")),
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
    link: normalizeNavigableHref(String(item?.link ?? "/")),
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

export function normalizeHomeSectionsValue(rawSections?: HomeSection[] | null): HomeSection[] {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return cloneHomeSections(defaultHomeSections).map((section, index) => ({ ...section, order: index }));
  }

  const sortedSavedSections = rawSections
    .filter((section): section is HomeSection => Boolean(section?.id))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((section) => {
      const fallback = defaultHomeSections.find((entry) => entry.id === section.id);
      return {
        ...(fallback || {}),
        ...section,
        label: section.label || fallback?.label || section.id,
        enabled: typeof section.enabled === "boolean" ? section.enabled : fallback?.enabled ?? true,
      } as HomeSection;
    });

  const hasSection = (id: string) => sortedSavedSections.some((section) => section.id === id);

  if (!hasSection("how_it_works")) {
    const heroIndex = sortedSavedSections.findIndex((section) => section.id === "hero");
    const insertIndex = heroIndex >= 0 ? heroIndex + 1 : 0;
    sortedSavedSections.splice(insertIndex, 0, createHomeSection("how_it_works"));
  }

  if (!hasSection("home_faq")) {
    const seoIndex = sortedSavedSections.findIndex((section) => section.id === "seo");
    const mascotIndex = sortedSavedSections.findIndex((section) => section.id === "mascot");
    const insertIndex = seoIndex >= 0 ? seoIndex : mascotIndex >= 0 ? mascotIndex : sortedSavedSections.length;
    sortedSavedSections.splice(insertIndex, 0, createHomeSection("home_faq"));
  }

  defaultHomeSections.forEach((defaultSection) => {
    if (!hasSection(defaultSection.id)) {
      sortedSavedSections.push({ ...defaultSection });
    }
  });

  return sortedSavedSections.map((section, index) => ({
    ...section,
    order: index,
  }));
}

// --- CONFIG HOOKS ---

export function useHomeLayout() { 
  const { data: settings } = useSettings(); 

  return useMemo(() => {
    const layoutV2 = settings?.home_layout_v2 as typeof defaultHomeLayout | undefined;
    const layout = { ...defaultHomeLayout, ...(layoutV2 || {}) };

    const sections = normalizeHomeSectionsValue(settings?.home_sections as HomeSection[] | undefined);

    const mappedSections = sections.map((s) => {
      let isEnabled = typeof s.enabled === 'boolean' ? s.enabled : true;
      if (s.id === 'hero') isEnabled = layout.hero;
      else if (s.id === 'trust') isEnabled = layout.trust;
      else if (s.id === 'big_three') isEnabled = layout.big_three;
      else if (s.id === 'categories') isEnabled = layout.categories;
      else if (s.id === 'news') isEnabled = layout.news;
      else if (s.id === 'forum') isEnabled = layout.forum_teaser;
      else if (s.id === 'seo') isEnabled = layout.seo_text;
      else if (s.id === 'amazon_top' || s.id === 'adsense_middle') isEnabled = layout.ads;
      
      return { ...s, enabled: isEnabled };
    });

    return { 
      sections: mappedSections, 
      layout 
    }; 
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
    badge: (settings?.ticker_badge_text as string) || "Aktuelle Trends",
    headline: (settings?.ticker_headline as string) || "Beliebte Apps & Deals",
    linkText: (settings?.ticker_link_text as string) || "Alle Trends ansehen →"
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