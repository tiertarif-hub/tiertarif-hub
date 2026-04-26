import "@/styles/article-content.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useCategoryProjects } from "@/hooks/useCategoryProjects";
import { Button } from "@/components/ui/button";
import { 
    Loader2, ShieldCheck, Clock, Users, Lock, Trophy, CheckCircle2, ArrowRight, Home, Lightbulb, Zap,
    ActivityIcon,
    Scale3DIcon,
    ScaleIcon,
    BookOpenCheckIcon,
    BookOpenIcon,
    BookOpenTextIcon
} from "lucide-react"; 

import CustomHtmlRenderer from "@/components/templates/CustomHtmlRenderer";
import { ComparisonTemplate } from "@/components/templates/ComparisonTemplate";
import { HubTemplate } from "@/components/templates/HubTemplate"; 
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForceSEO } from "@/hooks/useForceSEO";

import { UniversalWidgetLoader } from "@/components/templates/UniversalWidgetLoader";
import { useTrackView } from "@/hooks/useTrackView";

import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";
import { StarRatingWidget } from "@/components/StarRatingWidget";
import { RelatedComparisons } from "@/components/comparison/RelatedComparisons";
import { sanitizeCmsHtml, sanitizeCmsHtmlWithBreaks } from "@/lib/sanitizeHtml";
import { buildAbsoluteSiteUrl, getCategoryCanonicalUrl } from "@/lib/routes";
import { setPrerenderBlocked, setPrerenderReady } from "@/lib/prerender";

const getCategoryHeroImage = (category: any) => {
    if (category.hero_image_url) return category.hero_image_url;
    const slug = category.slug.toLowerCase();
    if (slug.includes('krypto') || slug.includes('bitcoin')) return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2072&auto=format&fit=crop";
    if (slug.includes('dating')) return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2072&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
};

const EditorialBadgeBlock = ({
    badgeText,
    isWinner,
    index,
}: {
    badgeText: string;
    isWinner: boolean;
    index: number;
}) => {
    const label = isWinner ? badgeText : index < 3 ? "Beliebt" : "Redaktionell eingeordnet";

    return (
        <div className="flex flex-col items-center mt-3 gap-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-orange-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Platzierung
                </div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#0A0F1C]">
                    #{index + 1}
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100/50">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span>Redaktionelle Einordnung</span>
            </div>
        </div>
    );
};

