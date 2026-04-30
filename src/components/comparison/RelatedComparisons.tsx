import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, TrendingUp } from "lucide-react";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useHeaderConfig } from "@/hooks/useSettings";
import { getCategoryComparisonRoute, getCategoryRoute, normalizeNavigableHref } from "@/lib/routes";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BRAND_BLUE = "#0E1F53";
const BRAND_ORANGE = "#FF8400";
const MAX_ITEMS = 4;
const DESKTOP_ITEMS_PER_SLIDE = 3;
const ALL_COMPARISONS_ROUTE = "/alle-vergleiche-im-ueberblick";
// TESTVARIANTE: 03 CSS Background Cover

const EXCLUDED_HUB_SLUGS = new Set([
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

type HeaderLink = {
  label?: string;
  url?: string | null;
  items?: HeaderLink[] | null;
};

type RelatedCategory = Pick<
  Category,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "sort_order"
  | "template"
  | "meta_description"
  | "button_text"
  | "card_image_url"
  | "hero_image_url"
> &
  Partial<
    Pick<
      Category,
      "h1_title" | "meta_title" | "comparison_title" | "hero_headline" | "site_name"
    >
  >;

function chunkArray<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}

function slugFromInternalUrl(rawUrl?: string | null): string | null {
  const href = normalizeNavigableHref(rawUrl || "", "");

  if (!href || href.startsWith("#") || href.startsWith("?") || /^https?:\/\//i.test(href)) {
    return null;
  }

  const path = href.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "");

  if (!path || path.includes("/") || path === "kategorien") {
    return null;
  }

  return path.toLowerCase();
}

function findSiblingSlugs(navLinks: HeaderLink[], currentSlug: string): string[] {
  for (const navLink of navLinks || []) {
    const items = Array.isArray(navLink.items) ? navLink.items : [];
    if (!items.length) continue;

    const slugs = items
      .map((item) => slugFromInternalUrl(item.url))
      .filter((slug): slug is string => Boolean(slug));

    if (slugs.includes(currentSlug)) {
      return slugs.filter((slug) => slug !== currentSlug);
    }
  }

  return [];
}

function sortCategories(categories: RelatedCategory[]): RelatedCategory[] {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.sort_order === "number" ? a.sort_order : 9999;
    const orderB = typeof b.sort_order === "number" ? b.sort_order : 9999;

    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, "de");
  });
}

