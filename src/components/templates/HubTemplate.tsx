import "@/styles/article-content.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Layers, Zap, Search, LayoutGrid, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from '@/hooks/useCategories';
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml';
import { useSiteBrandName } from "@/hooks/useSettings";

interface HubTemplateProps {
  category: any;
}

export const HubTemplate = ({ category }: HubTemplateProps) => {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const brandName = useSiteBrandName();

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const manualSlugsString = category.custom_css || "";
        const manualSlugs = manualSlugsString.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        if (manualSlugs.length > 0) {
            const { data } = await supabase.from('categories').select('*').in('slug', manualSlugs).eq('is_active', true);
            if (data) {
                const sortedData = manualSlugs.map((slug: string) => data.find((c: any) => c.slug === slug)).filter(Boolean);
                setSubCategories(sortedData);
                setFilteredCategories(sortedData);
            }
        } else {
            if (category.slug) {
                const { data } = await supabase.from('categories').select('*').eq('parent_group', category.slug).eq('is_active', true).order('sort_order', { ascending: true });
                if (data) {
                    setSubCategories(data);
                    setFilteredCategories(data);
                }
            }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubCategories();
  }, [category]);

  // Live Search Filter
  useEffect(() => {
    if (!searchQuery) {
        setFilteredCategories(subCategories);
    } else {
        const lower = searchQuery.toLowerCase();
        setFilteredCategories(subCategories.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            (c.meta_description && c.meta_description.toLowerCase().includes(lower))
        ));
    }
  }, [searchQuery, subCategories]);

  const getIcon = (slug: string) => {
    if (!slug) return "★";
    if (slug.includes('krypto') || slug.includes('bitcoin')) return "₿";
    if (slug.includes('bank') || slug.includes('konto')) return "€";
    if (slug.includes('love') || slug.includes('dating')) return "♥";
    return "➜";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Helmet>
        <title>{category?.meta_title || category?.name}</title>
        <meta name="description" content={category?.meta_description} />
      </Helmet>

      {/* --- CINEMATIC HERO SECTION --- */}
      <div className="relative min-h-[65vh] flex flex-col justify-center items-center overflow-hidden bg-slate-900 pb-32">
        
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
            {category.hero_image_url ? (
                <img 
                    src={category.hero_image_url} 
                    className="w-full h-full object-cover opacity-70"
                    alt={category?.name ? `${category.name} Hero-Bild` : "Kategorie Hero-Bild"} 
                    fetchPriority="high"
                    loading="eager"
                    decoding="sync"
                />
            ) : (
                <div className="w-full h-full bg-slate-900" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-50"></div>
        </div>
        
        {/* Animated Dust/Noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center pt-20">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-8 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Layers className="w-3 h-3 text-orange-400" /> {brandName} Themen-Hub
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight text-white drop-shadow-2xl leading-[1.1]">
                {category?.h1_title || category?.name}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed antialiased font-medium mb-12 drop-shadow-md">
                {category?.hero_headline || category?.description || "Wähle einen Bereich für den detaillierten Vergleich."}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2 transition-transform transform group-hover:-translate-y-0.5">
                    <Search className="w-6 h-6 text-slate-400 ml-4" />
                    <Input 
                        placeholder="Was möchtest du vergleichen?" 
                        className="border-0 shadow-none focus-visible:ring-0 text-lg h-14 bg-transparent text-slate-900 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button size="lg" className="h-12 px-8 rounded-lg bg-slate-900 hover:bg-orange-600 text-white font-bold transition-all shadow-lg">
                        Suchen
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="container mx-auto px-4 -mt-24 relative z-20 pb-16">
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-pulse"></div>
                ))}
            </div>
        ) : (
            <>
                <div className="flex items-center justify-between mb-8 px-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-slate-200/50">
                        <LayoutGrid className="w-4 h-4 text-orange-500" /> 
                        <span>{filteredCategories.length} Kategorien</span>
                    </div>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-orange-600 hover:underline text-sm font-medium transition-colors">
                            Filter löschen
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((sub) => (
                        <Link to={`/${sub.slug}`} key={sub.id} className="group block h-full">
                            
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-orange-500/10 border border-slate-100 hover:border-orange-500/20 transition-all duration-300 h-full flex flex-col relative isolate group-hover:-translate-y-2 overflow-hidden">
                                
                                {/* --- IMAGE CARD LOGIC --- */}
                                {sub.card_image_url ? (
                                    <>
                                        {/* Image Wrapper - NO ZOOM EFFECT */}
                                        <div className="relative h-64 w-full overflow-hidden z-0">
                                            <img 
                                                src={sub.card_image_url} 
                                                className="w-full h-full object-cover" 
                                                alt={sub.name} 
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 z-10"></div>
                                            
                                            {/* BADGE REMOVED FROM HERE - TO AVOID COVERING TEXT */}
                                        </div>

                                        <div className="p-8 flex flex-col flex-grow relative z-10 bg-white">
                                            
                                            {/* NEW BADGE POSITION: Above Title */}
                                            <div className="mb-4">
                                                 <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-100">
                                                    <TrendingUp className="w-3 h-3 text-orange-500" /> Vergleich
                                                 </span>
                                            </div>

                                            <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                                                {sub.name}
                                            </h3>
                                            
                                            <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed text-sm flex-grow font-medium">
                                                {sub.meta_description || "Detaillierte Analyse, Konditionen und Experten-Meinung im Vergleich."}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">Jetzt prüfen</span>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-orange-500 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-orange-200">
                                                    <ArrowRight className="w-5 h-5 text-slate-900 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* --- NO IMAGE FALLBACK (Icon stays here) --- */
                                    <div className="p-10 flex flex-col h-full relative overflow-hidden bg-white">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-100 transition-colors"></div>
                                        
                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100 group-hover:scale-110 transition-transform text-orange-500">
                                                {sub.icon ? <img src={sub.icon} alt={sub.name ? `${sub.name} Icon` : "Kategorie-Icon"} className="w-8 h-8 object-contain" /> : getIcon(sub.slug)}
                                            </div>
                                            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Analyse
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-orange-600 transition-colors relative z-10">
                                            {sub.name}
                                        </h3>
                                        
                                        <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed text-sm flex-grow relative z-10 font-medium">
                                            {sub.meta_description || "Entdecke die besten Angebote und vergleiche Konditionen neutral."}
                                        </p>
                                        
                                        <div className="mt-auto flex items-center text-slate-900 font-bold text-sm pt-4 group-hover:text-orange-600 relative z-10 cursor-pointer">
                                            Zum Vergleich <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-24 px-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 animate-pulse"><Search className="w-10 h-10" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Kein Treffer</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">Für "{searchQuery}" haben wir nichts gefunden.</p>
                            <Button onClick={() => setSearchQuery("")} variant="outline" className="border-slate-200 hover:bg-slate-50">Alles anzeigen</Button>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      {/* --- PREMIUM AD BREAK (Styled EXACTLY like a Card) --- */}
      {category?.sidebar_ad_html && (
        <div className="container mx-auto px-4 pb-20 flex justify-center">
            <div className="relative bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 flex flex-col items-center justify-center text-center overflow-hidden w-fit mx-auto min-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl z-10">
                    Anzeige
                </div>
                
                <div 
                    className="mt-4 flex justify-center items-center w-full h-full"
                    dangerouslySetInnerHTML={{ __html: category.sidebar_ad_html }} 
                />
            </div>
        </div>
      )}
      
      {/* --- SEO CONTENT SECTION (FULL WIDTH & LEFT ALIGNED) --- */}
      {category?.long_content_bottom && (
          <div className="bg-white border-t border-slate-200 py-24">
            {/* max-w-7xl macht es auf Desktop richtig breit */}
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="bg-slate-50/50 rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm text-left">
                    <h2 className="text-4xl font-black text-slate-900 mb-10 flex items-center gap-4 border-b border-slate-200 pb-6">
                        <Zap className="w-10 h-10 text-orange-500 fill-orange-500" /> 
                        Wissenswertes: {category.name}
                    </h2>
                    <div className="article-content article-content--lg article-content--brand article-content--soft max-w-none font-medium" dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(category.long_content_bottom) }} />
                </div>
            </div>
          </div>
      )}
    </div>
  );
};