import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { 
  ArrowRight, 
  Calendar, 
  Layers,
  Newspaper
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { FadeIn } from "@/components/ui/FadeIn";
import { normalizeInternalLinkTarget } from "@/lib/routes";

type FeedItem = {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string | null;
  date: string;
  type: "category";
  categoryName: string;
  button_text?: string | null;
};

// Hilfsfunktion: Teilt ein Array in Blöcke (für den Desktop Grid-Slider)
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

// KYRA FIX: Hilfsfunktion um saubere Teaser-Texte zu generieren (entfernt HTML Tags)
const getExcerpt = (primary: string | null, secondary: string | null, fallback: string) => {
  if (primary && primary.trim().length > 0) return primary;
  if (secondary && secondary.trim().length > 0) {
    // Entfernt alle HTML-Tags und ersetzt überflüssige Leerzeichen
    const stripped = secondary.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (stripped.length > 0) {
      return stripped.length > 140 ? stripped.substring(0, 140) + "..." : stripped;
    }
  }
  return fallback;
};

const optimizeImageUrl = (url: string | null, width = 1536) => {
  if (!url) return "";
  if (url.includes(".supabase.co/storage/v1/object/public/")) {
    return url.replace('/object/public/', '/render/image/public/') + `?width=${width}&quality=82`;
  }
  return url;
};

const NewsCard = ({ item }: { item: FeedItem }) => {
  const dateFormatted = format(new Date(item.date), "d. MMM yyyy", { locale: de });
  
  return (
    <Link 
        to={normalizeInternalLinkTarget(item.slug)} 
        className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100/60 focus:outline-none focus:ring-4 focus:ring-orange-500/15 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {item.image ? (
          <img 
            src={optimizeImageUrl(item.image, 1536)} 
            alt={item.title}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-orange-50 text-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
            <Layers className="w-10 h-10 opacity-20" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {dateFormatted}
           </div>
           <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
             <Layers className="w-3 h-3 text-primary" />
             {item.categoryName}
           </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {item.title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow min-h-[2.5rem]">
          {item.description}
        </p>

        <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
           <div className="flex items-center justify-center w-full bg-slate-50 dark:bg-slate-800 group-hover:bg-primary text-slate-700 dark:text-slate-300 group-hover:text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300">
             {item.button_text?.trim() || "Vergleich ansehen"}
             <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
           </div>
        </div>
      </div>
    </Link>
  );
};

export function NewsSection() {
  const { content } = useHomeContent();
  const fetchLimit = 18; 

  const { data: feedItems, isLoading } = useQuery({
    queryKey: ["latest-comparisons-feed", fetchLimit],
    queryFn: async () => {
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("id, name, description, meta_description, long_content_top, slug, created_at, icon, banner_override, card_image_url, button_text")
        .eq("is_active", true)
        .in("template", ["comparison", "review"])
        .order("created_at", { ascending: false })
        .limit(fetchLimit);

      if (catError) console.error("Fehler beim Laden der Kategorien:", catError);

      const items: FeedItem[] = [];

      if (categories) {
        categories.forEach(cat => {
          items.push({
            id: `cat-${cat.id}`,
            title: cat.name,
            description: getExcerpt(
                cat.description || cat.meta_description, 
                cat.long_content_top, 
                "Detaillierter Vergleich und redaktioneller Überblick."
            ),
            slug: `/${cat.slug}`,
            image: cat.card_image_url || cat.banner_override || cat.icon || null,
            date: cat.created_at || new Date().toISOString(),
            type: "category",
            categoryName: "Vergleich",
button_text: cat.button_text ?? null
          });
        });
      }

      return items
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, fetchLimit);
    },
  });

  if (isLoading || !feedItems || feedItems.length === 0) return null;

  const desktopChunks = chunkArray(feedItems, 6);

  return (
    <section className="py-16 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto relative z-10">
        
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20">
              <Newspaper className="w-3.5 h-3.5" />
              {content?.news?.headline || "Aktuelles Magazin"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
              {content?.news?.subheadline || "Aktuelles & Ratgeber"}
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Die neuesten Vergleiche, Artikel und Ratgeber aus unserer Redaktion.
            </p>
          </div>

          <div className="hidden md:flex gap-4">
              <Button size="sm" variant="outline" className="rounded-xl font-bold border-slate-300 hover:bg-slate-50" asChild>
                 <Link to={normalizeInternalLinkTarget(content?.news?.button_url || "/kategorien")}>{content?.news?.button_text || "Alle Vergleiche ansehen"}</Link>
              </Button>
          </div>
        </FadeIn>

        <div className="relative hidden lg:block w-full">
          <Carousel opts={{ align: "start", loop: true }} className="w-full relative">
            <CarouselContent>
              {desktopChunks.map((chunk, index) => (
                <CarouselItem key={index} className="w-full">
                  <div className="grid grid-cols-3 gap-5 xl:gap-6">
                    {chunk.map((item) => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {desktopChunks.length > 1 && (
              <>
                <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white hover:bg-slate-900 hover:text-orange-500 border-none w-14 h-14 shadow-[0_8px_30px_rgb(249,115,22,0.3)] rounded-full transition-all duration-300 z-20 flex items-center justify-center hover:scale-110" />
                <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white hover:bg-slate-900 hover:text-orange-500 border-none w-14 h-14 shadow-[0_8px_30px_rgb(249,115,22,0.3)] rounded-full transition-all duration-300 z-20 flex items-center justify-center hover:scale-110" />
              </>
            )}
          </Carousel>
        </div>

        <div className="block lg:hidden">
          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full pb-4"
          >
            <CarouselContent className="-ml-4">
              {feedItems.slice(0, 10).map((item) => (
                <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-[60%] md:basis-[45%] h-full">
                  <NewsCard item={item} />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 w-14 h-14 shadow-sm rounded-xl transition-all" />
              <CarouselNext className="static translate-y-0 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 w-14 h-14 shadow-sm rounded-xl transition-all" />
            </div>
          </Carousel>
          
          <div className="mt-6 text-center md:hidden">
              <Button size="lg" variant="outline" className="w-full rounded-xl font-bold border-slate-200 text-slate-700 bg-white" asChild>
                 <Link to="/experten-checks">Alle Beiträge ansehen</Link>
              </Button>
          </div>
        </div>

      </div>
    </section>
  );
}