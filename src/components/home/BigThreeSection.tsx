import { useMemo, useRef } from "react";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Globe,
  GraduationCap,
  Heart,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";
import { useCategories, type Category } from "@/hooks/useCategories";
import { getCategoriesRoute, normalizeNavigableHref } from "@/lib/routes";

// Icon Mapping für Admin-Typen
const getIcon = (type: string | undefined) => {
  switch (type) {
    case "trending": return <TrendingUp className="h-6 w-6" />;
    case "trophy": return <Trophy className="h-6 w-6" />;
    case "star": return <Star className="h-6 w-6" />;
    case "zap": return <Zap className="h-6 w-6" />;
    case "globe": return <Globe className="h-6 w-6" />;
    case "shield": return <Shield className="h-6 w-6" />;
    case "heart": return <Heart className="h-6 w-6" />;
    case "game": return <Gamepad2 className="h-6 w-6" />;
    case "bot": return <Bot className="h-6 w-6" />;
    case "briefcase": return <Briefcase className="h-6 w-6" />;
    case "cart": return <ShoppingCart className="h-6 w-6" />;
    case "edu": return <GraduationCap className="h-6 w-6" />;
    default: return <Shield className="h-6 w-6" />;
  }
};

// Helle TierTarif-Fallbacks, falls Admin-Feld leer ist.
const DEFAULT_CATEGORY_IMAGE = "/big-threes/tiertarif-tierversicherung-startseitenbild.webp";

// MARKUS-HINWEIS: Hier kannst du die Bild-/Kartenhöhe selbst feinjustieren.
// Bildhöhe ändern: z. B. "h-60 sm:h-64 lg:h-72" für noch höhere Bilder.
// Kartenhöhe ändern: z. B. "min-h-[590px]" für insgesamt höhere Cards.
const CATEGORY_IMAGE_HEIGHT_CLASS = "h-56 sm:h-60 lg:h-64";
const CATEGORY_CARD_MIN_HEIGHT_CLASS = "min-h-[560px]";

const CATEGORY_IMAGES: Record<string, string> = {
  "Versicherungen": "/big-threes/tiertarif-versicherungen-startseitenbild.webp",
  "Tierversicherungen": "/big-threes/tiertarif-versicherungen-startseitenbild.webp",
  "Hunde": DEFAULT_CATEGORY_IMAGE,
  "Hundeschutz": DEFAULT_CATEGORY_IMAGE,
  "Hundekrankenversicherung": DEFAULT_CATEGORY_IMAGE,
  "Katzen": DEFAULT_CATEGORY_IMAGE,
  "Katzenschutz": DEFAULT_CATEGORY_IMAGE,
  "Katzenversicherung": DEFAULT_CATEGORY_IMAGE,
  "Pferde": DEFAULT_CATEGORY_IMAGE,
  "Pferdeversicherung": DEFAULT_CATEGORY_IMAGE,
  "OP-Schutz": DEFAULT_CATEGORY_IMAGE,
  "Tier-OP-Versicherung": DEFAULT_CATEGORY_IMAGE,
  "Hunde-OP-Versicherung": DEFAULT_CATEGORY_IMAGE,
  "Katzen-OP-Versicherung": DEFAULT_CATEGORY_IMAGE,
  "Forum": "/big-threes/tiertarif-forum-magazin-hero.webp",
};

type BigThreeItem = {
  id?: string;
  title: string;
  desc?: string;
  link?: string;
  button_text?: string;
  theme?: string;
  image_url?: string;
  icon?: string;
};

const fallbackItems: BigThreeItem[] = [
  {
    id: "v1",
    title: "Tierversicherungen",
    desc: "Leistungen, Kosten und Erstattung für Hund und Katze sachlich prüfen.",
    link: getCategoriesRoute(),
    button_text: "Vergleiche ansehen",
    theme: "tiertarif",
    image_url: "/big-threes/tiertarif-versicherungen-startseitenbild.webp",
    icon: "shield",
  },
  {
    id: "h1",
    title: "Hundeschutz",
    desc: "Krankenversicherung, OP-Schutz und Selbstbeteiligung übersichtlich einordnen.",
    link: getCategoriesRoute(),
    button_text: "Hundetarife prüfen",
    theme: "tiertarif",
    image_url: "/big-threes/tiertarif-tierversicherung-startseitenbild.webp",
    icon: "heart",
  },
  {
    id: "k1",
    title: "Katzenschutz",
    desc: "FORL, Zahn-OP, Wartezeiten und Erstattungsgrenzen besser verstehen.",
    link: getCategoriesRoute(),
    button_text: "Katzentarife prüfen",
    theme: "tiertarif",
    image_url: "/big-threes/tiertarif-tierversicherung-startseitenbild.webp",
    icon: "star",
  },
];

