import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async"; 
import { useTrackView } from "@/hooks/useTrackView";
import { getCategoriesCanonicalUrl, getCategoryRoute } from "@/lib/routes";


const CATEGORY_FALLBACK_LINKS = [
  { label: "Hundekrankenversicherung", to: "/hundekrankenversicherung-vergleich" },
  { label: "Katzenversicherung", to: "/katzenversicherung-vergleich" },
  { label: "Pferde OP Versicherung", to: "/pferde-op-versicherung-vergleich" },
  { label: "Wie wir vergleichen", to: "/wie-wir-vergleichen" },
];

export default function Categories() {
  useTrackView("categories-overview", "page");

  const { data: categories = [], isLoading } = useCategories();
  const { data: projects = [] } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  const getProjectCount = (categoryId: string) => {
    return projects.filter((p) => p.category_id === categoryId && p.is_active).length;
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "DATING":
        return {
          bg: "bg-dating/10",
          border: "border-dating/20 hover:border-dating/50",
          text: "text-dating",
          gradient: "from-dating/20 to-transparent",
        };
      case "CASINO":
        return {
          bg: "bg-casino/10",
          border: "border-casino/20 hover:border-casino/50",
          text: "text-casino",
          gradient: "from-casino/20 to-transparent",
        };
      case "FINANCE":
        return {
          bg: "bg-finance/10",
          border: "border-finance/20 hover:border-finance/50",
          text: "text-finance",
          gradient: "from-finance/20 to-transparent",
        };
      case "HEALTH":
        return {
          bg: "bg-health/10",
          border: "border-health/20 hover:border-health/50",
          text: "text-health",
          gradient: "from-health/20 to-transparent",
        };
      case "SOFTWARE":
        return {
          bg: "bg-software/10",
          border: "border-software/20 hover:border-software/50",
          text: "text-software",
          gradient: "from-software/20 to-transparent",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200 hover:border-primary/50",
          text: "text-slate-600",
          gradient: "from-slate-100 to-transparent",
        };
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (!category.is_active) return false;
    if (searchQuery.trim() === "") return true;
    return (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Helmet>
        <title>TierTarif Vergleiche: Hunde, Katzen & Pferde | TierTarif</title>
        <meta name="description" content="TierTarif Vergleiche im Überblick: Hundekrankenversicherung, Katzenversicherung und Pferde OP Versicherung sachlich prüfen." />
        <link rel="canonical" href={getCategoriesCanonicalUrl()} />
      </Helmet>

      <Header />

      <main className="flex-grow pt-24 pb-16">
        <section className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Unsere Vergleiche
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Wähle einen Vergleich, um Tarifmerkmale, Kostenpunkte, Wartezeiten und Leistungen strukturiert zu prüfen.
            </p>

            <nav aria-label="Beliebte Vergleiche" className="flex flex-wrap justify-center gap-3 mb-8">
              {CATEGORY_FALLBACK_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

<div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Vergleich suchen..."
                className="pl-10 h-12 rounded-xl bg-white shadow-sm border-slate-200 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="py-20">
                <div className="flex justify-center items-center mb-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {CATEGORY_FALLBACK_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-muted-foreground mb-6">Keine Kategorien gefunden.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {CATEGORY_FALLBACK_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => {
                  const theme = getThemeClasses(category.theme);
                  const projectCount = getProjectCount(category.id);

                  return (
                    <Link 
                      key={category.id} 
                      to={getCategoryRoute(category.slug)}
                      className="group block h-full"
                    >
                      <div className={`h-full bg-white rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col ${theme.border} hover:shadow-lg`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                          <span className="text-3xl">{category.icon || "📊"}</span>
                        </div>

                        <h2 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h2>
                        
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {category.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <span className={`text-sm font-medium ${theme.text}`}>
                            {projectCount > 0 ? `${projectCount} Angebote` : "Vergleich öffnen"}
                          </span>
                          <ArrowRight className={`w-5 h-5 ${theme.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}