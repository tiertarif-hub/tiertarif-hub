import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { isBotLikeRuntime } from "@/lib/runtimeFlags";
import { useSiteBrandName } from "@/hooks/useSettings";

// Typisierung für die Consent-Einstellungen
interface ConsentSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieBanner = () => {
  const isBotRuntime = isBotLikeRuntime();
  const brandName = useSiteBrandName();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Standard: Nur Essenziell ist an, Rest aus (Opt-In Prinzip!)
  const [settings, setSettings] = useState<ConsentSettings>({
    essential: true, // Darf nicht deaktivierbar sein
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Prüfen, ob bereits eine Entscheidung getroffen wurde
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
        setIsVisible(true);
    } else {
        // Falls wir den Consent später im Code brauchen, laden wir ihn hier in den State
        try {
            setSettings(JSON.parse(consent));
        } catch (e) {
            console.error("Cookie Parse Error", e);
            localStorage.removeItem("cookie-consent");
            setIsVisible(true);
        }
    }

    // KYRA FIX: Manueller Trigger für Cookie-Einstellungen
    const handleManualShow = () => {
      setIsVisible(true);
      setShowDetails(true); // Direkt Details zeigen für volle Kontrolle
    };
    window.addEventListener("showCookieSettings", handleManualShow);
    return () => window.removeEventListener("showCookieSettings", handleManualShow);
  }, []);

  // Hilfsfunktion zum Speichern und Event feuern
  const saveConsent = (finalSettings: ConsentSettings) => {
    localStorage.setItem("cookie-consent", JSON.stringify(finalSettings));
    localStorage.setItem("cookie-consent-timestamp", Date.now().toString());
    
    // Wir feuern ein Event, damit z.B. Analytics sofort startet ohne Reload
    window.dispatchEvent(new Event("cookie-consent-update"));
    
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allOn = { essential: true, analytics: true, marketing: true };
    setSettings(allOn);
    saveConsent(allOn);
  };

  const handleDecline = () => {
    const allOff = { essential: true, analytics: false, marketing: false };
    setSettings(allOff);
    saveConsent(allOff);
  };

  const handleSaveSelection = () => {
    saveConsent(settings);
  };

  const toggleSetting = (key: keyof ConsentSettings) => {
    if (key === 'essential') return; // Essenziell ist immer an
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isBotRuntime || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom-5 duration-500">
        {/* Backdrop auf Mobile für Fokus */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] md:hidden -z-10 h-[100vh] -top-[100vh]" />

        <div className="bg-slate-900/95 border-t border-white/10 text-slate-200 shadow-2xl backdrop-blur-xl">
            <div className="container mx-auto p-4 md:p-6 max-w-6xl">
                
                {/* HEADLINE & KURZTEXT */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex gap-4 items-start max-w-3xl">
                        <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20 shrink-0">
                            <Cookie className="text-secondary w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base mb-1">Privatsphäre-Einstellungen</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Wir nutzen Cookies und externe Dienste (wie Amazon/Google), um {brandName} besser zu machen. 
                                Deine Daten gehören dir. Du entscheidest, was wir laden dürfen.
                                <span className="block mt-1 text-xs text-slate-500">
                                    <Link to="/datenschutz" className="hover:text-secondary underline decoration-slate-700 underline-offset-2 mr-3">Datenschutzerklärung</Link>
                                    <Link to="/impressum" className="hover:text-secondary underline decoration-slate-700 underline-offset-2">Impressum</Link>
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* ACTION BUTTONS (DESKTOP) */}
                    <div className="hidden md:flex flex-col gap-2 min-w-[200px]">
                        <Button onClick={handleAcceptAll} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20">
                            Alles akzeptieren
                        </Button>
                        <Button onClick={handleDecline} variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5">
                            Nur Essenzielle
                        </Button>
                        <button 
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-secondary transition-colors mt-1"
                        >
                            {showDetails ? "Weniger anzeigen" : "Optionen anpassen"}
                            {showDetails ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                        </button>
                    </div>
                </div>

                {/* DETAILS / SETTINGS BEREICH */}
                {showDetails && (
                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-200">
                        {/* ESSENTIAL */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 opacity-70 cursor-not-allowed">
                            <div className="mt-1"><ShieldCheck className="w-5 h-5 text-green-500" /></div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-white">Technisch notwendig</span>
                                    <input type="checkbox" checked disabled className="accent-secondary h-4 w-4" />
                                </div>
                                <p className="text-xs text-slate-400">Login, Warenkorb, Sicherheit. Ohne diese läuft nichts.</p>
                            </div>
                        </div>

                        {/* ANALYTICS */}
                        <div 
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                            onClick={() => toggleSetting('analytics')}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-white">Analyse & Performance</span>
                                <input 
                                    type="checkbox" 
                                    checked={settings.analytics} 
                                    readOnly
                                    className="accent-secondary h-4 w-4 rounded pointer-events-none" 
                                />
                            </div>
                            <p className="text-xs text-slate-400">Hilft uns zu verstehen, welche Seiten beliebt sind (Google Analytics).</p>
                        </div>

                        {/* MARKETING */}
                        <div 
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                            onClick={() => toggleSetting('marketing')}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-white">Marketing & Partner</span>
                                <input 
                                    type="checkbox" 
                                    checked={settings.marketing} 
                                    readOnly
                                    className="accent-secondary h-4 w-4 rounded pointer-events-none" 
                                />
                            </div>
                            <p className="text-xs text-slate-400">Amazon Bilder, AdSense Werbung und personalisierte Angebote.</p>
                        </div>
                        
                        {/* SAVE BUTTON FOR DETAILS - FIX: Mobile-friendly Full Width */}
                        <div className="md:col-span-3 flex justify-end mt-2">
                             <Button 
                                onClick={handleSaveSelection} 
                                variant="outline" 
                                className="w-full md:w-auto border-secondary text-secondary hover:bg-secondary hover:text-white font-bold"
                             >
                                Auswahl speichern
                             </Button>
                        </div>
                    </div>
                )}

                {/* MOBILE BUTTONS (Sichtbar auf Mobile, wenn Details zu sind) */}
                <div className="md:hidden flex flex-col gap-3 mt-6">
                    {!showDetails && (
                        <>
                            <Button onClick={handleAcceptAll} className="w-full bg-secondary text-white font-bold">
                                Alles akzeptieren
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={handleDecline} variant="outline" className="w-full border-white/15 bg-white text-slate-900 hover:bg-white/90 hover:text-slate-900 font-semibold shadow-sm">
                                    Ablehnen
                                </Button>
                                <Button onClick={() => setShowDetails(true)} variant="outline" className="w-full border-white/15 bg-white text-slate-900 hover:bg-white/90 hover:text-slate-900 font-semibold shadow-sm">
                                    Anpassen
                                </Button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};