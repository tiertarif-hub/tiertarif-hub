import { Link } from "react-router-dom";
import { ArrowRight, Eye, MessageCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRelatedThreads } from "@/hooks/useForum";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";

interface RelatedForumThreadsProps {
  categoryId?: string | null;
  currentThreadId?: string | null;
  title?: string;
  description?: string;
  className?: string;
}

const formatRelativeTime = (dateString?: string | null) => {
  if (!dateString) return "kürzlich";

  const target = new Date(dateString).getTime();
  if (Number.isNaN(target)) return "kürzlich";

  const diffMs = Date.now() - target;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `vor ${diffMinutes} Min.`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `vor ${diffHours} Std.`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `vor ${diffDays} Tagen`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `vor ${diffMonths} Mon.`;

  const diffYears = Math.floor(diffMonths / 12);
  return `vor ${diffYears} J.`;
};

function SliderCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function RelatedForumThreads({
  categoryId,
  currentThreadId,
  title = "Ähnliche Diskussionen",
  description = "Weitere aktive Ratgeber und Diskussionen aus derselben Kategorie.",
  className = "",
}: RelatedForumThreadsProps) {
  const { data: threads, isLoading } = useRelatedThreads({
    categoryId,
    currentThreadId,
    limit: 3,
  });

  if (!categoryId) return null;
  if (!isLoading && (!threads || threads.length === 0)) return null;

  return (
    <section className={`bg-white py-12 md:py-14 ${className}`.trim()} aria-labelledby="related-forum-threads-heading">
      <div className="mx-auto max-w-7xl px-4 xl:px-3 overflow-hidden">
        <div className="mb-7 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0E1F53] shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 text-[#FF4B2C]" aria-hidden="true" />
              Forum &amp; Ratgeber
            </span>
            <h2 id="related-forum-threads-heading" className="mt-4 font-heading text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">{description}</p>
          </div>
          <div className="hidden md:flex">
            <Link
              to="/forum"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50"
            >
              Alle Diskussionen ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <Carousel opts={{ align: "start", loop: false }} className="relative w-full pb-4">
          <CarouselContent className="-ml-4">
            {isLoading
              ? [1, 2, 3].map((item) => (
                  <CarouselItem key={item} className="h-full basis-[85%] pl-4 sm:basis-[60%] md:basis-[45%] lg:basis-1/3">
                    <SliderCardSkeleton />
                  </CarouselItem>
                ))
              : threads?.map((thread) => {
                  const imageUrl = thread.featured_image_url
                    ? optimizeSupabaseImageUrl(thread.featured_image_url, 900, 82) || thread.featured_image_url
                    : "";

                  return (
                    <CarouselItem key={thread.id} className="h-full basis-[85%] pl-4 sm:basis-[60%] md:basis-[45%] lg:basis-1/3">
                      <Link
                        to={`/forum/${thread.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100/60"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={thread.featured_image_alt || thread.title}
                              loading="lazy"
                              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-slate-100 via-white to-orange-50" />
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-7">
                          <div className="mb-3 inline-flex w-fit items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                            <TrendingUp className="h-3 w-3" /> Forum
                          </div>

                          <h3 className="min-h-[3.25rem] text-[1.05rem] font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary line-clamp-2 xl:text-[1.1rem]">
                            {thread.title}
                          </h3>

                          <p className="mb-4 mt-3 min-h-[3rem] flex-grow text-sm leading-relaxed text-slate-500 line-clamp-2">
                            {thread.seo_description ||
                              "Aktuelle Einordnung, Fragen und weiterführende Hinweise aus dem Forum."}
                          </p>

                          <div className="border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="inline-flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-orange-500" />
                                {thread.views || thread.view_count || 0} Aufrufe
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MessageCircle className="h-3.5 w-3.5 text-orange-500" />
                                {thread.reply_count || 0} Antworten
                              </span>
                            </div>
                            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                              <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                              Zuletzt aktiv: {formatRelativeTime(thread.updated_at || thread.last_activity_at)}
                            </div>
                          </div>

                          <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#0E1F53] transition-colors group-hover:text-orange-500">
                            Zum Ratgeber <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
          </CarouselContent>

          <CarouselPrevious className="left-3 top-[42%] hidden h-10 w-10 border-slate-200 bg-white text-[#0E1F53] shadow-md hover:bg-orange-50 hover:text-orange-600 lg:inline-flex" />
          <CarouselNext className="right-3 top-[42%] hidden h-10 w-10 border-slate-200 bg-white text-[#0E1F53] shadow-md hover:bg-orange-50 hover:text-orange-600 lg:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}

export { RelatedForumThreads };
