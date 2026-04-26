import { useState, useEffect } from "react";
import { useAdsEnabled, useAmazonConfig } from "@/hooks/useSettings";
import { ArrowRight, ShoppingCart, Zap } from "lucide-react";

interface AmazonBannerProps {
  format?: "horizontal" | "rectangle" | "vertical";
  customHeadline?: string;
  customText?: string;
  customLink?: string;
  customButtonText?: string;
  price?: string;
  isBestseller?: boolean;
}

export const AmazonBanner = ({ 
  format = "horizontal",
  customHeadline,
  customText,
  customLink,
  customButtonText,
  price,
  isBestseller = false
}: AmazonBannerProps) => {
  const adsEnabled = useAdsEnabled();
  const { headline, text, buttonText, link } = useAmazonConfig();

  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
        const stored = localStorage.getItem("cookie-consent");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setMarketingConsent(!!parsed.marketing);
            } catch(e) {}
        } else {
            setMarketingConsent(false);
        }
    };
    checkConsent();
    window.addEventListener("cookie-consent-update", checkConsent);
    return () => window.removeEventListener("cookie-consent-update", checkConsent);
  }, []);

  if (!adsEnabled || !marketingConsent) {
    return null;
  }
  
  const finalHeadline = customHeadline || headline;
  const finalText = customText || text;
  const finalLink = customLink || link;
  const finalBtn = customButtonText || buttonText || "Auf Amazon ansehen";

  const hasContent = finalHeadline && finalLink;

  return (
    <div className={`flex justify-center items-center my-8 animate-fade-in ${format === "horizontal" ? "w-full" : "w-auto"}`}>
      
      {hasContent ? (
        <a 
          href={finalLink} 
          target="_blank" 
          rel="nofollow noopener noreferrer"
          className="group relative w-full max-w-5xl overflow-hidden rounded-2xl bg-[#0A0F1C] p-1 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.01]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl bg-[#0A0F1C] px-6 py-5 md:px-8 md:py-6 border border-white/10 group-hover:border-secondary/50 transition-colors">
            
            <div className="flex items-center gap-5 text-center md:text-left w-full md:w-auto">
               <div className={`hidden md:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isBestseller ? 'bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white'}`}>
                 {isBestseller ? <Zap className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
               </div>
               
               <div className="space-y-1 w-full">
                 <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
                   <h3 className="font-display text-lg font-bold text-white group-hover:text-secondary transition-colors line-clamp-2 md:line-clamp-1">
                     {finalHeadline}
                   </h3>
                   {isBestseller && (
                     <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                       Bestseller
                     </span>
                   )}
                 </div>
                 {finalText && (
                   <p className="text-sm text-slate-400 max-w-xl line-clamp-2">
                     {finalText}
                   </p>
                 )}
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
              {price && (
                <div className="text-xl font-bold text-white tracking-tight">
                  {price}
                </div>
              )}
              <span className="inline-flex h-12 md:h-10 w-full md:w-auto items-center justify-center rounded-lg bg-secondary px-6 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all group-hover:bg-[#FF9900] group-hover:text-black group-hover:shadow-[#FF9900]/30">
                {finalBtn}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>

          </div>
        </a>
      ) : (
        <div className="w-full max-w-5xl rounded-xl border border-dashed border-slate-700 bg-slate-800/50 p-6 text-center">
           <div className="flex flex-col items-center gap-2 text-slate-400">
              <ShoppingCart className="h-8 w-8 opacity-50" />
              <p className="font-medium text-sm text-slate-300">Native Amazon Banner (Leer)</p>
              <p className="text-xs">Props übergeben oder im Admin-Bereich hinterlegen.</p>
           </div>
        </div>
      )}
    </div>
  );
};