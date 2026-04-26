import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Category schemas
export const categoryThemeEnum = z.enum(["DATING", "ADULT", "CASINO", "GENERIC"]);
export const categoryTemplateEnum = z.enum(["comparison", "review", "hub_overview"]); 
export const colorThemeEnum = z.enum(["dark", "light", "neon"]);

// Navigation settings
export const navigationSettingsSchema = z.object({
  show_top3_dating_apps: z.boolean().default(true),
  show_singles_in_der_naehe: z.boolean().default(true),
  show_chat_mit_einer_frau: z.boolean().default(true),
  show_online_dating_cafe: z.boolean().default(true),
  show_bildkontakte_login: z.boolean().default(true),
  show_18plus_hint_box: z.boolean().default(true),
});

export type NavigationSettings = z.infer<typeof navigationSettingsSchema>;

export const categorySchema = z.object({
  button_text: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug erforderlich").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  name: z.string().min(1, "Name erforderlich"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  theme: categoryThemeEnum.default("GENERIC"),
  color_theme: colorThemeEnum.default("light"),
  template: z.string().default("comparison"),
  is_active: z.boolean().default(true),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  h1_title: z.string().optional().nullable(),
  site_name: z.string().optional().nullable(),
  
  // HERO BANNER TEXTE
  hero_headline: z.string().optional().nullable(),
  hero_pretitle: z.string().optional().nullable(),
  hero_cta_text: z.string().optional().nullable(),
  hero_badge_text: z.string().optional().nullable(),
  
  // NEUE HUB & LISTEN TEXTE (Der Türsteher-Fix)
  intro_title: z.string().optional().nullable(),
  comparison_title: z.string().optional().nullable(),
  project_cta_text: z.string().optional().nullable(),
  features_title: z.string().optional().nullable(),
  
  hero_image_url: z.string().optional().nullable(),
  card_image_url: z.string().optional().nullable(), // NEU: Das Beitragsbild für Hubs
  long_content_top: z.string().optional().nullable(),
  long_content_bottom: z.string().optional().nullable(),
  analytics_code: z.string().optional().nullable(),
  banner_override: z.string().optional().nullable(),
  custom_html_override: z.string().optional().nullable(),
  custom_html: z.string().optional().nullable(), 
  custom_css: z.string().optional().nullable(), 
  comparison_widget_code: z.string().optional().nullable(),
  comparison_widget_type: z.enum(["html", "mr-money"]).optional().nullable(),
  comparison_widget_config: z.record(z.string(), z.any()).optional().nullable(),
  footer_site_name: z.string().optional().nullable(),
  footer_copyright_text: z.string().optional().nullable(),
  footer_designer_name: z.string().optional().nullable(),
  footer_designer_url: z.string().optional().nullable(),
  navigation_settings: navigationSettingsSchema.optional().nullable(),
  sidebar_ad_html: z.string().optional().nullable(),
  sidebar_ad_image: z.string().optional().nullable(),
  faq_data: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional().default([]),
  is_internal_generated: z.boolean().optional().default(false),
  is_city: z.boolean().optional().default(false),
  sort_order: z.number().optional().default(0),
  faq_section: z.any().optional(),
  footer_links: z.any().optional(),
  legal_links: z.any().optional(),
  popular_footer_links: z.any().optional(),
  projects: z.any().optional(),
  category_projects: z.any().optional(),
  reviews: z.any().optional(),
  testimonials: z.any().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const countryScopeEnum = z.enum(["DACH", "DE", "AT", "CH"]);

export const projectSchema = z.object({
  name: z.string().min(1, "Name erforderlich"),
  slug: z.string().min(1, "Slug erforderlich"),
short_description: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().url("Ungültige Logo-URL").optional().or(z.literal("")),
  affiliate_link: z.string().url("Ungültiger Affiliate-Link").optional().or(z.literal("")),
  rating: z.number().min(0).max(10).default(9.8),
  badge_text: z.string().max(50).optional(),
  features: z.array(z.string()).default([]),
  country_scope: countryScopeEnum.default("DACH"),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const trendingLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  emoji: z.string().optional(),
});

export const navLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

export const siteSettingsSchema = z.object({
  site_title: z.string().min(1).max(100),
  site_description: z.string().max(300),
  contact_email: z.string().email().optional().or(z.literal("")),
  google_analytics_id: z.string().optional().or(z.literal("")),
  google_search_console_verification: z.string().optional().or(z.literal("")),
  custom_report_url: z.string().optional().or(z.literal("")),
  social_links: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
  }).optional(),
  trending_links: z.array(trendingLinkSchema).default([]),
  header_nav: z.array(navLinkSchema).default([]),
  footer_nav: z.array(navLinkSchema).default([]),
  legal_nav: z.array(navLinkSchema).default([]),
});

export const homeContentSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    badge: z.string().optional(),
    search_placeholder: z.string().optional(),
  }),
  trust: z.object({
    headline: z.string(),
    subheadline: z.string(),
    card1_title: z.string(),
    card1_text: z.string(),
    card2_title: z.string(),
    card2_text: z.string(),
    card3_title: z.string(),
    card3_text: z.string(),
    box_title: z.string(),
    box_text: z.string(),
    live_badge: z.string().optional(),
  }),
  big_three: z.object({
    headline: z.string(),
    finance_title: z.string().optional(),
    finance_desc: z.string().optional(),
    finance_link: z.string().optional(),
    software_title: z.string().optional(),
    software_desc: z.string().optional(),
    software_link: z.string().optional(),
    services_title: z.string().optional(),
    services_desc: z.string().optional(),
    services_link: z.string().optional(),
    items: z.array(z.any()).default([]),
  }),
  why_us: z.object({
    headline: z.string().default("Warum dieses Portal?"),
    subheadline: z.string().default("Wir sind nicht nur ein weiteres Vergleichsportal."),
    features: z.array(z.any()).default([])
  }).default({}),
  categories: z.object({
    headline: z.string(),
    count: z.number().default(6),
    button_card: z.string().default("Bereich erkunden"),
  }),
  news: z.object({
    headline: z.string().default("Aktuelles & Ratgeber"),
    subheadline: z.string().default("Expertenwissen für deinen Erfolg."),
    count: z.number().default(3),
    button_text: z.string().default("Alle Vergleiche ansehen"),
    button_url: z.string().default("/kategorien"),
    read_more: z.string().default("Artikel lesen")
  }).default({}),
  forum_teaser: z.object({
    headline: z.string(),
    subheadline: z.string(),
  }),
});

export type HomeContent = z.infer<typeof homeContentSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;