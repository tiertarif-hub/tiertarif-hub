import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Trophy, Star, TrendingUp, Zap, Globe, Shield, Heart, Gamepad2, Bot, Briefcase, ShoppingCart, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";
import { useCategories, type Category } from "@/hooks/useCategories";
import { getCategoriesRoute, normalizeNavigableHref } from "@/lib/routes";

// Icon Mapping für Admin-Typen
const getIcon = (type: string | undefined) => {
  switch (type) {
    case 'trending': return <TrendingUp className="w-6 h-6 text-white" />;
    case 'trophy': return <Trophy className="w-6 h-6 text-white" />;
    case 'star': return <Star className="w-6 h-6 text-white" />;
    case 'zap': return <Zap className="w-6 h-6 text-white" />;
    case 'globe': return <Globe className="w-6 h-6 text-white" />;
    case 'shield': return <Shield className="w-6 h-6 text-white" />;
    case 'heart': return <Heart className="w-6 h-6 text-white" />;
    case 'game': return <Gamepad2 className="w-6 h-6 text-white" />;
    case 'bot': return <Bot className="w-6 h-6 text-white" />;
    case 'briefcase': return <Briefcase className="w-6 h-6 text-white" />;
    case 'cart': return <ShoppingCart className="w-6 h-6 text-white" />;
    case 'edu': return <GraduationCap className="w-6 h-6 text-white" />;
    default: return <TrendingUp className="w-6 h-6 text-white" />;
  }
};

// --- KYRA PREMIUM IMAGES (Elite-Fallback falls Admin-Feld leer ist) ---
const CATEGORY_IMAGES: Record<string, string> = {
  "Finanzen & Krypto": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop",
  "Love & Dating": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop",
  "Apps & Gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
  "KI & Software": "https://images.unsplash.com/photo-1620712943543-bcc4628c9759?q=80&w=1200&auto=format&fit=crop",
  "Dienstleistungen": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
  "Produkttests": "https://images.unsplash.com/photo-1526170315873-3a56162820cf?q=80&w=1200&auto=format&fit=crop",
  "Haus & Energie": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop",
  "Wissen & Karriere": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop"
};

const getThemeClasses = (theme: string | undefined) => {
  switch (theme) {
    case 'gold': return { gradient: "from-amber-500 to-amber-700", border: "group-hover:border-amber-500/50" };
    case 'dark': return { gradient: "from-slate-700 to-slate-900", border: "group-hover:border-slate-500/50" };
    case 'blue':
    default: return { gradient: "from-blue-600 to-blue-800", border: "group-hover:border-blue-500/50" };
  }
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
  { id: "v1", title: "Versicherungen", desc: "Tarife, Leistungen und Policen im Überblick.", link: getCategoriesRoute(), button_text: "Vergleichen", theme: "blue", image_url: "", icon: "shield" },
  { id: "f1", title: "Finanzen & Krypto", desc: "Broker, Kredite und Finanzthemen im Überblick.", link: getCategoriesRoute(), button_text: "Vergleichen", theme: "gold", image_url: "", icon: "trending" },
  { id: "s1", title: "KI & Software", desc: "Tools und Softwarelösungen im Überblick.", link: getCategoriesRoute(), button_text: "Tools finden", theme: "dark", image_url: "", icon: "bot" }
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
  const finalUrl = url && url.trim() !== "" ? url : (CATEGORY_IMAGES[title] || "");
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

    if (parsed.pathname.includes("/storage/v1/object/public/")) {
      parsed.pathname = parsed.pathname.replace("/object/public/", "/render/image/public/");
      parsed.searchParams.set("width", String(width));
      parsed.searchParams.set("quality", String(quality));
      return parsed.toString();
    }

    if (parsed.pathname.includes("/storage/v1/render/image/public/")) {
      parsed.searchParams.set("width", String(width));
      parsed.searchParams.set("quality", String(quality));
      return parsed.toString();
    }
  } catch {
    return finalUrl;
  }

  return finalUrl;
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
        behavior: "smooth"
      });
      return;
    }

    const isAtStart = slider.scrollLeft <= tolerance;
    slider.scrollTo({
      left: isAtStart ? maxScrollLeft : Math.max(slider.scrollLeft - distance, 0),
      behavior: "smooth"
    });
  };

  return (
    <section id="bereiche" className="py-24 md:py-28 relative overflow-hidden bg-white">
      <style>{`
        .standard-portal-category-slider {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .standard-portal-category-slider::-webkit-scrollbar {
          display: none;
        }

        .standard-portal-category-card {
          flex: 0 0 84%;
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

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-14 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6 tracking-tight">
            {content.big_three.headline}
          </h2>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          <button
            type="button"
            onClick={() => scrollSlider("prev")}
            className="hidden lg:flex absolute -left-5 top-1/2 z-20 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-x-0.5 hover:bg-secondary hover:text-white hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
            aria-label="Vorherige Vergleichskategorie anzeigen"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={sliderRef}
            className="standard-portal-category-slider flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory overscroll-x-contain"
            aria-label="Vergleichskategorien"
          >
            {items.map((item) => {
              const theme = getThemeClasses(item.theme);
              const imageUrl = getOptimizedImageUrl(item.image_url, item.title, 960, 78);

              return (
                <Link 
                  key={item.id} 
                  to={normalizeNavigableHref(item.link)}
                  className={`standard-portal-category-card group relative aspect-[16/9] min-h-[370px] sm:min-h-[388px] md:min-h-[400px] lg:min-h-[368px] xl:min-h-[388px] flex flex-col justify-between bg-slate-900 rounded-3xl p-6 md:p-7 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 overflow-hidden snap-start ${theme.border}`}
                >
                  <div
                    className="absolute inset-0 z-0 overflow-hidden rounded-3xl transform-gpu"
                    style={{
                      clipPath: "inset(0 round 1.5rem)",
                      WebkitClipPath: "inset(0 round 1.5rem)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden"
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 transform-gpu"
                      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/48 to-slate-900/12" />
                    <div className={`absolute inset-0 opacity-10 mix-blend-overlay bg-gradient-to-br ${theme.gradient}`} />
                  </div>

                  <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {getIcon(item.icon)}
                  </div>

                  <div className="relative z-10 space-y-3">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-secondary transition-colors drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-white text-sm leading-relaxed font-semibold drop-shadow-md line-clamp-2">
                      {item.desc}
                    </p>
                    
                    <div className="pt-2 flex items-center gap-3 text-xs md:text-sm font-bold text-white uppercase tracking-wider group-hover:gap-4 transition-all">
                      <span>{item.button_text}</span>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-secondary transition-colors border border-white/20">
                          <ChevronRight className="w-4 h-4" />
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
            className="hidden lg:flex absolute -right-5 top-1/2 z-20 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-lg shadow-slate-900/10 transition-all duration-300 hover:translate-x-0.5 hover:bg-secondary hover:text-white hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
            aria-label="Nächste Vergleichskategorie anzeigen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="pointer-events-none absolute inset-y-0 right-4 w-10 bg-gradient-to-l from-white to-transparent md:right-0 md:w-14" />
        </div>
      </div>
    </section>
  );
};
