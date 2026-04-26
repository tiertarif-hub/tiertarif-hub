import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Code2,
  Compass,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings, useSiteBrandName } from "@/hooks/useSettings";
import { useForceSEO } from "@/hooks/useForceSEO";
import {
  ABOUT_PAGE_SETTING_KEY,
  DEFAULT_ABOUT_HERO_IMAGE,
  getAboutPublicPath,
  normalizeAboutPageContent,
  type AboutTeamMember,
} from "@/lib/aboutContent";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";
import { buildAbsoluteSiteUrl } from "@/lib/routes";

const splitText = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const normalizeInternalLink = (href: string) => {
  if (!href) return "/kontakt";
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return href;
  return href.startsWith("/") ? href : `/${href}`;
};

const getInitials = (member: AboutTeamMember) => {
  const fallback = member.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return member.initials || fallback || "RS";
};

const SmartMemberImage = ({ member }: { member: AboutTeamMember }) => {
  const optimizedImage = optimizeSupabaseImageUrl(member.image_url, 900, 84);

  if (!optimizedImage) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,132,0,0.28),transparent_34%),linear-gradient(135deg,#0E1F53_0%,#101827_48%,#FF8400_140%)]">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 text-4xl font-black text-white shadow-2xl backdrop-blur">
          {getInitials(member)}
        </div>
      </div>
    );
  }

  return (
    <>
      <img
        src={optimizedImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover object-top opacity-45 blur-2xl saturate-125 transition-transform duration-700 group-hover:scale-125"
      />
      <div className="absolute inset-0 bg-[#071121]/35" />
      <img
        src={optimizedImage}
        alt={member.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-[1.45rem] object-contain object-top shadow-2xl transition-transform duration-700 group-hover:scale-[1.025]"
      />
    </>
  );
};

export default function About() {
  const location = useLocation();
  const { data: settings } = useSettings();
  const brandName = useSiteBrandName();
  const content = normalizeAboutPageContent(settings?.[ABOUT_PAGE_SETTING_KEY]);
  const activeMembers = content.team_members.filter((member) => member.is_active);
  const ctaLink = normalizeInternalLink(content.cta_button_link);
  const ctaIsExternal = ctaLink.startsWith("http://") || ctaLink.startsWith("https://") || ctaLink.startsWith("mailto:");
  const aboutPath = getAboutPublicPath(content.slug);
  const canonicalUrl = `https://example.com${aboutPath}`;
  const heroImage = optimizeSupabaseImageUrl(content.hero_image_url, 1920, 84) || DEFAULT_ABOUT_HERO_IMAGE;

  useForceSEO(content.meta_description);

  const ctaButtonContent = (
    <>
      {content.cta_button_text}
      <ArrowRight className="ml-2 h-4 w-4" />
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased">
      <Helmet key={location.pathname} prioritizeSeoTags defer={false}>
        <html lang="de" />
        <title>{content.meta_title}</title>
        <meta name="description" content={content.meta_description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={content.enabled ? "index, follow" : "noindex, follow"} />
        <meta property="og:title" content={content.meta_title} />
        <meta property="og:description" content={content.meta_description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={heroImage} />
      </Helmet>

      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#071121] pt-32 pb-20 md:pt-40 md:pb-28">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-[#071121]/72" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(255,132,0,0.24),transparent_28%),radial-gradient(circle_at_84%_0%,rgba(59,130,246,0.28),transparent_34%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />

          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-5xl text-center">
              <Badge className="mb-6 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-100 shadow-lg backdrop-blur hover:bg-white/10">
                <Sparkles className="mr-2 h-4 w-4 text-[#FF8400]" />
                {content.badge}
              </Badge>
              <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
                {content.hero_title}
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-relaxed text-slate-100 md:text-xl">
                {content.hero_subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8 md:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E1F53] text-white shadow-lg shadow-[#0E1F53]/20">
                  <Compass className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[#0E1F53] md:text-4xl">{content.intro_title}</h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600 md:text-lg">
                  {splitText(content.intro_text).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#0E1F53] text-white shadow-2xl shadow-[#0E1F53]/25">
              <CardContent className="relative h-full p-8 md:p-10">
                <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#FF8400]/20 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF8400] text-white shadow-lg shadow-[#FF8400]/30">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{content.mission_title}</h2>
                  <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-100 md:text-lg">
                    {splitText(content.mission_text).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#FF8400]">
                <BadgeCheck className="h-4 w-4" /> Standards
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[#0E1F53] md:text-4xl">{content.values_headline}</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {content.values.map((value, index) => {
                const icons = [Layers3, Code2, ShieldCheck];
                const Icon = icons[index % icons.length];

                return (
                  <div key={value.id} className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#FF8400] shadow-sm ring-1 ring-slate-200 transition-colors group-hover:bg-[#FF8400] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-[#0E1F53]">{value.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0E1F53]/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#0E1F53]">
              <Users className="h-4 w-4 text-[#FF8400]" /> Team
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#0E1F53] md:text-5xl">{content.team_headline}</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{content.team_subheadline}</p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {activeMembers.map((member) => (
              <article key={member.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/50">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[2rem] bg-[#0E1F53]">
                  <SmartMemberImage member={member} />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#071121] via-[#071121]/78 to-transparent" />
                  {member.badge && <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">{member.badge}</div>}
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-2xl font-black text-white drop-shadow">{member.name}</h3>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-orange-100 drop-shadow">{member.role}</p>
                  </div>
                </div>

                <div className="p-7">
                  <p className="text-base font-semibold leading-relaxed text-[#0E1F53]">{member.short_bio}</p>
                  <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
                    {splitText(member.long_bio).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 md:pb-28">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#071121] p-8 text-white shadow-2xl shadow-slate-300/50 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,132,0,0.28),transparent_32%),radial-gradient(circle_at_88%_88%,rgba(59,130,246,0.22),transparent_34%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-100">
                  <Bot className="h-4 w-4" /> {brandName} Netzwerk
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{content.cta_title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-200">{content.cta_text}</p>
              </div>

              {ctaIsExternal ? (
                <Button asChild className="h-12 rounded-2xl bg-[#FF8400] px-7 font-black text-white shadow-lg shadow-[#FF8400]/25 hover:bg-[#ff6f00]">
                  <a href={ctaLink} target={ctaLink.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">{ctaButtonContent}</a>
                </Button>
              ) : (
                <Button asChild className="h-12 rounded-2xl bg-[#FF8400] px-7 font-black text-white shadow-lg shadow-[#FF8400]/25 hover:bg-[#ff6f00]">
                  <Link to={ctaLink}>{ctaButtonContent}</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
