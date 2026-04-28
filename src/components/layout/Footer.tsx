import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { useFooterConfig } from "@/hooks/useSettings";
import { normalizeNavigableHref } from "@/lib/routes";
import { DEFAULT_BRAND_NAME } from "@/lib/constants";

type FooterLinkItem = {
  label?: string;
  url?: string;
};

export const Footer = () => {
  const config = useFooterConfig();

  const legalLinks = config.legal_links || [];
  const popularLinks = config.popular_links || [];
  const toolsLinks = config.tools_links || [];
  const brandName = String(config.title || DEFAULT_BRAND_NAME).trim();

  const openCookieSettings = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.dispatchEvent(new Event("showCookieSettings"));
  };

  let finalDisclaimer = "*Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn du über einen Link auf dieser Seite einkaufst, erhalten wir möglicherweise eine Provision. Der Preis für dich ändert sich dabei nicht. Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt.";

  if (config.disclaimer && config.disclaimer.trim() !== "") {
    finalDisclaimer = config.disclaimer
      .replace(/Wenn Sie/g, "Wenn du")
      .replace(/für Sie/g, "für dich")
      .replace(/Ihnen/g, "dir")
      .replace(/ Sie /g, " dich ")
      .replace(
        "Unsere redaktionelle Unabhängigkeit bleibt davon unberührt.",
        "Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt."
      );
  }

  const renderFooterLinks = (links: FooterLinkItem[]) => (
    <ul className="space-y-3">
      {links.map((link, i) => {
        const label = String(link?.label ?? "").trim();
        if (!label) return null;

        return (
          <li key={`${label}-${i}`}>
            <Link
              to={normalizeNavigableHref(String(link?.url ?? "").trim())}
              className="tt-footer-link group flex items-center text-sm font-medium transition-all duration-200"
            >
              <span className="mr-0 h-[1px] w-0 overflow-hidden bg-secondary transition-all duration-200 group-hover:mr-2 group-hover:w-2" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <footer className="tt-coral-footer relative mt-0 overflow-hidden border-t border-secondary/40 py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/16 via-transparent to-white/22" />

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.055]"
        style={{
          backgroundImage: `radial-gradient(#063d39 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
        }}
      />

      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-white/18 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="tt-footer-surface rounded-[2rem] p-6 md:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="tt-footer-brand-card rounded-3xl p-5">
                <Link to="/" className="group block w-fit">
                  <span className="tt-green-pop text-3xl font-display font-extrabold tracking-tight">
                    {brandName}
                    <span className="text-secondary">.</span>
                  </span>
                </Link>
                <p className="tt-footer-muted mt-5 max-w-xs text-sm font-medium leading-relaxed">
                  {config.text_description || "Sachliche Vergleiche und Ratgeber rund um Tierversicherungen, OP-Schutz und wichtige Leistungsbedingungen."}
                </p>
              </div>
            </div>

            <div>
              <h4 className="tt-footer-ink mb-6 text-base font-bold uppercase tracking-wider">Vergleiche</h4>
              {renderFooterLinks(popularLinks)}
            </div>

            <div>
              <h4 className="tt-footer-ink mb-6 text-base font-bold uppercase tracking-wider">Rechtliches</h4>
              {renderFooterLinks(legalLinks)}
              <button
                onClick={openCookieSettings}
                className="tt-footer-link group mt-3 flex w-full cursor-pointer items-center text-left text-sm font-medium transition-all duration-200"
              >
                <span className="mr-0 h-[1px] w-0 overflow-hidden bg-secondary transition-all duration-200 group-hover:mr-2 group-hover:w-2" />
                Cookie-Einstellungen
              </button>
            </div>

            <div>
              <h4 className="tt-footer-ink mb-6 text-base font-bold uppercase tracking-wider">Tools & Services</h4>
              {renderFooterLinks(toolsLinks)}
            </div>

            <div className="flex flex-col justify-start">
              <h4 className="tt-footer-ink mb-6 text-base font-bold uppercase tracking-wider">Transparenz</h4>
              <div className="cursor-default rounded-2xl border border-primary/10 bg-white/55 p-5 shadow-lg shadow-primary/5 transition-colors hover:bg-white/70">
                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/15 p-2.5 text-primary transition-transform duration-300 group-hover:scale-110">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="tt-footer-ink mb-1 text-sm font-bold">
                      {config.text_checked || "Redaktioneller Überblick"}
                    </div>
                    <div className="tt-footer-muted text-xs leading-snug">
                      {config.text_update || "Fortlaufend gepflegte Daten und nachvollziehbare Vergleiche."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-primary/10 pt-8 text-sm tt-footer-muted md:flex-row">
            <p>{config.copyright_text || `© ${new Date().getFullYear()} ${brandName}. Alle Rechte vorbehalten.`}</p>

            <div className="flex items-center gap-6">
              <p className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
                {config.made_with_text} <Heart className="h-3.5 w-3.5 fill-secondary text-secondary" /> {config.made_in_text}
              </p>
            </div>
          </div>

          {finalDisclaimer && (
            <div className="mt-8 border-t border-primary/10 pt-6">
              <p className="tt-footer-muted mx-auto max-w-4xl text-center text-xs leading-relaxed">
                {finalDisclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
