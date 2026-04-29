import { useState } from "react";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, type ProjectWithCategory } from "@/hooks/useProjects";
import { useCategoryOptions } from "@/hooks/useCategories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminProjects() {
  const { data: projects = [], isLoading } = useProjects(true);
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategoryOptions(true);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      country_scope: "DACH",
      is_active: true,
      sort_order: 0,
      tags: [],
      rating: 9.8,
      logo_url: "",
      affiliate_link: "",
      description: "",
    },
  });

  const categoryId = watch("category_id");
  const countryScope = watch("country_scope");
  const isActive = watch("is_active");
  const rating = watch("rating");

  const filteredProjects = filterCategory === "all" 
    ? projects 
    : projects.filter((p) => p.category_id === filterCategory);

  function openCreateDialog() {
    setEditingProject(null);
    reset({
      category_id: null,
      name: "",
      slug: "",
      url: "",
      short_description: "",
      description: "",
      logo_url: "",
      affiliate_link: "",
      rating: 9.8,
      country_scope: "DACH",
      tags: [],
      is_active: true,
      sort_order: projects.length,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(project: ProjectWithCategory) {
    setEditingProject(project);
    reset({
      category_id: project.category_id,
      name: project.name,
      slug: project.slug,
      url: project.url,
      short_description: project.short_description || "",
      description: project.description || "",
      logo_url: project.logo_url || "",
      affiliate_link: project.affiliate_link || "",
      rating: project.rating ?? 9.8,
      country_scope: project.country_scope,
      tags: project.tags || [],
      is_active: project.is_active,
      sort_order: project.sort_order,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: ProjectInput) {
    try {
      // Convert tags from comma-separated string if needed
      const processedData = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
      };

      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, input: processedData });
        toast({ title: "Projekt aktualisiert" });
      } else {
        await createProject.mutateAsync(processedData);
        toast({ title: "Projekt erstellt" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Möchtest du dieses Projekt wirklich löschen?")) return;
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: "Projekt gelöscht" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Projekt konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  }

  async function handleToggleActive(project: ProjectWithCategory) {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        input: { is_active: !project.is_active },
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  }

  async function handleMoveOrder(project: ProjectWithCategory, direction: "up" | "down") {
    const currentIndex = filteredProjects.findIndex((p) => p.id === project.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= filteredProjects.length) return;

    const otherProject = filteredProjects[newIndex];
    
    try {
      await Promise.all([
        updateProject.mutateAsync({
          id: project.id,
          input: { sort_order: otherProject.sort_order },
        }),
        updateProject.mutateAsync({
          id: otherProject.id,
          input: { sort_order: project.sort_order },
        }),
      ]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Reihenfolge konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Projekte</h2>
          <p className="text-muted-foreground">Verwalte deine Vergleichsportale und Anbieter.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory} disabled={isCategoriesLoading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={isCategoriesLoading ? "Kategorien laden..." : "Alle Kategorien"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Neues Projekt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingProject ? "Projekt bearbeiten" : "Neues Projekt"}
                </DialogTitle>
                <DialogDescription>
                  Verwalte Anbieter-Daten, Ziel-URL, Kategorie, Region und Sichtbarkeit für dein Vergleichsportal.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register("name")} placeholder="Tinder" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" {...register("slug")} placeholder="tinder" />
                    {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input id="url" {...register("url")} placeholder="https://tinder.com" />
                  {errors.url && <p className="text-sm text-destructive mt-1">{errors.url.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input id="logo_url" {...register("logo_url")} placeholder="https://tiertarif.com/logo.png" />
                    {errors.logo_url && <p className="text-sm text-destructive mt-1">{errors.logo_url.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="affiliate_link">Affiliate Link</Label>
                    <Input id="affiliate_link" {...register("affiliate_link")} placeholder="https://affiliate.com/go/..." />
                    {errors.affiliate_link && <p className="text-sm text-destructive mt-1">{errors.affiliate_link.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="short_description">Kurzbeschreibung</Label>
                  <Textarea 
                    id="short_description" 
                    {...register("short_description")} 
                    placeholder="Die weltweit beliebteste Dating App..." 
                    rows={2} 
                  />
                </div>

                <div>
                  <Label htmlFor="description">Ausführliche Beschreibung</Label>
                  <Textarea 
                    id="description" 
                    {...register("description")} 
                    placeholder="Eine detaillierte Beschreibung für die Landingpage..." 
                    rows={4} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category_id">Kategorie</Label>
                    <Select 
                      value={categoryId || "none"} 
                      onValueChange={(v) => setValue("category_id", v === "none" ? null : v)}
                      disabled={isCategoriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country_scope">Region</Label>
                    <Select 
                      value={countryScope} 
                      onValueChange={(v) => setValue("country_scope", v as ProjectInput["country_scope"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AT">Österreich</SelectItem>
                        <SelectItem value="DE">Deutschland</SelectItem>
                        <SelectItem value="DACH">DACH</SelectItem>
                        <SelectItem value="EU">EU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (0-10)</Label>
                    <Input 
                      id="rating" 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      value={rating}
                      onChange={(e) => setValue("rating", parseFloat(e.target.value) || 0)}
                    />
                    {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Aktiv</Label>
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("is_active", checked)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createProject.isPending || updateProject.isPending}
                >
                  {(createProject.isPending || updateProject.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingProject ? "Speichern" : "Erstellen"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ord.</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Partner & Angebote werden geladen...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Projekte vorhanden. Erstelle dein erstes Projekt.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project, index) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveOrder(project, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(project, "down")}
                          disabled={index === filteredProjects.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{project.name}</p>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {project.short_description || project.url}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.categories ? (
                        <span className="text-sm">
                          {project.categories.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {project.country_scope}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={project.is_active}
                        onCheckedChange={() => handleToggleActive(project)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(project)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
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
