import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useAdminSettings, useUpdateSetting } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  ABOUT_PAGE_SETTING_KEY,
  DEFAULT_ABOUT_HERO_IMAGE,
  defaultAboutPageContent,
  getAboutPublicPath,
  normalizeAboutPageContent,
  normalizeAboutSlug,
  type AboutPageContent,
  type AboutTeamMember,
  type AboutValueCard,
} from "@/lib/aboutContent";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function uploadImageToSupabase(file: File, folder: "about-team" | "about-hero"): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop() || "webp";
    const safeName = file.name
      .replace(`.${fileExt}`, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const fileName = `${folder}/${Date.now()}-${safeName || folder}.${fileExt}`;
    const { error } = await supabase.storage.from("images").upload(fileName, file, { cacheControl: "31536000", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("images").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error: any) {
    toast({ title: "Upload fehlgeschlagen", description: error?.message || "Das Bild konnte nicht hochgeladen werden.", variant: "destructive" });
    return null;
  }
}

const emptyMember = (sortOrder: number): AboutTeamMember => ({
  id: createId("member"),
  name: "Neue Person",
  role: "Rolle eintragen",
  badge: "Team",
  short_bio: "Kurze Zusammenfassung für die Team-Karte.",
  long_bio: "Ausführlichere Beschreibung der Person und ihrer Aufgaben bei Portal.",
  image_url: "",
  initials: "NP",
  sort_order: sortOrder,
  is_active: true,
});

const emptyValue = (sortOrder: number): AboutValueCard => ({
  id: createId("value"),
  title: `Wert ${sortOrder}`,
  text: "Kurze Erklärung, wofür Portal an dieser Stelle steht.",
});

const resequenceMembers = (members: AboutTeamMember[]) => members.map((member, index) => ({ ...member, sort_order: index + 1 }));

const getInitials = (member: AboutTeamMember) => {
  const fallback = member.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return member.initials || fallback || "RS";
};

const SmartImagePreview = ({ imageUrl, label, initials }: { imageUrl?: string; label: string; initials: string }) => {
  const optimizedImage = optimizeSupabaseImageUrl(imageUrl, 700, 84) || imageUrl;

  if (!optimizedImage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0E1F53] text-5xl font-black text-white">
        {initials}
      </div>
    );
  }

  return (
    <>
      <img
        src={optimizedImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover object-top opacity-45 blur-xl saturate-125"
      />
      <div className="absolute inset-0 bg-[#071121]/20" />
      <img
        src={optimizedImage}
        alt={label}
        loading="lazy"
        decoding="async"
        className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-[1.25rem] object-contain object-top shadow-xl"
      />
    </>
  );
};

