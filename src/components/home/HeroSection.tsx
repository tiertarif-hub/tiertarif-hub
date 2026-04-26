import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useHomeContent } from "@/hooks/useSettings";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Heart,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";

const calculatorFields = [
  { label: "Tierart", value: "Hund oder Katze", icon: Heart },
  { label: "Alter", value: "Welpe, erwachsen, Senior", icon: Activity },
  { label: "Schutzart", value: "Kranken- oder OP-Schutz", icon: ShieldCheck },
  { label: "Prüffokus", value: "Wartezeit, Erstattung, Selbstbeteiligung", icon: ClipboardCheck },
];

const trustItems = [
  "Tarife sachlich prüfen",
  "Keine Anbieter-Versprechen",
  "Wartezeiten & Selbstbeteiligung beachten",
  "Für Hunde & Katzen",
];

const isLegacyHeroText = (value: string | undefined, legacyNeedles: string[]) => {
  const normalized = String(value ?? "").toLowerCase();

  return !normalized || legacyNeedles.some((needle) => normalized.includes(needle.toLowerCase()));
};

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { content } = useHomeContent();
  const { data: searchResults = [], isLoading: isSearching } = useGlobalSearch(searchQuery);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!content) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/kategorien?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      return;
    }

    toast.error("Bitte gib einen Suchbegriff ein.");
  };

  const heroTitle = isLegacyHeroText(content.hero?.title, [
    "Vergleiche, Rechner",
    "zentraler Vergleichs-Hub",
    "Tools",
    "Software",
  ])
    ? "Tierversicherung vergleichen"
    : content.hero?.title;

  const heroSubtitle = isLegacyHeroText(content.hero?.subtitle, [
    "zahlreiche Anbieter",
    "Tools",
    "Software",
    "Lifestyle",
    "Erfolg",
  ])
    ? "Prüfe Leistungen, Kosten, Wartezeiten und Erstattung sachlich für Hund, Katze und OP-Schutz."
    : content.hero?.subtitle;

  const badgeText = content.hero?.badge || "TierTarif Vergleichsportal";
  const searchPlaceholder = content.hero?.search_placeholder || "Hund, Katze oder OP-Versicherung suchen";
  const searchButtonLabel = content.hero?.search_label || "Vergleich starten";

  const showDropdown = isSearchFocused && searchQuery.length >= 2;
  const heroStats = Array.isArray(content.hero?.stats) && content.hero.stats.length > 0
    ? content.hero.stats.slice(0, 3)
    : [
        { title: "Transparent", label: "Leistungen prüfen" },
        { title: "Sachlich", label: "Kosten einordnen" },
        { title: "Sicher", label: "Wartezeiten beachten" },
      ];

  return (
    <section className="relative overflow-hidden bg-[#F8F5EE] pt-28 md:pt-40">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(rgba(11,75,69,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(11,75,69,0.045)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[#D8E5E1]/50 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pb-14 md:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D8E5E1] text-primary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              {badgeText}
            </div>

            <h1 className="max-w-3xl text-4xl font-display font-extrabold leading-[1.04] tracking-tight text-primary md:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
              {heroSubtitle}
            </p>

            <div ref={searchRef} className="relative z-30 mt-8 max-w-2xl">
              <form
                onSubmit={handleSearch}
                className="group relative flex flex-col gap-3 rounded-[1.7rem] border border-border bg-white p-2 shadow-xl shadow-primary/10 transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-2xl focus-within:shadow-primary/15 sm:flex-row"
              >
                <div className="flex h-14 flex-1 items-center px-4">
                  <Search className="mr-3 h-5 w-5 shrink-0 text-primary/60" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="h-full border-none bg-transparent p-0 text-base font-semibold text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 md:text-lg"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                  {isSearching && <Loader2 className="ml-2 h-5 w-5 animate-spin text-primary" />}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 rounded-2xl bg-primary px-7 text-base font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-[#063A36] hover:shadow-primary/30 sm:rounded-[1.25rem]"
                >
                  {searchButtonLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-4 overflow-hidden rounded-2xl border border-border bg-white text-left shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
                  {searchResults.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          to={result.url}
                          onClick={() => setIsSearchFocused(false)}
                          className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-muted"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            {result.icon || "🔍"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                              {result.title}
                            </h4>
                            {result.subtitle && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                        </Link>
                      ))}
                    </div>
                  ) : !isSearching && searchQuery.length >= 2 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Keine Treffer für <span className="font-bold text-foreground">"{searchQuery}"</span>
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <div
                  key={`${stat.title}-${stat.label}-${index}`}
                  className="rounded-2xl border border-[#D8E5E1] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="text-sm font-extrabold text-primary">{stat.title}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.4rem] bg-[#D8E5E1]/55 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#D8E5E1] bg-white p-5 shadow-2xl shadow-primary/10 md:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Vergleichsrechner</p>
                  <h2 className="mt-2 text-2xl font-display font-extrabold text-primary md:text-3xl">
                    Schutz passend eingrenzen
                  </h2>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#F8F5EE] p-2">
                {["1. Tier", "2. Schutz", "3. Ergebnis"].map((step) => (
                  <div key={step} className="rounded-xl border border-[#D8E5E1] bg-white px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-primary">
                    {step}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {calculatorFields.map((field) => {
                  const Icon = field.icon;

                  return (
                    <button
                      key={field.label}
                      type="button"
                      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted hover:shadow-md"
                      aria-label={`${field.label}: ${field.value}`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-border transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {field.label}
                        </span>
                        <span className="mt-1 block text-sm font-extrabold text-foreground md:text-base">
                          {field.value}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-[#D8E5E1] bg-[#F8F5EE] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-primary/70">Simulation</div>
                    <p className="mt-1 text-lg font-display font-extrabold text-primary">
                      3 passende Prüfbereiche gefunden
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-primary shadow-sm">
                    neutral
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#063A36] p-5 text-primary-foreground">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-extrabold">Nächster Schritt</div>
                    <p className="mt-1 text-sm text-primary-foreground/75">
                      Kategorie wählen und Leistungsdetails prüfen.
                    </p>
                  </div>
                  <Button asChild className="bg-white text-primary hover:bg-[#F8F5EE]">
                    <Link to="/kategorien">Starten</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-muted/60 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  Fokus auf Leistungen, Ausschlüsse, Wartezeiten und Kosten — ohne reißerische Versprechen.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-primary/10 bg-white p-4 shadow-lg shadow-primary/5 md:mt-14">
          <div className="grid gap-3 md:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#EFF6F3] px-4 py-3 text-sm font-bold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
