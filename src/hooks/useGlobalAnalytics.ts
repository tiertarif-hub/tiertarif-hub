import { useState, useEffect } from "react";
import { useSetting } from "@/hooks/useSettings";

export function useGlobalAnalyticsCode(): string {
  // Holt den Code aus der Datenbank
  const code = useSetting<string>("global_analytics_code", "");
  
  // Lokaler State für die Erlaubnis
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const stored = localStorage.getItem("cookie-consent");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // WICHTIG: Wir prüfen hier spezifisch auf "analytics"
          if (parsed && parsed.analytics === true) {
            setHasConsent(true);
            return;
          }
        } catch (e) {
          console.error("Cookie Consent Parse Error:", e);
        }
      }
      setHasConsent(false);
    };

    // 1. Sofort beim Laden prüfen
    checkConsent();

    // 2. Auf Updates vom Banner lauschen (damit wir keinen Reload brauchen)
    window.addEventListener("cookie-consent-update", checkConsent);
    return () => window.removeEventListener("cookie-consent-update", checkConsent);
  }, []);

  // Gib den Code NUR zurück, wenn Consent erteilt wurde
  return hasConsent ? code : "";
}