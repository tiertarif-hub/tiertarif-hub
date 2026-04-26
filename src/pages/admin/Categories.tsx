import { useState, useEffect, useMemo } from "react";
import { 
    useCategories, 
    useCreateCategory, 
    useUpdateCategory, 
    useDeleteCategory, 
    useDuplicateCategory, // Neu hinzugefügt
    type Category 
} from "@/hooks/useCategories";
import { useCategoryProjects, useUpdateCategoryProjects } from "@/hooks/useCategoryProjects";
import { useGenerateCategoryContent } from "@/hooks/useGenerateCategoryContent";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
    Plus, Pencil, Trash2, Copy, ArrowUp, ArrowDown, UploadCloud, Database, 
    Eye, Bot, Settings2, Code, FileText, Search, LayoutTemplate, Layers, 
    Globe, CalendarDays, Image as ImageIcon, Star 
} from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import { CategoryFAQEditor } from "@/components/admin/CategoryFAQEditor"; 
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// --- HELPERS ---
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unbekannt";
    return new Date(dateString).toLocaleDateString("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
};

const getCleanToxicWordMessage = (rawMessage?: string) => {
  if (!rawMessage) return "Der Inhalt enthält einen blockierten Begriff.";

  const cleanMsg = rawMessage
    .replace(/^.*TOXIC_WORD_ERROR:\s*/i, "")
    .split("\n")[0]
    .trim();

  return cleanMsg || "Der Inhalt enthält einen blockierten Begriff.";
};

const parseWidgetConfigInput = (value?: string | null): Record<string, unknown> | null => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Widget Config muss ein gültiges JSON-Objekt sein, z. B. {\"sp\": \"tkvk\"}.");
  }

  return parsed as Record<string, unknown>;
};

const stringifyWidgetConfig = (value: unknown): string => {
  if (!value || typeof value !== "object") return "";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
};

// --- KI CONFIG DIALOG ---
const AIConfigDialog = () => {
    const [open, setOpen] = useState(false);
    const [provider, setProvider] = useState("google");
    const [googleKey, setGoogleKey] = useState("");
    const [openaiKey, setOpenaiKey] = useState("");

    useEffect(() => {
        if(open) {
            setProvider(localStorage.getItem("ai_provider") || "google");
            setGoogleKey(localStorage.getItem("ai_key_google") || "");
            setOpenaiKey(localStorage.getItem("ai_key_openai") || "");
        }
    }, [open]);

    const saveConfig = () => {
        localStorage.setItem("ai_provider", provider);
        localStorage.setItem("ai_key_google", googleKey.trim());
        localStorage.setItem("ai_key_openai", openaiKey.trim());
        setOpen(false);
        toast({ title: "Gespeichert", description: `KI auf ${provider === 'google' ? 'Google Gemini' : 'OpenAI GPT'} eingestellt.` });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="outline" onClick={() => setOpen(true)} className="gap-2 border-orange-200 hover:bg-orange-50 text-orange-700 shadow-sm bg-white">
                <Bot className="w-4 h-4" /> KI Settings
            </Button>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>KI Konfiguration</DialogTitle><DialogDescription>Keys werden lokal gespeichert.</DialogDescription></DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Anbieter</Label>
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="google">⚡ Google Gemini</SelectItem><SelectItem value="openai">🧠 OpenAI GPT-4o</SelectItem></SelectContent>
                        </Select>
                    </div>
                    {provider === 'google' && (<div className="space-y-2"><Label>Google Key</Label><Input value={googleKey} onChange={e => setGoogleKey(e.target.value)} type="password" /></div>)}
                    {provider === 'openai' && (<div className="space-y-2"><Label>OpenAI Key</Label><Input value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} type="password" /></div>)}
                </div>
                <DialogFooter><Button onClick={saveConfig} className="w-full">Speichern</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Helper Upload
async function uploadImageToSupabase(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    toast({ title: "Upload Fehler", description: error.message, variant: "destructive" });
    return null;
  }
}