const ProjectCard = ({ project, index, category }: { project: any, index: number, category: any }) => {
    const isWinner = index === 0;
    
    const ctaText = category?.project_cta_text || "Zum Anbieter";
    const badgeText = project?.badge_text || category?.hero_badge_text || "AUSGEWÄHLT 2026";
    

    return (
        <div className={`relative flex flex-col md:flex-row bg-white rounded-3xl transition-all duration-500 overflow-hidden mb-6 group ${isWinner ? 'shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/30 border-orange-500/20' : 'shadow-lg shadow-slate-100 border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30'}`}>
            
            {/* BADGE */}
            {isWinner && <div className="absolute top-0 right-0 bg-[#0A0F1C] text-orange-400 text-[11px] font-bold px-4 py-1.5 rounded-bl-2xl z-20 flex items-center gap-1 shadow-md"><Trophy className="w-3.5 h-3.5 mr-1 text-orange-500" /> {badgeText}</div>}
            <div className={`md:hidden absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-inner z-20 ${isWinner ? 'bg-[#0A0F1C] text-orange-400' : 'bg-slate-100 text-slate-500'}`}>#{index + 1}</div>
            
            {/* LOGO SEKTION */}
            <div className="p-8 md:w-[28%] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 bg-gradient-to-b from-white to-slate-50/50 relative">
                <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="transform group-hover:scale-105 transition-transform duration-500 ease-out block z-10">
                    {project.logo_url ? (
                        <img src={project.logo_url} alt={project.name} className="h-16 w-auto object-contain mb-4 mix-blend-multiply" />
                    ) : (
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-400 text-2xl border border-slate-100 shadow-sm">{project.name.charAt(0)}</div>
                    )}
                </a>
                <EditorialBadgeBlock badgeText={badgeText} isWinner={isWinner} index={index} />
            </div>

            {/* CONTENT SEKTION */}
            <div className="p-8 md:w-[47%] flex flex-col justify-center">
                <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="block w-fit z-10">
                    <h3 className="text-2xl font-bold text-[#0A0F1C] tracking-tight hover:text-orange-500 transition-colors mb-2">{project.name}</h3>
                </a>
                <p className="text-slate-500 text-[15px] mb-6 line-clamp-2 leading-relaxed font-medium">{project.short_description}</p>
                <div className="flex flex-wrap gap-2.5">
                    {(project.features || []).slice(0, 3).map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-orange-500" /> {feat}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA SEKTION */}
            <div className="p-8 md:w-[25%] flex flex-col justify-center items-center gap-4 bg-slate-50/30">
                <Button asChild size="lg" className={`w-full h-14 font-bold text-base shadow-lg transition-all duration-300 rounded-xl group/btn ${isWinner ? 'bg-orange-500 hover:bg-[#0A0F1C] text-white hover:text-orange-500 border-none shadow-orange-500/25 hover:shadow-slate-900/20' : 'bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 border-none shadow-slate-900/20'}`}>
                    <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="flex items-center justify-center gap-2">
                        {ctaText}* <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                </Button>
            </div>
        </div>
    );
};

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  useTrackView(slug, "category");

  const { data: category, isLoading: isCatLoading } = useCategoryBySlug(slug || "");
  const { data: projectsData, isLoading: isProjLoading } = useProjects();
  const { data: categoryProjects } = useCategoryProjects(category?.id);
  const [activeSection, setActiveSection] = useState<string>("");
  const hasSignaledReadyRef = useRef(false);

  const projects = useMemo(() => {
    if (!projectsData || !categoryProjects) return [];
    return categoryProjects.map(cp => {
        const proj = projectsData.find(p => p.id === cp.project_id);
        if (!proj) return null;
        return { ...proj, sort_order: cp.sort_order, features: proj.features || [] };
      }).filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => a.sort_order - b.sort_order);
  }, [projectsData, categoryProjects]);
  
  const topPick = projects[0];
  const contentTopRef = useRef<HTMLDivElement | null>(null);

  useForceSEO(category?.meta_description || "");

  // Dynamisches JSON-LD generieren
  const jsonLd = useMemo(() => {
    if (!category) return null;

    const schema: any = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": buildAbsoluteSiteUrl(`/${category.slug}/#webpage`),
          "url": buildAbsoluteSiteUrl(`/${category.slug}`),
          "name": category.meta_title || category.name,
          "description": category.meta_description || `Anbieter für ${category.name} im Vergleich.`
        },
        {
          "@type": "BreadcrumbList",
          "@id": buildAbsoluteSiteUrl(`/${category.slug}/#breadcrumb`),
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Startseite",
              "item": buildAbsoluteSiteUrl("/")
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": category.name,
              "item": buildAbsoluteSiteUrl(`/${category.slug}`)
            }
          ]
        }
      ]
    };

    const shouldRenderVisibleFaq =
      category?.is_internal_generated === true &&
      category?.template !== 'hub_overview' &&
      Array.isArray(category.faq_data) &&
      category.faq_data.length > 0;

    if (shouldRenderVisibleFaq) {
      schema["@graph"].push({
        "@type": "FAQPage",
        "@id": buildAbsoluteSiteUrl(`/${category.slug}/#faq`),
        "mainEntity": category.faq_data.map((faq: any) => ({
          "@type": "Question",
          "name": String(faq.question || "").trim(),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": String(faq.answer || "")
              .replace(/<[^>]+>/g, '')
              .replace(/\n/g, ' ')
              .trim()
          }
        }))
      });
    }

    return JSON.stringify(schema);
  }, [category]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
      }, { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    const sections = ["content-top", "vergleich", "content-bottom", "faq"];
    sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [category, projects]);

  useEffect(() => {
    hasSignaledReadyRef.current = false;
    setPrerenderBlocked({ routeKey: `category:${location.pathname}`, timeoutMs: 12000 });
  }, [location.pathname]);

  useEffect(() => {
    const routeKey = `category:${location.pathname}`;
    const isCriticalLoaded = isCatLoading === false && isProjLoading === false;

    if (!isCriticalLoaded || hasSignaledReadyRef.current) {
      return;
    }

    let raf1 = 0;
    let raf2 = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        const didSet = setPrerenderReady(routeKey);
        if (didSet) {
          hasSignaledReadyRef.current = true;
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [isCatLoading, isProjLoading, jsonLd, location.pathname]);

  if (isCatLoading || isProjLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-[#0A0F1C]" /></div>;
  
  if (!category || category.is_active === false) {
      return (
          <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-slate-50">
              <Helmet>
                  <title>404 - Seite nicht gefunden | Standard Portal</title>
                  <meta name="robots" content="noindex, nofollow" />
              </Helmet>
              <h1 className="text-4xl font-black text-[#0A0F1C]">404</h1>
              <p className="text-slate-500 font-medium">Diese Seite existiert nicht oder ist derzeit offline.</p>
              <Link to="/"><Button variant="outline" className="mt-4">Zurück zur Startseite</Button></Link>
          </div>
      );
  }

  const isStandardLayoutPage = (category as any)?.is_internal_generated === true || category?.template === 'review';
  const currentUrl = getCategoryCanonicalUrl(category.slug);

  if (category.template === 'hub_overview') {
      return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Helmet>
                <title>{category.meta_title || category.name}</title>
                <link rel="canonical" href={currentUrl} />
            </Helmet>
            
            {/* JSON-LD ausgelagert aus Helmet! */}
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
            
            <Header /><HubTemplate category={category} /><Footer />
        </div>
      );
  }

  if (isStandardLayoutPage) {
    const currentMonthYear = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    const heroImage = getCategoryHeroImage(category);
    const widgetType = ((category as any).comparison_widget_type ?? null) as string | null;
    const widgetConfig = ((category as any).comparison_widget_config ?? null) as Record<string, unknown> | null;
    const hasWidgetCode = !!(category as any).comparison_widget_code;
    const hasExternalWidget = widgetType === "mr-money" || widgetType === "html" || hasWidgetCode;

    const introTitle = category.intro_title || "Das Wichtigste in Kürze";
    const comparisonTitle = category.comparison_title || "Alle Anbieter im Vergleich";
    const featuresTitle = category.features_title || "Inhalt";

    return (
      <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAFAFA]">
        <Helmet>
          <title>{category.meta_title || `${category.name}`}</title>
          <meta name="description" content={category.meta_description || ""} />
          <link rel="canonical" href={currentUrl} />
        </Helmet>
        
        {/* JSON-LD ausgelagert aus Helmet! */}
        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        )}
        
        <Header />
        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="border-b border-white/5 bg-[#0a0a0a] sticky top-[65px] z-30 shadow-md">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 h-12 flex items-center text-sm font-medium text-slate-400 overflow-hidden">
                <Link to="/" className="hover:text-orange-500 flex items-center gap-1 transition-colors"><Home className="w-4 h-4"/> Startseite</Link>
                <span className="mx-2 text-slate-600">/</span>
                <span className="text-white truncate font-semibold">{category.name}</span>
            </div>
          </div>

          {/* Hero */}
          <section className="relative w-full min-h-[500px] md:min-h-[60vh] overflow-hidden rounded-b-[3.5rem] shadow-2xl shadow-slate-300/50 z-20 flex items-center justify-center bg-[#0a0a0a]">
            <div className="absolute inset-0 z-0"><img src={heroImage} alt="Background" className="w-full h-full object-cover object-center opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent"></div></div>
            <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center pt-32 pb-16 md:pt-40 md:pb-20 flex flex-col items-center justify-center">
              <div className="flex justify-center mb-6 md:mb-8"><div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-orange-400 px-5 py-2 rounded-full shadow-lg text-[10px] md:text-xs font-bold uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-orange-500" />{category.hero_pretitle || "Redaktioneller Überblick"}</div></div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mb-6 md:mb-8 leading-tight md:leading-[1.1] drop-shadow-2xl px-2">{category.h1_title || category.name}</h1>
              {category.hero_headline && (<p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto antialiased px-4">{category.hero_headline}</p>)}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 bg-white/5 backdrop-blur-sm p-3 rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto w-full sm:w-auto">
                <div className="flex items-center gap-3 px-5 md:px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm w-full sm:w-auto">
                  <div className="p-2 bg-green-50 rounded-full text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left text-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Markt-Überblick</div>
                    <div className="text-sm font-bold">Aktualisiert</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 md:px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm w-full sm:w-auto">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left text-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Letzter Check</div>
                    <div className="text-sm font-bold">{currentMonthYear}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-12 lg:flex lg:gap-12 relative z-10 -mt-10">
              <div className="lg:w-2/3" ref={contentTopRef}>
                
                {/* Intro Box */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                  <div className="flex items-start gap-6"><div className="hidden md:flex p-4 bg-orange-50 rounded-2xl text-orange-500 shrink-0"><Lightbulb className="w-8 h-8" /></div><div><h2 className="font-bold text-[#0A0F1C] text-2xl tracking-tight">{introTitle}</h2></div></div>
                </div>

                {category.long_content_top && (<div className="bg-transparent mb-16 px-2 mt-8"><article id="content-top" className="scroll-mt-32 article-content article-content--lg article-content--brand max-w-none"><div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(category.long_content_top) }} /></article></div>)}
                
                {/* --- INTELLIGENTE WEICHE (Rechner vs. Liste) --- */}
                {hasExternalWidget ? (
                    <div id="vergleich" className="scroll-mt-32 mb-10">
                        <div className="mb-8 px-2">
                            <Badge variant="outline" className="mb-3 border-orange-200 text-orange-600 bg-orange-50 px-3 py-1">Live Rechner</Badge>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1C] tracking-tight flex items-center gap-3">{comparisonTitle}</h2>
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            <UniversalWidgetLoader
                              htmlCode={(category as any).comparison_widget_code}
                              widgetType={widgetType}
                              widgetConfig={widgetConfig}
                            />
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">Daten werden bereitgestellt durch unseren Partner.</p>
                    </div>
                ) : (
                    projects.length > 0 && (<div id="vergleich" className="scroll-mt-32 mb-10"><div className="mb-8 px-2"><Badge variant="outline" className="mb-3 border-orange-200 text-orange-600 bg-orange-50 px-3 py-1">{category.hero_badge_text || "Ausgewählte Anbieter"}</Badge><h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1C] tracking-tight flex items-center gap-3">{comparisonTitle}</h2></div><div className="space-y-6">{projects.map((proj, idx) => (<ProjectCard key={proj.id} project={proj} index={idx} category={category} />))}</div></div>)
                )}

                <RelatedComparisons currentSlug={category.slug} />

                <div className="mb-16">
                    <AffiliateDisclaimer />
                </div>

                {category.long_content_bottom && (<div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/30 border border-slate-100 mb-16"><article id="content-bottom" className="scroll-mt-32 article-content article-content--lg article-content--brand max-w-none"><div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(category.long_content_bottom) }} /></article></div>)}
                
                {/* --- HIER WURDE DIE FALSCHE FAQ-BOX ENTFERNT UND DURCH EINEN PASSENDEN HEADER ERSETZT --- */}
                {category.faq_data && Array.isArray(category.faq_data) && (
                  <section id="faq" className="scroll-mt-32 mb-16">
                    <div className="mb-8 px-2">
                        <Badge variant="outline" className="mb-3 border-orange-200 text-orange-600 bg-orange-50 px-3 py-1">FAQ</Badge>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1C] tracking-tight flex items-center gap-3">
                            Häufige Fragen zu {category.name}
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {category.faq_data.map((faq: any, index: number) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="group overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white px-0 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF8400]/35 hover:shadow-[0_24px_60px_-34px_rgba(255,132,0,0.26)] data-[state=open]:border-[#FF8400]/40 data-[state=open]:shadow-[0_26px_70px_-34px_rgba(255,132,0,0.24)]"
                          >
                            <AccordionTrigger className="px-6 py-5 text-left text-lg font-bold text-[#0A0F1C] transition-colors hover:text-[#FF8400] hover:no-underline [&>svg]:hidden">
                              <span className="flex w-full items-center gap-4 pr-2">
                                <span className="flex-1 leading-snug">{faq.question}</span>
                                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#FF8400]/20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,195,132,0.92),rgba(255,132,0,0.96)_62%,rgba(210,92,0,1))] shadow-[inset_0_2px_6px_rgba(255,255,255,0.55),0_12px_24px_-12px_rgba(255,132,0,0.8)] transition-all duration-300 group-hover:scale-[1.04] group-data-[state=open]:scale-105 group-data-[state=open]:rotate-3 group-data-[state=open]:shadow-[inset_0_2px_6px_rgba(255,255,255,0.55),0_18px_36px_-14px_rgba(255,132,0,0.9)]">
                                  <span className="absolute inset-[5px] rounded-full border border-white/25 bg-white/10"></span>
                                  <CheckCircle2 className="relative z-10 h-6 w-6 text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.22)]" />
                                </span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-10 pt-0 text-base leading-8 text-slate-600">
                              <div className="border-t border-slate-200/80 pt-5">
                                <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtmlWithBreaks(String(faq.answer || "")) }} />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </section>
                )}

                <div className="lg:hidden mb-16 mt-8">
                    <StarRatingWidget slug={category.slug} />
                </div>

              </div>
              
              <aside className="lg:w-1/3 lg:sticky top-24 self-start hidden lg:block max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                {!hasWidgetCode && topPick && (<div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden"><div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl">AUSGEWÄHLT</div><div className="flex items-center gap-3 mb-6"><div className="p-2.5 bg-orange-50 rounded-xl text-orange-500"><Trophy className="w-6 h-6" /></div><p className="font-bold text-[#0A0F1C] text-lg">Hervorgehobener Anbieter</p></div><div className="flex items-center gap-5 mb-6">{topPick.logo_url ? (<img src={topPick.logo_url} alt={topPick.name} className="w-20 h-20 object-contain rounded-2xl border border-slate-50 p-2" />) : (<div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400">{topPick.name.charAt(0)}</div>)}<div className="flex-1"><p className="font-bold text-xl text-[#0A0F1C] leading-tight mb-1.5">{topPick.name}</p><div className="mb-1"><EditorialBadgeBlock badgeText={topPick.badge_text || category.hero_badge_text || "AUSGEWÄHLT"} isWinner={true} index={0} /></div></div></div><Button asChild className="w-full font-bold bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 transition-colors h-14 rounded-xl group/sidebar-btn"><a href={topPick.affiliate_link} target="_blank">Jetzt ansehen* <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/sidebar-btn:translate-x-1" /></a></Button></div>)}
                
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8">
                  <p className="font-bold text-[#0A0F1C] mb-6 flex items-center gap-2 text-sm uppercase tracking-widest"><Zap className="w-4 h-4 text-orange-500"/> {featuresTitle}</p>
                  <ul className="text-sm space-y-4 font-medium">
                    {category.long_content_top && (<li><a href="#content-top" className={`flex items-center gap-3 transition-colors ${activeSection==='content-top'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='content-top'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> Einleitung</a></li>)}
                    
                    <li><a href="#vergleich" className={`flex items-center gap-3 transition-colors ${activeSection==='vergleich'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='vergleich'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> Anbieter & Tarife</a></li>
                    
                    {category.long_content_bottom && (<li><a href="#content-bottom" className={`flex items-center gap-3 transition-colors ${activeSection==='content-bottom'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='content-bottom'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> Ratgeber & Analyse</a></li>)}
                    {category.faq_data && (<li><a href="#faq" className={`flex items-center gap-3 transition-colors ${activeSection==='faq'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='faq'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> FAQ</a></li>)}
                  </ul>
                </div>

                <StarRatingWidget slug={category.slug} />

                {((category as any).sidebar_ad_html || (category as any).sidebar_ad_image) && (
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8 flex flex-col items-center justify-center overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold mb-4 w-full text-center">Anzeige</span>
                        {(category as any).sidebar_ad_html ? (
                            <div className="w-full flex justify-center items-center"><div dangerouslySetInnerHTML={{ __html: (category as any).sidebar_ad_html }} /></div>
                        ) : (
                            <img src={(category as any).sidebar_ad_image} alt="Werbung" className="max-w-full h-auto rounded-xl mx-auto" />
                        )}
                    </div>
                )}
                
                <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30"><p className="font-bold text-[#0A0F1C] mb-6 text-[10px] uppercase tracking-widest text-center">Unsere redaktionellen Standards</p><div className="space-y-4 text-sm text-slate-600 font-medium"><div className="flex items-center gap-4"><BookOpenTextIcon className="w-5 h-5 text-blue-600" /><span>Redaktioneller Ratgeber</span></div><div className="flex items-center gap-4"><ScaleIcon className="w-5 h-5 text-blue-600" /><span>Transparente Kriterien</span></div><div className="flex items-center gap-4"><ActivityIcon className="w-5 h-5 text-blue-600" /><span>Laufend aktualisiert</span></div></div></div>
              </aside>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.meta_title || category.name}</title>
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      
      {/* JSON-LD ausgelagert aus Helmet! */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      
      {category.custom_html_override ? (
        <>
          <Header />
          <CustomHtmlRenderer category={category} projects={projects} htmlContent={category.custom_html_override} />
          <RelatedComparisons currentSlug={category.slug} />
          <Footer />
        </>
      ) : (
        <><Header /><ComparisonTemplate category={category} projects={projects} /><Footer /></>
      )}
    </>
  );
}