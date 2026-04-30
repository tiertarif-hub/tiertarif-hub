import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getCategoryComparisonRoute, getCategoryRoute } from "@/lib/routes";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";
import type { Category } from "@/hooks/useCategories";

const BRAND_BLUE = "#0E1F53";
const BRAND_ORANGE = "#FF8400";
const ALL_COMPARISONS_ROUTE = "/alle-vergleiche-im-ueberblick";
const MAX_HOME_COMPARISONS = 12;

const EXCLUDED_HOME_HUB_SLUGS = new Set([
  "apps-gaming",
  "ki-software",
  "finanzen-krypto",
  "haus-energie",
  "internet-tarife",
  "versicherungen",
  "kategorien",
  "forum",
  "ratgeber",
  "tools",
  "kontakt",
  "wie-wir-vergleichen",
]);

const COMPARISON_SIGNAL_PATTERN =
  /(vergleich|vergleichen|tarif|tarife|anbieter|versicherung|kredit|finanzierung|strom|gas|dsl|glasfaser|internet|konto|karte|karten|bu|pkv|gkv|krank|op|schutz|leasing)/i;

type HomeComparisonSliderProps = {
  categories: Category[];
  isLoading?: boolean;
  title?: string | null;
  subtitle?: string | null;
};

type HomeComparisonCategory = Pick<
  Category,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "template"
  | "sort_order"
  | "meta_title"
  | "meta_description"
  | "h1_title"
  | "comparison_title"
  | "button_text"
  | "card_image_url"
  | "hero_image_url"
> &
  Partial<Pick<Category, "hero_headline" | "site_name">>;

function stripHtml(value?: string | null): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isConcreteComparisonCategory(category: HomeComparisonCategory): boolean {
  const slug = String(category.slug || "").trim().toLowerCase();

  if (!slug || EXCLUDED_HOME_HUB_SLUGS.has(slug)) return false;
  if (category.template !== "comparison") return false;

  const searchableText = [
    category.slug,
    category.name,
    category.site_name,
    category.h1_title,
    category.meta_title,
    category.meta_description,
    category.hero_headline,
    category.comparison_title,
    category.button_text,
    category.description,
  ]
    .map(stripHtml)
    .join(" ");

  return COMPARISON_SIGNAL_PATTERN.test(searchableText);
}

function sortHomeComparisons(categories: HomeComparisonCategory[]): HomeComparisonCategory[] {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.sort_order === "number" ? a.sort_order : 9999;
    const orderB = typeof b.sort_order === "number" ? b.sort_order : 9999;

    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, "de");
  });
}

function getRawImageUrl(category: HomeComparisonCategory): string | null {
  return category.card_image_url || category.hero_image_url || null;
}

function getOptimizedImageUrl(category: HomeComparisonCategory, width = 768): string {
  const imageUrl = getRawImageUrl(category);
  if (!imageUrl) return "";

  return optimizeSupabaseImageUrl(imageUrl, width, 82) || imageUrl;
}

function getShortTitle(category: HomeComparisonCategory): string {
  const title = stripHtml(category.name || category.h1_title || category.meta_title);

  if (!title) return "Vergleich öffnen";
  return title.replace(/\s+\|\s+[^|]+$/i, "").trim();
}

function getTeaser(category: HomeComparisonCategory): string {
  const text = stripHtml(category.description || category.meta_description);

  if (!text) return "Passenden Vergleich öffnen.";
  return text.length > 90 ? `${text.slice(0, 87).trim()}...` : text;
}

