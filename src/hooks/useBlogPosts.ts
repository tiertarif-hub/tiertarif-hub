import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBlogPosts = () => {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) {
        console.warn("Fehler beim Laden der Blog-Posts:", error);
        return [];
      }
      return data || [];
    },
  });
};