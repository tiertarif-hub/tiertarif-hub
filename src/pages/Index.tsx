import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { useSettings, useHomeContent, useHomeLayout, useSiteTitle, useSiteDescription } from "@/hooks/useSettings";
import { Helmet } from "react-helmet-async";
import { AppTicker } from "@/components/home/AppTicker";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { HomeSEOText } from "@/components/home/HomeSEOText";
import { HomeFAQSection } from "@/components/home/HomeFAQSection";
import { useForceSEO } from "@/hooks/useForceSEO";
import { useTrackView } from "@/hooks/useTrackView";
import { isBotLikeRuntime } from "@/lib/runtimeFlags";
import { buildCanonicalUrl, stripHtmlToPlainText } from "@/lib/seo";
import { setPrerenderBlocked, setPrerenderReady } from "@/lib/prerender";
import { DEFAULT_BRAND_NAME, DEFAULT_SITE_DESCRIPTION, DEFAULT_AUTHOR_NAME } from "@/lib/constants";

const Index = () => {
  useTrackView("home", "page");

  const analyticsCode = useGlobalAnalyticsCode();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const { content } = useHomeContent();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  const { sections } = useHomeLayout();
  const location = useLocation();
  const isBotRuntime = isBotLikeRuntime();
  const shouldShowInitialLoader = !isBotRuntime && (isLoadingSettings || sections.length === 0);
  const hasSignaledReadyRef = useRef(false);

  const safeTitle = typeof siteTitle === "string" && siteTitle.length > 0
    ? siteTitle
    : `${DEFAULT_BRAND_NAME} | Dein Vergleichsportal`;

  const safeDescription = typeof siteDescription === "string" && siteDescription.length > 0
    ? siteDescription
    : DEFAULT_SITE_DESCRIPTION;

  const safeKeywords = (settings?.seo_keywords as string) || `Vergleich, Ratgeber, Rechner, ${DEFAULT_BRAND_NAME}, Überblick`;
  const canonicalUrl = buildCanonicalUrl("/");

  const homeFaqSection = sections.find((section) => section.id === "home_faq");
  const hasEnabledForumSection = sections.some((section) => section.id === "forum" && section.enabled);
  const homeFaqItems = useMemo(() => {
    const items = Array.isArray(content?.home_faq?.items) ? content.home_faq.items : [];
    return items
      .map((item: any) => ({
        question: String(item?.question || "").trim(),
        answer: stripHtmlToPlainText(String(item?.answer || ""), 2000),
      }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0);
  }, [content]);

  const schemaPayloads = useMemo(() => {
    const payloads: Array<Record<string, unknown>> = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: safeTitle,
        url: canonicalUrl,
        description: safeDescription,
        publisher: {
          "@type": "Organization",
          name: DEFAULT_BRAND_NAME,
          url: canonicalUrl,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: DEFAULT_BRAND_NAME,
        url: canonicalUrl,
        description: safeDescription,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: safeTitle,
        url: canonicalUrl,
        description: safeDescription,
        isPartOf: {
          "@type": "WebSite",
          name: DEFAULT_BRAND_NAME,
          url: canonicalUrl,
        },
      },
    ];

    if (homeFaqSection?.enabled !== false && homeFaqItems.length > 0) {
      payloads.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: homeFaqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }

    return payloads;
  }, [canonicalUrl, homeFaqItems, homeFaqSection?.enabled, safeDescription, safeTitle]);

  useForceSEO(safeDescription);

  useEffect(() => {
    hasSignaledReadyRef.current = false;
    setPrerenderBlocked({ routeKey: `index:${location.pathname}`, timeoutMs: 12000 });
  }, [location.pathname]);

  useEffect(() => {
    const routeKey = `index:${location.pathname}`;

    if (sections.length === 0 || hasSignaledReadyRef.current) {
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
  }, [location.pathname, schemaPayloads.length, sections.length]);

  const seoHead = (
    <>
      <Helmet>
        <title>{safeTitle}</title>
        <meta name="description" content={safeDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content={safeKeywords} />
        <meta name="author" content={DEFAULT_AUTHOR_NAME} />
        <meta name="publisher" content={DEFAULT_BRAND_NAME} />
        <meta property="og:title" content={safeTitle} />
        <meta property="og:description" content={safeDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={DEFAULT_BRAND_NAME} />
        <meta property="og:locale" content="de_DE" />
        {analyticsCode ? <script async src={analyticsCode} /> : null}
      </Helmet>
      
      {/* JSON-LD ausgelagert aus Helmet! */}
      {schemaPayloads.map((schema, index) => (
        <script
          key={`home-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    how_it_works: <HowItWorksSection />,
    news: <NewsSection />,
    big_three: <BigThreeSection />,
    forum: <ForumSection />,
    trust: <AppTicker />,
    categories: <CategoriesSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    home_faq: <HomeFAQSection />,
    seo: <HomeSEOText />,
    mascot: null,
  };

  if (shouldShowInitialLoader) {
    return (
      <>
        {seoHead}
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-white animate-in fade-in duration-500">
      {seoHead}
      <Header />
      <main className="flex-grow">
        {sections
          .filter((section) => section.enabled)
          .map((section) => (
            <div key={section.id} className="w-full">
              {sectionComponents[section.id] || null}
            </div>
          ))}
        {!hasEnabledForumSection && (
          <div className="w-full">
            <ForumSection />
          </div>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;