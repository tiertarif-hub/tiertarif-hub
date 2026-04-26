import { useState } from "react";
import { useAllPopularFooterLinks, useManagePopularFooterLinks } from "@/hooks/usePopularFooterLinks";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Link2, Globe, ArrowUp, ArrowDown } from "lucide-react";

interface PopularFooterLink {
  id: string;
  category_id: string | null;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminFooterLinks() {
  const { data: links = [], isLoading } = useAllPopularFooterLinks();
  const { data: categories = [] } = useCategories(true);
  const { createLink, updateLink, deleteLink } = useManagePopularFooterLinks();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<PopularFooterLink | null>(null);
  
  // Form state
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  function resetForm() {
    setLabel("");
    setUrl("");
    setCategoryId(null);
    setIsActive(true);
    setEditingLink(null);
  }

  function openCreateDialog() {
    resetForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(link: PopularFooterLink) {
    setEditingLink(link);
    setLabel(link.label);
    setUrl(link.url);
    setCategoryId(link.category_id);
    setIsActive(link.is_active);
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!label || !url) {
      toast({ title: "Fehler", description: "Label und URL sind erforderlich", variant: "destructive" });
      return;
    }

    try {
      if (editingLink) {
        await updateLink.mutateAsync({
          id: editingLink.id,
          label,
          url,
          category_id: categoryId,
          is_active: isActive,
        });
        toast({ title: "Link aktualisiert" });
      } else {
        const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.sort_order)) : 0;
        await createLink.mutateAsync({
          label,
          url,
          category_id: categoryId,
          is_active: isActive,
          sort_order: maxOrder + 1,
        });
        toast({ title: "Link erstellt" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Möchtest du diesen Link wirklich löschen?")) return;
    try {
      await deleteLink.mutateAsync(id);
      toast({ title: "Link gelöscht" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  }

  async function handleMoveOrder(link: PopularFooterLink, direction: "up" | "down") {
    const sortedLinks = [...links].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedLinks.findIndex(l => l.id === link.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedLinks.length) return;

    const otherLink = sortedLinks[newIndex];
    
    try {
      await Promise.all([
        updateLink.mutateAsync({ id: link.id, sort_order: otherLink.sort_order }),
        updateLink.mutateAsync({ id: otherLink.id, sort_order: link.sort_order }),
      ]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Reihenfolge konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Global (alle Seiten)";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unbekannt";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedLinks = [...links].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-6 h-6 text-primary" />
            Beliebte Footer-Links
          </h2>
          <p className="text-muted-foreground">
            Verwalte die "Beliebte Suche & Regionen" Links im Footer.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Neuer Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingLink ? "Link bearbeiten" : "Neuen Link anlegen"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="label">Link-Text</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="z.B. ONS Österreich"
                />
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/ons-oesterreich oder https://..."
                />
              </div>

              <div>
                <Label htmlFor="category">Zuordnung</Label>
                <Select 
                  value={categoryId || "global"} 
                  onValueChange={(v) => setCategoryId(v === "global" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zuordnung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Global (alle Seiten)
                      </div>
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Global = erscheint auf allen Seiten. Kategorie = nur auf dieser Seite.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Aktiv</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createLink.isPending || updateLink.isPending}
              >
                {(createLink.isPending || updateLink.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingLink ? "Speichern" : "Link erstellen"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ord.</TableHead>
                <TableHead>Link-Text</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Zuordnung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Footer-Links vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                sortedLinks.map((link, index) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveOrder(link, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(link, "down")}
                          disabled={index === sortedLinks.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{link.label}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{link.url}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${link.category_id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {getCategoryName(link.category_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${link.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        {link.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(link)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
