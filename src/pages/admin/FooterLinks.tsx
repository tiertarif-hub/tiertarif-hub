import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Settings } from "lucide-react";

export default function AdminFooterLinks() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">Footer-Links deaktiviert</CardTitle>
              <CardDescription>
                Dieses alte Modul verwendet die nicht vorhandene Tabelle <code>popular_footer_links</code>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Für TierTarif wird der Footer zentral über <strong>Einstellungen</strong> gepflegt. Dadurch entstehen keine
            unnötigen Supabase-404-Anfragen mehr und es gibt nur noch eine saubere Quelle für Footer-Inhalte.
          </p>
          <Button asChild className="gap-2">
            <Link to="/admin/settings">
              <Settings className="h-4 w-4" />
              Zu den Footer-Einstellungen
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