// --- SUB-COMPONENT: CATEGORY TABLE ---
const CategoryTable = ({ 
    data, 
    onEdit, 
    onDelete, 
    onView,
    onToggleActive,
    onDuplicate, // Neu hinzugefügt
    onManageRating // --- NEU ---
}: { 
    data: Category[], 
    onEdit: (c: Category) => void, 
    onDelete: (id: string) => void,
    onView: (slug: string) => void,
    onToggleActive: (id: string, currentStatus: boolean) => void,
    onDuplicate: (cat: Category) => void, // Neu hinzugefügt
    onManageRating: (cat: Category) => void // --- NEU ---
}) => {
    if (data.length === 0) {
        return <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-b-xl border-t border-slate-100">Keine Seiten in dieser Kategorie gefunden.</div>;
    }

    return (
        <Table>
            <TableHeader className="bg-slate-50/80">
                <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Seite</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Aktualisiert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((cat, index) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/60 transition-colors group">
                        <TableCell>
                            <div className="flex items-center justify-center text-xs font-bold text-slate-300 w-6 h-6 rounded-full bg-slate-100">
                                {index + 1}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-base">{cat.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="font-mono text-[10px] text-slate-500 border-slate-200 bg-slate-50">
                                        /{cat.slug}
                                    </Badge>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                {cat.template === 'hub_overview' ? (
                                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shadow-none"><Layers className="w-3 h-3 mr-1"/> Hub</Badge>
                                ) : (cat.template === 'comparison' ? (
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-none"><LayoutTemplate className="w-3 h-3 mr-1"/> Vergleich</Badge>
                                ) : (
                                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-none"><FileText className="w-3 h-3 mr-1"/> Artikel</Badge>
                                ))}
                                {(((cat as any).comparison_widget_type) || (cat as any).comparison_widget_code) && (
                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 shadow-none"><Code className="w-3 h-3 mr-1" /> {(cat as any).comparison_widget_type === "mr-money" ? "Mr. Money" : "Widget"}</Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-medium text-slate-700"><CalendarDays className="w-3 h-3 text-slate-400"/> {(cat as any).updated_at ? formatDate((cat as any).updated_at) : 'Neu'}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Switch 
                                    checked={cat.is_active} 
                                    onCheckedChange={() => onToggleActive(cat.id, cat.is_active)}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                                <span className={`text-xs font-medium ${cat.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {cat.is_active ? 'Online' : 'Entwurf'}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                {/* --- NEU: Sterne-Manager Button --- */}
                                <Button variant="ghost" size="sm" onClick={() => onManageRating(cat)} title="Basis-Sterne verwalten" className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg">
                                    <Star className="w-4 h-4 fill-current"/>
                                </Button>
                                
                                <Button variant="ghost" size="sm" onClick={()=>onView(`/${cat.slug}`)} className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" title="Vorschau"><Eye className="w-4 h-4"/></Button>
                                {/* KYRA ADD: Duplizier-Button */}
                                <Button variant="ghost" size="sm" onClick={() => onDuplicate(cat)} className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600" title="Duplizieren"><Copy className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => onEdit(cat)} className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600" title="Bearbeiten"><Pencil className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="sm" onClick={()=>onDelete(cat.id)} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" title="Löschen"><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function Categories() {
  const { data: categories = [] } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory(); // Neu
  const updateCategoryProjects = useUpdateCategoryProjects();
  const { generateCategoryContent, isGenerating: isGenContent } = useGenerateCategoryContent();
    
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedHubSlugs, setSelectedHubSlugs] = useState<string[]>([]);
  const [topicPrompt, setTopicPrompt] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // --- NEU: State für Sterne-Management ---
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [ratingTargetCategory, setRatingTargetCategory] = useState<Category | null>(null);
  const [seedAvg, setSeedAvg] = useState("4.8");
  const [seedCount, setSeedCount] = useState("120");
  
  // HTML VIEW STATES
  const [showHtmlTop, setShowHtmlTop] = useState(false);
  const [showHtmlBottom, setShowHtmlBottom] = useState(false);
  const [widgetConfigText, setWidgetConfigText] = useState("");

  // Stats Calculation
  const stats = useMemo(() => {
    return {
        total: categories.length,
        active: categories.filter(c => c.is_active).length,
        hubs: categories.filter(c => c.template === 'hub_overview').length,
        comparisons: categories.filter(c => c.template === 'comparison').length
    }
  }, [categories]);

  // Filtered & Sorted Categories Logic
  const filteredCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
        const dateA = new Date((a as any).updated_at || (a as any).created_at || 0).getTime();
        const dateB = new Date((b as any).updated_at || (b as any).created_at || 0).getTime();
        return dateB - dateA;
    });

    const searchFiltered = sorted.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab === "all") return searchFiltered;
    return searchFiltered.filter(cat => cat.template === activeTab);
  }, [categories, searchTerm, activeTab]);

  const { data: categoryProjects = [] } = useCategoryProjects(editingCategory?.id);

  useEffect(() => {
    let newIds: string[] = [];
    if (categoryProjects && categoryProjects.length > 0) {
      newIds = [...categoryProjects].sort((a, b) => a.sort_order - b.sort_order).map((cp) => cp.project_id);
    }
    setSelectedProjectIds(prev => JSON.stringify(prev) !== JSON.stringify(newIds) ? newIds : prev);
  }, [categoryProjects]); 

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { 
        theme: "DATING", 
        template: "comparison", 
        is_active: true, 
        sort_order: 0, 
        faq_data: [], 
        meta_title: "", 
        meta_description: "", 
        comparison_widget_code: "",
        comparison_widget_type: null,
        comparison_widget_config: null,
        hero_image_url: "",
        card_image_url: "",
        hero_pretitle: "",
        hero_headline: "",
        hero_cta_text: "",
        hero_badge_text: "",
        intro_title: "",
        comparison_title: "",
        project_cta_text: "",
        features_title: "",
        button_text: "Vergleich ansehen" // KYRA FIX: hinzugefügt
    },
  });

  const { register, handleSubmit, setValue, watch, control } = form;
  const currentTemplate = watch("template");
  const currentWidgetType = watch("comparison_widget_type") || "none";

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name, 
        slug: editingCategory.slug, 
        description: editingCategory.description || "",
        theme: editingCategory.theme || "GENERIC", 
        template: editingCategory.template || "comparison",
        is_active: editingCategory.is_active, 
        meta_title: editingCategory.meta_title || "",
        meta_description: editingCategory.meta_description || "", 
        h1_title: editingCategory.h1_title || "",
        custom_css: (editingCategory as any).custom_css || "", 
        sidebar_ad_html: (editingCategory as any).sidebar_ad_html || "",
        sidebar_ad_image: (editingCategory as any).sidebar_ad_image || "",
        hero_image_url: (editingCategory as any).hero_image_url || "", 
        card_image_url: (editingCategory as any).card_image_url || "", 
        long_content_top: editingCategory.long_content_top || "",
        long_content_bottom: editingCategory.long_content_bottom || "",
        faq_data: editingCategory.faq_data || [],
        custom_html_override: editingCategory.custom_html_override || "",
        comparison_widget_code: (editingCategory as any).comparison_widget_code || "",
        comparison_widget_type: (editingCategory as any).comparison_widget_type || null,
        comparison_widget_config: (editingCategory as any).comparison_widget_config || null,
        hero_pretitle: editingCategory.hero_pretitle || "",
        hero_headline: editingCategory.hero_headline || "",
        hero_cta_text: editingCategory.hero_cta_text || "",
        hero_badge_text: editingCategory.hero_badge_text || "",
        intro_title: editingCategory.intro_title || "",
        comparison_title: editingCategory.comparison_title || "",
        project_cta_text: editingCategory.project_cta_text || "",
        features_title: editingCategory.features_title || "",
        button_text: (editingCategory as any).button_text || "Vergleich ansehen",
      } as any);
      setTopicPrompt(`Content für ${editingCategory.name}`);
      setWidgetConfigText(stringifyWidgetConfig((editingCategory as any).comparison_widget_config));
      const savedSlugs = (editingCategory as any).custom_css ? (editingCategory as any).custom_css.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      setSelectedHubSlugs(savedSlugs);
    } else {
      form.reset({ 
        name: "", 
        slug: "", 
        theme: "GENERIC", 
        template: "comparison", 
        is_active: true, 
        faq_data: [], 
        meta_title: "", 
        meta_description: "", 
        sidebar_ad_html: '', 
        sidebar_ad_image: '', 
        hero_image_url: '', 
        card_image_url: '', 
        custom_css: '', 
        comparison_widget_code: '',
        comparison_widget_type: null,
        comparison_widget_config: null,
        hero_pretitle: "",
        hero_headline: "",
        hero_cta_text: "",
        hero_badge_text: "",
        intro_title: "",
        comparison_title: "",
        project_cta_text: "",
        features_title: "",
        button_text: "Vergleich ansehen" // KYRA FIX: hinzugefügt
      } as any);
      setSelectedProjectIds([]); setSelectedHubSlugs([]); setTopicPrompt("");
      setWidgetConfigText("");
    }
    setShowHtmlTop(false);
    setShowHtmlBottom(false);
  }, [editingCategory, form]);

  async function onSubmit(data: CategoryInput) {
    try {
      const now = new Date().toISOString();
      const rawData = { ...data } as any;
      const finalHubConfig = selectedHubSlugs.join(',');

      delete rawData.custom_html; 
      delete rawData.faq_section; delete rawData.footer_links; delete rawData.popular_footer_links; 
      delete rawData.legal_links; delete rawData.projects; delete rawData.category_projects; 
      delete rawData.reviews; delete rawData.testimonials;

      let normalizedWidgetType = rawData.comparison_widget_type ?? null;
      if (normalizedWidgetType === "none") {
        normalizedWidgetType = null;
      }

      let normalizedWidgetConfig: Record<string, unknown> | null = null;
      if (normalizedWidgetType === "mr-money") {
        normalizedWidgetConfig = parseWidgetConfigInput(widgetConfigText);
        if (typeof normalizedWidgetConfig.sp !== "string" || !String(normalizedWidgetConfig.sp).trim()) {
          throw new Error('Für Mr. Money muss in der Widget Config mindestens {"sp": "tkvk"} gesetzt sein.');
        }
      } else if (widgetConfigText.trim()) {
        normalizedWidgetConfig = parseWidgetConfigInput(widgetConfigText);
      }

      if (normalizedWidgetType !== "html" && !normalizedWidgetType) {
        rawData.comparison_widget_code = rawData.comparison_widget_code || null;
      }

      const payload = {
        ...rawData,
        comparison_widget_type: normalizedWidgetType,
        comparison_widget_config: normalizedWidgetConfig,
        updated_at: now,
        is_internal_generated: true,
        custom_css: finalHubConfig,
      };
      
      let catId = editingCategory?.id;
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast({ title: "Gespeichert", description: "Einstellungen erfolgreich übernommen." });
      } else {
        const result = await createCategory.mutateAsync(payload);
        catId = result.id;
        toast({ title: "Erstellt", description: "Seite erfolgreich angelegt." });
      }
      if (catId && selectedProjectIds.length > 0) {
          await updateCategoryProjects.mutateAsync({ categoryId: catId, projectIds: selectedProjectIds });
      }
      setIsDialogOpen(false);
    } catch (error: any) { 
        console.error("Save Error:", error);
        const rawMessage = error?.message || "";

        if (rawMessage.includes("TOXIC_WORD_ERROR")) {
          const cleanMsg = getCleanToxicWordMessage(rawMessage);

          toast({
            title: "Speichern blockiert",
            description: cleanMsg,
            variant: "destructive",
          });

          return;
        }

        toast({
          title: "Fehler beim Speichern",
          description: rawMessage || "Unbekannter Fehler",
          variant: "destructive",
        });
    }
  }

  // --- NEU: Sterne-Speicher-Funktion ---
  const handleSaveSeedRating = async () => {
    if (!ratingTargetCategory) return;
    const avg = parseFloat(seedAvg.replace(',', '.'));
    const count = parseInt(seedCount);
    
    if (isNaN(avg) || isNaN(count)) {
        toast({ title: "Fehler", description: "Bitte gültige Zahlen eingeben.", variant: "destructive" });
        return;
    }

    const totalStars = avg * count;

    const { error } = await supabase.rpc('set_seed_rating', { 
        page_slug: ratingTargetCategory.slug, 
        new_seed_total_stars: totalStars, 
        new_seed_vote_count: count 
    });

    if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Sterne aktualisiert", description: `Basis-Schnitt von ${avg} bei ${count} Stimmen gesetzt.` });
        setIsRatingDialogOpen(false);
    }
  };

  const openRatingManager = async (category: Category) => {
    setRatingTargetCategory(category);
    const { data } = await supabase.from('page_ratings').select('seed_total_stars, seed_vote_count').eq('slug', category.slug).maybeSingle();
    
    if (data && data.seed_vote_count > 0) {
        setSeedAvg((data.seed_total_stars / data.seed_vote_count).toFixed(1));
        setSeedCount(data.seed_vote_count.toString());
    } else {
        setSeedAvg("4.8");
        setSeedCount("120");
    }
    setIsRatingDialogOpen(true);
  };

  const handleGenerateContent = async () => {
    const catName = form.getValues("name");
    const provider = localStorage.getItem("ai_provider") || "google";
    const key = localStorage.getItem(provider === "google" ? "ai_key_google" : "ai_key_openai");
    
    if(!key) return toast({ title: "Kein API Key", description: "Bitte oben rechts 'KI Settings' prüfen.", variant: "destructive" });

    const result = await generateCategoryContent(catName, topicPrompt || catName);
    if (result) {
      form.setValue("long_content_top", result.contentTop, { shouldDirty: true });
      form.setValue("long_content_bottom", result.contentBottom, { shouldDirty: true });
      if (result.faqData && Array.isArray(result.faqData) && result.faqData.length > 0) {
          form.setValue("faq_data", result.faqData, { shouldDirty: true });
          toast({ title: "Erfolg", description: "Content & FAQs wurden generiert!" });
      } else {
          toast({ title: "Content generiert", description: "Keine FAQs erhalten." });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const url = await uploadImageToSupabase(e.target.files[0]);
    if (url) { form.setValue(fieldName, url, { shouldDirty: true }); toast({ title: "Bild hochgeladen" }); }
  };

  const toggleHubSlug = (slug: string) => {
    setSelectedHubSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Wirklich löschen?")) await deleteCategory.mutateAsync(id);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
      try {
          await updateCategory.mutateAsync({ id, is_active: !currentStatus });
          toast({ title: "Status aktualisiert", description: `Die Seite ist nun ${!currentStatus ? 'Online' : 'Offline'}.` });
      } catch (error: any) {
          toast({ title: "Fehler beim Status Update", description: error.message, variant: "destructive" });
      }
  };

  // KYRA ADD: Duplizier-Handler
  const handleDuplicate = async (cat: Category) => {
      try {
          await duplicateCategory.mutateAsync(cat);
          toast({ title: "Seite dupliziert", description: "Die Kopie wurde erfolgreich erstellt und ist als Entwurf gespeichert." });
      } catch (error: any) {
          toast({ title: "Fehler beim Duplizieren", description: error.message, variant: "destructive" });
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Gesamt Seiten</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-slate-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-600">Aktiv & Live</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-emerald-600">{stats.active}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600">Vergleiche</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-blue-600">{stats.comparisons}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-yellow-600">Themen Hubs</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-yellow-600">{stats.hubs}</div></CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-900 tracking-tight">
                <Settings2 className="w-8 h-8 text-primary" /> Seiten-Manager
            </h2>
            <p className="text-slate-500 mt-1">Verwalte deine Landingpages, Hubs und Vergleiche.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Suche..." 
                    className="pl-9 bg-white shadow-sm border-slate-200" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <AIConfigDialog />
            <Button onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }} size="lg" className="shadow-lg hover:shadow-primary/20 transition-all">
                <Plus className="w-5 h-5 mr-2" /> Neue Seite
            </Button>
        </div>
      </div>

      {/* --- MAIN TABS FOR OVERVIEW --- */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white border border-slate-200 shadow-sm h-12 p-1">
                <TabsTrigger value="all" className="h-10 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Alle Seiten</TabsTrigger>
                <TabsTrigger value="comparison" className="h-10 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2"><LayoutTemplate className="w-4 h-4"/> Vergleiche</TabsTrigger>
                <TabsTrigger value="hub_overview" className="h-10 px-4 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 flex gap-2"><Layers className="w-4 h-4"/> Hubs</TabsTrigger>
                <TabsTrigger value="review" className="h-10 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 flex gap-2"><FileText className="w-4 h-4"/> Artikel</TabsTrigger>
            </TabsList>
        </div>

        <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
            <CardContent className="p-0">
                <TabsContent value="all" className="m-0">
                    <CategoryTable 
                        data={filteredCategories} 
                        onEdit={(cat) => { setEditingCategory(cat); setIsDialogOpen(true); }}
                        onDelete={handleDelete}
                        onView={(slug) => window.open(slug, '_blank')}
                        onToggleActive={handleToggleActive}
                        onDuplicate={handleDuplicate} // Neu
                        onManageRating={openRatingManager} // --- NEU ---
                    />
                </TabsContent>
                <TabsContent value="comparison" className="m-0">
                    <CategoryTable 
                        data={filteredCategories} 
                        onEdit={(cat) => { setEditingCategory(cat); setIsDialogOpen(true); }}
                        onDelete={handleDelete}
                        onView={(slug) => window.open(slug, '_blank')}
                        onToggleActive={handleToggleActive}
                        onDuplicate={handleDuplicate} // Neu
                        onManageRating={openRatingManager} // --- NEU ---
                    />
                </TabsContent>
                <TabsContent value="hub_overview" className="m-0">
                    <CategoryTable 
                        data={filteredCategories} 
                        onEdit={(cat) => { setEditingCategory(cat); setIsDialogOpen(true); }}
                        onDelete={handleDelete}
                        onView={(slug) => window.open(slug, '_blank')}
                        onToggleActive={handleToggleActive}
                        onDuplicate={handleDuplicate} // Neu
                        onManageRating={openRatingManager} // --- NEU ---
                    />
                </TabsContent>
                <TabsContent value="review" className="m-0">
                    <CategoryTable 
                        data={filteredCategories} 
                        onEdit={(cat) => { setEditingCategory(cat); setIsDialogOpen(true); }}
                        onDelete={handleDelete}
                        onView={(slug) => window.open(slug, '_blank')}
                        onToggleActive={handleToggleActive}
                        onDuplicate={handleDuplicate} // Neu
                        onManageRating={openRatingManager} // --- NEU ---
                    />
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>

      {/* --- EDIT DIALOG (MODAL) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col p-0 bg-slate-50/50 rounded-2xl overflow-hidden border-0 shadow-2xl">
            <div className="px-8 py-5 border-b bg-white flex justify-between items-center shadow-sm z-10">
                <div><DialogTitle className="text-2xl font-bold text-slate-900">{editingCategory ? "Seite bearbeiten" : "Neue Seite erstellen"}</DialogTitle><DialogDescription>Konfiguriere Layout, Content und Partner.</DialogDescription></div>
                <div className="flex gap-3"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button><Button onClick={handleSubmit(onSubmit)} className="bg-primary text-white hover:bg-primary/90 shadow-md"><Database className="w-4 h-4 mr-2" /> Speichern</Button></div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar"><div className="max-w-6xl mx-auto p-8">
                    
                    {/* --- TYPE SELECTION CARD --- */}
                    <Card className="mb-8 border-slate-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-primary"/> Layout & Typ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold text-slate-700">Wähle den Seitentyp</Label>
                                    <Controller control={control} name="template" render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || "comparison"}>
                                            <SelectTrigger className="h-12 text-base font-medium bg-slate-50 border-slate-200 focus:ring-primary/20"><SelectValue placeholder="Wähle Typ..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="comparison"><div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Vergleich</Badge> Für Vergleichs- und Übersichtsseiten</div></SelectItem>
                                                <SelectItem value="hub_overview"><div className="flex items-center gap-2"><Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Hub</Badge> Sammelseite für Unterkategorien</div></SelectItem>
                                                <SelectItem value="review"><div className="flex items-center gap-2"><Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0">Artikel</Badge> Klassischer Content</div></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                            </div>

                            {/* --- WIDGET CODE EDITOR --- */}
                            {currentTemplate === "comparison" && (
                                <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-inner">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                                                <Code className="w-5 h-5 text-green-400" /> Affiliate Widget Code
                                            </Label>
                                            <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-800">Tarifcheck / Check24 / FinanceAds</Badge>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Füge hier den <strong>kompletten Embed-Code</strong> ein (inkl. <code>&lt;script&gt;</code> Tags). Dieser überschreibt die manuelle Projektliste.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <Label>Widget Typ</Label>
                                                <Controller
                                                    name="comparison_widget_type"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value || "none"}
                                                            onValueChange={(value) => {
                                                                field.onChange(value === "none" ? null : value);
                                                                if (value !== "mr-money" && widgetConfigText.trim() === `{\n  "sp": "tkvk"\n}`) {
                                                                  setWidgetConfigText("");
                                                                }
                                                                if (value === "mr-money" && !widgetConfigText.trim()) {
                                                                  setWidgetConfigText(`{\n  "sp": "tkvk"\n}`);
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                                                <SelectValue placeholder="Widget wählen" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">Keines</SelectItem>
                                                                <SelectItem value="html">HTML Embed</SelectItem>
                                                                <SelectItem value="mr-money">Mr. Money</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Widget Config (JSON)</Label>
                                                <Textarea
                                                    value={widgetConfigText}
                                                    onChange={(e) => setWidgetConfigText(e.target.value)}
                                                    placeholder={`{\n  "sp": "tkvk"\n}`}
                                                    className="font-mono text-xs bg-black/50 text-green-400 min-h-[110px] p-4 border-slate-700 focus:ring-green-500/50 focus:border-green-500/50 placeholder:text-slate-600"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Für Mr. Money z. B. <code>{'{"sp":"tkvk"}'}</code>
                                                </p>
                                            </div>
                                        </div>
                                        {currentWidgetType !== "mr-money" ? (
                                            <Controller
                                                name="comparison_widget_code"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        {...field}
                                                        value={field.value || ""}
                                                        placeholder={`<div id=\"rechner\"></div>\n<script src=\"...\"></script>`}
                                                        className="font-mono text-xs bg-black/50 text-green-400 min-h-[200px] p-4 border-slate-700 focus:ring-green-500/50 focus:border-green-500/50 placeholder:text-slate-600"
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
                                                Mr. Money nutzt die JSONB-Bridge. Der Renderpfad verwendet hier die Config aus <code>comparison_widget_config</code>.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="basis" className="w-full">
                        <TabsList className="w-full justify-start h-14 bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-6">
                            <TabsTrigger value="basis" className="h-11 px-6 rounded-lg font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Basis & SEO</TabsTrigger>
                            <TabsTrigger value="content" className="h-11 px-6 rounded-lg font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Inhalt</TabsTrigger>
                            {currentTemplate === 'hub_overview' ? <TabsTrigger value="hub" className="h-11 px-6 rounded-lg font-bold bg-yellow-50 text-yellow-700 data-[state=active]:bg-yellow-100">Hub Config</TabsTrigger> : <TabsTrigger value="projects" className="h-11 px-6 rounded-lg font-bold bg-blue-50 text-blue-700 data-[state=active]:bg-blue-100">Partner</TabsTrigger>}
                            <TabsTrigger value="design" className="h-11 px-6 rounded-lg font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Design & Ads</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basis" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-slate-200 shadow-sm h-fit">
                                    <CardHeader><CardTitle>Allgemeine Daten</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2"><Label>Seiten Name *</Label><Input {...register("name")} className="font-bold text-lg" placeholder="z.B. Kredit Vergleich" /></div>
                                        <div className="space-y-2"><Label>URL Slug *</Label><div className="flex items-center"><span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-md px-3 py-2 text-sm text-slate-500">deine-domain.at/</span><Input {...register("slug")} className="rounded-l-none font-mono text-sm" placeholder="kredit-vergleich" /></div></div>
                                        <div className="space-y-2"><Label>H1 Hauptüberschrift</Label><Input {...register("h1_title")} placeholder="Die große Headline auf der Seite" /></div>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-sm h-fit">
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500"/> Google SEO</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2"><Label>Meta Title (Browser Tab)</Label><Input {...register("meta_title")} placeholder="Kreditvergleich 2026 | Top Zinsen..." /></div>
                                        <div className="space-y-2"><Label>Meta Description (Google Snippet)</Label><Textarea {...register("meta_description")} className="min-h-[120px]" placeholder="Beschreibe die Seite für Google..." /></div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <Card className="border-slate-200 shadow-sm h-fit border-l-4 border-l-primary bg-slate-50/50">
                                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><LayoutTemplate className="w-5 h-5 text-primary"/> Hub & Listen Texte</CardTitle><CardDescription>Überschreibe die Standard-Texte des Templates.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2"><Label>Überschrift über Liste</Label><Input {...register("comparison_title")} className="bg-white" placeholder="z.B. Anbieter und Modelle im Überblick" /></div>
                                        <div className="space-y-2"><Label>Features Überschrift</Label><Input {...register("features_title")} className="bg-white" placeholder="z.B. Wichtige Funktionen" /></div>
                                        <div className="space-y-2"><Label>Intro Titel</Label><Input {...register("intro_title")} className="bg-white" placeholder="z.B. Warum du vergleichen solltest" /></div>
                                        <div className="space-y-2"><Label className="text-primary font-bold">Projekt Button-Text (CTA)</Label><Input {...register("project_cta_text")} className="bg-white border-primary/20" placeholder="z.B. Preis prüfen (überschreibt Standard)" /></div>
<div className="space-y-2"><Label className="text-primary font-bold">Startseiten Button-Text (Card)</Label><Input {...register("button_text")} className="bg-white border-primary/20" placeholder="z.B. Jetzt berechnen (Standard: Vergleich ansehen)" /></div>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-sm h-fit bg-slate-50/50">
                                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Settings2 className="w-5 h-5 text-slate-500"/> Hero Banner Texte</CardTitle><CardDescription>Spezifische Anpassungen für den Kopfbereich.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2"><Label>Hero Pre-Title</Label><Input {...register("hero_pretitle")} className="bg-white" placeholder="z.B. Aktueller Überblick" /></div>
                                        <div className="space-y-2"><Label>Hero Headline</Label><Input {...register("hero_headline")} className="bg-white" placeholder="z.B. Tools und Funktionen im Überblick" /></div>
                                        <div className="space-y-2"><Label>Hero CTA Button</Label><Input {...register("hero_cta_text")} className="bg-white" placeholder="z.B. Jetzt vergleichen" /></div>
                                        <div className="space-y-2"><Label>Hero Badge</Label><Input {...register("hero_badge_text")} className="bg-white" placeholder="z.B. Update 2026" /></div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-6">
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex gap-2 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <Bot className="w-5 h-5 text-purple-600 mt-2" />
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-purple-900 font-bold">KI Content Generator</Label>
                                            <div className="flex gap-2">
                                                <Input value={topicPrompt} onChange={e=>setTopicPrompt(e.target.value)} placeholder="Thema eingeben (z.B. Beste Dating Apps)" className="bg-white" />
                                                <Button onClick={handleGenerateContent} disabled={isGenContent} className="bg-purple-600 hover:bg-purple-700 text-white">Generieren</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <Label className="text-lg font-bold">Content Oben (Einleitung)</Label>
                                                <Button variant="ghost" size="sm" onClick={()=>setShowHtmlTop(!showHtmlTop)} className="h-6 text-xs gap-1 text-slate-400 hover:text-primary">
                                                    {showHtmlTop ? <><FileText className="w-3 h-3"/> Editor</> : <><Code className="w-3 h-3"/> HTML</>}
                                                </Button>
                                            </div>
                                            <Controller name="long_content_top" control={control} render={({ field }) => (
                                                showHtmlTop ? 
                                                <Textarea value={field.value || ''} onChange={field.onChange} className="font-mono text-xs min-h-[400px] bg-slate-50" /> :
                                                <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                                            )}/>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <Label className="text-lg font-bold">Content Unten (SEO Text)</Label>
                                                <Button variant="ghost" size="sm" onClick={()=>setShowHtmlBottom(!showHtmlBottom)} className="h-6 text-xs gap-1 text-slate-400 hover:text-primary">
                                                    {showHtmlBottom ? <><FileText className="w-3 h-3"/> Editor</> : <><Code className="w-3 h-3"/> HTML</>}
                                                </Button>
                                            </div>
                                            <Controller name="long_content_bottom" control={control} render={({ field }) => (
                                                showHtmlBottom ?
                                                <Textarea value={field.value || ''} onChange={field.onChange} className="font-mono text-xs min-h-[400px] bg-slate-50" /> :
                                                <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                                            )}/>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t"><CategoryFAQEditor form={form} /></div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="hub" className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl border border-yellow-200 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div><Label className="text-2xl font-bold text-slate-900">Hub-Struktur</Label><p className="text-slate-500">Wähle die Unterseiten für diesen Hub.</p></div>
                                    <Badge variant="secondary" className="text-lg px-4 py-1 bg-yellow-100 text-yellow-800">{selectedHubSlugs.length} ausgewählt</Badge>
                                </div>
                                <ScrollArea className="h-[500px] w-full border rounded-xl bg-slate-50/50 p-6 shadow-inner">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {categories.filter(c => c.id !== editingCategory?.id).map((cat) => (
                                            <div key={cat.id} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${selectedHubSlugs.includes(cat.slug) ? 'bg-white border-primary shadow-md scale-[1.02]' : 'bg-white border-transparent hover:border-slate-200'}`} onClick={() => toggleHubSlug(cat.slug)}>
                                                <Checkbox checked={selectedHubSlugs.includes(cat.slug)} onCheckedChange={() => toggleHubSlug(cat.slug)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                                <div className="flex flex-col">
                                                    <Label className="font-bold cursor-pointer text-base">{cat.name}</Label>
                                                    <span className="text-xs text-slate-400">/{cat.slug}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="projects">
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} />
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="space-y-6">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader><CardTitle>Visuelle Gestaltung</CardTitle></CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label className="mb-2 block flex items-center gap-2 font-bold"><UploadCloud className="w-4 h-4 text-slate-500" /> Hero Hintergrundbild (Banner)</Label>
                                            <p className="text-xs text-slate-400 mb-3">Wird oben auf der Detailseite als Banner angezeigt.</p>
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors text-center">
                                                {watch("hero_image_url") ? (
                                                    <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden group">
                                                        <img src={watch("hero_image_url") || ""} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="secondary" size="sm" onClick={()=>setValue("hero_image_url", "", {shouldDirty: true})}>Entfernen</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4 text-slate-400"><UploadCloud className="w-12 h-12 mx-auto mb-2 opacity-50"/> Drag & Drop oder Klick</div>
                                                )}
                                                <div className="flex gap-2 w-full">
                                                    <Input {...register("hero_image_url")} placeholder="https://..." className="bg-white" />
                                                    <input type="file" className="hidden" id="upload-hero" onChange={(e)=>handleImageUpload(e,"hero_image_url")}/>
                                                    <Button variant="outline" type="button" onClick={()=>document.getElementById('upload-hero')?.click()}><UploadCloud className="w-4 h-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label className="mb-2 block flex items-center gap-2 font-bold"><ImageIcon className="w-4 h-4 text-orange-500" /> Beitragsbild / Grid Image</Label>
                                            <p className="text-xs text-slate-400 mb-3">Wird im Hub als Vorschau-Karte angezeigt.</p>
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors text-center border-orange-200 bg-orange-50/30">
                                                {watch("card_image_url") ? (
                                                    <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden group shadow-md">
                                                        <img src={watch("card_image_url") || ""} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="secondary" size="sm" onClick={()=>setValue("card_image_url", "", {shouldDirty: true})}>Entfernen</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4 text-slate-400"><ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50 text-orange-300"/> Drag & Drop oder Klick</div>
                                                )}
                                                <div className="flex gap-2 w-full">
                                                    <Input {...register("card_image_url")} placeholder="https://..." className="bg-white" />
                                                    <input type="file" className="hidden" id="upload-card" onChange={(e)=>handleImageUpload(e,"card_image_url")}/>
                                                    <Button variant="outline" type="button" onClick={()=>document.getElementById('upload-card')?.click()} className="border-orange-200 text-orange-700 hover:bg-orange-50"><UploadCloud className="w-4 h-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-slate-100">
                                        <Label className="mb-2 block">Sidebar Werbung (Custom HTML)</Label>
                                        <Textarea {...register("sidebar_ad_html")} rows={8} className="font-mono text-xs bg-slate-50" placeholder="<div>Werbebanner Code...</div>"/>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div></div>
        </DialogContent>
      </Dialog>

      {/* --- NEU: STERNE-MODAL --- */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Basis-Sterne (Seed)</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-1">
              Setze künstliche Startwerte für <strong>{ratingTargetCategory?.name}</strong>. Echte Votes werden dazu addiert.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="font-bold">Wunsch-Durchschnitt (z.B. 4.9)</Label>
              <Input value={seedAvg} onChange={(e) => setSeedAvg(e.target.value)} className="rounded-xl border-slate-200" />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Anzahl Basis-Stimmen</Label>
              <Input value={seedCount} onChange={(e) => setSeedCount(e.target.value)} className="rounded-xl border-slate-200" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveSeedRating} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}