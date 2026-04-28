import { useHomeContent, useSiteBrandName } from "@/hooks/useSettings";
import { ShieldCheck, Cup, GraphUp } from "@solar-icons/react";
import { sanitizeCmsHtml } from "@/lib/sanitizeHtml";

const DEFAULT_MISSION_IMAGE = "/big-threes/tiertarif-tierversicherung-startseitenbild.webp";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const resolveMissionImageUrl = (url: unknown) => {
  const cleanUrl = String(url ?? "").trim();

  if (!cleanUrl) return DEFAULT_MISSION_IMAGE;

  const normalizedUrl = cleanUrl.startsWith("//") ? `https:${cleanUrl}` : cleanUrl;

  try {
    const parsed = new URL(normalizedUrl);

    if (parsed.pathname.includes("/storage/v1/render/image/public/")) {
      parsed.pathname = parsed.pathname.replace("/storage/v1/render/image/public/", "/storage/v1/object/public/");
      parsed.search = "";
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return normalizedUrl;
  }
};

const createStructuredMissionHtml = (seo: Record<string, any> | undefined) => {
  const headline = seo?.headline || "TierTarif: Dein Kompass für klare Entscheidungen";
  const intro = seo?.intro || "TierTarif bündelt Informationen rund um Tierversicherungen, Tierarztkosten und OP-Schutz für Hunde, Katzen und Pferde.";
  const block1Title = seo?.block1_title || "Unser Ansatz";
  const block1Text = seo?.block1_text || "Wir strukturieren komplexe Tarifmerkmale wie Wartezeit, Selbstbeteiligung, Erstattung und Leistungsgrenzen verständlich und übersichtlich.";
  const block2Title = seo?.block2_title || "Laufende Pflege";
  const block2Text = seo?.block2_text || "Unsere Inhalte werden fortlaufend gepflegt, damit Tierhalter wichtige Unterschiede besser einordnen können.";

  return `
    <h2>${escapeHtml(headline)}</h2>
    <p>${escapeHtml(intro)}</p>
    <h3>${escapeHtml(block1Title)}</h3>
    <p>${escapeHtml(block1Text)}</p>
    <h3>${escapeHtml(block2Title)}</h3>
    <p>${escapeHtml(block2Text)}</p>
  `;
};

export const HomeSEOText = () => {
  const { content } = useHomeContent();
  const brandName = useSiteBrandName();
  const seo = content?.seo as Record<string, any> | undefined;

  const manualLongText = typeof seo?.long_text === "string" ? seo.long_text.trim() : "";
  const seoContent = manualLongText || createStructuredMissionHtml(seo);

  const badge = seo?.badge || "Unsere Mission";
  const cardImage = resolveMissionImageUrl(seo?.card_image_url);
  const cardImageAlt = seo?.card_image_alt || `${brandName} Mission`;
  const cardEyebrow = seo?.card_eyebrow || brandName;
  const cardTitle = seo?.card_title || "Tier Guide";
  const cardTierLabel = seo?.card_tier_label || "Premium";
  const cardMetricLeft = seo?.card_metric_left || "DATEN: gepflegt";
  const cardMetricRight = seo?.card_metric_right || "FOKUS: Überblick";

  if (!seoContent) return null;

  return (
    <section className="relative overflow-hidden border-y border-primary/10 bg-[#f7fbf8] py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-96 w-96 rounded-full bg-secondary/12 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7 xl:col-span-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-px w-8 bg-secondary" />
              <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">
                {badge}
              </span>
            </div>
            <div className="home-rich-text max-w-none break-words text-[#102f2c] [overflow-wrap:anywhere] [&_a]:font-semibold [&_a]:text-primary hover:[&_a]:text-secondary [&_h2]:mb-5 [&_h2]:mt-0 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:leading-[1.08] [&_h2]:tracking-tight [&_h2]:text-[#071f1d] md:[&_h2]:text-4xl [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-[1.2] [&_h3]:tracking-tight [&_h3]:text-[#071f1d] md:[&_h3]:text-2xl [&_p]:mb-5 [&_p]:text-lg [&_p]:font-medium [&_p]:leading-8 [&_p]:text-[#234844] [&_strong]:font-extrabold [&_strong]:text-[#071f1d]">
              <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(seoContent) }} />
            </div>
          </div>

          <div className="relative flex min-w-0 justify-center lg:col-span-5 lg:justify-end xl:col-span-4">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/22 blur-[100px] sm:h-[400px] sm:w-[300px]" />
            <div className="group relative z-10 h-[368px] w-[240px] max-w-full cursor-pointer overflow-hidden rounded-[2rem] border-[4px] border-[#083f3b] bg-[#071f1d] shadow-2xl shadow-primary/20 transition-all duration-500 ease-out sm:h-[460px] sm:w-[300px] sm:rotate-3 sm:hover:rotate-0 sm:hover:scale-105">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#061615] via-transparent to-[#061615]/60" />
              <img
                src={cardImage}
                width="300"
                height="460"
                alt={cardImageAlt}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  const image = event.currentTarget;
                  if (!image.src.endsWith(DEFAULT_MISSION_IMAGE)) {
                    image.src = DEFAULT_MISSION_IMAGE;
                  }
                }}
                className="h-full w-full object-cover opacity-85 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
              />

              <div className="absolute left-0 top-0 z-30 flex w-full items-start justify-between p-5">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">
                    {cardEyebrow}
                  </span>
                  <span className="text-lg font-bold leading-none text-white">
                    {cardTierLabel}
                  </span>
                </div>
                <ShieldCheck weight="Bold" className="h-6 w-6 text-emerald-300" />
              </div>

              <div className="absolute bottom-0 left-0 z-30 w-full bg-gradient-to-t from-black/90 to-transparent p-5">
                <span className="font-display text-xl font-bold uppercase tracking-wide text-white">
                  {cardTitle}
                </span>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2">
                    <GraphUp className="h-4 w-4 text-emerald-300" />
                    <span className="font-mono text-[10px] text-slate-200">{cardMetricLeft}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cup className="h-4 w-4 text-secondary" />
                    <span className="font-mono text-[10px] text-slate-200">{cardMetricRight}</span>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 z-40 translate-x-[-100%] bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
