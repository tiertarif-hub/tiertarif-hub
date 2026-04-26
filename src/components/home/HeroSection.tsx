import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Magnifer, GraphUp, ShieldCheck, UsersGroupTwoRounded, Star } from '@solar-icons/react';
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useHomeContent } from "@/hooks/useSettings";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { Loader2, ExternalLink } from "lucide-react";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { content } = useHomeContent();
  const { data: searchResults = [], isLoading: isSearching } = useGlobalSearch(searchQuery);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!content) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/kategorien?search=${encodeURIComponent(searchQuery)}`);
        setIsSearchFocused(false);
    } else {
      toast.error("Bitte gib einen Suchbegriff ein.");
    }
  };

  const newTitle = content.hero?.title || "Vergleiche, Rechner und Ratgeber im Überblick.";
  const newSubtitle = content.hero?.subtitle || "Wir strukturieren zahlreiche Anbieter, damit du in Sekunden die richtige Wahl triffst. Spare Zeit, Geld und Nerven.";
  const badgeText = content.hero?.badge || "Update 2026";
  const searchPlaceholder = content.hero?.search_placeholder || "Was möchtest du vergleichen?";
  const searchButtonLabel = content.hero?.search_label || "Vergleichen";

  const showDropdown = isSearchFocused && searchQuery.length >= 2;
  const heroStats = Array.isArray(content.hero?.stats) && content.hero.stats.length > 0
    ? content.hero.stats.slice(0, 3)
    : [
        { title: "Viele", label: "Kategorien" },
        { title: "Aktive", label: "Community" },
        { title: "Laufend", label: "Aktualisiert" },
      ];

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-10 bg-[#0a0f1c] selection:bg-secondary/30 z-40">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/big-threes/tiertarif-forum-magazin-hero.webp"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center opacity-100"
            style={{
              maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1c]/5 to-[#0a0f1c] md:from-[#0a0f1c]/5 md:via-[#0a0f1c]/15 z-0" />

          <div className="absolute inset-0 z-0 opacity-80" 
               style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
            <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='0.5'/%3E%3Ccircle cx='33' cy='21' r='0.5'/%3E%3Ccircle cx='48' cy='48' r='0.5'/%3E%3Ccircle cx='18' cy='52' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <div className="absolute inset-0 animate-[pulse_2.5s_ease-in-out_infinite] [animation-delay:1s]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='75' cy='45' r='1'/%3E%3Ccircle cx='105' cy='105' r='1'/%3E%3Ccircle cx='45' cy='85' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <div className="absolute inset-0 animate-[pulse_3.5s_ease-in-out_infinite] [animation-delay:0.5s]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3Ccircle cx='180' cy='90' r='1.5'/%3E%3Ccircle cx='120' cy='200' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          </div>

          <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="container px-4 mx-auto relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/80 border border-white/20 backdrop-blur-md mb-8 shadow-lg animate-fade-in hover:bg-white/5 transition-colors cursor-default group">
            <span className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <Star weight="Bold" className="relative w-3.5 h-3.5 text-secondary" />
            </span>
            <span className="text-sm font-medium text-slate-100 tracking-wide group-hover:text-white transition-colors">{badgeText}</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight leading-[1.1] animate-fade-in animation-delay-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            {newTitle}
          </h1>
          
          <p className="text-lg md:text-xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200 font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            {newSubtitle}
          </p>

          <div ref={searchRef} className="relative group max-w-2xl mx-auto animate-fade-in animation-delay-300 z-[100]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/40 to-blue-500/40 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

            
            <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row gap-2 p-2 bg-primary/95 border border-white/20 backdrop-blur-xl rounded-2xl sm:rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-white/40 hover:border-white/30">
              <div className="flex-grow flex items-center px-4 h-14">
                <Magnifer weight="Bold" className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
                <Input 
                  type="text" 
                  placeholder={searchPlaceholder} 
                  className="bg-transparent border-none h-full w-full text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-0 font-medium"
                  value={searchQuery}
                  onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                />
                {isSearching && <Loader2 className="w-5 h-5 text-secondary animate-spin ml-2" />}
              </div>
              <Button type="submit" size="lg" className="rounded-xl sm:rounded-full h-14 px-8 bg-secondary hover:bg-secondary/90 text-white font-bold text-base shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all shrink-0">
                {searchButtonLabel}
              </Button>
            </form>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-200 text-left z-[100]">
                {searchResults.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        to={result.url}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-secondary transition-colors shrink-0 text-xl">
                          {result.icon || "🔍"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate group-hover:text-secondary transition-colors text-sm">
                            {result.title}
                          </h4>
                          {result.subtitle && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-secondary shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : !isSearching && searchQuery.length >= 2 ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-500 text-sm">Keine Treffer im Netzwerk für "<span className="font-bold text-slate-800">{searchQuery}</span>"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in animation-delay-500 relative z-0">
            {heroStats.map((stat, index) => {
              const icon = index === 0 ? (
                <GraphUp weight="Bold" className="w-5 h-5 text-blue-200" />
              ) : index === 1 ? (
                <UsersGroupTwoRounded weight="Bold" className="w-5 h-5 text-blue-200" />
              ) : (
                <ShieldCheck weight="Bold" className="w-5 h-5 text-green-400" />
              );

              return (
                <div key={`${stat.title}-${stat.label}-${index}`} className="flex items-center gap-3 group select-none">
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors border border-white/10 shadow-sm">
                    {icon}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold leading-none">{stat.title}</div>
                    <div className="text-slate-300 text-xs font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform translate-y-[1px] z-20 pointer-events-none">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px]">
              <path d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z" className="fill-background"></path>
          </svg>
      </div>

    </section>
  );
};