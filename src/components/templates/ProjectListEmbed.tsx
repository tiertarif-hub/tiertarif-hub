import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectWithCategory } from "@/hooks/useProjects";
import { sanitizeCmsHtml } from "@/lib/sanitizeHtml";
import { ExternalLink, CheckCircle2, Award, ShieldCheck } from "lucide-react";

interface ProjectListEmbedProps {
  projects: ProjectWithCategory[];
  categoryName?: string;
  theme?: string;
}

export default function ProjectListEmbed({
  projects,
  categoryName = "",
  theme = "DATING",
}: ProjectListEmbedProps) {
  const getThemeClasses = (t: string) => {
    switch (t) {
      case "DATING":
        return {
          bg: "bg-dating/10",
          text: "text-dating",
          button: "bg-dating hover:bg-dating/90",
        };
      case "CASINO":
        return {
          bg: "bg-casino/10",
          text: "text-casino",
          button: "bg-casino hover:bg-casino/90",
        };
      case "ADULT":
        return {
          bg: "bg-adult/10",
          text: "text-adult",
          button: "bg-adult hover:bg-adult/90",
        };
      default:
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          button: "bg-primary hover:bg-primary/90",
        };
    }
  };

  const themeClasses = getThemeClasses(theme);

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Experten-Auswahl {new Date().getFullYear()}
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Top {projects.length} Anbieter für dich
          </h2>
          {categoryName && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unsere Redaktion hat Anbieter für {categoryName} strukturiert
              aufbereitet.
            </p>
          )}
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {projects.map((project, index) => {
            const editorialBadge =
              project.badge_text ||
              (index === 0 ? "Top-Empfehlung" : index < 3 ? "Beliebt" : "Redaktionell sortiert");

            return (
              <div
                key={project.id}
                className={`group relative bg-card border rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 shadow-md ${
                  index === 0
                    ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "border-border/80"
                }`}
              >
                <div
                  className={`absolute -left-3 -top-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  #{index + 1}
                </div>

                {index === 0 && (
                  <div className="absolute -right-2 -top-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg shadow-amber-500/25">
                      🏆 Top-Empfehlung
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-shrink-0">
                    {project.logo_url ? (
                      <img
                        src={project.logo_url}
                        alt={project.name}
                        className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl bg-white p-2 shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-xl ${themeClasses.bg} flex items-center justify-center shadow-inner`}
                      >
                        <span className="text-2xl md:text-3xl">💕</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-100">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-semibold text-xs uppercase tracking-wide">
                          {editorialBadge}
                        </span>
                      </div>
                    </div>

                    {project.short_description && (
                      <p className="text-muted-foreground text-sm mb-3">
                        {project.short_description}
                      </p>
                    )}

                    {project.description && (
                      <div className="mt-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed text-left">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeCmsHtml(project.description),
                          }}
                        />
                      </div>
                    )}

                    {project.pros_list && project.pros_list.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.pros_list.slice(0, 3).map((pro, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-full border border-green-500/20"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {pro}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Link to={`/go/${project.slug}`}>
                      <Button
                        className={`w-full md:w-auto gap-2 shadow-lg ${
                          index === 0
                            ? `${themeClasses.button} text-white shadow-primary/25`
                            : ""
                        }`}
                      >
                        Jetzt testen
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    {project.badge_text && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        {project.badge_text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
