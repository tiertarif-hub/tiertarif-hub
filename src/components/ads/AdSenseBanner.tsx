import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useAdsEnabled, useAdSenseConfig } from "@/hooks/useSettings";

export const AdSenseBanner = ({ slotId }: { slotId?: string }) => {
  const adsEnabled = useAdsEnabled();
  const { clientId, defaultSlotId } = useAdSenseConfig();
  
  // Consent State
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Live-Check der Marketing-Zustimmung
  useEffect(() => {
    const checkConsent = () => {
        const stored = localStorage.getItem("cookie-consent");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // AdSense braucht "marketing"
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

  // Verwende die übergebene SlotId oder den Default aus den Settings
  const finalSlotId = slotId || defaultSlotId;

  useEffect(() => {
    // Der Push passiert NUR, wenn alles konfiguriert UND erlaubt ist
    if (adsEnabled && clientId && finalSlotId && marketingConsent) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense Error:", err);
      }
    }
  }, [adsEnabled, clientId, finalSlotId, marketingConsent]);

  // Global deaktiviert? Raus.
  if (!adsEnabled) return null;

  // RECHTSKONFORMITÄT: Kein Marketing-Consent? Keine Anzeige.
  if (!marketingConsent) return null;

  // Prüfen ob Konfiguration vorhanden ist
  const isConfigured = clientId && finalSlotId;

  return (
    <div className="w-full my-12 flex flex-col items-center justify-center animate-fade-in">
      <div className="text-[10px] text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Info className="w-3 h-3" />
        Anzeige
      </div>
      
      {/* Container für den Ad-Code */}
      <div className="w-full max-w-5xl bg-slate-50 border border-slate-100 rounded-lg overflow-hidden min-h-[120px] flex items-center justify-center relative">
        
        {!isConfigured ? (
          // PLACEHOLDER (Wenn keine Daten im Admin eingetragen sind)
          <div className="absolute inset-0 flex items-center justify-center opacity-30 bg-[url('/grid-pattern.svg')]">
             <span className="text-slate-300 font-bold">Google AdSpace (Konfiguration fehlt)</span>
          </div>
        ) : (
          // ECHTER AD CODE
          <ins className="adsbygoogle"
               style={{ display: "block", width: "100%", height: "100%" }}
               data-ad-client={clientId}
               data-ad-slot={finalSlotId}
               data-ad-format="auto"
               data-full-width-responsive="true" 
          />
        )}
      </div>
    </div>
  );
};