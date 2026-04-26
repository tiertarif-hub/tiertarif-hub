import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getCategoryRoute,
  getForumCategoryRoute,
  getForumThreadRoute,
  getProjectRoute,
} from "@/lib/routes";

export type SearchResultType = 'category' | 'project' | 'forum_category' | 'forum_thread';

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
}

export const useGlobalSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: ["global-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const safeQuery = `%${searchQuery}%`;
      const results: GlobalSearchResult[] = [];

      // 1. Kategorien & Hubs suchen
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, description, slug, icon")
        .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
        .eq("is_active", true)
        .limit(3);

      if (categories) {
        categories.forEach(c => results.push({
          id: c.id,
          type: "category",
          title: c.name,
          subtitle: c.description,
          url: getCategoryRoute(c.slug),
          icon: c.icon || "📊"
        }));
      }

      // 2. Projekte & Tools suchen
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, short_description, slug")
        .or(`name.ilike.${safeQuery},short_description.ilike.${safeQuery}`)
        .limit(4);

      if (projects) {
        projects.forEach(p => results.push({
          id: p.id,
          type: "project",
          title: p.name,
          subtitle: p.short_description,
          url: getProjectRoute(p.slug),
          icon: "🚀"
        }));
      }

      // 3. Forum Kategorien suchen
      const { data: forumCats } = await supabase
        .from("forum_categories")
        .select("id, name, description, slug")
        .or(`name.ilike.${safeQuery}`)
        .eq("is_active", true)
        .limit(2);

      if (forumCats) {
        forumCats.forEach(fc => results.push({
          id: fc.id,
          type: "forum_category",
          title: fc.name,
          subtitle: "Forum Bereich",
          url: getForumCategoryRoute(fc.slug),
          icon: "👥"
        }));
      }

      // 4. Forum Threads suchen
      const { data: threads } = await supabase
        .from("forum_threads")
        .select("id, title, slug")
        .or(`title.ilike.${safeQuery}`)
        .eq("is_active", true)
        .limit(4);

      if (threads) {
        threads.forEach(t => results.push({
          id: t.id,
          type: "forum_thread",
          title: t.title,
          subtitle: "Community Diskussion",
          url: getForumThreadRoute(t.slug),
          icon: "💬"
        }));
      }

      return results;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
  });
};