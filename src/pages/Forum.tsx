import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useForceSEO } from "@/hooks/useForceSEO";
import { setPrerenderBlocked, setPrerenderReady } from "@/lib/prerender";
import {
  buildAbsoluteSiteUrl,
  getForumCategoryRoute,
  getForumIndexRoute,
  getForumThreadRoute,
} from "@/lib/routes";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock3,
  Eye,
  FolderOpen,
  Lock,
  MessageSquare,
  Pin,
  Search,
  ShieldCheck,
} from "lucide-react";

interface PublicForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thread_count: number;
}

interface PublicForumThread {
  id: string;
  title: string;
  slug: string;
  author_name: string;
  created_at: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  seo_description: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  is_answered: boolean;
  views: number;
  reply_count: number;
  forum_categories?: {
    name?: string | null;
    slug?: string | null;
  } | null;
}

const DEFAULT_META_TITLE = "Forum & Ratgeber 2026 | TierTarif";
const DEFAULT_META_DESCRIPTION =
  "TierTarif Forum mit Ratgebern, Vergleichen und Analysen. Beiträge nach Themen durchsuchen und aktuelle Artikel schnell finden.";

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "R";

const optimizeThreadImage = (url?: string | null) => {
  if (!url) return "";
  return optimizeSupabaseImageUrl(url, 1536, 82) || url;
};

const ForumThreadCard = ({ thread }: { thread: PublicForumThread }) => {
  const excerpt =
    thread.seo_description?.trim() ||
    "Lies den vollständigen Beitrag mit kompakten Fakten, Vergleichen und Einordnung in unserem TierTarif Forum.";

  return (
    <article className="group h-full">
      <Link
        to={getForumThreadRoute(thread.slug)}
        className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/60 focus:outline-none focus:ring-4 focus:ring-orange-500/15"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {thread.forum_categories?.name ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              <FolderOpen className="h-3.5 w-3.5 text-orange-500" />
              {thread.forum_categories.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              <BookOpen className="h-3.5 w-3.5 text-orange-500" />
              Magazin
            </span>
          )}
          {thread.is_pinned && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-600">
              <Pin className="h-3.5 w-3.5" /> Angepinnt
            </span>
          )}
          {thread.is_locked && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-slate-600">
              <Lock className="h-3.5 w-3.5" /> Geschlossen
            </span>
          )}
          {thread.is_answered && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600">
              <CheckCircle className="h-3.5 w-3.5" /> Beantwortet
            </span>
          )}
        </div>

        <h2 className="mb-3 line-clamp-2 text-xl font-black leading-tight tracking-tight text-[#0A0F1C] transition-colors group-hover:text-orange-600 md:text-[1.35rem]">
          {thread.title}
        </h2>

        <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
          {excerpt}
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 sm:text-sm">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-orange-500" />
            <span>{formatDate(thread.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-orange-500" />
            <span>{thread.reply_count} Antworten</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-orange-500" />
            <span>{thread.views} Aufrufe</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A0F1C] text-sm font-black text-white">
              {getInitials(thread.author_name || "Redaktion")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0A0F1C]">
                {thread.author_name || "Redaktion"}
              </p>
              <p className="text-xs text-slate-500">TierTarif Redaktion</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 transition-transform duration-300 group-hover:translate-x-1">
            Lesen <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
};

const ForumListingSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <Skeleton className="aspect-[3/2] w-full rounded-none" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-11/12" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);

