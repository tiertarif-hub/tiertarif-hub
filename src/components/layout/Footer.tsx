import { Link } from "react-router-dom";
import { Heart, ShieldCheck } from "lucide-react";
import { useFooterConfig } from "@/hooks/useSettings";
import { normalizeNavigableHref } from "@/lib/routes";
import { DEFAULT_BRAND_NAME } from "@/lib/constants";

export const Footer = () => {
  const config = useFooterConfig();

  const legalLinks = config.legal_links || [];
  const popularLinks = config.popular_links || [];
  const toolsLinks = config.tools_links || [];
  const brandName = String(config.title || DEFAULT_BRAND_NAME).trim();

  // KYRA FIX: Trigger-Funktion für Cookie-Einstellungen
  const openCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("showCookieSettings"));
  };

  // --- DISCLAIMER LOGIK SAUBER AUSGELAGERT ---
  let finalDisclaimer = "*Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn du über einen Link auf dieser Seite einkaufst, erhalten wir möglicherweise eine Provision. Der Preis für dich ändert sich dabei nicht. Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt.";

  if (config.disclaimer && config.disclaimer.trim() !== "") {
    finalDisclaimer = config.disclaimer
      // 1. Du/Sie UX Konsistenz
      .replace(/Wenn Sie/g, "Wenn du")
      .replace(/für Sie/g, "für dich")
      .replace(/Ihnen/g, "dir")
      .replace(/ Sie /g, " dich ")
      // 2. Toxischen Unabhängigkeits-Claim der DB direkt abfangen (Safety Net!)
      .replace(
        "Unsere redaktionelle Unabhängigkeit bleibt davon unberührt.", 
        "Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt."
      );
  }

  return (
    <footer className="relative bg-[#063A36] pt-20 pb-12 overflow-hidden border-t border-secondary/20 mt-0">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      
      <div 
        className="absolute inset-0 z-0 opacity-[0.06]" 
        style={{
          backgroundImage: `radial-gradient(rgba(248,245,238,0.55) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to top, black 40%, transparent 100%)', 
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
        }}
      />

      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-16">
          
          {/* 1. BRANDING (CONSISTENT) */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="block w-fit group">
               <span className="text-3xl font-display font-extrabold tracking-tight text-white">
                  {brandName}
                  <span className="text-secondary">.</span>
               </span>
            </Link>
            <p className="text-[#DDEBE7] text-sm leading-relaxed max-w-xs">
              {config.text_description || "Sachliche Vergleiche und Ratgeber rund um Tierversicherungen, OP-Schutz und wichtige Leistungsbedingungen."}
            </p>
          </div>

          {/* 2. Links: Vergleiche */}
          <div>
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Vergleiche</h4>
            <ul className="space-y-3">
              {popularLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link 
                    to={normalizeNavigableHref(link.url)} 
                    className="text-[#DDEBE7] hover:text-white text-sm transition-all duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-200 overflow-hidden h-[1px] bg-secondary mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Links: Rechtliches */}
          <div>
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Rechtliches</h4>
            <ul className="space-y-3">
              {/* Dynamische Links aus der Datenbank */}
              {legalLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link
                    to={normalizeNavigableHref(String(link?.url ?? "").trim())}
                    className="text-[#DDEBE7] hover:text-white text-sm transition-all duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-200 overflow-hidden h-[1px] bg-secondary mr-0 group-hover:mr-2"></span>
                    {String(link?.label ?? "").trim()}
                  </Link>
                </li>
              ))}
              
              {/* Fester Button für Cookie-Einstellungen */}
              <li>
                <button
                  onClick={openCookieSettings}
                  className="text-[#DDEBE7] hover:text-white text-sm transition-all duration-200 flex items-center group w-full text-left cursor-pointer"
                >
                  <span className="w-0 group-hover:w-2 transition-all duration-200 overflow-hidden h-[1px] bg-secondary mr-0 group-hover:mr-2"></span>
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Tools & Services */}
          <div>
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Tools & Services</h4>
            <ul className="space-y-3">
              {toolsLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link 
                    to={normalizeNavigableHref(String(link?.url ?? "").trim())} 
                    className="text-[#DDEBE7] hover:text-white text-sm transition-all duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-200 overflow-hidden h-[1px] bg-secondary mr-0 group-hover:mr-2"></span>
                    {String(link?.label ?? "").trim()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Quality Badge */}
          <div className="flex flex-col justify-start">
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Transparenz</h4>
            <div className="bg-white/[0.07] border border-white/15 rounded-2xl p-5 hover:bg-white/[0.10] transition-colors cursor-default group">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-secondary/15 rounded-full text-[#DDEBE7] border border-secondary/30 group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm mb-1">{config.text_checked || "Redaktioneller Überblick"}</div>
                        <div className="text-xs text-[#BFD4CE] leading-snug">
                            {config.text_update || "Fortlaufend gepflegte Daten und nachvollziehbare Vergleiche."}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary/20 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#DDEBE7]">
          <p>{config.copyright_text || `© ${new Date().getFullYear()} ${brandName}. Alle Rechte vorbehalten.`}</p>
          
          <div className="flex items-center gap-6">
             <p className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                {config.made_with_text} <Heart className="w-3.5 h-3.5 text-secondary fill-secondary animate-pulse" /> {config.made_in_text}
             </p>
          </div>
        </div>
        
        {/* Disclaimer - Sauber über Variable gerendert */}
        {finalDisclaimer && (
            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-xs text-[#DDEBE7] text-center max-w-4xl mx-auto leading-relaxed">
                    {finalDisclaimer}
                </p>
            </div>
        )}
      </div>
    </footer>
  );
};