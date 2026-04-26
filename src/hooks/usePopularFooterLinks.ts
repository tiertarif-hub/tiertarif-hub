import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeNavigableHref } from "@/lib/routes";

interface PopularFooterLink {
  id: string;
  category_id: string | null;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

function normalizePopularFooterLinks(items: PopularFooterLink[] | null | undefined): PopularFooterLink[] {
  return (items || []).map((item) => ({
    ...item,
    url: normalizeNavigableHref(item.url),
  }));
}

export function usePopularFooterLinks(categoryId?: string | null) {
  return useQuery({
    queryKey: ["popular-footer-links", categoryId],
    queryFn: async () => {
      // Get category-specific links first, fall back to global links
      let query = supabase
        .from("popular_footer_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (categoryId) {
        // Try to get category-specific links
        const { data: categoryLinks } = await supabase
          .from("popular_footer_links")
          .select("*")
          .eq("category_id", categoryId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (categoryLinks && categoryLinks.length > 0) {
          return normalizePopularFooterLinks(categoryLinks as PopularFooterLink[]);
        }
      }

      // Fall back to global links (category_id is null)
      const { data, error } = await supabase
        .from("popular_footer_links")
        .select("*")
        .is("category_id", null)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return normalizePopularFooterLinks((data || []) as PopularFooterLink[]);
    },
  });
}

export function useAllPopularFooterLinks() {
  return useQuery({
    queryKey: ["all-popular-footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("popular_footer_links")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return normalizePopularFooterLinks((data || []) as PopularFooterLink[]);
    },
  });
}

export function useManagePopularFooterLinks() {
  const queryClient = useQueryClient();

  const createLink = useMutation({
    mutationFn: async (link: Omit<PopularFooterLink, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("popular_footer_links")
        .insert(link)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["all-popular-footer-links"] });
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PopularFooterLink> & { id: string }) => {
      const { data, error } = await supabase
        .from("popular_footer_links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["all-popular-footer-links"] });
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("popular_footer_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["all-popular-footer-links"] });
    },
  });

  return { createLink, updateLink, deleteLink };
}
