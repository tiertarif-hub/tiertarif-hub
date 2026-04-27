import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Gamepad2, BrainCircuit, Users, LayoutGrid, ChevronDown, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useHeaderConfig, useSiteBrandName } from "@/hooks/useSettings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { normalizeNavigableHref } from "@/lib/routes";

const iconMap: Record<string, any> = {
  LayoutGrid, Gamepad2, BrainCircuit, Users, FileText
};

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const config = useHeaderConfig();
  const brandName = useSiteBrandName();

  const navLinks = config.nav_links || [];
  const hubLinks = config.hub_links || [];
  const toolsLinks = config.tools_links || [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getHeaderStyle = () => {
    return {
      wrapper: "bg-white/95 backdrop-blur-md border-b border-[#D8E5E1] shadow-sm shadow-primary/5",
      rankText: "text-primary",
      scoutText: "text-secondary",
      toggleBtn: "text-primary hover:bg-secondary/10 hover:text-secondary",
      navLink: "text-[#173D3A] hover:text-secondary"
    };
  };

  const style = getHeaderStyle();

  return (
    // KYRA FIX: 'overflow-hidden' entfernt, damit Dropdowns sichtbar sind!
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 h-[65px] flex items-center ${style.wrapper}`}
    >
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
          style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px'
          }}
        />
      )}

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            <span className={`text-2xl md:text-3xl font-display font-extrabold tracking-tight transition-colors ${style.rankText}`}>
              {brandName}
              <span className={style.scoutText}>.</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link: any, idx: number) => {
              const hasSubmenu = link.items && link.items.length > 0;
              
              if (hasSubmenu) {
                return (
                  <div key={idx} className="relative group h-full flex items-center">
                    <Link to={normalizeNavigableHref(link.url)} className={`flex items-center gap-1.5 text-sm font-bold transition-colors py-2 ${style.navLink}`}>
                      {link.label}
                      <ChevronDown className="w-4 h-4 text-secondary transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    
                    {/* RICH MEGA MENU DROPDOWN */}
                    <div className="absolute top-[90%] left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 w-max max-w-[800px] z-50">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 overflow-hidden ring-1 ring-black/5 relative">
                        {/* Kleiner Pfeil oben */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-slate-100"></div>
                        
                        <div className="relative bg-white z-10 grid grid-cols-1 gap-2 min-w-[320px]">
                          {link.items.map((sub: any, sIdx: number) => (
                            <Link 
                              key={sIdx} 
                              to={normalizeNavigableHref(sub.url)} 
                              className="group/item flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100"
                            >
                              {/* Icon / Bild */}
                              {sub.image_url ? (
                                <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 shadow-sm overflow-hidden flex-shrink-0 group-hover/item:shadow-md transition-all">
                                    <img src={sub.image_url} alt={sub.label ? `${sub.label} Vorschau` : "Navigationsbild"} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover/item:text-white group-hover/item:bg-secondary transition-all">
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="font-bold text-sm text-slate-800 group-hover/item:text-secondary transition-colors flex items-center justify-between">
                                    {sub.label}
                                    <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-secondary">→</span>
                                </div>
                                {sub.description ? (
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 group-hover/item:text-slate-600">{sub.description}</p>
                                ) : (
                                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-medium">Jetzt vergleichen</p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  to={normalizeNavigableHref(link.url)}
                  className={`text-sm font-medium transition-colors relative group py-2 ${style.navLink}`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
            
            <Link to={normalizeNavigableHref(config.button_url)}>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-lg shadow-secondary/25 transition-all hover:-translate-y-0.5 hover:shadow-secondary/35 px-6">
                {config.button_text}
              </Button>
            </Link>
          </nav>

          <button 
            className={`md:hidden p-2 rounded-lg transition-colors ${style.toggleBtn}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div 
            className="fixed left-0 right-0 bottom-0 top-[65px] bg-white z-40 md:hidden overflow-y-auto border-t border-slate-100 animate-in slide-in-from-right-10 fade-in duration-300"
            style={{ height: 'calc(100dvh - 65px)' }}
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
            
            {/* Hub Links Grid */}
            <div className="grid grid-cols-2 gap-4 mb-2">
                {hubLinks.filter((link: any) => link.enabled !== false).map((link: any) => {
                  const Icon = iconMap[link.icon] || LayoutGrid;
                  const isComingSoon = link.isComingSoon === true;

                  return (
                    <div key={link.label} className="relative">
                      {isComingSoon && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 whitespace-nowrap">
                          Bald verfügbar
                        </div>
                      )}
                      <Link
                          to={isComingSoon ? "#" : normalizeNavigableHref(link.url)}
                          onClick={(e) => {
                            if (isComingSoon) {
                              e.preventDefault();
                              return;
                            }
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all group shadow-sm duration-200 h-full
                            ${isComingSoon 
                              ? "opacity-60 grayscale cursor-default" 
                              : "hover:border-secondary/40 hover:bg-white active:scale-95"
                            }
                          `}
                      >
                          <div className={`mb-2 transition-transform ${isComingSoon ? "text-slate-400" : "text-secondary group-hover:scale-110"}`}>
                             <Icon className="w-6 h-6" />
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wide text-center ${isComingSoon ? "text-slate-500" : "text-slate-700"}`}>
                            {link.label}
                          </span>
                      </Link>
                    </div>
                  );
                })}
            </div>


            {toolsLinks.filter((link: any) => link.enabled !== false).length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 mb-3">Tools & Services</div>
                <div className="flex flex-col gap-2">
                  {toolsLinks.filter((link: any) => link.enabled !== false).map((link: any, idx: number) => {
                    const Icon = iconMap[link.icon] || FileText;
                    return (
                      <Link
                        key={`${link.label}-${idx}`}
                        to={normalizeNavigableHref(link.url)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-secondary/40 hover:text-secondary transition-all"
                      >
                        <Icon className="w-4 h-4 text-secondary" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Navigation (with Accordion for Submenus) */}
            <div className="flex flex-col">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {navLinks.map((link: any, idx: number) => {
                    const hasSubmenu = link.items && link.items.length > 0;

                    if (hasSubmenu) {
                      return (
                        <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-100">
                          <AccordionTrigger className="text-lg font-bold text-slate-800 hover:text-secondary py-4 hover:no-underline">
                            {link.label}
                          </AccordionTrigger>
                          <AccordionContent>
                             <div className="flex flex-col space-y-1 pl-4 pb-4 border-l-2 border-secondary/25 ml-1">
                                {link.items.map((sub: any, sIdx: number) => (
                                  <Link
                                    key={sIdx}
                                    to={normalizeNavigableHref(sub.url)}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-2 text-base font-medium text-slate-600 hover:text-secondary block"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                             </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }

                    return (
                      <Link
                        key={idx}
                        to={normalizeNavigableHref(link.url)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-bold text-slate-800 hover:text-secondary py-4 border-b border-slate-100 flex justify-between items-center group"
                      >
                        {link.label}
                        <span className="text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all">→</span>
                      </Link>
                    );
                  })}
                </Accordion>
            </div>

            <Link to={normalizeNavigableHref(config.button_url)} onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-14 text-lg rounded-xl shadow-xl shadow-secondary/25">
                {config.button_text}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};