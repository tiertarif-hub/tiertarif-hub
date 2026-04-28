import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ForumSection() {
  
  // Wir holen die neuesten Beiträge (Limit für Slider-Futter)
  const { data: latestPosts, isLoading } = useQuery({
    queryKey: ["home-latest-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          id, 
          title, 
          slug, 
          featured_image_url, 
          created_at, 
          author_name, 
          seo_description,
          category_id,
          forum_categories ( name )
        `)
        .eq("is_active", true)
        .eq("status", "published")
        .order('created_at', { ascending: false })
        .limit(9); // Limit leicht erhöht für ein besseres Slider-Erlebnis am Desktop
      
      if (error) throw error;
      return data;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };
// KYRA UPDATE: Supabase Bild-Kompressor
  const optimizeImageUrl = (url: string, width = 600) => {
    if (!url) return "";

    try {
      const parsed = new URL(url);

      if (parsed.pathname.includes("/storage/v1/render/image/public/")) {
        parsed.pathname = parsed.pathname.replace("/render/image/public/", "/object/public/");
        ["width", "height", "quality", "resize", "format"].forEach((key) => parsed.searchParams.delete(key));
        return parsed.toString();
      }

      if (parsed.pathname.includes("/storage/v1/object/public/")) {
        return parsed.toString();
      }
    } catch {
      return url;
    }

    return url;
  };
  // 1:1 Parität mit der NewsSection (Magazin Edge-to-Edge Kartendesign)
  const PostCard = ({ post }: { post: any }) => (
    <Link 
      to={`/forum/${post.slug}`} 
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100/60 focus:outline-none focus:ring-4 focus:ring-orange-500/15"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
        {post.featured_image_url ? (
          <img 
            src={optimizeImageUrl(post.featured_image_url, 1536)} 
            alt={post.title}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" 
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-orange-50 text-slate-300">
            <BookOpen className="w-10 h-10 opacity-20" />
          </div>
        )}
      </div>

      {/* Content Wrapper (Padding 5 wie in NewsCard) */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.created_at)}
           </div>
           
           {post.forum_categories && (
             <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
               <BookOpen className="w-3 h-3 text-orange-500" />
               {/* @ts-ignore */}
               {post.forum_categories.name}
             </div>
           )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-orange-500 transition-colors line-clamp-2 min-h-[3rem]">
          {post.title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow min-h-[2.5rem]">
          {post.seo_description || "Lies den ganzen Artikel in unserem Magazin..."}
        </p>

        <div className="mt-auto pt-2 border-t border-slate-50">
           <div className="flex items-center justify-center w-full bg-slate-50 group-hover:bg-orange-500 text-slate-700 group-hover:text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300">
             Artikel lesen
             <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
           </div>
        </div>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-end mb-10">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />)}
           </div>
        </div>
      </section>
    );
  }

  if (!latestPosts || latestPosts.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-secondary" />
              Aktuelles aus dem Magazin
            </h2>
            <p className="text-lg text-slate-600">
              Die neuesten Ratgeber, Finanz-Tipps und Analysen unserer Redaktion.
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex group rounded-full px-6">
            <Link to="/forum">
              Alle Beiträge ansehen 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* --- UNIFIED SLIDER (Mobile & Desktop) --- */}
        <div className="relative w-full">
          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full pb-4"
          >
            <CarouselContent className="-ml-4">
              {latestPosts.map((post) => (
                // lg:basis-1/3 sichert exakt 3 Items nebeneinander am Desktop
                <CarouselItem key={post.id} className="pl-4 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-1/3 h-full">
                  <div className="h-full py-2"> 
                    <PostCard post={post} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Desktop Controls (Seitlich ausgelagert für bestes UI) */}
            <div className="hidden lg:block">
              <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white hover:bg-slate-900 hover:text-orange-500 border-none w-14 h-14 shadow-[0_8px_30px_rgb(249,115,22,0.3)] rounded-full transition-all duration-300 z-20 flex items-center justify-center hover:scale-110" />
              <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white hover:bg-slate-900 hover:text-orange-500 border-none w-14 h-14 shadow-[0_8px_30px_rgb(249,115,22,0.3)] rounded-full transition-all duration-300 z-20 flex items-center justify-center hover:scale-110" />
            </div>

            {/* Mobile Controls (Unter dem Slider platziert) */}
            <div className="flex lg:hidden justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 w-14 h-14 shadow-sm rounded-xl transition-all" />
              <CarouselNext className="static translate-y-0 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 w-14 h-14 shadow-sm rounded-xl transition-all" />
            </div>
          </Carousel>

          {/* Mobile CTA */}
          <div className="mt-6 text-center md:hidden">
            <Button asChild className="w-full rounded-xl font-bold h-12 text-base" size="lg">
              <Link to="/forum">
                Zum Magazin
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}