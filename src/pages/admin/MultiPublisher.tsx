import "@/styles/article-content.css";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ExportTemplate } from "@/components/templates/ExportTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Globe, FileText, LayoutList, Database, Save, Eye, PlusCircle, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateCityContent } from "@/hooks/useGenerateCityContent";
import { useGenerateCategoryContent, GeneratedCategoryContent } from "@/hooks/useGenerateCategoryContent";
// KYRA FIX: Import ohne geschweifte Klammern, da es ein Default Export ist
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";

// Typen
type DeploymentTarget = {
  id: string;
  name: string;
  bridge_url: string;
};
type Project = { id: string; name: string; logo_url: string; rating: number; affiliate_link: string; features: any; badge_text: string; };
type Category = { id: string; name: string; slug: string; is_internal_generated?: boolean };

export default function AdminPublisher() {
  // Global Mode
  const [mode, setMode] = useState<"external" | "internal">("internal");

  // Data State
  const [targets, setTargets] = useState<DeploymentTarget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Selection State
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // External Generator State (Cities)
  const [city, setCity] = useState("Berlin");
  const [keyword, setKeyword] = useState("Dating");
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  
  // Internal Generator State (Categories)
  const [catKeyword, setCatKeyword] = useState("Vergleich & Test");
  const [generatedCategoryContent, setGeneratedCategoryContent] = useState<GeneratedCategoryContent | null>(null);
  const [newInternalName, setNewInternalName] = useState(""); 
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Hooks
  const { generateContent, isGenerating: isGeneratingCity } = useGenerateCityContent();
  const { generateCategoryContent, isGenerating: isGeneratingCat } = useGenerateCategoryContent();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load Data
  useEffect(() => {
    fetchTargets();
    fetchProjects();
    fetchCategories();
  }, []);

  // Sync Projects when Category changes in Internal Mode
  useEffect(() => {
    if (mode === 'internal' && selectedCategoryId) {
        fetchExistingCategoryProjects(selectedCategoryId);
    } else {
        setSelectedProjectIds([]);
    }
  }, [selectedCategoryId, mode]);

  const fetchTargets = async () => {
  const { data, error } = await (supabase as any)
    .from("deployment_targets")
    .select("id, name, bridge_url")
    .order("name");

  if (error) {
    toast({
      title: "Fehler",
      description: "Deployment-Ziele konnten nicht geladen werden.",
      variant: "destructive",
    });
    return;
  }

  setTargets((data ?? []) as DeploymentTarget[]);
};

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").eq("is_active", true).order("rating", { ascending: false });
    if (data) setProjects(data as any);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, is_internal_generated")
      .eq("is_active", true)
      .eq("is_internal_generated", true)
      .order("name");

    if (data) setCategories(data);
  };

  const fetchExistingCategoryProjects = async (catId: string) => {
      const { data } = await supabase
        .from('category_projects')
        .select('project_id')
        .eq('category_id', catId)
        .order('sort_order');
      
      if (data) {
          setSelectedProjectIds(data.map(p => p.project_id));
      }
  };

  const handleGenerateCityHTML = async () => {
    if (selectedProjectIds.length === 0) {
      toast({ title: "Fehler", description: "Wähle mindestens ein Projekt.", variant: "destructive" });
      return;
    }
    const content = await generateContent(city, keyword);
    if (!content) return;

    const activeProjects = projects.filter(p => selectedProjectIds.includes(p.id));
    const staticHtml = renderToStaticMarkup(
      <ExportTemplate 
        city={city} 
        keyword={keyword} 
        projects={activeProjects}
        contentTop={content.contentTop}
        contentBottom={content.contentBottom}
      />
    );

    const fullPage = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <title>${keyword} in ${city} - Vergleich 2026</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>${staticHtml}</body>
      </html>
    `;
    setGeneratedHtml(fullPage);
    toast({ title: "Generiert", description: "HTML Vorschau erstellt." });
  };

  const handleDeploy = async () => {
  if (!generatedHtml || !selectedTargetId) return;

  setIsDeploying(true);

  try {
    const { error } = await supabase.functions.invoke("publish-external-page", {
      body: {
        targetId: selectedTargetId,
        html: generatedHtml,
      },
    });

    if (error) throw error;

    toast({
      title: "Erfolg",
      description: "Seite erfolgreich veröffentlicht!",
    });
  } catch (e: any) {
    toast({
      title: "Fehler",
      description: e?.message || "Deployment fehlgeschlagen",
      variant: "destructive",
    });
  } finally {
    setIsDeploying(false);
  }
};

  const handleCreateInternalCategory = async () => {
    if (!newInternalName.trim()) return;
    setIsCreatingCat(true);

    const slug = newInternalName.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newInternalName,
          slug: slug,
          is_active: true,
          is_internal_generated: true,
          theme: 'GENERIC',
          template: 'comparison'
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Erstellt", description: `Interne Seite "${newInternalName}" angelegt.` });
      await fetchCategories();
      if (data) setSelectedCategoryId(data.id);
      setNewInternalName("");
      
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message || "Konnte Kategorie nicht erstellen.", variant: "destructive" });
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleGenerateCategory = async () => {
    if (!selectedCategoryId) {
      toast({ title: "Fehler", description: "Bitte wähle eine Kategorie.", variant: "destructive" });
      return;
    }
    const cat = categories.find(c => c.id === selectedCategoryId);
    if (!cat) return;

    const result = await generateCategoryContent(cat.name, catKeyword);
    if (result) {
      setGeneratedCategoryContent(result);
      toast({ title: "Fertig", description: "Content generiert. Bitte prüfen & speichern." });
    }
  };

  const handleSaveToDatabase = async () => {
    if (!selectedCategoryId) return;
    setIsSaving(true);

    try {
      if (generatedCategoryContent) {
          const { error: catError } = await supabase
            .from("categories")
            .update({
              long_content_top: generatedCategoryContent.contentTop,
              long_content_bottom: generatedCategoryContent.contentBottom,
              updated_at: new Date().toISOString()
            })
            .eq("id", selectedCategoryId);
          if (catError) throw catError;
      }

      const { error: deleteError } = await supabase
        .from('category_projects')
        .delete()
        .eq('category_id', selectedCategoryId);
      if (deleteError) throw deleteError;

      if (selectedProjectIds.length > 0) {
          const projectMappings = selectedProjectIds.map((pid, index) => ({
              category_id: selectedCategoryId,
              project_id: pid,
              sort_order: index
          }));

          const { error: insertError } = await supabase
            .from('category_projects')
            .insert(projectMappings);
          if (insertError) throw insertError;
      }

      toast({ title: "Gespeichert", description: "Content & Projekt-Mapping erfolgreich aktualisiert!" });
    } catch (e: any) {
      toast({ title: "Speicherfehler", description: e.message || "Zugriff verweigert.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Mode Switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Multi-Publisher Engine</h1>
          <p className="text-slate-500 mt-2">Zentrale Steuerung für Content & Externe LPs.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <span className={`text-sm font-medium ${mode === 'external' ? 'text-blue-600' : 'text-slate-400'}`}>Extern (City LPs)</span>
            <Switch 
                checked={mode === 'internal'} 
                onCheckedChange={(c) => setMode(c ? 'internal' : 'external')} 
            />
            <span className={`text-sm font-medium ${mode === 'internal' ? 'text-indigo-600' : 'text-slate-400'}`}>Intern (Portal)</span>
        </div>
      </div>

      {mode === 'external' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Globe className="w-5 h-5 text-blue-500" />
                            1. Ziel & Content Setup
                        </CardTitle>
                        <CardDescription>Konfiguriere die externe Landingpage (City LP).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ziel-Stadt</Label>
                                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="z.B. München" />
                            </div>
                            <div className="space-y-2">
                                <Label>Haupt-Keyword</Label>
                                <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="z.B. Dating Apps" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Deployment Ziel</Label>
                            <Select onValueChange={setSelectedTargetId} value={selectedTargetId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wähle eine Domain..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {targets.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-blue-500" />
                            3. Generierung & Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleGenerateCityHTML} disabled={isGeneratingCity} className="w-full bg-slate-800 hover:bg-slate-900">
                            {isGeneratingCity ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                            HTML Generieren
                        </Button>
                        {generatedHtml && (
                            <div className="p-4 bg-slate-50 rounded border space-y-4">
                                <Button onClick={handleDeploy} disabled={isDeploying} className="w-full bg-green-600 hover:bg-green-700">
                                    {isDeploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                                    Live Schalten
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <LayoutList className="w-5 h-5 text-blue-500" />
                            2. Projekte Wählen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                            {/* KYRA FIX: Korrekte Props für die Komponente */}
                            <ProjectCheckboxList 
                                selectedIds={selectedProjectIds} 
                                onChange={setSelectedProjectIds} 
                            />
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                
                <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg">
                            <PlusCircle className="w-5 h-5 text-indigo-600" />
                            Neue Interne Seite anlegen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                         <Input 
                            placeholder="Titel der Seite (z.B. Krypto Vergleich 2026)" 
                            value={newInternalName}
                            onChange={(e) => setNewInternalName(e.target.value)}
                            className="bg-white"
                         />
                         <Button onClick={handleCreateInternalCategory} disabled={isCreatingCat || !newInternalName} className="bg-indigo-600 hover:bg-indigo-700">
                            {isCreatingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                         </Button>
                    </CardContent>
                </Card>

                <Card className="border-indigo-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <Database className="w-5 h-5 text-indigo-600" />
                            1. Seite wählen & Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-0">
                        <div className="space-y-3">
                            <Label>Zielseite wählen</Label>
                            <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="Liste laden..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length > 0 ? categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    )) : (
                                        <SelectItem value="none" disabled>Keine internen Seiten gefunden.</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Fokus-Keyword (AI Prompt)</Label>
                            <Input value={catKeyword} onChange={e => setCatKeyword(e.target.value)} placeholder="z.B. Krypto Börsen Vergleich" />
                        </div>

                        <Button 
                            onClick={handleGenerateCategory} 
                            disabled={isGeneratingCat || !selectedCategoryId}
                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isGeneratingCat ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                            AI Content Generieren
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-indigo-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                            2. Ranking & Projekte festlegen
                        </CardTitle>
                        <CardDescription>Wähle aus, welche Anbieter in welcher Reihenfolge erscheinen.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4 border rounded-lg p-4 bg-slate-50/50">
                            {/* KYRA FIX: Korrekte Props für die Komponente */}
                            <ProjectCheckboxList 
                                selectedIds={selectedProjectIds} 
                                onChange={setSelectedProjectIds} 
                            />
                        </ScrollArea>
                        <p className="mt-4 text-xs text-muted-foreground italic text-center">Tipp: Die Reihenfolge der Auswahl bestimmt das Ranking auf der Seite.</p>
                    </CardContent>
                </Card>
             </div>

             <div className="space-y-6">
                {selectedCategoryId ? (
                    <Card className="h-full border-green-100 shadow-lg">
                        <CardHeader className="bg-green-50/50 pb-4 border-b">
                            <CardTitle className="flex items-center gap-2 text-green-900">
                                <Eye className="w-5 h-5 text-green-600" />
                                3. Finalisierung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <Tabs defaultValue="top" className="w-full">
                                <TabsList className="w-full bg-slate-100 p-1">
                                    <TabsTrigger value="top" className="flex-1">Einleitung (Top)</TabsTrigger>
                                    <TabsTrigger value="bottom" className="flex-1">Ratgeber (Bottom)</TabsTrigger>
                                </TabsList>
                                <TabsContent value="top" className="mt-4 animate-in slide-in-from-left-2">
                                    <div className="article-content article-content--sm p-4 bg-white rounded border h-[350px] overflow-y-auto max-w-none shadow-inner" 
                                         dangerouslySetInnerHTML={{ __html: generatedCategoryContent?.contentTop || '<span class="text-slate-400 italic">Noch kein Content generiert...</span>' }} />
                                </TabsContent>
                                <TabsContent value="bottom" className="mt-4 animate-in slide-in-from-right-2">
                                    <div className="article-content article-content--sm p-4 bg-white rounded border h-[350px] overflow-y-auto max-w-none shadow-inner" 
                                         dangerouslySetInnerHTML={{ __html: generatedCategoryContent?.contentBottom || '<span class="text-slate-400 italic">Noch kein Content generiert...</span>' }} />
                                </TabsContent>
                            </Tabs>

                            <div className="bg-slate-50 p-4 rounded-xl border border-dashed flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="font-bold text-slate-700">{selectedProjectIds.length}</span> Projekte verknüpft
                                </div>
                                <Button 
                                    onClick={handleSaveToDatabase} 
                                    disabled={isSaving}
                                    className="bg-green-600 hover:bg-green-700 h-12 px-8 text-lg shadow-lg shadow-green-200"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                    Live Schalten
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 text-slate-400 bg-slate-50/30">
                        <Database className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-center">Wähle links eine Zielseite aus,<br/>um den Editor zu aktivieren.</p>
                    </div>
                )}
             </div>
        </div>
      )}
    </div>
  );
}