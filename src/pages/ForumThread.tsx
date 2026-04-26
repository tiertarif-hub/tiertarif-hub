import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { optimizeSupabaseImageUrl, sanitizeForumHtml } from "@/lib/sanitizeHtml";
import {
  useForumThread,
  useThreadReplies,
  useCreateReply,
  useToggleLike,
  useIncrementThreadView,
  ForumReplyWithLikes,
} from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  MessageCircle,
  Pin,
  Clock,
  ArrowLeft,
  Send,
  Lock,
  CheckCircle,
  ThumbsUp,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ForumSidebar } from "@/components/forum/ForumSidebar";
import { ForumComparisonSlider } from "@/components/forum/ForumComparisonSlider";
import { RelatedForumThreads } from "@/components/forum/RelatedForumThreads";
import { Helmet } from "react-helmet-async";
import { useForceSEO } from "@/hooks/useForceSEO";
import { FadeIn } from "@/components/ui/FadeIn";
import { useTrackView } from "@/hooks/useTrackView";
import { setPrerenderBlocked, setPrerenderReady } from "@/lib/prerender";
import { buildCanonicalUrlFromLocation, stripHtmlToPlainText } from "@/lib/seo";
import "@/styles/article-content.css";
import "@/styles/forum-thread.css";
import { buildAbsoluteSiteUrl } from "@/lib/routes";

interface ExtractedFaqItem {
  question: string;
  answer: string;
}

const extractFAQs = (htmlString: string): ExtractedFaqItem[] => {
  if (!htmlString || typeof window === "undefined") return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const headings = Array.from(doc.querySelectorAll("h2, h3"));
    const faqs: ExtractedFaqItem[] = [];

    for (const heading of headings) {
      const question = heading.textContent?.replace(/\s+/g, " ").trim() || "";
      if (!question.endsWith("?")) continue;

      let sibling = heading.nextElementSibling;
      while (sibling && sibling.tagName !== "P") {
        if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(sibling.tagName)) {
          sibling = null;
          break;
        }
        sibling = sibling.nextElementSibling;
      }

      const answer = sibling?.textContent?.replace(/\s+/g, " ").trim() || "";
      if (!answer) continue;

      faqs.push({ question, answer });
    }

    return faqs;
  } catch {
    return [];
  }
};

