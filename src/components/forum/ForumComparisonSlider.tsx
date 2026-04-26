import { useMemo } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, TrendingUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useForumSidebarConfig, useHomeContent } from "@/hooks/useSettings";
import { normalizeInternalLinkTarget } from "@/lib/routes";

const BRAND_BLUE = "#0E1F53";
const BRAND_ORANGE = "#FF4B2C";

type Props = {
  currentSlug?: string;
  categoryId?: string | null;
  threadTitle?: string | null;
};

const KEYWORD_MATCHERS: Array<{ test: RegExp; slug: string }> = [
  { test: /hund|tier|op-versicherung hund|hundekranken/i, slug: "hundekrankenversicherung-vergleich" },
  { test: /strom|energie/i, slug: "stromvergleich" },
  { test: /gas/i, slug: "gasvergleich" },
  { test: /dsl|internet/i, slug: "dsl-vergleich-rank-scout" },
  { test: /rechtsschutz/i, slug: "rechtsschutzversicherung-vergleich" },
  { test: /hausrat/i, slug: "hausratversicherung-vergleich" },
  { test: /haftpflicht/i, slug: "haftpflichtversicherung-vergleich" },
  { test: /wohngebäude|gebäude|haus und grund/i, slug: "wohngebaeudeversicherung-vergleich" },
  { test: /kredit|baufinanz/i, slug: "kredit-vergleich" },
];

function img(category: Category) { return category.card_image_url || category.hero_image_url || "/big-threes/forum_magazin_herobild_rank-scout.webp"; }
function teaser(category: Category) { return String(category.description || category.meta_description || category.comparison_title || "Tarife und Leistungen prüfen.").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
function chunkArray<T>(arr: T[], size: number) { return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i*size, i*size + size)); }

function Card({ category }: { category: Category }) {
  return (
    <Link to={normalizeInternalLinkTarget(`/${category.slug}`)} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100/60">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img src={img(category)} alt={category.name} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md w-fit">
          <TrendingUp className="w-3 h-3 text-primary" /> Vergleich
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">{category.name}</h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow min-h-[2.5rem]">{teaser(category)}</p>
        <div className="mt-auto pt-2 border-t border-slate-50">
          <div className="flex items-center justify-center w-full bg-slate-50 group-hover:bg-primary text-slate-700 group-hover:text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300">
            Zum Vergleich
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ForumComparisonSlider({ currentSlug, categoryId, threadTitle }: Props) {
  const { data: categories = [] } = useCategories(false);
  const config = useForumSidebarConfig();
  const { content } = useHomeContent();

  const comparisonCategories = useMemo(() => {
    const typeSafe = categories.filter((c) => c.is_active && ["comparison", "hub_overview"].includes(c.template) && c.slug !== currentSlug);
    const selectedIds = new Set<string>();

    if (categoryId && typeSafe.some((c) => c.id === categoryId)) selectedIds.add(categoryId);
    const title = String(threadTitle || "");
    KEYWORD_MATCHERS.forEach((rule) => {
      if (rule.test.test(title)) {
        const match = typeSafe.find((c) => c.slug === rule.slug);
        if (match) selectedIds.add(match.id);
      }
    });
    config.hot_comparison_ids.forEach((id) => selectedIds.add(id));
    config.popular_comparison_ids.forEach((id) => selectedIds.add(id));

    const selected = typeSafe.filter((c) => selectedIds.has(c.id));
    return selected.slice(0, 10);
  }, [categories, config.hot_comparison_ids, config.popular_comparison_ids, categoryId, threadTitle, currentSlug]);

  if (comparisonCategories.length === 0) return null;
  const desktopChunks = chunkArray(comparisonCategories, 3);
  const allLink = normalizeInternalLinkTarget(content?.news?.button_url || "/kategorien");
  const allText = content?.news?.button_text || "Alle Vergleiche ansehen";

  return (
    <section className="bg-white py-12 md:py-14" aria-labelledby="forum-related-comparisons-heading">
      <div className="mx-auto max-w-6xl px-1 sm:px-2">
        <div className="mb-7 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] shadow-sm" style={{ color: BRAND_BLUE, borderColor: "rgba(255,132,0,0.18)", backgroundColor: "rgba(255,132,0,0.07)" }}>
              <TrendingUp className="h-3.5 w-3.5" style={{ color: BRAND_ORANGE }} aria-hidden="true" />
              Beliebte Vergleiche
            </span>
            <h2 id="forum-related-comparisons-heading" className="mt-4 font-heading text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Top Vergleiche</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">Passende Vergleichsseiten direkt aus dem Beitrag heraus öffnen und ohne Umweg weiter prüfen.</p>
          </div>
          <div className="hidden md:flex">
            <Link to={allLink} className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 hover:text-[#0E1F53]">
              <LayoutGrid className="h-4 w-4" style={{ color: BRAND_BLUE }} aria-hidden="true" />
              {allText}
            </Link>
          </div>
        </div>
        <div className="relative hidden w-full lg:block">
          <Carousel opts={{ align: "start", loop: desktopChunks.length > 1 }} className="w-full relative">
            <CarouselContent>
              {desktopChunks.map((chunk, index) => (
                <CarouselItem key={index} className="w-full">
                  <div className="grid grid-cols-3 gap-5 xl:gap-6">
                    {chunk.map((category) => <Card key={category.id} category={category} />)}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {desktopChunks.length > 1 && <>
              <CarouselPrevious className="absolute -left-6 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-none bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-300 hover:scale-110 hover:bg-slate-900 hover:text-orange-500" />
              <CarouselNext className="absolute -right-6 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-none bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-300 hover:scale-110 hover:bg-slate-900 hover:text-orange-500" />
            </>}
          </Carousel>
        </div>
        <div className="block lg:hidden">
          <Carousel opts={{ align: "start", loop: false }} className="w-full pb-4">
            <CarouselContent className="-ml-4">
              {comparisonCategories.map((category) => (
                <CarouselItem key={category.id} className="h-full basis-[85%] pl-4 sm:basis-[60%] md:basis-[45%]">
                  <Card category={category} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {comparisonCategories.length > 1 && <div className="mt-8 flex justify-center gap-4">
              <CarouselPrevious className="static h-14 w-14 translate-y-0 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white" />
              <CarouselNext className="static h-14 w-14 translate-y-0 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white" />
            </div>}
          </Carousel>
          <div className="mt-6 text-center md:hidden">
            <Link to={allLink} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50">
              <LayoutGrid className="h-4 w-4" style={{ color: BRAND_BLUE }} aria-hidden="true" />
              {allText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