function stripHtml(value?: string | null): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isConcreteComparisonCategory(category: RelatedCategory): boolean {
  const slug = String(category.slug || "").trim().toLowerCase();

  if (!slug || EXCLUDED_HUB_SLUGS.has(slug)) return false;
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

function buildRelatedCategories(
  categories: RelatedCategory[],
  navLinks: HeaderLink[],
  currentSlug: string,
): RelatedCategory[] {
  const normalizedCurrentSlug = currentSlug.trim().toLowerCase();
  const activeComparisonCategories = sortCategories(
    categories.filter(
      (category) =>
        category.slug?.toLowerCase() !== normalizedCurrentSlug &&
        isConcreteComparisonCategory(category),
    ),
  );

  if (!activeComparisonCategories.length) return [];

  const bySlug = new Map(
    activeComparisonCategories.map((category) => [category.slug.toLowerCase(), category]),
  );
  const siblingSlugs = findSiblingSlugs(navLinks, normalizedCurrentSlug);
  const siblings = siblingSlugs
    .map((slug) => bySlug.get(slug))
    .filter((category): category is RelatedCategory => Boolean(category));

  const unique = new Map<string, RelatedCategory>();
  [...siblings, ...activeComparisonCategories].forEach((category) => {
    const slug = category.slug.toLowerCase();
    if (!unique.has(slug)) {
      unique.set(slug, category);
    }
  });

  return Array.from(unique.values()).slice(0, MAX_ITEMS);
}

function getRawImageUrl(category: RelatedCategory): string | null {
  return category.card_image_url || category.hero_image_url || null;
}

function getOptimizedImageUrl(category: RelatedCategory, width = 1536): string {
  const imageUrl = getRawImageUrl(category);
  if (!imageUrl) return "";

  return optimizeSupabaseImageUrl(imageUrl, width, 82) || imageUrl;
}

function getTeaserText(category: RelatedCategory): string {
  const description = stripHtml(category.description || category.meta_description);

  if (!description) {
    return "Vergleich öffnen und passende Anbieter strukturiert prüfen.";
  }

  return description.length > 140 ? `${description.slice(0, 137).trim()}...` : description;
}

function RelatedComparisonCard({ category }: { category: RelatedCategory }) {
  const route = getCategoryRoute(category.slug);
  const comparisonRoute = getCategoryComparisonRoute(category.slug);
  const imageUrl = getOptimizedImageUrl(category, 1536);
  const imageAlt = `${category.name} Vergleich`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100/60 focus-within:ring-4 focus-within:ring-orange-500/15">
      <Link to={route} className="block focus:outline-none" aria-label={category.name + " öffnen"}>
        <div
          className="relative h-[220px] w-full overflow-hidden border-b border-slate-100 bg-slate-100 bg-cover bg-center bg-no-repeat transition-transform duration-700 sm:h-[240px] lg:h-[230px] xl:h-[250px]"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          role={imageUrl ? "img" : undefined}
          aria-label={imageUrl ? imageAlt : undefined}
        >
          {imageUrl ? (
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <LayoutGrid className="h-10 w-10 opacity-25" aria-hidden="true" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{
              color: BRAND_BLUE,
              borderColor: "rgba(255,132,0,0.18)",
              backgroundColor: "rgba(255,132,0,0.07)",
            }}
          >
            <TrendingUp className="h-3.5 w-3.5" style={{ color: BRAND_ORANGE }} aria-hidden="true" />
            Aktuell gefragt
          </span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: BRAND_ORANGE }}
            aria-hidden="true"
          />
        </div>

        <Link to={route} className="focus:outline-none">
          <h3 className="mb-2 min-h-[3rem] text-lg font-bold leading-tight text-slate-900 transition-colors line-clamp-2 hover:text-primary">
            {category.name}
          </h3>
        </Link>

        <p className="mb-4 min-h-[2.5rem] flex-grow text-sm leading-relaxed text-slate-500 line-clamp-2">
          {getTeaserText(category)}
        </p>

        <div className="mt-auto border-t border-slate-50 pt-3">
          <Link
            to={comparisonRoute}
            className="flex w-full items-center justify-center rounded-lg bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label={category.name + " direkt zum Vergleich öffnen"}
          >
            Direkt zum Vergleich
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function RelatedComparisons({ currentSlug }: { currentSlug: string }) {
  const { data: categories = [] } = useCategories(false);
  const headerConfig = useHeaderConfig();

  const relatedCategories = useMemo(
    () => buildRelatedCategories(categories as RelatedCategory[], headerConfig.nav_links || [], currentSlug),
    [categories, headerConfig.nav_links, currentSlug],
  );

  if (!relatedCategories.length) return null;

  const desktopChunks = chunkArray(relatedCategories, DESKTOP_ITEMS_PER_SLIDE);

  return (
    <section className="bg-white py-12 md:py-14" aria-labelledby="related-comparisons-heading">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-7 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] shadow-sm"
              style={{
                color: BRAND_BLUE,
                borderColor: "rgba(255,132,0,0.18)",
                backgroundColor: "rgba(255,132,0,0.07)",
              }}
            >
              <TrendingUp className="h-3.5 w-3.5" style={{ color: BRAND_ORANGE }} aria-hidden="true" />
              Aktuell gefragt
            </span>
            <h2
              id="related-comparisons-heading"
              className="mt-4 font-heading text-2xl font-bold tracking-tight text-gray-950 md:text-3xl"
            >
              Weitere Vergleiche
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
              Passende Vergleichsseiten weiter prüfen und ohne Sackgasse zum nächsten Thema wechseln.
            </p>
          </div>

          <div className="hidden md:flex">
            <Link
              to={ALL_COMPARISONS_ROUTE}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 hover:text-[#0E1F53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-4"
              aria-label="Alle Vergleiche im Überblick ansehen"
            >
              <LayoutGrid className="h-4 w-4" style={{ color: BRAND_BLUE }} aria-hidden="true" />
              Alle Vergleiche ansehen
            </Link>
          </div>
        </div>

        <div className="relative hidden w-full lg:block">
          <Carousel opts={{ align: "start", loop: desktopChunks.length > 1 }} className="w-full relative">
            <CarouselContent>
              {desktopChunks.map((chunk, index) => (
                <CarouselItem key={index} className="w-full">
                  <div className="grid grid-cols-3 gap-5 xl:gap-6">
                    {chunk.map((category) => (
                      <RelatedComparisonCard key={category.id} category={category} />
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {desktopChunks.length > 1 && (
              <>
                <CarouselPrevious className="absolute -left-6 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-none bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-300 hover:scale-110 hover:bg-slate-900 hover:text-orange-500" />
                <CarouselNext className="absolute -right-6 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-none bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-300 hover:scale-110 hover:bg-slate-900 hover:text-orange-500" />
              </>
            )}
          </Carousel>
        </div>

        <div className="block lg:hidden">
          <Carousel opts={{ align: "start", loop: false }} className="w-full pb-4">
            <CarouselContent className="-ml-4">
              {relatedCategories.map((category) => (
                <CarouselItem key={category.id} className="h-full basis-[85%] pl-4 sm:basis-[60%] md:basis-[45%]">
                  <RelatedComparisonCard category={category} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {relatedCategories.length > 1 && (
              <div className="mt-8 flex justify-center gap-4">
                <CarouselPrevious className="static h-14 w-14 translate-y-0 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white" />
                <CarouselNext className="static h-14 w-14 translate-y-0 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white" />
              </div>
            )}
          </Carousel>

          <div className="mt-6 text-center md:hidden">
            <Link
              to={ALL_COMPARISONS_ROUTE}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-4"
              aria-label="Alle Vergleiche im Überblick ansehen"
            >
              <LayoutGrid className="h-4 w-4" style={{ color: BRAND_BLUE }} aria-hidden="true" />
              Alle Vergleiche ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}