const toCleanSlug = (value: string | null | undefined) => {
  return String(value ?? "")
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
};

const getHubSlugFromItemLink = (link: string | null | undefined) => {
  return toCleanSlug(normalizeNavigableHref(link, ""));
};

const getHubChildSlugs = (hub: Category) => {
  return String(hub.custom_css ?? "")
    .split(",")
    .map(toCleanSlug)
    .filter(Boolean);
};

const hubHasActiveComparisonChildren = (hub: Category, categoriesBySlug: Map<string, Category>) => {
  const childSlugs = getHubChildSlugs(hub);

  if (childSlugs.length === 0) {
    return false;
  }

  return childSlugs.some((childSlug) => {
    const child = categoriesBySlug.get(childSlug);
    return Boolean(child?.is_active && child.template === "comparison");
  });
};

const getOptimizedImageUrl = (url: string | undefined, title: string, width = 720, quality = 75) => {
  const finalUrl = url && url.trim() !== "" ? url.trim() : (CATEGORY_IMAGES[title] || DEFAULT_CATEGORY_IMAGE);
  if (!finalUrl) return "";

  try {
    const parsed = new URL(finalUrl);

    if (parsed.hostname.includes("images.unsplash.com")) {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", String(quality));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    }

    if (parsed.pathname.includes("/storage/v1/render/image/public/")) {
      parsed.pathname = parsed.pathname.replace("/render/image/public/", "/object/public/");
      parsed.searchParams.delete("width");
      parsed.searchParams.delete("quality");
      return parsed.toString();
    }

    if (parsed.pathname.includes("/storage/v1/object/public/")) {
      return parsed.toString();
    }
  } catch {
    return finalUrl;
  }

  return finalUrl;
};

const getChecklistItems = (item: BigThreeItem) => {
  const haystack = `${item.title} ${item.desc ?? ""}`.toLowerCase();

  if (haystack.includes("katze") || haystack.includes("forl")) {
    return ["Zahn-OP & FORL prüfen", "Wartezeiten beachten", "Erstattung einordnen"];
  }

  if (haystack.includes("hund")) {
    return ["OP-Kosten prüfen", "Selbstbeteiligung beachten", "Nachsorge einordnen"];
  }

  if (haystack.includes("op")) {
    return ["Narkose & OP-Leistung prüfen", "Grenzen beachten", "Nachsorge vergleichen"];
  }

  return ["Leistungsumfang prüfen", "Kosten transparent einordnen", "Ausschlüsse beachten"];
};

export const BigThreeSection = () => {
  const { content } = useHomeContent();
  const { data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError } = useCategories();
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const rawItems = useMemo<BigThreeItem[]>(() => {
    const cmsItems = content?.big_three?.items || [];
    return cmsItems.length > 0 ? cmsItems : fallbackItems;
  }, [content?.big_three?.items]);

  const categoriesBySlug = useMemo(() => {
    return new Map(categories.map((category) => [category.slug.toLowerCase(), category]));
  }, [categories]);

  const items = useMemo(() => {
    const canFilterByHubState = !isCategoriesLoading && !isCategoriesError && categoriesBySlug.size > 0;

    if (!canFilterByHubState) {
      return rawItems;
    }

    return rawItems.filter((item) => {
      const hubSlug = getHubSlugFromItemLink(item.link);
      const hub = categoriesBySlug.get(hubSlug);

      if (!hub || !hub.is_active || hub.template !== "hub_overview") {
        return false;
      }

      return hubHasActiveComparisonChildren(hub, categoriesBySlug);
    });
  }, [categoriesBySlug, isCategoriesError, isCategoriesLoading, rawItems]);

  if (!content || items.length === 0) return null;

  const scrollSlider = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    const firstCard = slider.querySelector<HTMLElement>(".standard-portal-category-card");
    const sliderStyles = window.getComputedStyle(slider);
    const gap = parseFloat(sliderStyles.columnGap || sliderStyles.gap || "0") || 0;
    const distance = firstCard ? firstCard.offsetWidth + gap : Math.max(slider.clientWidth / 3, 320);
    const tolerance = 8;

    if (direction === "next") {
      const isAtEnd = slider.scrollLeft >= maxScrollLeft - tolerance;

      slider.scrollTo({
        left: isAtEnd ? 0 : Math.min(slider.scrollLeft + distance, maxScrollLeft),
        behavior: "smooth",
      });
      return;
    }

    const isAtStart = slider.scrollLeft <= tolerance;
    slider.scrollTo({
      left: isAtStart ? maxScrollLeft : Math.max(slider.scrollLeft - distance, 0),
      behavior: "smooth",
    });
  };

  return (
    <section id="schwerpunkte" className="relative overflow-hidden scroll-mt-[88px] bg-white py-20 md:py-28">
      <span id="bereiche" className="absolute -top-24" aria-hidden="true" />
      <style>{`
        .standard-portal-category-slider {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .standard-portal-category-slider::-webkit-scrollbar {
          display: none;
        }

        .standard-portal-category-card {
          flex: 0 0 86%;
        }

        @media (min-width: 640px) {
          .standard-portal-category-card {
            flex-basis: 420px;
          }
        }

        @media (min-width: 768px) {
          .standard-portal-category-card {
            flex-basis: calc((100% - 1.5rem) / 2);
          }
        }

        @media (min-width: 1024px) {
          .standard-portal-category-card {
            flex-basis: calc((100% - 3rem) / 3);
          }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute right-[-8rem] top-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute left-[-8rem] bottom-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            <Shield className="h-4 w-4" />
            Vergleichsbereiche
          </div>
          <h2 className="text-4xl font-display font-extrabold tracking-tight text-primary md:text-5xl">
            {content.big_three.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground">
            Wähle den passenden Bereich und prüfe Leistungen, Kostenpunkte und Bedingungen strukturiert.
          </p>
        </div>

        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          <button
            type="button"
            onClick={() => scrollSlider("prev")}
            className="tt-coral-shine absolute -left-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-secondary-foreground transition-all duration-300 hover:-translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-primary/30 lg:flex"
            aria-label="Vorherige Vergleichskategorie anzeigen"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={sliderRef}
            className="standard-portal-category-slider flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 scroll-smooth overscroll-x-contain"
            aria-label="Vergleichskategorien"
          >
            {items.map((item) => {
              const imageUrl = getOptimizedImageUrl(item.image_url, item.title, 700, 76);
              const checklistItems = getChecklistItems(item);

              return (
                <Link
                  key={item.id}
                  to={normalizeNavigableHref(item.link)}
                  className={`standard-portal-category-card tt-glass-card group relative flex ${CATEGORY_CARD_MIN_HEIGHT_CLASS} snap-start flex-col overflow-hidden rounded-[1.75rem] border border-secondary/20 p-0 transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/15`}
                >
                  {imageUrl && (
                    <div className={`relative mb-0 ${CATEGORY_IMAGE_HEIGHT_CLASS} overflow-hidden rounded-t-[1.75rem] bg-secondary/5`}>
                      <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = CATEGORY_IMAGES[item.title] || DEFAULT_CATEGORY_IMAGE;
                        }}
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-primary shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-secondary group-hover:text-secondary-foreground">
                          {getIcon(item.icon)}
                        </span>
                        <h3 className="min-w-0 text-2xl font-display font-extrabold leading-tight text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-secondary transition-all duration-300 group-hover:border-secondary/35 group-hover:bg-secondary/15">
                        Prüfen
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm font-medium leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {["Leistung", "Kosten", "Bedingung"].map((metric) => (
                        <span key={metric} className="rounded-xl border border-secondary/20 bg-secondary/5 px-2 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider text-primary">
                          {metric}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 space-y-3">
                      {checklistItems.map((point) => (
                        <div key={point} className="flex items-center gap-3 text-sm font-bold text-foreground">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-7">
                      <div className="tt-teal-shine flex items-center justify-between rounded-2xl px-5 py-4 text-primary-foreground">
                        <span className="text-sm font-extrabold uppercase tracking-wider">
                          {item.button_text}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-white ring-1 ring-white/15 transition-all group-hover:translate-x-1 group-hover:bg-secondary">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollSlider("next")}
            className="tt-coral-shine absolute -right-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-secondary-foreground transition-all duration-300 hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-primary/30 lg:flex"
            aria-label="Nächste Vergleichskategorie anzeigen"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="pointer-events-none absolute inset-y-0 right-4 w-10 bg-gradient-to-l from-white to-transparent md:right-0 md:w-14" />
        </div>
      </div>
    </section>
  );
};
