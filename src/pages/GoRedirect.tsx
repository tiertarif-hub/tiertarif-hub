import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  slug: string;
  name: string;
  url: string;
  is_active: boolean;
};

// Validate URL protocol
function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export default function GoRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectAndRedirect() {
      if (!slug) {
        setError("Kein Projekt angegeben.");
        setLoading(false);
        return;
      }

      // 1. Projekt laden
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("id, slug, name, url, is_active")
        .eq("slug", slug)
        .single();

      if (fetchError || !data) {
        setError("Projekt nicht gefunden.");
        setLoading(false);
        return;
      }

      setProject(data);

      if (data.is_active && data.url) {
        if (!isValidRedirectUrl(data.url)) {
          setError("Ungültige Weiterleitungs-URL.");
          setLoading(false);
          return;
        }

        // 2. Klick zählen (Wir funken an die NEUE Edge Function page-pulse!)
        try {
           await supabase.functions.invoke('page-pulse', {
             body: { pageName: slug, type: 'project' }
           });
        } catch (err) {
           console.error("Pulse Sync Failed:", err);
        }

        // 3. Weiterleitung
        setTimeout(() => {
          window.location.replace(data.url);
        }, 500); // Kurzer Delay für UX (Loading Screen sehen)
      } else {
        setLoading(false);
      }
    }

    fetchProjectAndRedirect();
  }, [slug]);

  if (loading && !error && project?.is_active) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Weiterleitung...
          </h1>
          <p className="text-muted-foreground mb-6">
            Du wirst zu <span className="font-medium text-foreground">{project?.name}</span> weitergeleitet.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ExternalLink className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h1 className="font-display font-bold text-2xl text-foreground mb-2">
          {error || "Projekt nicht verfügbar"}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {project && !project.is_active
            ? "Dieses Projekt ist derzeit nicht aktiv."
            : "Der angeforderte Link konnte nicht gefunden werden."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/categories">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Alle Kategorien
            </Button>
          </Link>
          <Link to="/">
            <Button className="gap-2">
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}