export default function ForumThread() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useTrackView(slug, "forum");
  const viewIncremented = useRef(false);
  const hasSignaledReadyRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: thread, isLoading: threadLoading } = useForumThread(slug || "");
  const { data: replies, isLoading: repliesLoading } = useThreadReplies(
    thread?.id || "",
    currentUserId || undefined
  );
  const createReply = useCreateReply();
  const toggleLike = useToggleLike();
  const incrementView = useIncrementThreadView();

  useEffect(() => {
    if (thread?.id && !viewIncremented.current) {
      incrementView.mutate(thread.id);
      viewIncremented.current = true;
    }
  }, [thread?.id, incrementView]);

  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyName.trim() || !replyContent.trim()) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    if (!thread?.id) return;

    try {
      await createReply.mutateAsync({
        thread_id: thread.id,
        author_name: replyName.trim(),
        content: replyContent.trim(),
      });

      setReplyName("");
      setReplyContent("");
      toast.success("Dein Kommentar wurde eingereicht und wird geprüft");
    } catch (error) {
      toast.error("Fehler beim Senden des Kommentars");
    }
  };

  const handleLikeClick = async (reply: ForumReplyWithLikes) => {
    if (!currentUserId) {
      toast.error("Bitte melde dich an, um Kommentare zu liken");
      return;
    }

    try {
      await toggleLike.mutateAsync({
        replyId: reply.id,
        userId: currentUserId,
        isLiked: reply.user_has_liked,
      });
    } catch (error) {
      toast.error("Fehler beim Liken");
    }
  };

  const getArticleHtml = () => {
    if (!thread) return "";
    return thread.raw_html_content || thread.content || "";
  };

  const splitArticleBeforeFaq = () => {
    const htmlContent = getArticleHtml();
    const faqRegex = /<h[23][^>]*>\s*(?:\d+\.\s*)?(?:Häufige Fragen|FAQ)[\s\S]*?<\/h[23]>/i;
    const match = faqRegex.exec(htmlContent);

    if (!match || typeof match.index !== "number") {
      return { beforeFaq: sanitizeForumHtml(htmlContent), faqAndAfter: "" };
    }

    return {
      beforeFaq: sanitizeForumHtml(htmlContent.slice(0, match.index)),
      faqAndAfter: sanitizeForumHtml(htmlContent.slice(match.index)),
    };
  };

  const seoTitle =
    thread?.seo_title && thread.seo_title.trim() !== ""
      ? thread.seo_title
      : thread
        ? `${thread.title} | Forum`
        : "Lade Beitrag...";

  let seoDescription = "";
  if (thread) {
    if (thread.seo_description && thread.seo_description.trim() !== "") {
      seoDescription = thread.seo_description;
    } else {
      const cleanContent = thread.content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      seoDescription =
        cleanContent.substring(0, 155) + (cleanContent.length > 155 ? "..." : "");
    }
  }

  useForceSEO(seoDescription);
  const canonicalUrl = buildCanonicalUrlFromLocation(location.pathname);
  const featuredImageAlt = thread?.featured_image_alt?.trim() || thread?.title || "Standard Portal Forum Beitrag";
  const adImageAlt = thread?.ad_image_alt?.trim() || thread?.title || "Standard Portal Anzeige";

  const discussionSchemaJson = useMemo(() => {
    if (!thread) return "";

    const replyCount = replies?.length ?? thread.reply_count ?? 0;
    const likeCount = Number.isFinite(thread.likes_count) ? Number(thread.likes_count) : 0;
    const viewCount = Number.isFinite(thread.views) ? Number(thread.views) : 0;
    const discussionText = stripHtmlToPlainText(thread.raw_html_content || thread.content || "", 5000);
    const visibleComments = (replies || []).slice(0, 10).map((reply) => ({
      "@type": "Comment",
      text: stripHtmlToPlainText(reply.content, 1000),
      datePublished: reply.created_at,
      ...(reply.updated_at ? { dateModified: reply.updated_at } : {}),
      author: {
        "@type": "Person",
        name: reply.author_name || "Unbekannt",
        url: "https://example.com/ueber-uns",
      },
    }));

    const discussionNode: Record<string, unknown> = {
      "@type": "DiscussionForumPosting",
      "@id": `${canonicalUrl}#discussion`,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      headline: thread.title,
      text: discussionText,
      author: {
        "@type": "Person",
        name: thread.author_name || "Unbekannt",
        url: "https://example.com/ueber-uns",
      },
      datePublished: thread.created_at,
      dateModified: thread.updated_at || thread.created_at,
      commentCount: replyCount,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/ViewAction",
          userInteractionCount: viewCount,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: replyCount,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: likeCount,
        },
      ],
    };

    if (visibleComments.length > 0) {
      discussionNode.comment = visibleComments;
    }

    if (thread.featured_image_url) {
      discussionNode.image = optimizeSupabaseImageUrl(thread.featured_image_url, 1200, 80);
    }

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: seoTitle,
          description: seoDescription,
          mainEntity: {
            "@id": `${canonicalUrl}#discussion`,
          },
        },
        discussionNode,
      ],
    };

    return JSON.stringify(schema);
  }, [canonicalUrl, replies, seoDescription, seoTitle, thread]);

  const faqSchemaJson = useMemo(() => {
    const htmlContent = thread?.raw_html_content || thread?.content || "";
    const faqs = extractFAQs(htmlContent);

    if (faqs.length === 0) return "";

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }, [thread?.content, thread?.raw_html_content]);

  useEffect(() => {
    hasSignaledReadyRef.current = false;
    setPrerenderBlocked({ routeKey: `forum:${location.pathname}`, timeoutMs: 12000 });
  }, [location.pathname]);

  useEffect(() => {
    const routeKey = `forum:${location.pathname}`;

    if (!thread || repliesLoading || hasSignaledReadyRef.current) {
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
  }, [discussionSchemaJson, location.pathname, repliesLoading, thread]);

  const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "U");

  if (threadLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 max-w-[1920px]">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 mb-8">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-4 w-1/4 mb-12" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-20 text-center max-w-[1920px]">
          <div className="bg-white rounded-3xl p-16 shadow-lg shadow-slate-200/30 border border-slate-100 max-w-2xl mx-auto">
            <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <h1 className="text-3xl font-extrabold text-[#0A0F1C] mb-4">
              Beitrag nicht gefunden
            </h1>
            <p className="text-slate-500 mb-8 text-lg">
              Der gesuchte Beitrag existiert nicht oder wurde entfernt.
            </p>
            <Button
              asChild
              className="bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 h-12 px-8 rounded-full font-bold"
            >
              <Link to="/">Zurück zum Forum</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-800 font-sans">
      <Helmet key={location.pathname}>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Standard Portal" />
        <meta property="og:locale" content="de_DE" />
        <meta name="twitter:card" content={thread.featured_image_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {thread.featured_image_url && (
          <>
            <meta property="og:image" content={optimizeSupabaseImageUrl(thread.featured_image_url, 1200, 80)} />
            <meta property="og:image:alt" content={featuredImageAlt} />
            <meta name="twitter:image" content={optimizeSupabaseImageUrl(thread.featured_image_url, 1200, 80)} />
            <meta name="twitter:image:alt" content={featuredImageAlt} />
          </>
        )}
        {thread.ad_image_url && <meta name="standard-portal:ad-image-alt" content={adImageAlt} />}
      </Helmet>

      {discussionSchemaJson && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: discussionSchemaJson }} />
      )}
      {faqSchemaJson && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchemaJson }} />
      )}

      <Header />

      <main className="flex-grow">
        <div className="sticky top-[65px] z-30 w-full bg-primary/95 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 h-14 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-200 hover:text-orange-500 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 text-orange-500 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Zur Startseite</span>
              <span className="sm:hidden">Startseite</span>
            </Link>
          </div>
        </div>

        <section className="pt-20 pb-6 md:pt-20 md:pb-16">
          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="flex-1 lg:w-[70%]">
                <div className="bg-white rounded-3xl p-4 sm:p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-slate-100 mb-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-orange-500"></div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      {thread.is_pinned && (
                        <Badge className="bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 gap-1.5 px-3 py-1 text-xs">
                          <Pin className="w-3 h-3" /> Angepinnt
                        </Badge>
                      )}
                      {thread.is_locked && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 px-3 py-1 text-xs text-slate-500 border-slate-200"
                        >
                          <Lock className="w-3 h-3" /> Geschlossen
                        </Badge>
                      )}
                      {thread.is_answered && (
                        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 gap-1.5 px-3 py-1 text-xs hover:bg-emerald-100">
                          <CheckCircle className="w-3 h-3" /> Beantwortet
                        </Badge>
                      )}
                    </div>

                    <h1 className="forum-thread-title text-[#0A0F1C] font-extrabold mb-5 md:mb-7">
                      {thread.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-slate-500 border-b border-slate-100 pb-5 md:pb-8 mb-7 md:mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#0A0F1C] flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-sm">
                          {getInitial(thread.author_name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Autor
                          </span>
                          <span className="font-bold text-[#0A0F1C] text-sm">
                            {thread.author_name}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                          <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Veröffentlicht
                          </span>
                          <span className="font-bold text-[#0A0F1C] text-sm">
                            {formatDate(thread.created_at || "")}
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block h-8 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500">
                          <Eye className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aufrufe</span>
                          <span className="font-bold text-[#0A0F1C] text-sm">{thread.views || thread.view_count || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Antworten</span>
                          <span className="font-bold text-[#0A0F1C] text-sm">{replies?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <FadeIn>
                    <div className="mx-auto w-full max-w-4xl px-1 sm:px-2">
                      <article
                        className="forum-thread-html article-content article-content--lg article-content--brand article-content--forum article-content--soft max-w-none"
                        dangerouslySetInnerHTML={{ __html: splitArticleBeforeFaq().beforeFaq }}
                      />
                    </div>
                  </FadeIn>

                  <ForumComparisonSlider
                    currentSlug={thread.slug}
                    categoryId={thread.category_id}
                    threadTitle={thread.title}
                  />

                  {splitArticleBeforeFaq().faqAndAfter ? (
                    <FadeIn>
                      <div className="mx-auto mt-8 w-full max-w-4xl px-1 sm:px-2">
                        <article
                          className="forum-thread-html article-content article-content--lg article-content--brand article-content--forum article-content--soft max-w-none"
                          dangerouslySetInnerHTML={{ __html: splitArticleBeforeFaq().faqAndAfter }}
                        />
                      </div>
                    </FadeIn>
                  ) : null}
                </div>

                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-8 px-2">
                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-500 shrink-0">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A0F1C] tracking-tight">
                      Antworten{" "}
                      <span className="text-slate-400 font-medium ml-1">
                        ({replies?.length || 0})
                      </span>
                    </h2>
                  </div>

                  {repliesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl" />
                      ))}
                    </div>
                  ) : replies && replies.length > 0 ? (
                    <div className="space-y-5">
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start gap-4 md:gap-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 shadow-inner flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-base md:text-lg">
                              {getInitial(reply.author_name)}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-3">
                                <span className="font-extrabold text-[#0A0F1C] text-lg">
                                  {reply.author_name}
                                </span>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                  {formatDate(reply.created_at || "")}
                                </span>
                              </div>
                              <div className="text-slate-600 leading-relaxed text-base mb-6 break-words">
                                {reply.content}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`h-10 gap-2 px-5 rounded-full transition-all font-bold ${
                                    reply.user_has_liked
                                      ? "bg-orange-500 text-white border-transparent shadow-lg shadow-orange-500/20 hover:bg-[#0A0F1C] hover:text-orange-500"
                                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-500/30 hover:text-orange-500 hover:bg-white"
                                  }`}
                                  onClick={() => handleLikeClick(reply)}
                                  disabled={toggleLike.isPending}
                                >
                                  <ThumbsUp
                                    className={`w-4 h-4 ${
                                      reply.user_has_liked ? "fill-current" : ""
                                    }`}
                                  />
                                  <span>{reply.like_count}</span>
                                </Button>
                                <button className="text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-wider">
                                  Antworten
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-extrabold text-[#0A0F1C] mb-2">
                        Noch keine Antworten
                      </h3>
                      <p className="text-slate-500 font-medium">
                        Sei der Erste, der sein Wissen hier teilt!
                      </p>
                    </div>
                  )}
                </div>

                <RelatedForumThreads
                  categoryId={thread.category_id}
                  currentThreadId={thread.id}
                  title="Ähnliche Diskussionen"
                  description="Weitere aktive Ratgeber und Diskussionen aus derselben Kategorie, die thematisch zu diesem Beitrag passen."
                  className="pt-0"
                />

                {!thread.is_locked ? (
                  <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden mt-8">
                    <div className="bg-slate-50/50 border-b border-slate-100 px-6 md:px-8 py-6">
                      <h3 className="text-xl font-extrabold text-[#0A0F1C]">
                        Deine Meinung zählt
                      </h3>
                    </div>
                    <div className="p-6 md:p-8">
                      <form onSubmit={handleSubmitReply} className="space-y-6">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Dein Name
                          </label>
                          <Input
                            placeholder="Max Mustermann"
                            value={replyName}
                            onChange={(e) => setReplyName(e.target.value)}
                            maxLength={50}
                            required
                            className="bg-slate-50 border-slate-200 h-14 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium px-4"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Deine Antwort
                          </label>
                          <Textarea
                            placeholder="Schreibe deine Gedanken hier..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={6}
                            maxLength={1000}
                            required
                            className="bg-slate-50 border-slate-200 rounded-2xl min-h-[160px] focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium p-5 resize-y"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                          <p className="text-xs text-slate-400 font-bold order-2 sm:order-1 flex items-center gap-1.5 uppercase tracking-wide">
                            <ShieldCheck className="w-4 h-4 text-green-500" />{" "}
                            Moderiert & Respektvoll
                          </p>
                          <Button
                            type="submit"
                            disabled={createReply.isPending}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 h-14 px-10 rounded-full text-base font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1"
                          >
                            <Send className="w-5 h-5 mr-2" />
                            {createReply.isPending
                              ? "Wird gesendet..."
                              : "Antwort absenden"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 border-none rounded-3xl p-12 text-center mt-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0A0F1C] mb-2">
                      Diskussion geschlossen
                    </h3>
                    <p className="text-slate-500 font-medium">
                      Zu diesem Beitrag sind keine weiteren Antworten möglich.
                    </p>
                  </div>
                )}
              </div>

              <aside className="lg:w-[30%] lg:self-start">
                <div className="sticky top-[90px]">
                  <ForumSidebar categoryId={thread.category_id} threadTitle={thread.title} />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
