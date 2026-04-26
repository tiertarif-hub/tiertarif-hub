import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PromotedApp {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  affiliate_link: string | null;
  category: string | null;
  short_description: string | null;
  rating: number;
  daily_rank: number | null;
  advertising_weight: number; // 1-10
}

const PROMOTED_APP_SELECT = `
  id,
  name,
  slug,
  logo_url,
  affiliate_link,
  category,
  short_description,
  rating,
  daily_rank,
  advertising_weight
`;

/**
 * Holt ALLE aktiven Apps für die Top 100 Liste
 * Sortiert nach 'daily_rank'
 */
export const useTop100Apps = () => {
  return useQuery({
    queryKey: ["promoted-apps-top-100"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promoted_apps")
        .select(PROMOTED_APP_SELECT)
        .eq("is_active", true)
        .order("daily_rank", { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as PromotedApp[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Der "Smart Slider" Algorithmus
 * Wählt zufällige Apps aus, aber bevorzugt solche mit hohem 'advertising_weight'.
 * @param limit Anzahl der Apps im Slider (z.B. 15)
 */
export const useWeightedApps = (limit: number = 15) => {
  return useQuery({
    queryKey: ["promoted-apps-weighted", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promoted_apps")
        .select(PROMOTED_APP_SELECT)
        .eq("is_active", true);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const allApps = data as PromotedApp[];
      const pool: PromotedApp[] = [];

      allApps.forEach((app) => {
        const weight = Math.max(1, Math.min(10, app.advertising_weight || 1));

        for (let i = 0; i < weight; i += 1) {
          pool.push(app);
        }
      });

      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const selectedApps = new Set<string>();
      const result: PromotedApp[] = [];

      for (const app of pool) {
        if (result.length >= limit) break;
        if (!selectedApps.has(app.id)) {
          selectedApps.add(app.id);
          result.push(app);
        }
      }

      return result;
    },
    staleTime: 1000 * 60 * 1,
  });
};
