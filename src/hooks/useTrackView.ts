import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isBlockedTopLevelSlug } from "@/lib/routes";

export function useTrackView(pageName: string | undefined, type: string) {
  const hasTracked = useRef(false);

  useEffect(() => {
    const normalizedPageName = String(pageName ?? "").trim().toLowerCase();
    const isBlockedFileLikeRequest = type === "category" && isBlockedTopLevelSlug(normalizedPageName);

    if (!normalizedPageName || hasTracked.current || isBlockedFileLikeRequest) return;

    const track = async () => {
      try {
        hasTracked.current = true;

        // 100% Cookieless & Storage-Free Stealth Tracking
        await supabase.functions.invoke("page-pulse", {
          body: { pageName: normalizedPageName, type }
        });
      } catch (error) {
        console.error("Pulse Sync Failed", error);
      }
    };

    track();
  }, [pageName, type]);
}