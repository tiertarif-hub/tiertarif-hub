import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LinkItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

export function CategoryLegalLinksEditor({ categoryId }: { categoryId: string | null }) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLinks = async () => {
    if (!categoryId) return;
    setLoading(true);
    
    try {
      // 1. Versuche, Links für DIESE Kategorie zu laden
      const { data: catLinks, error: catError } = await supabase
        .from('footer_links') // Tabelle für Legal Links
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // 2. Wenn Kategorie-Links existieren, nimm diese
      if (catLinks && catLinks.length > 0) {
        setLinks(catLinks);
      } else {
        // 3. SONST: Lade die GLOBALEN Links als Vorschlag
        const { data: globalLinks } = await supabase
          .from('footer_links')
          .select('*')
          .is('category_id', null)
          .order('sort_order', { ascending: true });
        
        if (globalLinks) {
          const prefilled = globalLinks.map((l, idx) => ({
            ...l,
            id: `temp-${idx}`, 
            category_id: categoryId 
          }));
          setLinks(prefilled);
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Fehler beim Laden", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [categoryId]);

  const handleSave = async () => {
    if (!categoryId) return;
    setLoading(true);

    try {
      await supabase.from('footer_links').delete().eq('category_id', categoryId);

      const linksToSave = links.map((l, idx) => ({
        category_id: categoryId,
        label: l.label,
        url: l.url,
        sort_order: idx,
        is_active: true
      }));

      if (linksToSave.length > 0) {
        const { error } = await supabase.from('footer_links').insert(linksToSave);
        if (error) throw error;
      }

      toast({ title: "Gespeichert", description: "Rechtliche Links aktualisiert." });
      fetchLinks(); 
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { id: `new-${Date.now()}`, label: "", url: "", sort_order: links.length }]);
  };

  const removeLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  if (!categoryId) return null;

  return (
    <Card className="mt-4 border shadow-sm">
      <CardHeader className="pb-3 bg-muted/50">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          Rechtliches (Footer)
          <Button variant="ghost" size="sm" onClick={fetchLinks} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {links.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Keine Links vorhanden.</p>}

        {links.map((link, idx) => (
          <div key={link.id} className="flex gap-2 items-center group">
            <GripVertical className="w-4 h-4 text-gray-300 cursor-move group-hover:text-gray-500 transition-colors" />
            <div className="grid grid-cols-2 gap-2 flex-1">
                <Input 
                    placeholder="Label (z.B. Impressum)" 
                    value={link.label} 
                    onChange={(e) => updateLink(idx, "label", e.target.value)} 
                    className="h-8 text-sm"
                />
                <Input 
                    placeholder="URL (z.B. /impressum)" 
                    value={link.url} 
                    onChange={(e) => updateLink(idx, "url", e.target.value)} 
                    className="h-8 text-sm font-mono text-muted-foreground"
                />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeLink(idx)}>
                <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={addLink}><Plus className="w-3 h-3 mr-2" /> Eintrag hinzufügen</Button>
            <Button size="sm" onClick={handleSave} disabled={loading} className="min-w-[100px]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Speichern"}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}