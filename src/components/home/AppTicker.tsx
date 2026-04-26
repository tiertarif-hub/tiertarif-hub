import { useWeightedApps } from "@/hooks/usePromotedApps";
import { useHomeContent } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AltArrowRight, Star, GraphUp } from "@solar-icons/react";
import { Link } from "react-router-dom";

export const AppTicker = () => {
  const { data: apps, isLoading } = useWeightedApps(15);
  const { content } = useHomeContent();
  const trust = content?.trust || {};
  const badgeText = trust.badge || "LIVE: Trend Apps letzte 24h";
  const headline = trust.headline || "Top Apps & Deals";
  const linkText = trust.link_text || "Alle Trends ansehen →";

  if (isLoading) {
    return <div className="py-12 container"><Skeleton className="h-32 w-full rounded-3xl" /></div>;
  }

  if (!apps || apps.length === 0) return null;

  const scrollingApps = [...apps, ...apps];

  return (
    <div className="w-full bg-[#FAFAFA] border-b border-slate-200 py-16 relative group/ticker overflow-hidden">
      <div className="container mx-auto px-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            {badgeText}
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0A0F1C] flex items-center justify-center md:justify-start gap-3 tracking-tight">
            <GraphUp weight="Bold" className="w-8 h-8 text-orange-500" />
            {headline}
          </h2>
        </div>

        <Link to="/top-apps" className="text-sm font-bold text-slate-500 hover:text-orange-500 transition-all flex items-center gap-2 group bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
          {linkText}
          <AltArrowRight weight="Bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="relative w-full overflow-hidden mask-gradient-x py-8">
        <div className="flex w-max gap-6 px-8 animate-scroll will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:transform-none">
          {scrollingApps.map((app, index) => {
            const numericRating = Number(app.rating || 5).toFixed(1);
            const isDuplicate = index >= apps.length;

            return (
              <div
                key={`${app.id}-${index}`}
                aria-hidden={isDuplicate}
                className="relative w-[260px] md:w-[280px] flex-shrink-0 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-orange-500/30 rounded-3xl p-6 pt-12 flex flex-col items-center text-center transition-all duration-300 group hover:-translate-y-2 mt-6"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-[1.25rem] bg-white shadow-lg shadow-slate-200/60 border border-slate-50 flex items-center justify-center overflow-hidden p-2 group-hover:-translate-y-1 transition-transform duration-300 pointer-events-none">
                  {app.logo_url ? (
                    <img
                      src={app.logo_url}
                      alt={app.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable="false"
                    />
                  ) : (
                    <span className="text-3xl">📱</span>
                  )}
                </div>

                <div className="flex flex-col items-center w-full mb-6 mt-2 pointer-events-none">
                  <h3 className="font-extrabold text-[#0A0F1C] text-xl truncate w-full px-2 mb-2 group-hover:text-orange-500 transition-colors">
                    {app.name}
                  </h3>

                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100 mb-4">
                    {app.category || "Premium App"}
                  </span>

                  <div className="flex items-center gap-2 bg-orange-50/50 px-3 py-1.5 rounded-xl border border-orange-100/50">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          weight="Bold"
                          className={`w-4 h-4 ${i < Math.round(app.rating || 5) ? "text-orange-500" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                    <span className="font-extrabold text-[#0A0F1C] text-sm">{numericRating}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 rounded-xl bg-[#0A0F1C] hover:bg-orange-500 text-white transition-all font-bold shadow-lg shadow-slate-900/10 group-hover:shadow-orange-500/25 mt-auto z-10"
                  asChild
                >
                  <a href={app.affiliate_link || "#"} target="_blank" rel="noopener noreferrer" onDragStart={(e) => e.preventDefault()}>
                    Details ansehen
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-2 md:hidden">
        <Button variant="outline" className="w-full rounded-2xl border-slate-200 text-[#0A0F1C] font-bold h-14 bg-white shadow-sm" asChild>
          <Link to="/top-apps">{linkText}</Link>
        </Button>
      </div>
    </div>
  );
};