function HomeComparisonCard({ category }: { category: HomeComparisonCategory }) {
  const route = getCategoryRoute(category.slug);
  const comparisonRoute = getCategoryComparisonRoute(category.slug);
  const imageUrl = getOptimizedImageUrl(category, 768);
  const title = getShortTitle(category);
  const teaser = getTeaser(category);

  return (
    <article className="group flex h-full min-h-[242px] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,31,83,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_20px_60px_rgba(255,132,0,0.16)] focus-within:ring-4 focus-within:ring-orange-500/15 sm:min-h-[256px] lg:min-h-[272px]">
      <Link to={route} className="block focus:outline-none" aria-label={category.name + " öffnen"}>
        <div
          className="relative h-32 w-full overflow-hidden bg-slate-100 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.02] sm:h-36 lg:h-40 xl:h-44"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          role={imageUrl ? "img" : undefined}
          aria-label={imageUrl ? category.name + " Vergleich" : undefined}
        >
          {imageUrl ? (
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0E1F53]/20 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"
              aria-hidden="true"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <LayoutGrid className="h-9 w-9 opacity-30" aria-hidden="true" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              color: BRAND_BLUE,
              borderColor: "rgba(255,132,0,0.2)",
              backgroundColor: "rgba(255,132,0,0.08)",
            }}
          >
            <TrendingUp className="h-3 w-3" style={{ color: BRAND_ORANGE }} aria-hidden="true" />
            Gefragt
          </span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: BRAND_ORANGE }}
            aria-hidden="true"
          />
        </div>

        <Link to={route} className="focus:outline-none">
          <h3 className="text-base font-bold leading-snug text-slate-950 transition-colors duration-300 line-clamp-2 hover:text-primary sm:text-lg">
            {title}
          </h3>
        </Link>

        <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">
          {teaser}
        </p>

        <Link
          to={comparisonRoute}
          className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-[#0E1F53] transition-colors duration-300 hover:text-orange-600 focus:outline-none"
          aria-label={category.name + " direkt zum Vergleich öffnen"}
        >
          Direkt zum Vergleich
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function HomeComparisonSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="min-w-[72%] sm:min-w-[45%] md:min-w-[34%] lg:min-w-[25%] xl:min-w-[20%]">
          <Skeleton className="h-[242px] rounded-[26px] bg-slate-100 sm:h-[256px] lg:h-[272px]" />
        </div>
      ))}
    </div>
  );
}

export function HomeComparisonSlider({
  categories,
  isLoading = false,
  title,
  subtitle,
}: HomeComparisonSliderProps) {
  const comparisonCategories = useMemo(() => {
    return sortHomeComparisons(
      (categories as HomeComparisonCategory[]).filter(isConcreteComparisonCategory),
    ).slice(0, MAX_HOME_COMPARISONS);
  }, [categories]);

  if (!isLoading && comparisonCategories.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-16" id="categories" aria-labelledby="home-comparison-slider-heading">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-secondary/5 blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-secondary/20 bg-secondary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary"
            >
              Beliebte Vergleiche
            </Badge>
            <h2
              id="home-comparison-slider-heading"
              className="font-display text-3xl font-bold tracking-tight text-primary md:text-5xl"
            >
              {title || "Vergleiche direkt öffnen"}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
              {subtitle || "Wähle den passenden Vergleich und springe ohne Umweg direkt zur relevanten Übersicht."}
            </p>
          </div>

          <Link
            to={ALL_COMPARISONS_ROUTE}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-4"
            aria-label="Alle Vergleiche im Überblick ansehen"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Alle Vergleiche ansehen
          </Link>
        </div>

        {isLoading ? (
          <HomeComparisonSkeleton />
        ) : (
          <Carousel opts={{ align: "start", loop: comparisonCategories.length > 4 }} className="w-full pb-4 lg:pb-0">
            <CarouselContent className="-ml-4">
              {comparisonCategories.map((category) => (
                <CarouselItem
                  key={category.id}
                  className="h-full basis-[72%] pl-4 min-[420px]:basis-[62%] sm:basis-[45%] md:basis-[34%] lg:basis-1/4 xl:basis-1/5"
                >
                  <HomeComparisonCard category={category} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {comparisonCategories.length > 1 && (
              <div className="mt-8 flex justify-center gap-4 lg:hidden">
                <CarouselPrevious className="static h-14 w-14 translate-y-0 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white" />
                <CarouselNext className="static h-14 w-14 translate-y-0 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white" />
              </div>
            )}

            {comparisonCategories.length > 4 && (
              <>
                <CarouselPrevious className="absolute -left-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-none bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-300 hover:scale-110 hover:bg-slate-900 hover:text-orange-500 lg:flex" />
                <CarouselNext className="absolute -right-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-none bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-300 hover:scale-110 hover:bg-slate-900 hover:text-orange-500 lg:flex" />
              </>
            )}
          </Carousel>
        )}
      </div>
    </section>
  );
}
