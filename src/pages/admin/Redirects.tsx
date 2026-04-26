import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  useCreateRedirect,
  useDeleteRedirect,
  useRedirects,
  useUpdateRedirect,
  type Redirect as TrackingRedirect,
} from "@/hooks/useRedirects";
import {
  useDeleteSeoRedirect,
  useSeoRedirects,
  useUpdateSeoRedirect,
  type SeoRedirect,
  type SeoRedirectEntityTable,
} from "@/hooks/useSeoRedirects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
} from "lucide-react";

type TrackingFormState = {
  source_path: string;
  target_url: string;
  is_active: boolean;
};

const DEFAULT_TRACKING_FORM: TrackingFormState = {
  source_path: "",
  target_url: "",
  is_active: true,
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeTrackingInput(value: string) {
  return value.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

function getTrackingRedirectUrl(baseUrl: string | undefined, sourcePath: string) {
  const normalizedBaseUrl = (baseUrl ?? "").replace(/\/$/, "");
  const normalizedSourcePath = normalizeTrackingInput(sourcePath);

  return `${normalizedBaseUrl}/functions/v1/go-redirect?slug=${encodeURIComponent(normalizedSourcePath)}`;
}

function TrackingLinksTab() {
  const { data: redirects = [], isLoading } = useRedirects(true);
  const createRedirect = useCreateRedirect();
  const updateRedirect = useUpdateRedirect();
  const deleteRedirect = useDeleteRedirect();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<TrackingRedirect | null>(null);
  const [formData, setFormData] = useState<TrackingFormState>(DEFAULT_TRACKING_FORM);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const redirectPreviewUrl = getTrackingRedirectUrl(supabaseUrl, formData.source_path);

  function openCreateDialog() {
    setEditingRedirect(null);
    setFormData(DEFAULT_TRACKING_FORM);
    setIsDialogOpen(true);
  }

  function openEditDialog(redirect: TrackingRedirect) {
    setEditingRedirect(redirect);
    setFormData({
      source_path: redirect.source_path,
      target_url: redirect.target_url,
      is_active: redirect.is_active,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSourcePath = normalizeTrackingInput(formData.source_path);

    if (!normalizedSourcePath || !formData.target_url.trim()) {
      toast({
        title: "Pflichtfelder fehlen",
        description: "Tracking-Slug und Ziel-URL müssen gesetzt sein.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingRedirect) {
        await updateRedirect.mutateAsync({
          id: editingRedirect.id,
          input: {
            source_path: normalizedSourcePath,
            target_url: formData.target_url,
            is_active: formData.is_active,
          },
        });
        toast({ title: "Tracking-Link aktualisiert" });
      } else {
        await createRedirect.mutateAsync({
          source_path: normalizedSourcePath,
          target_url: formData.target_url,
          is_active: formData.is_active,
        });
        toast({ title: "Tracking-Link erstellt" });
      }

      setIsDialogOpen(false);
      setFormData(DEFAULT_TRACKING_FORM);
      setEditingRedirect(null);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Tracking-Link konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Möchtest du diesen Tracking-Link wirklich löschen?")) return;

    try {
      await deleteRedirect.mutateAsync(id);
      toast({ title: "Tracking-Link gelöscht" });
    } catch {
      toast({
        title: "Fehler",
        description: "Tracking-Link konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  }

  async function handleToggleActive(redirect: TrackingRedirect) {
    try {
      await updateRedirect.mutateAsync({
        id: redirect.id,
        input: { is_active: !redirect.is_active },
      });
      toast({ title: redirect.is_active ? "Tracking-Link deaktiviert" : "Tracking-Link aktiviert" });
    } catch {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  }

  async function copyRedirectUrl(sourcePath: string) {
    await navigator.clipboard.writeText(getTrackingRedirectUrl(supabaseUrl, sourcePath));
    toast({ title: "Tracking-URL kopiert" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-xl">Tracking-Links</CardTitle>
            <CardDescription>
              Affiliate-Links bleiben getrennt von SEO-Weiterleitungen. Hier werden Klicks gezählt und über die Supabase Edge Function ausgeliefert.
            </CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Neuer Tracking-Link
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingRedirect ? "Tracking-Link bearbeiten" : "Neuen Tracking-Link erstellen"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source_path">Tracking-Slug</Label>
                  <Input
                    id="source_path"
                    value={formData.source_path}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        source_path: normalizeTrackingInput(event.target.value),
                      }))
                    }
                    placeholder="tinder-offer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Wird zu: <span className="font-medium">{redirectPreviewUrl}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_url">Ziel-URL</Label>
                  <Input
                    id="target_url"
                    type="url"
                    value={formData.target_url}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        target_url: event.target.value,
                      }))
                    }
                    placeholder="https://tracking.example.com/go/..."
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Aktiv</p>
                    <p className="text-xs text-muted-foreground">
                      Deaktivierte Tracking-Links liefern keinen Redirect aus.
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        is_active: checked,
                      }))
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRedirect.isPending || updateRedirect.isPending}
                >
                  {(createRedirect.isPending || updateRedirect.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingRedirect ? "Tracking-Link speichern" : "Tracking-Link anlegen"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking-Slug</TableHead>
                <TableHead>Ziel</TableHead>
                <TableHead className="text-center">Klicks</TableHead>
                <TableHead>Letzter Klick</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Keine Tracking-Links vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                          {redirect.source_path}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyRedirectUrl(redirect.source_path)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex max-w-[280px] items-center gap-2">
                        <span className="truncate text-sm text-muted-foreground">
                          {redirect.target_url}
                        </span>
                        <a
                          href={redirect.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-mono font-semibold text-primary">
                        {redirect.clicks.toLocaleString("de-AT")}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(redirect.last_clicked_at)}
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={redirect.is_active}
                        onCheckedChange={() => handleToggleActive(redirect)}
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(redirect)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(redirect.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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

function SeoRedirectsTab() {
  const [search, setSearch] = useState("");
  const [entityTable, setEntityTable] = useState<SeoRedirectEntityTable | "all">("all");
  const [isSyncingCloudflare, setIsSyncingCloudflare] = useState(false);

  const {
    data: redirects = [],
    isLoading,
    refetch,
    isFetching,
  } = useSeoRedirects({
    includeInactive: true,
    entityTable,
    search,
  });

  const updateSeoRedirect = useUpdateSeoRedirect();
  const deleteSeoRedirect = useDeleteSeoRedirect();

  const activeRedirectCount = useMemo(
    () => redirects.filter((redirect) => redirect.is_active).length,
    [redirects],
  );

  const automaticRedirectCount = useMemo(
    () => redirects.filter((redirect) => redirect.is_automatic).length,
    [redirects],
  );

  async function handleToggleLocked(redirect: SeoRedirect) {
    try {
      await updateSeoRedirect.mutateAsync({
        id: redirect.id,
        input: { is_locked: !redirect.is_locked },
      });

      toast({
        title: redirect.is_locked ? "SEO-Redirect entsperrt" : "SEO-Redirect gesperrt",
        description: redirect.is_locked
          ? "Die DB-Automatik darf diesen Eintrag wieder überschreiben."
          : "Dieser Eintrag ist jetzt vor automatischen Überschreibungen geschützt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Lock-Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteSeoRedirect(redirect: SeoRedirect) {
    const confirmed = window.confirm(
      `SEO-Redirect wirklich löschen?

${redirect.source_path} -> ${redirect.target_path}

Nur löschen, wenn dieser Eintrag wirklich ein Versehen war und nicht indexiert wurde.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSeoRedirect.mutateAsync(redirect.id);
      toast({
        title: "SEO-Redirect gelöscht",
        description: "Der Eintrag wurde vollständig entfernt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "SEO-Redirect konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  }

  async function handleCloudflareSync() {
    setIsSyncingCloudflare(true);

    try {
      const { data, error } = await supabase.functions.invoke("cloudflare-sync");

      if (error) {
        throw error;
      }

      if (!data?.success) {
        if (data?.in_progress) {
          toast({
            title: "Cloudflare-Sync blockiert",
            description: data?.message || `Es läuft bereits eine Bulk-Operation (${data?.status || "pending"}).`,
            variant: "destructive",
          });
          return;
        }

        throw new Error(data?.error || data?.message || "Cloudflare-Sync konnte nicht gestartet werden.");
      }

      toast({
        title: "Cloudflare synchronisiert",
        description: `${data.exported_count ?? 0} Redirects exportiert. Operation-ID: ${data.operation_id ?? "unbekannt"}.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Cloudflare-Sync konnte nicht ausgeführt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingCloudflare(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-display text-xl">SEO-Redirects</CardTitle>
              <CardDescription>
                Diese Einträge werden automatisch durch Supabase Trigger erzeugt, sobald sich Slugs in <code>categories</code> oder <code>projects</code> ändern.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Aktualisieren
              </Button>
              <Button
                className="gap-2"
                onClick={handleCloudflareSync}
                disabled={redirects.length === 0 || isSyncingCloudflare}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingCloudflare ? "animate-spin" : ""}`} />
                Mit Cloudflare synchronisieren
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="border-border/60 shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{redirects.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{activeRedirectCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Automatisch</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{automaticRedirectCount}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nach Quelle oder Ziel suchen..."
                className="pl-9"
              />
            </div>

            <div className="flex rounded-xl border border-input bg-background p-1">
              {(["all", "categories", "projects"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEntityTable(value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    entityTable === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value === "all" ? "Alle" : value}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quelle</TableHead>
                  <TableHead>Ziel</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Locked</TableHead>
                  <TableHead>Aktualisiert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      Keine SEO-Redirects gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  redirects.map((redirect) => (
                    <TableRow key={redirect.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                          {redirect.source_path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                          {redirect.target_path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit capitalize">
                            {redirect.entity_table}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{redirect.entity_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{redirect.redirect_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={redirect.is_active ? "default" : "secondary"}>
                            {redirect.is_active ? "aktiv" : "inaktiv"}
                          </Badge>
                          <Badge variant={redirect.is_automatic ? "outline" : "secondary"}>
                            {redirect.is_automatic ? "automatisch" : "manuell"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleToggleLocked(redirect)}
                          disabled={updateSeoRedirect.isPending}
                        >
                          {redirect.is_locked ? (
                            <>
                              <Lock className="h-4 w-4" />
                              Locked
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4" />
                              Offen
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(redirect.updated_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSeoRedirect(redirect)}
                            disabled={deleteSeoRedirect.isPending}
                            className="text-destructive hover:text-destructive"
                            title="SEO-Redirect löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminRedirects() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Redirect-Management</h2>
        <p className="text-muted-foreground">
          Affiliate-Tracking bleibt getrennt von echten SEO-301-Weiterleitungen.
        </p>
      </div>

      <Tabs defaultValue="tracking-links" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking-links">Tracking-Links</TabsTrigger>
          <TabsTrigger value="seo-redirects">SEO-Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking-links">
          <TrackingLinksTab />
        </TabsContent>

        <TabsContent value="seo-redirects">
          <SeoRedirectsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