const HeroPreview = ({ imageUrl }: { imageUrl?: string }) => {
  const heroImage = optimizeSupabaseImageUrl(imageUrl, 1000, 84) || DEFAULT_ABOUT_HERO_IMAGE;

  return (
    <div className="relative aspect-[16/7] overflow-hidden rounded-3xl border border-slate-200 bg-[#071121]">
      <img src={heroImage} alt="Hero Vorschau" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-[#071121]/50" />
      <div className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {imageUrl ? "Gewähltes Herobild" : "Standard-Herobild"}
      </div>
    </div>
  );
};

export default function AdminAbout() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();
  const [content, setContent] = useState<AboutPageContent>(defaultAboutPageContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  const normalizedServerContent = useMemo(() => normalizeAboutPageContent(settings?.[ABOUT_PAGE_SETTING_KEY]), [settings]);
  const publicPath = getAboutPublicPath(content.slug);

  useEffect(() => {
    if (!isLoading) {
      setContent(normalizedServerContent);
      setHasUnsavedChanges(false);
    }
  }, [isLoading, normalizedServerContent]);

  const updateContent = (patch: Partial<AboutPageContent>) => {
    setContent((current) => ({ ...current, ...patch }));
    setHasUnsavedChanges(true);
  };

  const updateMember = (id: string, patch: Partial<AboutTeamMember>) => {
    setContent((current) => ({
      ...current,
      team_members: current.team_members.map((member) => member.id === id ? { ...member, ...patch } : member),
    }));
    setHasUnsavedChanges(true);
  };

  const updateValue = (id: string, patch: Partial<AboutValueCard>) => {
    setContent((current) => ({
      ...current,
      values: current.values.map((value) => value.id === id ? { ...value, ...patch } : value),
    }));
    setHasUnsavedChanges(true);
  };

  const moveMember = (id: string, direction: "up" | "down") => {
    setContent((current) => {
      const members = [...current.team_members];
      const index = members.findIndex((member) => member.id === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= members.length) return current;
      [members[index], members[targetIndex]] = [members[targetIndex], members[index]];
      return { ...current, team_members: resequenceMembers(members) };
    });
    setHasUnsavedChanges(true);
  };

  const addMember = () => {
    setContent((current) => ({ ...current, team_members: [...current.team_members, emptyMember(current.team_members.length + 1)] }));
    setHasUnsavedChanges(true);
  };

  const removeMember = (id: string) => {
    setContent((current) => ({ ...current, team_members: resequenceMembers(current.team_members.filter((member) => member.id !== id)) }));
    setHasUnsavedChanges(true);
  };

  const addValue = () => {
    setContent((current) => ({ ...current, values: [...current.values, emptyValue(current.values.length + 1)] }));
    setHasUnsavedChanges(true);
  };

  const removeValue = (id: string) => {
    setContent((current) => ({ ...current, values: current.values.filter((value) => value.id !== id) }));
    setHasUnsavedChanges(true);
  };

  const handleMemberUpload = async (memberId: string, file?: File) => {
    if (!file) return;
    setUploadingTarget(memberId);
    const url = await uploadImageToSupabase(file, "about-team");
    setUploadingTarget(null);
    if (!url) return;
    updateMember(memberId, { image_url: url });
    toast({ title: "Bild hochgeladen", description: "Das Team-Bild wurde übernommen. Bitte noch speichern." });
  };

  const handleHeroUpload = async (file?: File) => {
    if (!file) return;
    setUploadingTarget("hero");
    const url = await uploadImageToSupabase(file, "about-hero");
    setUploadingTarget(null);
    if (!url) return;
    updateContent({ hero_image_url: url });
    toast({ title: "Herobild hochgeladen", description: "Das Herobild wurde übernommen. Bitte noch speichern." });
  };

  const handleSave = async () => {
    try {
      const normalized = normalizeAboutPageContent({ ...content, slug: normalizeAboutSlug(content.slug) });
      await updateSetting.mutateAsync({ key: ABOUT_PAGE_SETTING_KEY, value: normalized as unknown as Json });
      setContent(normalized);
      setHasUnsavedChanges(false);
      toast({ title: "Über-uns-Seite gespeichert", description: `Die öffentliche Seite wurde unter ${getAboutPublicPath(normalized.slug)} aktualisiert.` });
    } catch (error: any) {
      toast({ title: "Speichern fehlgeschlagen", description: error?.message || "Die Inhalte konnten nicht gespeichert werden.", variant: "destructive" });
    }
  };

  const resetToDefaults = () => {
    setContent(defaultAboutPageContent);
    setHasUnsavedChanges(true);
    toast({ title: "Standard-Inhalte geladen", description: "Bitte speichern, wenn du diese Inhalte übernehmen möchtest." });
  };

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0E1F53]" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#0E1F53] to-[#12285f] p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-100">
                <Users className="h-4 w-4 text-[#FF8400]" /> Team & Über uns
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Über-uns-Seite steuern</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-100 md:text-base">
                Seitenbeschreibung, Slug, Herobild, Mission, Werte und Team-Personen zentral bearbeiten. Die öffentliche Seite liegt aktuell unter <strong className="text-white">{publicPath}</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <a href={publicPath} target="_blank" rel="noreferrer"><Eye className="mr-2 h-4 w-4" />Live ansehen</a>
              </Button>
              <Button type="button" variant="outline" onClick={resetToDefaults} className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <RefreshCw className="mr-2 h-4 w-4" />Defaults laden
              </Button>
              <Button type="button" onClick={handleSave} disabled={updateSetting.isPending} className="bg-[#FF8400] font-black text-white shadow-lg shadow-[#FF8400]/20 hover:bg-[#ff7300]">
                {updateSetting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Speichern
              </Button>
            </div>
          </div>
        </div>

        {hasUnsavedChanges && <div className="border-b border-orange-200 bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-800">Ungespeicherte Änderungen vorhanden — bitte speichern, bevor du die Seite verlässt.</div>}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Seiteneinstellungen</CardTitle>
              <CardDescription>Steuert SEO, Slug, Hero, Einleitung und Mission der öffentlichen Über-uns-Seite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <Label className="text-base font-black text-slate-900">Seite aktiv / indexierbar</Label>
                  <p className="mt-1 text-sm text-slate-500">Aus = Seite bleibt erreichbar, bekommt aber noindex.</p>
                </div>
                <Switch checked={content.enabled} onCheckedChange={(checked) => updateContent({ enabled: checked })} className="data-[state=checked]:bg-[#FF8400]" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL-Slug</Label>
                  <Input value={content.slug} onChange={(e) => updateContent({ slug: e.target.value })} placeholder="ueber-uns" />
                  <p className="text-xs text-slate-500">Aktueller Pfad: <strong>{publicPath}</strong>. Keine bestehende Kategorie als Slug verwenden.</p>
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input value={content.badge} onChange={(e) => updateContent({ badge: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input value={content.meta_title} onChange={(e) => updateContent({ meta_title: e.target.value })} />
                  <p className="text-xs text-slate-500">Aktuell: {content.meta_title.length} Zeichen</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea rows={3} value={content.meta_description} onChange={(e) => updateContent({ meta_description: e.target.value })} />
                  <p className="text-xs text-slate-500">Aktuell: {content.meta_description.length} Zeichen</p>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="w-full lg:w-[360px]"><HeroPreview imageUrl={content.hero_image_url} /></div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label>Herobild URL</Label>
                      <Input value={content.hero_image_url || ""} onChange={(e) => updateContent({ hero_image_url: e.target.value })} placeholder="Leer = Startseiten-Standardbild" />
                      <p className="text-xs text-slate-500">Wenn leer, wird nur im Hero automatisch das Standardbild der Startseite geladen.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <input id="about-hero-upload" type="file" accept="image/*" className="hidden" onChange={(event) => handleHeroUpload(event.target.files?.[0])} />
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="about-hero-upload" className="cursor-pointer">
                          {uploadingTarget === "hero" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                          Herobild hochladen
                        </label>
                      </Button>
                      {content.hero_image_url && (
                        <Button type="button" variant="outline" onClick={() => updateContent({ hero_image_url: "" })} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                          <X className="mr-2 h-4 w-4" />Standardbild nutzen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hero Headline</Label>
                <Textarea rows={2} value={content.hero_title} onChange={(e) => updateContent({ hero_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hero Beschreibung</Label>
                <Textarea rows={4} value={content.hero_subtitle} onChange={(e) => updateContent({ hero_subtitle: e.target.value })} />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><Label>Einleitung Titel</Label><Input value={content.intro_title} onChange={(e) => updateContent({ intro_title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Mission Titel</Label><Input value={content.mission_title} onChange={(e) => updateContent({ mission_title: e.target.value })} /></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><Label>Einleitung Text</Label><Textarea rows={7} value={content.intro_text} onChange={(e) => updateContent({ intro_text: e.target.value })} /></div>
                <div className="space-y-2"><Label>Mission Text</Label><Textarea rows={7} value={content.mission_text} onChange={(e) => updateContent({ mission_text: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Werte / Qualitätsversprechen</CardTitle>
                <CardDescription>Diese Kacheln erklären kurz, wofür Portal steht.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addValue}><Plus className="mr-2 h-4 w-4" />Wert hinzufügen</Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label>Werte Headline</Label><Input value={content.values_headline} onChange={(e) => updateContent({ values_headline: e.target.value })} /></div>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.values.map((value) => (
                  <div key={value.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <Badge variant="outline" className="bg-white">Wert</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeValue(value.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1"><Label>Titel</Label><Input value={value.title} onChange={(e) => updateValue(value.id, { title: e.target.value })} /></div>
                      <div className="space-y-1"><Label>Text</Label><Textarea rows={5} value={value.text} onChange={(e) => updateValue(value.id, { text: e.target.value })} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Team-Personen</CardTitle>
                <CardDescription>Smart-Bildrahmen für Hochformat 1023×1537 und Querformat 1537×1023 ohne harte Crops.</CardDescription>
              </div>
              <Button type="button" onClick={addMember} className="bg-[#0E1F53] hover:bg-[#12285f]"><Plus className="mr-2 h-4 w-4" />Person hinzufügen</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><Label>Team Headline</Label><Input value={content.team_headline} onChange={(e) => updateContent({ team_headline: e.target.value })} /></div>
                <div className="space-y-2"><Label>Team Subheadline</Label><Input value={content.team_subheadline} onChange={(e) => updateContent({ team_subheadline: e.target.value })} /></div>
              </div>

              <Accordion type="multiple" defaultValue={content.team_members.map((member) => member.id)} className="space-y-4">
                {content.team_members.map((member, index) => {
                  const thumbUrl = optimizeSupabaseImageUrl(member.image_url, 180, 84) || member.image_url;
                  const memberInitials = getInitials(member);

                  return (
                    <AccordionItem key={member.id} value={member.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-0">
                      <AccordionTrigger className="px-5 py-4 hover:no-underline">
                        <div className="flex min-w-0 items-center gap-4 text-left">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0E1F53] text-sm font-black text-white">
                            {thumbUrl ? <img src={thumbUrl} alt="" className="h-full w-full object-cover object-top" /> : memberInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-black text-slate-900">{member.name}</div>
                            <div className="truncate text-sm text-slate-500">{member.role}</div>
                          </div>
                          {!member.is_active && <Badge variant="outline" className="border-slate-300 bg-white text-slate-500">Ausgeblendet</Badge>}
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="border-t border-slate-200 bg-white px-5 py-6">
                        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
                          <div className="space-y-4">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                              <SmartImagePreview imageUrl={member.image_url} label={member.name} initials={memberInitials} />
                            </div>
                            <div className="space-y-2">
                              <Label>Bild URL</Label>
                              <Input value={member.image_url || ""} onChange={(e) => updateMember(member.id, { image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="flex flex-col gap-2">
                              <input id={`upload-${member.id}`} type="file" accept="image/*" className="hidden" onChange={(event) => handleMemberUpload(member.id, event.target.files?.[0])} />
                              <Button type="button" variant="outline" className="w-full" asChild>
                                <label htmlFor={`upload-${member.id}`} className="cursor-pointer">
                                  {uploadingTarget === member.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                  Bild hochladen
                                </label>
                              </Button>
                              {member.image_url && (
                                <Button type="button" variant="outline" onClick={() => updateMember(member.id, { image_url: "" })} className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                  <X className="mr-2 h-4 w-4" />Bild entfernen
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center gap-3">
                                <Switch checked={member.is_active} onCheckedChange={(checked) => updateMember(member.id, { is_active: checked })} className="data-[state=checked]:bg-[#FF8400]" />
                                <span className="text-sm font-bold text-slate-700">Auf Seite anzeigen</span>
                              </div>
                              <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => moveMember(member.id, "up")} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => moveMember(member.id, "down")} disabled={index === content.team_members.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => removeMember(member.id)} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div className="space-y-2"><Label>Name</Label><Input value={member.name} onChange={(e) => updateMember(member.id, { name: e.target.value })} /></div>
                              <div className="space-y-2"><Label>Rolle</Label><Input value={member.role} onChange={(e) => updateMember(member.id, { role: e.target.value })} /></div>
                              <div className="space-y-2"><Label>Badge</Label><Input value={member.badge || ""} onChange={(e) => updateMember(member.id, { badge: e.target.value })} /></div>
                              <div className="space-y-2"><Label>Initialen</Label><Input value={member.initials || ""} onChange={(e) => updateMember(member.id, { initials: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><Label>Kurzbeschreibung</Label><Textarea rows={3} value={member.short_bio} onChange={(e) => updateMember(member.id, { short_bio: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Ausführliche Beschreibung</Label><Textarea rows={8} value={member.long_bio} onChange={(e) => updateMember(member.id, { long_bio: e.target.value })} /></div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>CTA unten</CardTitle>
              <CardDescription>Abschlussbereich der Über-uns-Seite.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>CTA Titel</Label><Input value={content.cta_title} onChange={(e) => updateContent({ cta_title: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>CTA Text</Label><Textarea rows={3} value={content.cta_text} onChange={(e) => updateContent({ cta_text: e.target.value })} /></div>
              <div className="space-y-2"><Label>Button Text</Label><Input value={content.cta_button_text} onChange={(e) => updateContent({ cta_button_text: e.target.value })} /></div>
              <div className="space-y-2"><Label>Button Link</Label><Input value={content.cta_button_link} onChange={(e) => updateContent({ cta_button_link: e.target.value })} placeholder="/kontakt" /></div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-[#FF8400]" />Vorschau-Status</CardTitle>
              <CardDescription>Kurzer Qualitätscheck vor dem Speichern.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-slate-600">Öffentlicher Pfad</span><Badge variant="outline">{publicPath}</Badge></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-slate-600">Aktive Personen</span><Badge className="bg-[#0E1F53] text-white">{content.team_members.filter((member) => member.is_active).length}</Badge></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-slate-600">Werte-Kacheln</span><Badge variant="outline">{content.values.length}</Badge></div>
              <div className="rounded-xl bg-orange-50 p-4 text-orange-800"><strong>RLS-Hinweis:</strong> Für öffentliche Anzeige muss die Setting-Key <code>about_page_content</code> öffentlich lesbar sein. Dafür liegt die Migration im ZIP.</div>
              <Button type="button" onClick={handleSave} disabled={updateSetting.isPending} className="w-full bg-[#FF8400] font-black text-white hover:bg-[#ff7300]">
                {updateSetting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Alles speichern
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