export default function Forum() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);
  const hasSignaledReadyRef = useRef(false);

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoryScrollerRef.current;
    if (!container) return;

    const delta = Math.max(container.clientWidth * 0.72, 260);
    container.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["forum-public-categories"],
    queryFn: async () => {
      const [{ data: categoryRows, error: categoryError }, { data: threadRows, error: threadError }] = await Promise.all([
        supabase
          .from("forum_categories")
          .select("id, name, slug, description")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("forum_threads")
          .select("category_id")
          .eq("is_active", true)
          .eq("status", "published"),
      ]);

      if (categoryError) throw categoryError;
      if (threadError) throw threadError;

      const threadCountByCategory = (threadRows || []).reduce<Record<string, number>>((acc, thread: any) => {
        if (!thread.category_id) return acc;
        acc[thread.category_id] = (acc[thread.category_id] || 0) + 1;
        return acc;
      }, {});

      return (categoryRows || []).map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        thread_count: threadCountByCategory[category.id] || 0,
      })) as PublicForumCategory[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug) || null,
    [categories, categorySlug],
  );

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["forum-public-threads", categorySlug || "all"],
    queryFn: async () => {
      let categoryId: string | null = null;

      if (categorySlug) {
        const { data: category, error: categoryError } = await supabase
          .from("forum_categories")
          .select("id")
          .eq("slug", categorySlug)
          .eq("is_active", true)
          .maybeSingle();

        if (categoryError) throw categoryError;
        if (!category) return [] as PublicForumThread[];
        categoryId = category.id;
      }

      let query = supabase
        .from("forum_threads")
        .select(
          `
            id,
            title,
            slug,
            author_name,
            created_at,
            featured_image_url,
            featured_image_alt,
            seo_description,
            is_pinned,
            is_locked,
            is_answered,
            views,
            category_id,
            forum_categories(name, slug),
            forum_replies(count)
          `,
        )
        .eq("is_active", true)
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((thread: any) => ({
        id: thread.id,
        title: thread.title,
        slug: thread.slug,
        author_name: thread.author_name || "Redaktion",
        created_at: thread.created_at,
        featured_image_url: thread.featured_image_url || null,
        featured_image_alt: thread.featured_image_alt || null,
        seo_description: thread.seo_description || null,
        is_pinned: thread.is_pinned === true,
        is_locked: thread.is_locked === true,
        is_answered: thread.is_answered === true,
        views: Number(thread.views || 0),
        reply_count: thread.forum_replies?.[0]?.count || 0,
        forum_categories: thread.forum_categories || null,
      })) as PublicForumThread[];
    },
    staleTime: 1000 * 60,
  });

  const filteredThreads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return threads;

    return threads.filter((thread) =>
      [
        thread.title,
        thread.author_name,
        thread.seo_description || "",
        thread.forum_categories?.name || "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, threads]);

  const metaTitle = selectedCategory
    ? truncate(`${selectedCategory.name} Forum & Ratgeber | TierTarif`, 60)
    : DEFAULT_META_TITLE;

  const metaDescription = selectedCategory
    ? truncate(
        `${selectedCategory.name} Beiträge, Vergleiche und Analysen im TierTarif Forum. Mobil optimiert, schnell filterbar und direkt lesbar.`,
        155,
      )
    : DEFAULT_META_DESCRIPTION;

  const canonicalPath = selectedCategory
    ? getForumCategoryRoute(selectedCategory.slug)
    : getForumIndexRoute();

  const canonicalUrl = buildAbsoluteSiteUrl(canonicalPath);
  useForceSEO(metaDescription);

  const isInitialLoading = categoriesLoading || threadsLoading;
  const hasInvalidCategory = Boolean(categorySlug) && !categoriesLoading && !selectedCategory;
  const totalCategoryCount = categories.length;
  const totalLoadedThreadCount = filteredThreads.length;
  const totalPublishedThreadCount = threads.length;
  const shouldIndexForumPage = selectedCategory
    ? selectedCategory.thread_count > 0
    : !hasInvalidCategory && totalPublishedThreadCount > 0;
  const robotsContent = shouldIndexForumPage ? "index, follow" : "noindex, follow";

  const forumSchemaJson = useMemo(() => {
    if (!shouldIndexForumPage || filteredThreads.length === 0) {
      return "";
    }

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: metaTitle,
          description: metaDescription,
        },
        {
          "@type": "ItemList",
          "@id": `${canonicalUrl}#forum-list`,
          itemListElement: filteredThreads.slice(0, 20).map((thread, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "DiscussionForumPosting", 
              url: buildAbsoluteSiteUrl(getForumThreadRoute(thread.slug)),
              headline: thread.title,
              ...(thread.seo_description ? { text: thread.seo_description } : {}),
              author: {
  "@type": "Person",
  name: thread.author_name || "Redaktion",
  url: buildAbsoluteSiteUrl("/ueber-uns"),
},
              datePublished: thread.created_at,
              ...(thread.featured_image_url ? { image: optimizeThreadImage(thread.featured_image_url) } : {}),
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/ViewAction",
                  userInteractionCount: Number(thread.views || 0),
                },
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/CommentAction",
                  userInteractionCount: Number(thread.reply_count || 0),
                },
              ],
            },
          })),
        },
      ],
    };

    return JSON.stringify(schema);
  }, [canonicalUrl, filteredThreads, metaDescription, metaTitle, shouldIndexForumPage]);

  useEffect(() => {
    hasSignaledReadyRef.current = false;
    setPrerenderBlocked({ routeKey: `forum-list:${canonicalPath}`, timeoutMs: 12000 });
  }, [canonicalPath]);

  useEffect(() => {
    const routeKey = `forum-list:${canonicalPath}`;

    if (categories.length === 0 || threads.length === 0 || hasSignaledReadyRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const didSet = setPrerenderReady(routeKey);
      if (didSet) {
        hasSignaledReadyRef.current = true;
      }
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canonicalPath, categories.length, forumSchemaJson, threads.length]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={robotsContent} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>

      {/* JSON-LD ausgelagert aus Helmet! */}
      {forumSchemaJson && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: forumSchemaJson }} />
      )}

      <Header />

      <main className="pt-[65px]">
        <section className="relative overflow-hidden border-b border-white/10 bg-[#0A0F1C] text-white">
          <div className="absolute inset-0">
            <img
              src="/big-threes/tiertarif-forum-magazin-hero.webp"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_left_center,rgba(255,255,255,0.08),transparent_22%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C]/25 via-[#0A0F1C]/55 to-[#0A0F1C]/92" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

          <div className="relative mx-auto flex w-full max-w-[1920px] flex-col gap-8 px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
              <Link to={getForumIndexRoute()} className="transition-colors hover:text-white">
                Forum
              </Link>
              {selectedCategory && (
                <>
                  <span className="text-orange-400">/</span>
                  <span className="text-white">{selectedCategory.name}</span>
                </>
              )}
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
              <div>
                <Badge className="mb-4 border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-orange-200 hover:bg-orange-500/15">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Redaktionell gepflegt
                </Badge>

                <h1 className="max-w-4xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {selectedCategory ? `${selectedCategory.name} Forum & Ratgeber` : "TierTarif Forum & Ratgeber"}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
                  {selectedCategory?.description ||
                    "Vergleiche, Fachbeiträge und praxisnahe Analysen für starke Entscheidungen. Schnell filterbar, mobil optimiert und ohne Admin-Ballast im Public-View."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 xl:gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Geladene Beiträge</div>
                  <div className="mt-2 text-3xl font-black text-white">{totalLoadedThreadCount}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Kategorien</div>
                  <div className="mt-2 text-3xl font-black text-white">{totalCategoryCount}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Ansicht</div>
                  <div className="mt-2 text-lg font-black text-white">
                    {selectedCategory ? selectedCategory.name : "Alle Themen"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/95 p-4 shadow-2xl shadow-black/20 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Beiträge, Autoren oder Themen durchsuchen"
                    className="h-12 rounded-2xl border-slate-200 bg-white pl-12 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link to={getForumIndexRoute()}>
                    <Button
                      variant={!selectedCategory ? "default" : "outline"}
                      className={!selectedCategory ? "bg-[#0A0F1C] hover:bg-[#16295f]" : "border-slate-200"}
                    >
                      Alle Themen
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollCategories("left")}
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600 lg:inline-flex"
                  aria-label="Kategorien nach links scrollen"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="relative min-w-0 flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white via-white/85 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white via-white/85 to-transparent" />

                  <div
                    ref={categoryScrollerRef}
                    className="scrollbar-none flex gap-2 overflow-x-auto scroll-smooth px-1 py-1"
                  >
                    {categories.map((category) => {
                      const isActive = category.slug === selectedCategory?.slug;

                      return (
                        <Link
                          key={category.id}
                          to={getForumCategoryRoute(category.slug)}
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                            isActive
                              ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                              : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600"
                          }`}
                        >
                          <FolderOpen className="h-4 w-4" />
                          {category.name}
                          <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {category.thread_count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollCategories("right")}
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600 lg:inline-flex"
                  aria-label="Kategorien nach rechts scrollen"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-10 lg:py-12">
          <div className="mx-auto grid w-full max-w-[1920px] gap-8 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-12">
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#0A0F1C] md:text-[2rem]">
                    Aktuelle Beiträge
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 md:text-base">
                    {filteredThreads.length} Treffer in der aktuellen Ansicht.
                  </p>
                </div>
              </div>

              {hasInvalidCategory ? (
                <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col items-start gap-4 p-8 sm:p-10">
                    <Badge variant="outline" className="border-red-200 text-red-600">Kategorie nicht gefunden</Badge>
                    <p className="max-w-2xl text-slate-600">
                      Die angeforderte Forum-Kategorie ist nicht aktiv oder existiert nicht mehr. Wir leiten hier bewusst nicht auf ein Admin-Interface um.
                    </p>
                    <Link to={getForumIndexRoute()}>
                      <Button className="bg-[#0A0F1C] hover:bg-[#16295f]">Zur Forum-Übersicht</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : isInitialLoading ? (
                <ForumListingSkeleton />
              ) : filteredThreads.length === 0 ? (
                <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col items-start gap-4 p-8 sm:p-10">
                    <Badge variant="outline" className="border-slate-200 text-slate-600">Keine Treffer</Badge>
                    <p className="max-w-2xl text-slate-600">
                      Für deinen aktuellen Filter liegen keine Beiträge vor. Entferne den Suchbegriff oder wechsle auf eine andere Kategorie.
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Suche zurücksetzen</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredThreads.map((thread) => (
                    <ForumThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-black tracking-tight text-[#0A0F1C]">Kategorien</h2>
                  <div className="mt-4 space-y-3">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={getForumCategoryRoute(category.slug)}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <span className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-orange-500" />
                          {category.name}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                          {category.thread_count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}