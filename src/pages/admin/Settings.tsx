import { useState, useEffect } from "react";
import { 
  useAdminSettings, 
  useUpdateSetting, 
  useHomeLayout, 
  useHomeContent, 
  useForumAds,
  useComplianceConfig,
  useUpdateComplianceConfig,
  defaultHomeLayout, 
  defaultHomeContent,
  defaultFeatureToggles,
  normalizeFeatureTogglesValue,
  ForumAd,
  type FeatureToggles
} from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, Trash2, Save, Globe, Layout, Sparkles, BarChart3, 
  DollarSign, Image as ImageIcon, Upload, Link as LinkIcon,
  Target, Users, Plus, Menu as MenuIcon, MessageSquare, ShieldCheck, List,
  Mail, Megaphone, PaintBucket, ArrowUp, ArrowDown, Type, Rocket, X,
  ShieldAlert, ShieldOff, FileText, Monitor, Smartphone
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoriesRoute, getCategoryRoute } from "@/lib/routes";
import { normalizeFooterConfigValue, normalizeHeaderConfigValue, useForumSidebarConfig, defaultForumSidebarConfig } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { HomeFAQEditor } from "@/components/admin/HomeFAQEditor";

// --- NEUE KOMPONENTE: COMPLIANCE MANAGER ---
function ComplianceSettingsCard() {
  const config = useComplianceConfig();
  const updateConfig = useUpdateComplianceConfig();
  
  const [mode, setMode] = useState(config?.mode || "strict");
  const [exemptSlugs, setExemptSlugs] = useState(config?.exempt_slugs || "");

  useEffect(() => {
    if (config) {
      setMode(config.mode || "strict");
      setExemptSlugs(config.exempt_slugs || "");
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig({ mode, exempt_slugs: exemptSlugs });
      toast({
        title: "Compliance Settings gespeichert",
        description: `Der Legal-Filter läuft nun im Modus: ${mode.toUpperCase()}`,
      });
    } catch (error) {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm border-l-4 border-l-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4 border-b border-border">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          {mode === 'strict' && <ShieldCheck className="w-5 h-5 text-accent-foreground" />}
          {mode === 'warn' && <ShieldAlert className="w-5 h-5 text-secondary" />}
          {mode === 'off' && <ShieldOff className="w-5 h-5 text-red-500" />}
          Legal & Compliance Manager
        </CardTitle>
        <CardDescription>
          Steuert den globalen Datenbank-Schutz vor abmahngefährdeten Wörtern (z.B. "Testsieger").
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        <div className="space-y-3">
          <Label className="font-bold text-foreground">Schutz-Modus (Global)</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-12 rounded-xl bg-background border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strict">
                <span className="font-bold text-primary dark:text-accent-foreground">STRICT:</span> Harter Block (Speichern wird verweigert)
              </SelectItem>
              <SelectItem value="warn">
                <span className="font-bold text-secondary">SOFT ALLOW (Warn):</span> Speichern wird erlaubt, kein Hard-Stop
              </SelectItem>
              <SelectItem value="off">
                <span className="font-bold text-red-600 dark:text-red-500">OFF (Exit-Modus):</span> Komplett deaktiviert (Alles ist erlaubt)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="font-bold text-foreground">Ausnahmen (Freigegebene Slugs)</Label>
          <Input 
            value={exemptSlugs} 
            onChange={(e) => setExemptSlugs(e.target.value)} 
            placeholder="z.B. kredit-vergleich, dating-apps" 
            className="h-12 rounded-xl bg-background border-input font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Kommagetrennte Liste von URLs (ohne Slash), bei denen der Filter ignoriert wird, selbst wenn "STRICT" aktiv ist.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl font-bold">
          <Save className="w-4 h-4 mr-2" /> Compliance Einstellungen speichern
        </Button>
      </CardContent>
    </Card>
  );
}
// --- ENDE NEUE KOMPONENTE ---

// --- NEUE KOMPONENTE: SERVER SECRETS WARNING ---
function ServerSecretsWarningCard() {
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <ShieldAlert className="w-5 h-5" />
          Server-Secrets
        </CardTitle>
        <CardDescription className="text-red-700/80 dark:text-red-400/80">
          Bridge-Key und Admin-Geheimnisse werden nicht mehr in der Datenbank oder im Browser gespeichert.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-red-700/80 dark:text-red-400/80">
          Verwaltung erfolgt ausschließlich serverseitig über Supabase Secrets und die Edge Function.
        </p>
        <p className="text-sm text-red-700/80 dark:text-red-400/80">
          Änderungen laufen ab sofort nur noch über Supabase CLI bzw. Supabase Dashboard.
        </p>
      </CardContent>
    </Card>
  );
}
// --- ENDE NEUE KOMPONENTE ---

const HERO_IMAGE_BUCKET = "branding";
const HERO_IMAGE_FIELDS = {
  desktop: "desktop_image_url",
  mobile: "mobile_image_url",
} as const;
type HeroImageVariant = keyof typeof HERO_IMAGE_FIELDS;

function getSafeStorageFileName(file: File, prefix: string) {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "hero";

  return `hero/${prefix}-${Date.now()}-${baseName}.${fileExtension}`;
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();
   
  // Hooks für Home-Steuerung & Ads
  const { layout, sections: normalizedHomeSections } = useHomeLayout();
  const { content: serverContent } = useHomeContent();
  const forumSidebarConfig = useForumSidebarConfig();
  const { data: comparisonCategories = [] } = useCategories(false);
  const forumAds = useForumAds();
   
  // Lokaler State
  const [localContent, setLocalContent] = useState<typeof defaultHomeContent | null>(null);
  const [forumSidebarLocal, setForumSidebarLocal] = useState<any>(defaultForumSidebarConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // SEO Text State (Lokal, Performance für langes Tippen)
  const [seoLongText, setSeoLongText] = useState("");

  // Bestehende States
  const [siteTitle, setSiteTitle] = useState("");
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [topBarText, setTopBarText] = useState("");
  const [topBarLink, setTopBarLink] = useState("");
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHeroDesktop, setIsUploadingHeroDesktop] = useState(false);
  const [isUploadingHeroMobile, setIsUploadingHeroMobile] = useState(false);

  // --- THEME STATES ---
  const [activeTheme, setActiveTheme] = useState("tiertarif");
  const [dashboardTheme, setDashboardTheme] = useState("dark");

  // --- MARKETING STATES ---
  const [newsletterActive, setNewsletterActive] = useState(true);
  const [popupActive, setPopupActive] = useState(false);

  // --- FORUM BANNER CONFIG ---
  const [forumBanner, setForumBanner] = useState({
    title: "", ctaText: "", linkUrl: "", imageUrl: "", isActive: false, description: ""
  });

  // --- HOME SECTIONS (ERWEITERT) ---
  const [homeSections, setHomeSections] = useState<any[]>([]);

  // --- TIER TARIF FEATURE TOGGLES ---
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>(defaultFeatureToggles);

  // --- ANALYTICS STATES ---
  const [ga4Id, setGa4Id] = useState("");
  const [gscVerification, setGscVerification] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  const [adSenseClient, setAdSenseClient] = useState("");
  const [adSenseSlot, setAdSenseSlot] = useState("");
  const [amznHeadline, setAmznHeadline] = useState("");
  const [amznText, setAmznText] = useState("");
  const [amznButton, setAmznButton] = useState("");
  const [amznLink, setAmznLink] = useState("");

  // SCOUTY STATES
  const [scoutyHighTicketUrl, setScoutyHighTicketUrl] = useState("");
  const [scoutyEnabled, setScoutyEnabled] = useState(true);
  const [scoutyLeadsCount, setScoutyLeadsCount] = useState(0);

  // --- GOOGLE INDEXING STATE (NEU) ---
  const [indexingUrls, setIndexingUrls] = useState("");
  const [isPinging, setIsPinging] = useState(false);
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);

  const handleIndexPing = async () => {
    if (!indexingUrls.trim()) return;
    
    setIsPinging(true);
    try {
      const urls = indexingUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      
      if (urls.length === 0) {
        toast({ title: "Keine gültigen URLs gefunden", variant: "destructive" });
        setIsPinging(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-ping', {
        body: { urls }
      });

      if (error) throw error;

      const results = data.results || [];
      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.length - successCount;

      toast({ 
        title: "Indexing Request gesendet", 
        description: `${successCount} erfolgreich, ${failCount} fehlgeschlagen.`,
        variant: failCount > 0 ? "destructive" : "default"
      });
      
      if (successCount === urls.length) {
        setIndexingUrls("");
      }

    } catch (error: any) {
      toast({ title: "Fehler beim Pingen", description: error.message || "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setIsPinging(false);
    }
  };

  const handleGenerateSitemap = async () => {
    if (!featureToggles.has_indexing_tools) {
      toast({ title: "Indexing Tools deaktiviert", description: "Aktiviere das Modul zuerst unter Module." });
      return;
    }

    setIsGeneratingSitemap(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-sitemap');

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || data?.message || 'Sitemap konnte nicht generiert werden.');
      }

      toast({
        title: 'Sitemap neu generiert',
        description: `${data.url_count ?? 0} URLs geschrieben. ${data.public_url ? `Live-URL: ${data.public_url}` : ''}`.trim(),
      });
    } catch (error: any) {
      toast({ title: 'Fehler bei der Sitemap', description: error.message || 'Unbekannter Fehler', variant: 'destructive' });
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  // --- STANDARD CONFIG WERTE (DEFAULTS) ---
  const defaultHeaderConfig = {
    nav_links: [
      { label: "Hunde", url: getCategoriesRoute() },
      { label: "Katzen", url: getCategoriesRoute() },
      { label: "OP-Schutz", url: getCategoriesRoute() }
    ],
    hub_links: [
      { label: "Alle Kategorien", url: "/kategorien", icon: "LayoutGrid" },
      { label: "Ratgeber", url: "/kategorien", icon: "FileText" }
    ],
    button_text: "Jetzt vergleichen",
    button_url: getCategoriesRoute()
  };

  const defaultFooterConfig = {
    text_checked: "Redaktionell geprüft",
    text_update: "Aktualisiert: 2026",
    text_description: "TierTarif strukturiert Tierversicherungen, Tierarztkosten und OP-Schutz sachlich für Hunde- und Katzenhalter.",
    copyright_text: "© 2026 TierTarif. Alle Rechte vorbehalten.",
    made_with_text: "Made with",
    made_in_text: "in Austria",
    disclaimer: "*Werbehinweis: Wir finanzieren uns teilweise über sogenannte Affiliate-Links. Wenn du über einen Link oder Vergleichsrechner auf dieser Seite weitergehst, erhalten wir möglicherweise eine Provision. Der Preis für dich ändert sich dadurch nicht. Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt.",
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
      { label: "Hundeversicherung", url: getCategoriesRoute() },
      { label: "Katzenversicherung", url: getCategoriesRoute() },
      { label: "Tier-OP-Versicherung", url: getCategoriesRoute() }
    ],
    tools_links: [
      { label: "Alle Vergleiche", url: "/kategorien" },
      { label: "Wie wir vergleichen", url: "/wie-wir-vergleichen" },
      { label: "Kontakt", url: "/kontakt" },
      { label: "Cookie-Einstellungen", url: "/cookie-einstellungen" }
    ]
  };

  const [headerConfig, setHeaderConfig] = useState<any>(defaultHeaderConfig);
  const [footerConfig, setFooterConfig] = useState<any>(defaultFooterConfig);

  // Stabile Dependency-Keys: verhindert React-18-Renderloops durch neue Objekt-Referenzen.
  const serverContentKey = JSON.stringify(serverContent ?? null);
  const forumSidebarConfigKey = JSON.stringify(forumSidebarConfig ?? defaultForumSidebarConfig);
  const normalizedHomeSectionsKey = JSON.stringify(normalizedHomeSections ?? []);

  // Initialisierung: niemals State während des Renderns setzen.
  // React 18 + Router darf hier nur rendern; alle Syncs laufen nach dem Commit im Effekt.
  useEffect(() => {
    if (!settings) return;

    setSiteTitle((settings.site_title as string) || "TierTarif");
    setSiteLogoUrl((settings.site_logo_url as string) || "");
    setSiteDescription((settings.site_description as string) || "");
    setTopBarText((settings.top_bar_text as string) || "");
    setTopBarLink((settings.top_bar_link as string) || "");
    setAnalyticsCode((settings.global_analytics_code as string) || "");
    setAdsEnabled((settings.ads_enabled as boolean) || false);
    
    // Theme & Marketing Init
    setActiveTheme((settings.active_theme as string) || "tiertarif");
    setDashboardTheme((settings.dashboard_theme as string) || "dark");
    setNewsletterActive((settings.newsletter_active as boolean) ?? true);
    setPopupActive((settings.popup_active as boolean) ?? false);
    setFeatureToggles(normalizeFeatureTogglesValue(settings.feature_toggles as Partial<FeatureToggles> | undefined));

    // Forum Banner Init
    setForumBanner((prev: any) => ({
      ...prev,
      ...((settings.forum_banner_config as any) || {}),
    }));


    // Load Analytics
    setGa4Id((settings as any).google_analytics_id || "");
    setGscVerification((settings as any).google_search_console_verification || "");
    setReportUrl((settings as any).custom_report_url || "");

    setAdSenseClient((settings.ads_sense_client_id as string) || "");
    setAdSenseSlot((settings.ads_sense_slot_id as string) || "");
    
    setAmznHeadline((settings.ads_amazon_headline as string) || "");
    setAmznText((settings.ads_amazon_text as string) || "");
    setAmznButton((settings.ads_amazon_button_text as string) || "");
    setAmznLink((settings.ads_amazon_link as string) || "");

    // Scouty Init
    // @ts-ignore
    const scoutyConfig = settings.scouty_config as { high_ticket_url?: string; enabled?: boolean } | null;
    setScoutyHighTicketUrl(scoutyConfig?.high_ticket_url || "");
    setScoutyEnabled(scoutyConfig?.enabled ?? true);

    // DB ist Single Source of Truth: Defaults nur bei komplett fehlender Config.
    const savedHeaderConfig = settings.header_config as any;
    setHeaderConfig(
      savedHeaderConfig
        ? normalizeHeaderConfigValue({ ...defaultHeaderConfig, ...savedHeaderConfig })
        : normalizeHeaderConfigValue(defaultHeaderConfig)
    );

    const savedFooterConfig = settings.footer_config as any;
    setFooterConfig(
      savedFooterConfig
        ? normalizeFooterConfigValue({ ...defaultFooterConfig, ...savedFooterConfig })
        : normalizeFooterConfigValue(defaultFooterConfig)
    );
  }, [settings]);

  useEffect(() => {
    const nextContent = JSON.parse(serverContentKey || "null");
    if (!nextContent || hasUnsavedChanges) return;

    const nextSeoLongText = nextContent.seo?.long_text || "";

    setLocalContent((currentContent) => {
      if (currentContent && JSON.stringify(currentContent) === JSON.stringify(nextContent)) {
        return currentContent;
      }
      return nextContent;
    });

    setSeoLongText((currentText) => currentText === nextSeoLongText ? currentText : nextSeoLongText);
  }, [serverContentKey, hasUnsavedChanges]);

  useEffect(() => {
    const nextForumSidebarConfig = JSON.parse(forumSidebarConfigKey || JSON.stringify(defaultForumSidebarConfig));

    setForumSidebarLocal((currentConfig: any) => {
      if (currentConfig && JSON.stringify(currentConfig) === JSON.stringify(nextForumSidebarConfig)) {
        return currentConfig;
      }
      return nextForumSidebarConfig;
    });
  }, [forumSidebarConfigKey]);

  useEffect(() => {
    const nextHomeSections = JSON.parse(normalizedHomeSectionsKey || "[]");

    if (nextHomeSections.length > 0 && homeSections.length === 0) {
      setHomeSections(nextHomeSections);
    }
  }, [normalizedHomeSectionsKey, homeSections.length]);

  useEffect(() => {
    // TierTarif-Hotfix: Keine blinde Anfrage mehr auf die optionale Tabelle
    // "subscribers". Wenn das Leads-Modul/Tabelle in Supabase nicht existiert,
    // erzeugt bereits der Request einen Browser-404. Darum bleibt der Zähler
    // deaktiviert, bis das Leads-Modul inklusive DB-Tabelle bewusst ausgerollt wird.
    setScoutyLeadsCount(0);
  }, [featureToggles.has_scouty, featureToggles.has_leads]);

  async function saveSetting(key: string, value: Json) {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  }

  const saveScoutyConfig = () => {
    saveSetting("scouty_config", { 
      high_ticket_url: scoutyHighTicketUrl,
      enabled: scoutyEnabled
    });
  };

  const saveAnalytics = () => {
    saveSetting("google_analytics_id", ga4Id);
    saveSetting("google_search_console_verification", gscVerification);
    saveSetting("custom_report_url", reportUrl);
    saveSetting("global_analytics_code", analyticsCode);
  };

  const saveThemeSettings = () => {
    saveSetting("active_theme", activeTheme);
    saveSetting("dashboard_theme", dashboardTheme);
  };

  const saveMarketingSettings = () => {
    saveSetting("newsletter_active", newsletterActive);
    saveSetting("popup_active", popupActive);
  };

  const updateFeatureToggle = (key: keyof FeatureToggles, value: boolean) => {
    setFeatureToggles((current) => ({ ...current, [key]: value }));
  };

  const saveFeatureToggles = () => {
    saveSetting("feature_toggles", featureToggles as unknown as Json);
  };

  const saveForumBannerConfig = () => {
    saveSetting("forum_banner_config", forumBanner);
  };

  const saveForumSidebarConfig = () => {
    saveSetting("forum_sidebar", forumSidebarLocal);
  };

  const moveHomeSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === homeSections.length - 1) return;
    
    const newSections = [...homeSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    newSections.forEach((sec, i) => sec.order = i);
    setHomeSections(newSections);
    saveSetting("home_sections", newSections);
  };

  const toggleHomeSectionEnabled = (index: number) => {
    const newSections = [...homeSections];
    newSections[index].enabled = !newSections[index].enabled;
    setHomeSections(newSections);
    saveSetting("home_sections", newSections);
  };

  const toggleSection = (key: keyof typeof defaultHomeLayout) => {
    // @ts-ignore
    const newLayout = { ...layout, [key]: !layout[key] };
    saveSetting("home_layout_v2", newLayout); 
  };

  const updateContent = (section: string, field: string, value: any) => {
    if (!localContent) return;
    const newContent = { 
      ...localContent, 
      [section]: { 
        // @ts-ignore
        ...(localContent[section] || {}), 
        [field]: value 
      } 
    };
    setLocalContent(newContent as any);
    setHasUnsavedChanges(true);
  };

  const persistHomeContent = async (nextContent: typeof defaultHomeContent, successTitle = "Startseiteninhalte gespeichert") => {
    const finalContentToSave = {
      ...nextContent,
      seo: {
        ...nextContent.seo,
        long_text: seoLongText
      }
    };

    await updateSetting.mutateAsync({
      key: "home_content",
      value: finalContentToSave as unknown as Json
    });

    setLocalContent(finalContentToSave);
    setHasUnsavedChanges(false);
    toast({ title: successTitle });
  };

  const saveContentManually = async () => {
    if (!localContent) return;

    try {
      await persistHomeContent(localContent);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error?.message || "Startseiteninhalte konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, variant: HeroImageVariant) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !localContent) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Ungültige Datei", description: "Bitte lade ein Bild im Format WebP, AVIF, JPG oder PNG hoch.", variant: "destructive" });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Bild zu groß", description: "Bitte komprimiere das Hero-Bild auf maximal 4 MB. Für Live ideal: unter 350 KB.", variant: "destructive" });
      return;
    }

    const setUploading = variant === "desktop" ? setIsUploadingHeroDesktop : setIsUploadingHeroMobile;
    setUploading(true);

    try {
      const fileName = getSafeStorageFileName(file, variant);
      const { error: uploadError } = await supabase.storage
        .from(HERO_IMAGE_BUCKET)
        .upload(fileName, file, { cacheControl: "31536000", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(HERO_IMAGE_BUCKET)
        .getPublicUrl(fileName);

      const heroField = HERO_IMAGE_FIELDS[variant];
      const nextContent = {
        ...localContent,
        hero: {
          ...localContent.hero,
          [heroField]: publicUrl,
        }
      } as typeof defaultHomeContent;

      await persistHomeContent(
        nextContent,
        variant === "desktop" ? "Desktop-Hero-Bild gespeichert" : "Mobiles Hero-Bild gespeichert"
      );
    } catch (error: any) {
      toast({
        title: "Hero-Bild Upload fehlgeschlagen",
        description: error?.message?.includes("Bucket not found")
          ? "Storage-Bucket 'branding' fehlt. Bitte zuerst das SQL create_storage_branding_bucket.sql ausführen oder statt Upload eine Bild-URL eintragen."
          : (error?.message || "Bitte Storage-Bucket und Admin-Rechte prüfen oder alternativ eine Bild-URL eintragen."),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const updateHeroImageUrl = (variant: HeroImageVariant, url: string) => {
    if (!localContent) return;

    const heroField = HERO_IMAGE_FIELDS[variant];
    setLocalContent({
      ...localContent,
      hero: {
        ...localContent.hero,
        [heroField]: url,
      }
    } as typeof defaultHomeContent);
    setHasUnsavedChanges(true);
  };

  const saveHeroImageUrl = async (variant: HeroImageVariant) => {
    if (!localContent) return;

    const heroField = HERO_IMAGE_FIELDS[variant];
    const normalizedUrl = String(localContent.hero?.[heroField] || "").trim();

    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith("/")) {
      toast({
        title: "Ungültige Bild-URL",
        description: "Bitte eine vollständige https:// URL oder einen relativen Pfad wie /hero/bild.webp eintragen.",
        variant: "destructive"
      });
      return;
    }

    const nextContent = {
      ...localContent,
      hero: {
        ...localContent.hero,
        [heroField]: normalizedUrl,
      }
    } as typeof defaultHomeContent;

    try {
      await persistHomeContent(
        nextContent,
        variant === "desktop" ? "Desktop-Hero-URL gespeichert" : "Mobile-Hero-URL gespeichert"
      );
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error?.message || "Hero-Bild-URL konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const removeHeroImage = async (variant: HeroImageVariant) => {
    if (!localContent) return;

    try {
      const heroField = HERO_IMAGE_FIELDS[variant];
      const nextContent = {
        ...localContent,
        hero: {
          ...localContent.hero,
          [heroField]: "",
        }
      } as typeof defaultHomeContent;

      await persistHomeContent(
        nextContent,
        variant === "desktop" ? "Desktop-Hero-Bild entfernt" : "Mobiles Hero-Bild entfernt"
      );
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error?.message || "Hero-Bild konnte nicht entfernt werden.",
        variant: "destructive"
      });
    }
  };

  // --- BIG THREE DYNAMISCH ---
  const addBigThreeItem = () => {
    if (!localContent) return;
    // @ts-ignore
    const currentItems = localContent.big_three?.items || [];
    const newItem = {
      id: crypto.randomUUID(),
      title: "Neuer Bereich",
      desc: "Beschreibung...",
      link: "/",
      button_text: "Ansehen",
      image_url: "",
      theme: "tiertarif",
      icon: "trending"
    };
    updateContent("big_three", "items", [...currentItems, newItem]);
  };

  const removeBigThreeItem = (index: number) => {
    if (!localContent) return;
    // @ts-ignore
    const newItems = [...(localContent.big_three?.items || [])];
    newItems.splice(index, 1);
    updateContent("big_three", "items", newItems);
  };

  const updateBigThreeItem = (index: number, field: string, value: any) => {
    if (!localContent) return;
    // @ts-ignore
    const newItems = [...(localContent.big_three?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updateContent("big_three", "items", newItems);
  };

  const updateFeature = (index: number, field: string, value: any) => {
    if (!localContent) return;
    // @ts-ignore
    const currentFeatures = localContent.why_us?.features || [];
    while (currentFeatures.length < 4) {
      currentFeatures.push({ title: "Feature", text: "Beschreibung", icon: "zap" });
    }
    const newFeatures = [...currentFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateContent("why_us", "features", newFeatures);
  };

  // --- HEADER LINKS (Desktop) ---
  const addNavLink = () => {
    const newLinks = [...(headerConfig.nav_links || []), { label: "Neuer Link", url: "/" }];
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  const removeNavLink = (index: number) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    newLinks.splice(index, 1);
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  const updateNavLink = (index: number, field: string, value: string) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  // --- HEADER LINKS (Mobile Hub) ---
  const updateHubLink = (index: number, field: string, value: string) => {
    const newLinks = [...(headerConfig.hub_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setHeaderConfig({ ...headerConfig, hub_links: newLinks });
  };

  const toggleHubLink = (index: number) => {
    const newLinks = [...(headerConfig.hub_links || [])];
    const currentStatus = newLinks[index].enabled !== false; 
    newLinks[index] = { ...newLinks[index], enabled: !currentStatus };
    setHeaderConfig({ ...headerConfig, hub_links: newLinks });
  };

  const toggleHubLinkComingSoon = (index: number) => {
    const newLinks = [...(headerConfig.hub_links || [])];
    const currentStatus = newLinks[index].isComingSoon === true; 
    newLinks[index] = { ...newLinks[index], isComingSoon: !currentStatus };
    setHeaderConfig({ ...headerConfig, hub_links: newLinks });
  };

  const addHeaderToolLink = () => {
    const newLinks = [...(headerConfig.tools_links || []), { label: "Neuer Tool-Link", url: "/", icon: "FileText", enabled: true }];
    setHeaderConfig({ ...headerConfig, tools_links: newLinks });
  };

  const removeHeaderToolLink = (index: number) => {
    const newLinks = [...(headerConfig.tools_links || [])];
    newLinks.splice(index, 1);
    setHeaderConfig({ ...headerConfig, tools_links: newLinks });
  };

  const updateHeaderToolLink = (index: number, field: string, value: string) => {
    const newLinks = [...(headerConfig.tools_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setHeaderConfig({ ...headerConfig, tools_links: newLinks });
  };

  const toggleHeaderToolLink = (index: number) => {
    const newLinks = [...(headerConfig.tools_links || [])];
    const currentStatus = newLinks[index].enabled !== false;
    newLinks[index] = { ...newLinks[index], enabled: !currentStatus };
    setHeaderConfig({ ...headerConfig, tools_links: newLinks });
  };

  // --- FOOTER LINKS ---
  const addLegalLink = () => {
    const newLinks = [...(footerConfig.legal_links || []), { label: "Neuer Link", url: "/" }];
    setFooterConfig({ ...footerConfig, legal_links: newLinks });
  };

  const removeLegalLink = (index: number) => {
    const newLinks = [...(footerConfig.legal_links || [])];
    newLinks.splice(index, 1);
    setFooterConfig({ ...footerConfig, legal_links: newLinks });
  };

  const updateLegalLink = (index: number, field: string, value: string) => {
    const newLinks = [...(footerConfig.legal_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterConfig({ ...footerConfig, legal_links: newLinks });
  };
   
  const addPopularLink = () => {
    const newLinks = [...(footerConfig.popular_links || []), { label: "Neuer Link", url: "/" }];
    setFooterConfig({ ...footerConfig, popular_links: newLinks });
  };

  const removePopularLink = (index: number) => {
    const newLinks = [...(footerConfig.popular_links || [])];
    newLinks.splice(index, 1);
    setFooterConfig({ ...footerConfig, popular_links: newLinks });
  };

  const updatePopularLink = (index: number, field: string, value: string) => {
    const newLinks = [...(footerConfig.popular_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterConfig({ ...footerConfig, popular_links: newLinks });
  };


  const addFooterToolLink = () => {
    const newLinks = [...(footerConfig.tools_links || []), { label: "Neuer Tool-Link", url: "/" }];
    setFooterConfig({ ...footerConfig, tools_links: newLinks });
  };

  const removeFooterToolLink = (index: number) => {
    const newLinks = [...(footerConfig.tools_links || [])];
    newLinks.splice(index, 1);
    setFooterConfig({ ...footerConfig, tools_links: newLinks });
  };

  const updateFooterToolLink = (index: number, field: string, value: string) => {
    const newLinks = [...(footerConfig.tools_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterConfig({ ...footerConfig, tools_links: newLinks });
  };

  // --- HEADER SUB-LINKS LOGIC ---
  const addSubLink = (parentIdx: number) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    if (!newLinks[parentIdx].items) newLinks[parentIdx].items = [];
    newLinks[parentIdx].items.push({ label: "Neuer Unterpunkt", url: "/" });
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  const removeSubLink = (parentIdx: number, subIdx: number) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    newLinks[parentIdx].items.splice(subIdx, 1);
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  const updateSubLink = (parentIdx: number, subIdx: number, field: string, value: string) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    newLinks[parentIdx].items[subIdx] = { ...newLinks[parentIdx].items[subIdx], [field]: value };
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  const saveHeader = () => saveSetting("header_config", normalizeHeaderConfigValue(headerConfig));
  const saveFooter = () => saveSetting("footer_config", normalizeFooterConfigValue(footerConfig));

  const handleAdsToggle = (enabled: boolean) => {
    setAdsEnabled(enabled);
    saveSetting("ads_enabled", enabled);
  };

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
       
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      setSiteLogoUrl(publicUrl);
      await saveSetting('site_logo_url', publicUrl);
      toast({ title: "Logo erfolgreich hochgeladen" });
    } catch (error: any) {
      toast({ title: "Upload Fehler", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function removeLogo() {
    setSiteLogoUrl("");
    await saveSetting("site_logo_url", null);
    toast({ title: "Logo entfernt" });
  }

  if (isLoading || !localContent) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // @ts-ignore
  const safeBigThreeItems = localContent?.big_three?.items || [];
  // @ts-ignore
  const safeFeatures = localContent?.why_us?.features || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalte globale Website-Einstellungen, Navigation und Inhalte.</p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/70 p-1 rounded-xl h-auto flex-wrap md:flex-nowrap">
          <TabsTrigger value="global" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium">
            Global
          </TabsTrigger>
          <TabsTrigger value="modules" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium flex gap-2 items-center justify-center">
            <Layout className="w-4 h-4 hidden sm:block"/> Module
          </TabsTrigger>
          <TabsTrigger value="marketing" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium flex gap-2 items-center justify-center">
            <Megaphone className="w-4 h-4 hidden sm:block"/> Marketing
          </TabsTrigger>
          <TabsTrigger value="analytics_new" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium flex gap-2 items-center justify-center">
            <BarChart3 className="w-4 h-4 hidden sm:block"/> API
          </TabsTrigger>
          <TabsTrigger value="navigation" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium">
            Navi & Footer
          </TabsTrigger>
          <TabsTrigger value="home" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium">
            Startseite {hasUnsavedChanges && <span className="ml-2 w-2 h-2 rounded-full bg-secondary animate-pulse"></span>}
          </TabsTrigger>
        </TabsList>

        {/* ==============================================================
            GLOBAL TAB
        ============================================================== */}
        <TabsContent value="global" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-primary border-primary/20 text-primary-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Target className="h-4 w-4 text-secondary" /> Scouty AI Config
                </CardTitle>
                <CardDescription className="text-primary-foreground/70 text-xs">Konfiguriere deinen AI-Assistenten.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-xs">Scouty aktivieren</Label>
                  <Switch checked={scoutyEnabled} onCheckedChange={setScoutyEnabled} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-xs">High-Ticket / Easter-Egg URL</Label>
                  <Input placeholder="https://..." value={scoutyHighTicketUrl} onChange={(e) => setScoutyHighTicketUrl(e.target.value)} className="bg-primary/80 border-primary/30 text-xs h-9" />
                </div>
                <Button onClick={saveScoutyConfig} size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-8">
                  <Save className="h-3 w-3 mr-2" /> Speichern
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary border-primary/20 text-primary-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Users className="h-4 w-4 text-accent-foreground" /> Scouty Leads
                </CardTitle>
                <CardDescription className="text-primary-foreground/70 text-xs">Generierte Kontakte im Chat.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-white">{scoutyLeadsCount}</div>
                <div className="text-xs text-primary-foreground/70 leading-tight">User haben ihre Mail<br/>hinterlassen.</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-secondary" /> Branding & Theme</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 border-b border-border pb-6">
                <div className="space-y-4">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden">
                      {siteLogoUrl ? <img src={siteLogoUrl} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-8 h-8 text-muted-foreground/50" />}
                      {isUploadingLogo && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="relative cursor-pointer w-full text-xs" disabled={isUploadingLogo}>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                          <Upload className="w-3 h-3 mr-2" /> Upload
                        </Button>
                        {siteLogoUrl && <Button variant="destructive" size="sm" onClick={removeLogo}><Trash2 className="w-3 h-3 mr-2" /> Entfernen</Button>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-medium flex items-center gap-2 text-sm"><PaintBucket className="w-4 h-4 text-primary" /> Farbgebung</h4>
                  <div className="space-y-2">
                    <Label className="text-xs">Aktives Theme (Frontend)</Label>
                    <Select value={activeTheme} onValueChange={setActiveTheme}>
                      <SelectTrigger><SelectValue placeholder="Theme auswählen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiertarif">TierTarif · Trust Vet Teal</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="light">Light Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Dashboard Theme (Admin)</Label>
                    <Select value={dashboardTheme} onValueChange={setDashboardTheme}>
                      <SelectTrigger><SelectValue placeholder="Theme auswählen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" onClick={saveThemeSettings} className="w-full mt-2"><Save className="w-3 h-3 mr-2" /> Theme Speichern</Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2"><Label>Website Titel</Label><Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label>Meta Beschreibung</Label><Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2} /></div>
              </div>
              <Button onClick={() => { saveSetting("site_title", siteTitle); saveSetting("site_description", siteDescription); }} className="bg-primary hover:bg-primary/90"><Save className="w-4 h-4 mr-2" /> Globale Daten Speichern</Button>
            </CardContent>
          </Card>

          <ServerSecretsWarningCard />

          <ComplianceSettingsCard />
        </TabsContent>


        {/* ==============================================================
            MODULE TAB
        ============================================================== */}
        <TabsContent value="modules" className="space-y-6 mt-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" /> TierTarif Modul-Steuerung
              </CardTitle>
              <CardDescription>
                Blendet fachfremde Alt-Module aus dem Admin und aus der Startseiten-Logik aus, ohne die Codebasis zu zerstören.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-accent/60 bg-accent/15 p-4 text-sm text-primary">
                Für TierTarif bleiben Versicherungs-, Seiten-, Ratgeber-, Lead- und Trust-Module aktiv. Gaming, App-Deals, Massen-Generator und Ads bleiben standardmäßig aus.
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["has_projects", "Partner & Angebote", "Vergleichspartner und Angebotsverwaltung im Admin anzeigen."],
                  ["has_pages", "Seiten & Hubs", "Kategorien, Hubs und Landingpage-Strukturen verwalten."],
                  ["has_magazine", "Ratgeber / Magazin", "Redaktionelle Inhalte und Ratgeberverwaltung anzeigen."],
                  ["has_forum", "Forum / Community", "Forum-Teaser und Community-Verwaltung aktivieren."],
                  ["has_apps", "Apps & Deals / Ticker", "Altes App-/Deal-Modul inklusive Ticker aktivieren."],
                  ["has_mass_generator", "Massen-Generator", "Multi-Publisher und Programmatic-Generator im Admin anzeigen."],
                  ["has_ads", "Werbe-Module global", "AdSense/Amazon-Slots grundsätzlich erlauben."],
                  ["has_amazon", "Amazon Banner", "Amazon-Banner auf Startseite und in Einstellungen erlauben."],
                  ["has_adsense", "Google AdSense", "AdSense-Bereiche auf Startseite und in Einstellungen erlauben."],
                  ["has_scouty", "Scouty Assistent", "Scouty Widget und Admin-Konfiguration aktivieren."],
                  ["has_leads", "Leads", "Lead-Verwaltung im Admin anzeigen."],
                  ["has_redirects", "Redirects", "Redirect-Verwaltung im Admin anzeigen."],
                  ["has_footer_links", "Footer-Links", "Footer-Link-Verwaltung im Admin anzeigen."],
                  ["has_about", "Über uns", "Über-uns-Verwaltung im Admin anzeigen."],
                  ["has_indexing_tools", "Indexing Tools", "Google-Ping und Sitemap-Aktionen in den Settings anzeigen."],
                  ["has_analytics", "Analytics/API", "Analytics- und API-Einstellungen anzeigen."]
                ].map(([key, label, description]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/35 p-4">
                    <div className="space-y-1">
                      <Label className="font-semibold text-foreground">{label}</Label>
                      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={featureToggles[key as keyof FeatureToggles]}
                      onCheckedChange={(checked) => updateFeatureToggle(key as keyof FeatureToggles, checked)}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={saveFeatureToggles} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold">
                <Save className="w-4 h-4 mr-2" /> Modul-Steuerung speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==============================================================
            MARKETING TAB
        ============================================================== */}
        <TabsContent value="marketing" className="space-y-6 mt-6">
          <Card className="bg-card border-border shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Lead-Gen Steuerung
              </CardTitle>
              <CardDescription>Aktivieren oder Deaktivieren von Popups und Newsletter-Formularen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100">
                <div className="flex flex-col space-y-1">
                  <Label className="font-medium text-base">Newsletter Box (Startseite)</Label>
                  <span className="text-sm text-muted-foreground">Zeigt die Newsletter-Eintragung unten an.</span>
                </div>
                <Switch checked={newsletterActive} onCheckedChange={setNewsletterActive} />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100">
                <div className="flex flex-col space-y-1">
                  <Label className="font-medium text-base">Exit-Intent Popup</Label>
                  <span className="text-sm text-muted-foreground">Erscheint, wenn der User die Seite verlassen will.</span>
                </div>
                <Switch checked={popupActive} onCheckedChange={setPopupActive} />
              </div>
              
              <Button onClick={saveMarketingSettings} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                <Save className="w-4 h-4 mr-2" /> Einstellungen Speichern
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Monetarisierung
              </CardTitle>
              <CardDescription>Steuere Werbebanner und Affiliate Links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="ads-toggle" className="font-medium text-base">Globale Werbebanner</Label>
                  <span className="text-sm text-muted-foreground">Hauptschalter für Adsense & Amazon Sektionen.</span>
                </div>
                <Switch id="ads-toggle" checked={adsEnabled} onCheckedChange={handleAdsToggle} />
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"/> Forum Global Banner
                </h4>
                <div className="space-y-3 bg-accent/15 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-bold">Banner aktiv</Label>
                    <Switch checked={forumBanner.isActive} onCheckedChange={(c) => setForumBanner({ ...forumBanner, isActive: c })} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Titel</Label><Input value={forumBanner.title} onChange={(e) => setForumBanner({ ...forumBanner, title: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Link URL</Label><Input value={forumBanner.linkUrl} onChange={(e) => setForumBanner({ ...forumBanner, linkUrl: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Button Text</Label><Input value={forumBanner.ctaText} onChange={(e) => setForumBanner({ ...forumBanner, ctaText: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Bild URL</Label><Input value={forumBanner.imageUrl} onChange={(e) => setForumBanner({ ...forumBanner, imageUrl: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Beschreibung</Label><Textarea value={forumBanner.description} onChange={(e) => setForumBanner({ ...forumBanner, description: e.target.value })} rows={2} /></div>
                  <Button size="sm" onClick={saveForumBannerConfig} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-2">
                    <Save className="w-4 h-4 mr-2" /> Forum Banner Speichern
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"/> Native Amazon Banner
                </h4>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Headline</Label><Input value={amznHeadline} onChange={(e) => setAmznHeadline(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Affiliate Link</Label><Input value={amznLink} onChange={(e) => setAmznLink(e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Text</Label><Input value={amznText} onChange={(e) => setAmznText(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Button</Label><Input value={amznButton} onChange={(e) => setAmznButton(e.target.value)} /></div>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  saveSetting("ads_amazon_headline", amznHeadline);
                  saveSetting("ads_amazon_text", amznText);
                  saveSetting("ads_amazon_button_text", amznButton);
                  saveSetting("ads_amazon_link", amznLink);
                }}>
                  <Save className="w-4 h-4 mr-2" /> Banner speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==============================================================
            API & ANALYTICS TAB
        ============================================================== */}
        <TabsContent value="analytics_new" className="space-y-6 mt-6">
          <ServerSecretsWarningCard />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary"/> Tracking & Reports</CardTitle>
              <CardDescription>Verbinde deine Google Dienste für maximale Einsicht.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Google Analytics 4 (GA4)</Label>
                <p className="text-sm text-slate-500">Deine Mess-ID (z.B. G-12345678).</p>
                <Input value={ga4Id} onChange={e => setGa4Id(e.target.value)} placeholder="G-XXXXXXXXXX" className="font-mono" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Google Search Console</Label>
                <p className="text-sm text-slate-500">Der Content des HTML-Tags für die Verifizierung.</p>
                <Input value={gscVerification} onChange={e => setGscVerification(e.target.value)} placeholder="..." className="font-mono" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Looker Studio Report URL</Label>
                <p className="text-sm text-slate-500">Bette deinen persönlichen Report direkt ins Dashboard ein.</p>
                <Input value={reportUrl} onChange={e => setReportUrl(e.target.value)} placeholder="https://lookerstudio.google.com/embed/..." className="font-mono" />
              </div>
                    
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">AdSense Integration</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label className="text-xs">Publisher ID</Label><Input value={adSenseClient} onChange={(e) => setAdSenseClient(e.target.value)} /></div>
                  <div className="space-y-2"><Label className="text-xs">Slot ID</Label><Input value={adSenseSlot} onChange={(e) => setAdSenseSlot(e.target.value)} /></div>
                </div>
              </div>

              <Button onClick={() => { saveAnalytics(); saveSetting("ads_sense_client_id", adSenseClient); saveSetting("ads_sense_slot_id", adSenseSlot); }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"><Save className="w-4 h-4 mr-2" /> Analytics & Ads speichern</Button>
            </CardContent>
          </Card>

          {/* --- GOOGLE INDEXING TOOL --- */}
          {featureToggles.has_indexing_tools ? (
            <>
              <Card className="border-secondary/30 bg-secondary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-secondary"/> Google Indexing API</CardTitle>
                  <CardDescription>Manuelles Pingen von URLs an den Google Index (via Indexing API).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>URLs (Eine pro Zeile)</Label>
                    <Textarea
                      placeholder="https://deine-domain.at/kategorie/..."
                      className="font-mono text-xs min-h-[150px] bg-muted/40"
                      value={indexingUrls}
                      onChange={(e) => setIndexingUrls(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Maximal 200 URLs pro Tag (Google Quota beachten).</p>
                  </div>
                  <Button
                    onClick={handleIndexPing}
                    disabled={isPinging || !indexingUrls.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isPinging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                    Jetzt Indexierung beantragen
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-accent/40 bg-accent/15">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary"/> Auto-Sitemap</CardTitle>
                  <CardDescription>Generiert die sitemap.xml neu, lädt sie in den öffentlichen Bucket <code>seo-assets</code> und versorgt Nginx über die Bucket-URL.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-accent/40 bg-card/70 p-4 text-sm text-muted-foreground">
                    Nutzt aktive Kategorien, Forum-Threads und die geteilte Route-Logik aus den Edge Functions. Affiliate-<code>/go/</code>-Routen bleiben bewusst außen vor.
                  </div>
                  <Button
                    onClick={handleGenerateSitemap}
                    disabled={isGeneratingSitemap}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isGeneratingSitemap ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                    Sitemap neu generieren
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary"/> Indexing Tools deaktiviert</CardTitle>
                <CardDescription>Google-Ping und Auto-Sitemap sind im Modul-Manager ausgeschaltet und feuern keine Edge-Function-Requests.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* ==============================================================
            NAVIGATION TAB (MIT SUB-MENUS)
        ============================================================== */}
        <TabsContent value="navigation" className="space-y-6 mt-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-secondary" /> Top-Bar (Oben drüber)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Text</Label><Input value={topBarText} onChange={(e) => setTopBarText(e.target.value)} /></div>
                <div className="space-y-2"><Label>Link</Label><Input value={topBarLink} onChange={(e) => setTopBarLink(e.target.value)} /></div>
              </div>
              <Button onClick={() => { saveSetting("top_bar_text", topBarText); saveSetting("top_bar_link", topBarLink); }} className="bg-primary hover:bg-primary/90"><Save className="w-4 h-4 mr-2" /> Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><MenuIcon className="w-5 h-5 text-primary" /> Header Navigation</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-6">
                <h4 className="font-medium text-sm text-slate-500 mb-2">Desktop & Mobile Menüstruktur</h4>
                {headerConfig.nav_links?.map((link: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-3 items-end mb-4">
                      <div className="flex-1 space-y-1"><Label className="text-xs font-bold text-primary">Haupt-Link</Label><Input value={link.label} onChange={e => updateNavLink(idx, 'label', e.target.value)} className="bg-white dark:bg-slate-950 font-bold" /></div>
                      <div className="flex-1 space-y-1"><Label className="text-xs">Ziel-URL</Label><Input value={link.url} onChange={e => updateNavLink(idx, 'url', e.target.value)} className="bg-white dark:bg-slate-950" /></div>
                      <Button variant="ghost" size="icon" onClick={() => removeNavLink(idx)} className="mb-0.5 hover:bg-red-100 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                        
                    <div className="pl-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-3">
                      <Label className="text-xs text-primary-foreground/70 uppercase tracking-widest">Untermenü (Mega Dropdown)</Label>
                      {link.items?.map((subLink: any, subIdx: number) => (
                        <div key={subIdx} className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-950 border rounded-lg mb-2 shadow-sm relative group/edit">
                          <div className="flex gap-2 items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">{subIdx + 1}</div>
                              <span className="text-xs font-semibold text-slate-500">Eintrag #{subIdx + 1}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeSubLink(idx, subIdx)} className="h-6 w-6 p-0 text-primary-foreground/70 hover:text-red-500 hover:bg-red-50"><X className="w-3 h-3" /></Button>
                          </div>
                                      
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-500 uppercase">Titel *</Label>
                              <Input value={subLink.label} onChange={e => updateSubLink(idx, subIdx, 'label', e.target.value)} className="h-8 text-xs font-medium" placeholder="z.B. VPN Vergleich" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-500 uppercase">Ziel-URL *</Label>
                              <Input value={subLink.url} onChange={e => updateSubLink(idx, subIdx, 'url', e.target.value)} className="h-8 text-xs font-mono" placeholder="/kategorien/vpn" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-500 uppercase">Bild/Icon URL (Optional)</Label>
                              <div className="flex gap-2">
                                <Input value={subLink.image_url || ""} onChange={e => updateSubLink(idx, subIdx, 'image_url', e.target.value)} className="h-8 text-xs" placeholder="https://..." />
                                {subLink.image_url && <div className="w-8 h-8 rounded border bg-slate-50 flex-shrink-0 overflow-hidden"><img src={subLink.image_url} className="w-full h-full object-cover" /></div>}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-500 uppercase">Beschreibung (Optional)</Label>
                              <Input value={subLink.description || ""} onChange={e => updateSubLink(idx, subIdx, 'description', e.target.value)} className="h-8 text-xs" placeholder="z.B. Top 10 Anbieter 2026" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addSubLink(idx)} className="mt-2 text-xs h-8 w-full border-dashed"><Plus className="w-3 h-3 mr-1" /> Weiteren Unterpunkt hinzufügen</Button>
                    </div>
                  </div>
                ))}
                <Button onClick={addNavLink} className="w-full border-dashed border-2 bg-transparent text-slate-500 hover:bg-slate-50 hover:text-primary"><Plus className="w-4 h-4 mr-2" /> Neuen Haupt-Menüpunkt anlegen</Button>
              </div>

              <div className="pt-8 mt-8 border-t border-border space-y-4">
                <h4 className="font-medium text-sm text-slate-500 mb-2">Mobile Hub Grid (App-Style)</h4>
                {headerConfig.hub_links?.map((link: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 md:items-end p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100">
                    <div className="flex-1 space-y-1"><Label className="text-xs">Beschriftung</Label><Input value={link.label} onChange={e => updateHubLink(idx, 'label', e.target.value)} /></div>
                    <div className="flex-1 space-y-1"><Label className="text-xs">Ziel-URL</Label><Input value={link.url} onChange={e => updateHubLink(idx, 'url', e.target.value)} /></div>
                       
                    <div className="flex items-center gap-4 justify-end pb-2 px-2 mt-2 md:mt-0">
                      <div className="flex flex-col items-center space-y-2">
                        <Label className="text-xs text-primary font-bold whitespace-nowrap">Bald verfügbar</Label>
                        <Switch checked={link.isComingSoon === true} onCheckedChange={() => toggleHubLinkComingSoon(idx)} />
                      </div>
                      <div className="flex flex-col items-center space-y-2 border-l border-slate-200 pl-4">
                        <Label className="text-xs">Aktiv</Label>
                        <Switch checked={link.enabled !== false} onCheckedChange={() => toggleHubLink(idx)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300"><FileText className="w-4 h-4" /> Mobile Tools & Services</h4>
                {headerConfig.tools_links?.map((link: any, idx: number) => (
                  <div key={idx} className="grid md:grid-cols-[1fr_1fr_180px_auto_auto] gap-3 items-end">
                    <div className="space-y-1"><Label className="text-xs">Beschriftung</Label><Input value={link.label} onChange={e => updateHeaderToolLink(idx, 'label', e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">Ziel-URL</Label><Input value={link.url} onChange={e => updateHeaderToolLink(idx, 'url', e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">Icon</Label><Input value={link.icon || 'FileText'} onChange={e => updateHeaderToolLink(idx, 'icon', e.target.value)} /></div>
                    <div className="flex items-center justify-between rounded-md border border-border px-3 h-10"><span className="text-xs text-muted-foreground">Aktiv</span><Switch checked={link.enabled !== false} onCheckedChange={() => toggleHeaderToolLink(idx)} /></div>
                    <Button variant="ghost" size="icon" onClick={() => removeHeaderToolLink(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addHeaderToolLink}><Plus className="w-3 h-3 mr-2" /> Tool-Link hinzufügen</Button>
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2"><Label>Button Text</Label><Input value={headerConfig.button_text} onChange={e => setHeaderConfig({ ...headerConfig, button_text: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Button Ziel</Label><Input value={headerConfig.button_url} onChange={e => setHeaderConfig({ ...headerConfig, button_url: e.target.value })} /></div>
                </div>
              </div>
              <Button onClick={saveHeader} className="w-full mt-4 bg-primary"><Save className="w-4 h-4 mr-2" /> Header Konfiguration Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><List className="w-5 h-5 text-accent-foreground" /> Footer Links</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300"><ShieldCheck className="w-4 h-4" /> Rechtliches</h4>
                {footerConfig.legal_links?.map((link: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1"><Label className="text-xs">Beschriftung</Label><Input value={link.label} onChange={e => updateLegalLink(idx, 'label', e.target.value)} /></div>
                    <div className="flex-1 space-y-1"><Label className="text-xs">Ziel-URL</Label><Input value={link.url} onChange={e => updateLegalLink(idx, 'url', e.target.value)} /></div>
                    <Button variant="ghost" size="icon" onClick={() => removeLegalLink(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLegalLink}><Plus className="w-3 h-3 mr-2" /> Neu</Button>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300"><LinkIcon className="w-4 h-4" /> Vergleiche & Tools</h4>
                {footerConfig.popular_links?.map((link: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1"><Label className="text-xs">Beschriftung</Label><Input value={link.label} onChange={e => updatePopularLink(idx, 'label', e.target.value)} /></div>
                    <div className="flex-1 space-y-1"><Label className="text-xs">Ziel-URL</Label><Input value={link.url} onChange={e => updatePopularLink(idx, 'url', e.target.value)} /></div>
                    <Button variant="ghost" size="icon" onClick={() => removePopularLink(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addPopularLink}><Plus className="w-3 h-3 mr-2" /> Neu</Button>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300"><FileText className="w-4 h-4" /> Tools & Services</h4>
                {footerConfig.tools_links?.map((link: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1"><Label className="text-xs">Beschriftung</Label><Input value={link.label} onChange={e => updateFooterToolLink(idx, 'label', e.target.value)} /></div>
                    <div className="flex-1 space-y-1"><Label className="text-xs">Ziel-URL</Label><Input value={link.url} onChange={e => updateFooterToolLink(idx, 'url', e.target.value)} /></div>
                    <Button variant="ghost" size="icon" onClick={() => removeFooterToolLink(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFooterToolLink}><Plus className="w-3 h-3 mr-2" /> Neu</Button>
              </div>

              <Button onClick={saveFooter} className="w-full mt-2 bg-primary"><Save className="w-4 h-4 mr-2" /> Footer Links Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Footer Inhalte</CardTitle>
              <CardDescription>Texte im unteren Bereich der Seite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Geprüft Text</Label><Input value={footerConfig.text_checked} onChange={e => setFooterConfig({ ...footerConfig, text_checked: e.target.value })} /></div>
                <div className="space-y-2"><Label>Update Text</Label><Input value={footerConfig.text_update} onChange={e => setFooterConfig({ ...footerConfig, text_update: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Copyright Zeile</Label><Input value={footerConfig.copyright_text} onChange={e => setFooterConfig({ ...footerConfig, copyright_text: e.target.value })} /></div>
              <div className="space-y-2"><Label>Beschreibung (Über uns)</Label><Textarea value={footerConfig.text_description} onChange={e => setFooterConfig({ ...footerConfig, text_description: e.target.value })} rows={2} /></div>
              <div className="space-y-2"><Label>Disclaimer (Ganz unten)</Label><Textarea value={footerConfig.disclaimer} onChange={e => setFooterConfig({ ...footerConfig, disclaimer: e.target.value })} rows={3} /></div>
              
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2"><Label>"Made with" Text</Label><Input value={footerConfig.made_with_text} onChange={e => setFooterConfig({ ...footerConfig, made_with_text: e.target.value })} /></div>
                <div className="space-y-2"><Label>"Made in" Text</Label><Input value={footerConfig.made_in_text} onChange={e => setFooterConfig({ ...footerConfig, made_in_text: e.target.value })} /></div>
              </div>
              
              <Button onClick={saveFooter} className="w-full mt-2 bg-primary"><Save className="w-4 h-4 mr-2" /> Footer Texte Speichern</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==============================================================
            HOME TAB (Startseite) - INKLUSIVE CONTENT EDITOR
        ============================================================== */}
        <TabsContent value="home" className="space-y-6 mt-6">
          <div className="sticky top-2 z-50 bg-background/95 backdrop-blur py-3 border-b border-border/50 flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Startseiten Editor</h3>
              <p className="text-xs text-muted-foreground">Struktur und Live-Texte der Homepage.</p>
            </div>
            <Button onClick={saveContentManually} size="lg" className={hasUnsavedChanges ? 'bg-primary animate-pulse' : 'bg-primary'}>
              <Save className="w-4 h-4 mr-2" /> Alle Änderungen Speichern
            </Button>
          </div>

          <Card className="bg-card border-border shadow-sm border-l-4 border-l-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layout className="w-5 h-5 text-secondary" /> Struktur Manager</CardTitle>
              <CardDescription>Aktiviere und sortiere die Blöcke auf der Startseite (Top to Bottom).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {homeSections.length > 0 ? homeSections.map((section, idx) => (
                <div key={section.id} className={`flex items-center justify-between border border-slate-200 dark:border-slate-800 p-3 rounded-lg ${section.enabled ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-slate-100 dark:bg-slate-950 opacity-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-primary-foreground/70 w-4">{idx + 1}.</span>
                    <Label className="font-semibold text-sm cursor-pointer">{section.label}</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={section.enabled} onCheckedChange={() => toggleHomeSectionEnabled(idx)} />
                    <div className="flex flex-col ml-4">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveHomeSection(idx, 'up')} disabled={idx === 0}><ArrowUp className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveHomeSection(idx, 'down')} disabled={idx === homeSections.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500">Lade Layout-Daten aus der Datenbank...</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Startseiten Inhalte (Texte)</CardTitle>
              <CardDescription>Bearbeite die Live-Texte der einzelnen Sektionen. Vergiss nicht oben zu speichern!</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                
                <AccordionItem value="hero">
                  <AccordionTrigger className="font-semibold">Hero Sektion (Ganz oben)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-primary font-bold">Badge Text</Label>
                        <Input placeholder="Update 2026: Neue Vergleiche" value={localContent.hero?.badge || ""} onChange={e => updateContent("hero", "badge", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>H1 Titel (Groß / Shadow)</Label>
                        <Input placeholder="Vergleiche Finanzen..." value={localContent.hero?.title || ""} onChange={e => updateContent("hero", "title", e.target.value)} />
                        <p className="text-xs text-muted-foreground">Der fette, große Haupttitel.</p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Beschreibungstext (Intro)</Label>
                        <Textarea placeholder="Wir analysieren über 500 Anbieter..." value={localContent.hero?.subtitle || ""} onChange={e => updateContent("hero", "subtitle", e.target.value)} rows={3} />
                      </div>

                      <div className="space-y-2">
                        <Label>Suchfeld Button Text</Label>
                        <Input placeholder="Vergleichen" value={localContent.hero?.search_label || ""} onChange={e => updateContent("hero", "search_label", e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label>Suchfeld Platzhalter</Label>
                        <Input placeholder="z.B. Kredit, VPN..." value={localContent.hero?.search_placeholder || ""} onChange={e => updateContent("hero", "search_placeholder", e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <Label className="text-base font-bold text-primary">Hero-Bilder Desktop & Mobil</Label>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Empfohlen Desktop: <strong>2400 × 1350 px</strong> (16:9), WebP/AVIF, ideal unter 350 KB. Mobil: <strong>1080 × 1350 px</strong> (4:5), WebP/AVIF, ideal unter 250 KB. Motiv bitte ruhig halten, mit genug Freiraum für Text und Rechner.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 font-bold text-primary">
                              <Monitor className="h-4 w-4 text-secondary" /> Desktop Hero
                            </div>
                            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">2400×1350</span>
                          </div>

                          <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                            {localContent.hero?.desktop_image_url ? (
                              <img src={localContent.hero.desktop_image_url} alt="Desktop Hero Vorschau" className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-center text-xs text-muted-foreground">
                                <ImageIcon className="mx-auto mb-2 h-6 w-6 opacity-50" />
                                Noch kein Desktop-Bild gesetzt
                              </div>
                            )}
                            {isUploadingHeroDesktop && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" className="relative flex-1 overflow-hidden border-secondary/40 text-primary hover:bg-secondary/10" disabled={isUploadingHeroDesktop}>
                              <input
                                type="file"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                accept="image/avif,image/webp,image/jpeg,image/png"
                                onChange={(event) => handleHeroImageUpload(event, "desktop")}
                              />
                              <Upload className="mr-2 h-4 w-4" /> Desktop hochladen
                            </Button>
                            {localContent.hero?.desktop_image_url && (
                              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeHeroImage("desktop")}>
                                <Trash2 className="mr-2 h-4 w-4" /> Entfernen
                              </Button>
                            )}
                          </div>

                          <div className="mt-3 space-y-2 rounded-xl border border-secondary/20 bg-secondary/5 p-3">
                            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                              <LinkIcon className="h-3.5 w-3.5 text-secondary" /> Desktop-Bild per URL
                            </Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input
                                value={localContent.hero?.desktop_image_url || ""}
                                onChange={(event) => updateHeroImageUrl("desktop", event.target.value)}
                                placeholder="https://.../hero-desktop.webp oder /hero/desktop.webp"
                                className="bg-white text-xs"
                              />
                              <Button type="button" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => saveHeroImageUrl("desktop")}>
                                URL speichern
                              </Button>
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              Ideal, wenn du eigene Dateinamen behalten willst: Bild in Supabase/Cloudflare hochladen, Public URL kopieren und hier einfügen.
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 font-bold text-primary">
                              <Smartphone className="h-4 w-4 text-secondary" /> Mobile Hero
                            </div>
                            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">1080×1350</span>
                          </div>

                          <div className="relative mx-auto flex h-40 max-w-[180px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                            {localContent.hero?.mobile_image_url ? (
                              <img src={localContent.hero.mobile_image_url} alt="Mobile Hero Vorschau" className="h-full w-full object-cover" />
                            ) : (
                              <div className="px-3 text-center text-xs text-muted-foreground">
                                <ImageIcon className="mx-auto mb-2 h-6 w-6 opacity-50" />
                                Noch kein Mobil-Bild gesetzt
                              </div>
                            )}
                            {isUploadingHeroMobile && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" className="relative flex-1 overflow-hidden border-secondary/40 text-primary hover:bg-secondary/10" disabled={isUploadingHeroMobile}>
                              <input
                                type="file"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                accept="image/avif,image/webp,image/jpeg,image/png"
                                onChange={(event) => handleHeroImageUpload(event, "mobile")}
                              />
                              <Upload className="mr-2 h-4 w-4" /> Mobil hochladen
                            </Button>
                            {localContent.hero?.mobile_image_url && (
                              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeHeroImage("mobile")}>
                                <Trash2 className="mr-2 h-4 w-4" /> Entfernen
                              </Button>
                            )}
                          </div>

                          <div className="mt-3 space-y-2 rounded-xl border border-secondary/20 bg-secondary/5 p-3">
                            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                              <LinkIcon className="h-3.5 w-3.5 text-secondary" /> Mobile-Bild per URL
                            </Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input
                                value={localContent.hero?.mobile_image_url || ""}
                                onChange={(event) => updateHeroImageUrl("mobile", event.target.value)}
                                placeholder="https://.../hero-mobile.webp oder /hero/mobile.webp"
                                className="bg-white text-xs"
                              />
                              <Button type="button" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => saveHeroImageUrl("mobile")}>
                                URL speichern
                              </Button>
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              Für Mobile am besten ein eigenes 4:5-Bild verwenden, damit der Kopfbereich nicht ungünstig beschnitten wird.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label className="font-semibold text-base">USP-Leiste unter der Suche</Label>
                        <p className="text-xs text-muted-foreground mt-1">Diese drei Texte erscheinen direkt unter dem Suchfeld auf der Startseite.</p>
                      </div>
                      {[0,1,2].map((idx) => (
                        <div key={idx} className="grid md:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                          <div className="space-y-2">
                            <Label>Zeile {idx + 1} – obere Zeile</Label>
                            <Input
                              value={localContent.hero?.stats?.[idx]?.title || ""}
                              onChange={e => {
                                const nextStats = Array.isArray(localContent.hero?.stats) ? [...localContent.hero.stats] : [];
                                while (nextStats.length < 3) nextStats.push({ title: "", label: "" });
                                nextStats[idx] = { ...nextStats[idx], title: e.target.value };
                                updateContent("hero", "stats", nextStats);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Zeile {idx + 1} – untere Zeile</Label>
                            <Input
                              value={localContent.hero?.stats?.[idx]?.label || ""}
                              onChange={e => {
                                const nextStats = Array.isArray(localContent.hero?.stats) ? [...localContent.hero.stats] : [];
                                while (nextStats.length < 3) nextStats.push({ title: "", label: "" });
                                nextStats[idx] = { ...nextStats[idx], label: e.target.value };
                                updateContent("hero", "stats", nextStats);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trust">
                  <AccordionTrigger className="font-semibold">TierTarif Trust-/Ticker-Sektion</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-xs text-muted-foreground">Im Struktur-Manager heißt dieser Block „Trust“. Für TierTarif sollte dieser Bereich nur aktiv sein, wenn das Apps/Ticker-Modul eingeschaltet ist.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Badge</Label><Input value={localContent.trust?.badge || ""} onChange={e => updateContent("trust", "badge", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Headline</Label><Input value={localContent.trust?.headline || ""} onChange={e => updateContent("trust", "headline", e.target.value)} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Button / Link Text</Label><Input value={localContent.trust?.link_text || ""} onChange={e => updateContent("trust", "link_text", e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how_it_works">
                  <AccordionTrigger className="font-semibold">So funktioniert Sektion</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={localContent.how_it_works?.headline || ""} onChange={e => updateContent("how_it_works", "headline", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Subheadline</Label><Input value={localContent.how_it_works?.subheadline || ""} onChange={e => updateContent("how_it_works", "subheadline", e.target.value)} /></div>
                    </div>
                    <div className="space-y-4 pt-2">
                      {[0,1,2].map((idx) => (
                        <div key={idx} className="grid md:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                          <div className="space-y-2"><Label>Schritt {idx + 1} – Titel</Label><Input value={localContent.how_it_works?.steps?.[idx]?.title || ""} onChange={e => {
                            const nextSteps = Array.isArray(localContent.how_it_works?.steps) ? [...localContent.how_it_works.steps] : [];
                            while (nextSteps.length < 3) nextSteps.push({ title: "", text: "" });
                            nextSteps[idx] = { ...nextSteps[idx], title: e.target.value };
                            updateContent("how_it_works", "steps", nextSteps);
                          }} /></div>
                          <div className="space-y-2"><Label>Schritt {idx + 1} – Text</Label><Textarea rows={2} value={localContent.how_it_works?.steps?.[idx]?.text || ""} onChange={e => {
                            const nextSteps = Array.isArray(localContent.how_it_works?.steps) ? [...localContent.how_it_works.steps] : [];
                            while (nextSteps.length < 3) nextSteps.push({ title: "", text: "" });
                            nextSteps[idx] = { ...nextSteps[idx], text: e.target.value };
                            updateContent("how_it_works", "steps", nextSteps);
                          }} /></div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="big_three">
                  <AccordionTrigger className="font-semibold">Big Three Sektion (Hauptlinks)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Haupt-Headline</Label>
                      <Input value={localContent.big_three?.headline || ""} onChange={e => updateContent("big_three", "headline", e.target.value)} />
                    </div>
                    <div className="space-y-4">
                      <Label>Dynamische Blöcke (Die 3 großen Cards)</Label>
                      {safeBigThreeItems.map((item: any, idx: number) => (
                        <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border relative">
                          <Button variant="ghost" size="icon" onClick={() => removeBigThreeItem(idx)} className="absolute top-2 right-2 h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2"><Label>Titel</Label><Input value={item.title} onChange={e => updateBigThreeItem(idx, "title", e.target.value)} /></div>
                            <div className="space-y-2"><Label>Link URL</Label><Input value={item.link} onChange={e => updateBigThreeItem(idx, "link", e.target.value)} /></div>
                            <div className="space-y-2"><Label>Button Text</Label><Input value={item.button_text} onChange={e => updateBigThreeItem(idx, "button_text", e.target.value)} /></div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Bild-URL / Bild-Link</Label>
                              <Input
                                value={item.image_url || ""}
                                placeholder="https://.../bild.webp oder /big-threes/dateiname.webp"
                                onChange={e => updateBigThreeItem(idx, "image_url", e.target.value)}
                              />
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                Empfohlen für die Schwerpunkt-Karten: 900 × 520 px, 16:9, WebP/AVIF, ideal unter 180 KB. Feld leer lassen nutzt das TierTarif-Fallbackbild.
                              </p>
                              {item.image_url && (
                                <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={item.image_url}
                                      alt=""
                                      className="h-16 w-24 rounded-lg border border-border object-cover"
                                      loading="lazy"
                                    />
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">Bildvorschau</p>
                                      <p className="max-w-[26rem] truncate text-xs text-muted-foreground">{item.image_url}</p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateBigThreeItem(idx, "image_url", "")}
                                  >
                                    <X className="mr-2 h-3.5 w-3.5" />
                                    Bild entfernen
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2 md:col-span-2"><Label>Beschreibung</Label><Input value={item.desc} onChange={e => updateBigThreeItem(idx, "desc", e.target.value)} /></div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addBigThreeItem}><Plus className="w-3 h-3 mr-2" /> Neuer Block</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                

                <AccordionItem value="categories">
                  <AccordionTrigger className="font-semibold">Kategorien Slider Sektion</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={localContent.categories?.headline || ""} onChange={e => updateContent("categories", "headline", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Anzahl anzuzeigender Kategorien</Label><Input type="number" value={localContent.categories?.count || 6} onChange={e => updateContent("categories", "count", parseInt(e.target.value))} /></div>
                      <div className="space-y-2"><Label>Button ("Mehr laden")</Label><Input value={localContent.categories?.button_more || ""} onChange={e => updateContent("categories", "button_more", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Button auf Karte</Label><Input value={localContent.categories?.button_card || ""} onChange={e => updateContent("categories", "button_card", e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="news">
                  <AccordionTrigger className="font-semibold">News & Magazin Sektion</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={localContent.news?.headline || ""} onChange={e => updateContent("news", "headline", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Subheadline</Label><Input value={localContent.news?.subheadline || ""} onChange={e => updateContent("news", "subheadline", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Anzahl Posts</Label><Input type="number" value={localContent.news?.count || 3} onChange={e => updateContent("news", "count", parseInt(e.target.value))} /></div>
                      <div className="space-y-2"><Label>Top Button Text</Label><Input value={localContent.news?.button_text || ""} onChange={e => updateContent("news", "button_text", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Top Button Link</Label><Input value={localContent.news?.button_url || ""} onChange={e => updateContent("news", "button_url", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Link Text (Karte)</Label><Input value={localContent.news?.read_more || ""} onChange={e => updateContent("news", "read_more", e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="forum-sidebar">
                  <AccordionTrigger className="font-semibold">Forum Sidebar</AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Titel Heiße Vergleiche</Label><Input value={forumSidebarLocal?.hot_title || ""} onChange={e => setForumSidebarLocal((p: any) => ({ ...p, hot_title: e.target.value }))} /></div>
                      <div className="space-y-2"><Label>Titel Beliebte Vergleiche</Label><Input value={forumSidebarLocal?.popular_title || ""} onChange={e => setForumSidebarLocal((p: any) => ({ ...p, popular_title: e.target.value }))} /></div>
                      <div className="space-y-2"><Label>Titel Zufällige Vergleiche</Label><Input value={forumSidebarLocal?.random_title || ""} onChange={e => setForumSidebarLocal((p: any) => ({ ...p, random_title: e.target.value }))} /></div>
                      <div className="space-y-2"><Label>Anzahl Zufällige Vergleiche</Label><Input type="number" min={0} max={5} value={forumSidebarLocal?.random_count ?? 2} onChange={e => setForumSidebarLocal((p: any) => ({ ...p, random_count: parseInt(e.target.value || '0', 10) }))} /></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between rounded-xl border p-3"><Label>Heiße Vergleiche anzeigen</Label><Switch checked={!!forumSidebarLocal?.show_hot} onCheckedChange={(checked) => setForumSidebarLocal((p: any) => ({ ...p, show_hot: checked }))} /></div>
                      <div className="flex items-center justify-between rounded-xl border p-3"><Label>Beliebte Vergleiche anzeigen</Label><Switch checked={!!forumSidebarLocal?.show_popular} onCheckedChange={(checked) => setForumSidebarLocal((p: any) => ({ ...p, show_popular: checked }))} /></div>
                      <div className="flex items-center justify-between rounded-xl border p-3"><Label>Zufällige Vergleiche anzeigen</Label><Switch checked={!!forumSidebarLocal?.show_random} onCheckedChange={(checked) => setForumSidebarLocal((p: any) => ({ ...p, show_random: checked }))} /></div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-3 block">Heiße Vergleiche</Label>
                        <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-auto rounded-xl border p-3">
                          {comparisonCategories.filter((cat) => ["comparison", "hub_overview"].includes(cat.template)).map((cat) => {
                            const checked = Array.isArray(forumSidebarLocal?.hot_comparison_ids) && forumSidebarLocal.hot_comparison_ids.includes(cat.id);
                            return <label key={`hot-${cat.id}`} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(e) => setForumSidebarLocal((p: any) => ({ ...p, hot_comparison_ids: e.target.checked ? [...(p.hot_comparison_ids || []), cat.id] : (p.hot_comparison_ids || []).filter((id: string) => id !== cat.id) }))} /> <span>{cat.name}</span></label>;
                          })}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-3 block">Beliebte Vergleiche</Label>
                        <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-auto rounded-xl border p-3">
                          {comparisonCategories.filter((cat) => ["comparison", "hub_overview"].includes(cat.template)).map((cat) => {
                            const checked = Array.isArray(forumSidebarLocal?.popular_comparison_ids) && forumSidebarLocal.popular_comparison_ids.includes(cat.id);
                            return <label key={`popular-${cat.id}`} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(e) => setForumSidebarLocal((p: any) => ({ ...p, popular_comparison_ids: e.target.checked ? [...(p.popular_comparison_ids || []), cat.id] : (p.popular_comparison_ids || []).filter((id: string) => id !== cat.id) }))} /> <span>{cat.name}</span></label>;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={saveForumSidebarConfig} className="rounded-xl">Forum Sidebar speichern</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="forum_teaser">
                  <AccordionTrigger className="font-semibold">Forum Teaser Sektion</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={localContent.forum_teaser?.headline || ""} onChange={e => updateContent("forum_teaser", "headline", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Link Text (Alle Foren)</Label><Input value={localContent.forum_teaser?.link_text || ""} onChange={e => updateContent("forum_teaser", "link_text", e.target.value)} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Subheadline</Label><Textarea value={localContent.forum_teaser?.subheadline || ""} onChange={e => updateContent("forum_teaser", "subheadline", e.target.value)} rows={2} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Mobile Button</Label><Input value={localContent.forum_teaser?.mobile_button || ""} onChange={e => updateContent("forum_teaser", "mobile_button", e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="home_faq">
                  <AccordionTrigger className="font-semibold">FAQ Startseite</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <HomeFAQEditor
                      value={(localContent.home_faq as any) || (defaultHomeContent.home_faq as any)}
                      onChange={(field, value) => updateContent("home_faq", field, value)}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="seo">
                  <AccordionTrigger className="font-semibold">SEO Texte (Unten)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>SEO Headline</Label><Input value={localContent.seo?.headline || ""} onChange={e => updateContent("seo", "headline", e.target.value)} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Intro Text</Label><Textarea value={localContent.seo?.intro || ""} onChange={e => updateContent("seo", "intro", e.target.value)} rows={2} /></div>
                       
                      <div className="space-y-2"><Label>Block 1 Titel</Label><Input value={localContent.seo?.block1_title || ""} onChange={e => updateContent("seo", "block1_title", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Block 1 Text</Label><Textarea value={localContent.seo?.block1_text || ""} onChange={e => updateContent("seo", "block1_text", e.target.value)} rows={2} /></div>

                      <div className="space-y-2"><Label>Block 2 Titel</Label><Input value={localContent.seo?.block2_title || ""} onChange={e => updateContent("seo", "block2_title", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Block 2 Text</Label><Textarea value={localContent.seo?.block2_text || ""} onChange={e => updateContent("seo", "block2_text", e.target.value)} rows={2} /></div>
                    </div>
                     
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Deep Content (Langer SEO Text)</Label>
                      <Textarea className="min-h-[400px] font-mono text-sm bg-slate-50" value={seoLongText} onChange={(e) => {
                        setSeoLongText(e.target.value);
                        updateContent("seo", "long_text", e.target.value);
                      }} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle>Legacy Layout (Backup)</CardTitle><CardDescription>Primitive Steuerung älterer Module.</CardDescription></CardHeader>
            <CardContent className="space-y-4 opacity-75">
              {Object.keys(defaultHomeLayout).map((key) => (
                <div key={key} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 p-2 rounded-lg">
                  <Label className="capitalize font-medium">{key.replace('_', ' ')}</Label>
                  <Switch checked={(layout as any)[key]} onCheckedChange={() => toggleSection(key as any)} />
                </div>
              ))}
            </CardContent>
          </Card>
           
          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle>TierTarif Ticker Sektion</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="ticker_headline">Ticker Überschrift</Label>
                  <Input 
                    id="ticker_headline" 
                    name="ticker_headline" 
                    placeholder="Beliebte TierTarif-Bereiche"
                    defaultValue={settings?.ticker_headline as string || "Beliebte TierTarif-Bereiche"} 
                    onChange={(e) => saveSetting("ticker_headline", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker_badge_text">Badge Text</Label>
                  <Input 
                    id="ticker_badge_text" 
                    name="ticker_badge_text" 
                    placeholder="TierTarif Überblick"
                    defaultValue={settings?.ticker_badge_text as string || "TierTarif Überblick"} 
                    onChange={(e) => saveSetting("ticker_badge_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ticker_link_text">Button Text (Link zur Topliste)</Label>
                  <Input 
                    id="ticker_link_text" 
                    name="ticker_link_text" 
                    placeholder="Alle Bereiche ansehen →"
                    defaultValue={settings?.ticker_link_text as string || "Alle Bereiche ansehen →"} 
                    onChange={(e) => saveSetting("ticker_link_text", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
