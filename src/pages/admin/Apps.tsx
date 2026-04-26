import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, Star, TrendingUp } from "lucide-react";

export default function AdminApps() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);

  // --- DATA FETCHING ---
  const { data: apps, isLoading } = useQuery({
    queryKey: ["admin-promoted-apps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promoted_apps").select("*").order("daily_rank", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // --- MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (formData.id) {
        const { error } = await supabase.from("promoted_apps").update(formData).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promoted_apps").insert([formData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promoted-apps"] });
      queryClient.invalidateQueries({ queryKey: ["promoted-apps-weighted"] }); // Cache löschen für Frontend
      setIsDialogOpen(false);
      setEditingApp(null);
      toast.success("App erfolgreich gespeichert");
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promoted_apps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promoted-apps"] });
      toast.success("App gelöscht");
    },
  });

  // --- HANDLERS ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingApp?.id,
      name: formData.get("name"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      affiliate_link: formData.get("affiliate_link"),
      logo_url: formData.get("logo_url"),
      short_description: formData.get("short_description"),
      daily_rank: Number(formData.get("daily_rank")) || 99,
      advertising_weight: Number(formData.get("advertising_weight")) || 1,
      rating: Number(formData.get("rating")) || 5.0,
      is_active: formData.get("is_active") === "on",
    };
    saveMutation.mutate(data);
  };

  const filteredApps = apps?.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Verwaltung</h1>
          <p className="text-muted-foreground">Verwalte die Top 100 Liste und die Slider-Gewichtung.</p>
        </div>
        <Button onClick={() => { setEditingApp(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Neue App
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Suchen nach Name oder Kategorie..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rang</TableHead>
              <TableHead>App Name</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Gewichtung (Ads)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-bold">#{app.daily_rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-50 border flex items-center justify-center p-1">
                      {app.logo_url ? <img src={app.logo_url} className="w-full h-full object-contain" /> : "📱"}
                    </div>
                    <span className="font-medium">{app.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{app.category}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${app.advertising_weight > 7 ? 'text-red-500' : 'text-slate-400'}`} />
                    <span className="font-bold">{app.advertising_weight}/10</span>
                  </div>
                </TableCell>
                <TableCell>
                  {app.is_active 
                    ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Aktiv</Badge> 
                    : <Badge variant="secondary">Inaktiv</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingApp(app); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { if(confirm("Wirklich löschen?")) deleteMutation.mutate(app.id); }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingApp ? "App bearbeiten" : "Neue App anlegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editingApp?.name} required placeholder="z.B. Netflix" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input name="slug" defaultValue={editingApp?.slug} required placeholder="z.B. netflix" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Input name="category" defaultValue={editingApp?.category} placeholder="z.B. Streaming" />
              </div>
              <div className="space-y-2">
                <Label>Affiliate Link (Money URL)</Label>
                <Input name="affiliate_link" defaultValue={editingApp?.affiliate_link} placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input name="logo_url" defaultValue={editingApp?.logo_url} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label>Kurzbeschreibung (für Top 100 Liste)</Label>
              <Input name="short_description" defaultValue={editingApp?.short_description} placeholder="Kurzer Teaser..." />
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Werbe-Gewichtung (1-10)</Label>
                  <span className="text-xs font-bold text-primary">Wie oft im Slider?</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-sm">1</span>
                   <Slider 
                      name="advertising_weight_slider" // Fake input for visual
                      defaultValue={[editingApp?.advertising_weight || 1]} 
                      max={10} 
                      min={1} 
                      step={1}
                      onValueChange={(v) => {
                        const input = document.getElementById('hidden-weight') as HTMLInputElement;
                        if(input) input.value = v[0].toString();
                      }}
                   />
                   <span className="text-sm">10</span>
                </div>
                <input type="hidden" id="hidden-weight" name="advertising_weight" defaultValue={editingApp?.advertising_weight || 1} />
                <p className="text-[10px] text-muted-foreground">10 = Wird sehr oft angezeigt (Premium). 1 = Selten.</p>
              </div>

              <div className="space-y-4">
                <Label>Ranking Platz (1-100)</Label>
                <Input type="number" name="daily_rank" defaultValue={editingApp?.daily_rank || 99} />
              </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Switch name="is_active" defaultChecked={editingApp?.is_active ?? true} />
                 <Label>App ist aktiv</Label>
               </div>
               <div className="flex items-center gap-2">
                 <Label>Rating:</Label>
                 <Input type="number" name="rating" className="w-20" step="0.1" max="5.0" defaultValue={editingApp?.rating || 5.0} />
                 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
              <Button type="submit">Speichern</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}