import { useState, useRef, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";
import { useProjects, type ProjectWithCategory } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";

// KYRA UPDATE: Prop für dynamischen CMS-Text hinzugefügt
export function SearchBar({ placeholder }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: projects = [] } = useProjects();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredProjects = query.length >= 2
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
        project.short_description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Icon ist jetzt Orange */}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-hover:scale-110 transition-transform duration-300" />
        <Input
          type="text"
          // KYRA FIX: Dynamischer Placeholder aus Admin Settings (mit deinem Fallback)
          placeholder={placeholder || "Suche nach Portalen, Apps oder Kategorien..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          // Focus Ring & Caret in Orange
          className="w-full h-14 pl-12 pr-4 text-lg bg-muted/30 border-border/50 rounded-xl focus:border-secondary focus:ring-secondary/20 focus:bg-white transition-all duration-300 caret-secondary placeholder:text-muted-foreground/70"
        />
      </div>

      {isOpen && filteredProjects.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border/50 rounded-xl shadow-xl shadow-primary/5 overflow-hidden z-50 animate-fade-in">
          {filteredProjects.map((project) => (
            <SearchResultItem key={project.id} project={project} onClose={() => setIsOpen(false)} />
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && filteredProjects.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border/50 rounded-xl shadow-xl shadow-primary/5 p-6 text-center z-50 animate-fade-in">
          <p className="text-muted-foreground">Keine Ergebnisse gefunden für "<span className="text-secondary font-medium">{query}</span>"</p>
        </div>
      )}
    </div>
  );
}

function SearchResultItem({ project, onClose }: { project: ProjectWithCategory; onClose: () => void }) {
  // Wir nutzen hier globale Theme-Farben, aber Hover ist immer Secondary
  return (
    <a
      href={`/go/${project.slug}`}
      onClick={onClose}
      className="flex items-center gap-4 p-4 hover:bg-secondary/5 transition-colors border-b border-border/50 last:border-b-0 group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted text-muted-foreground group-hover:bg-secondary group-hover:text-white transition-colors`}>
        <span className="text-lg">{project.categories?.icon || "📊"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate group-hover:text-secondary transition-colors">
          {project.name}
        </h4>
        {project.short_description && (
          <p className="text-sm text-muted-foreground truncate group-hover:text-muted-foreground/80">
            {project.short_description}
          </p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
    </a>
  );
}