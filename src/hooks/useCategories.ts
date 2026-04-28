import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryInput, NavigationSettings } from "@/lib/schemas";
import { isBlockedTopLevelSlug } from "@/lib/routes";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  theme: "DATING" | "ADULT" | "CASINO" | "GENERIC";
  template: "comparison" | "review" | "hub_overview";
  color_theme: "dark" | "light" | "neon";
  
  // Content & SEO
  site_name: string | null;
  hero_headline: string | null;
  hero_pretitle: string | null;
  hero_cta_text: string | null;
  hero_badge_text: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1_title: string | null;
  long_content_top: string | null;
  long_content_bottom: string | null;
  
  // === NEUE HUB FELDER (Flexible Landingpages) ===
  intro_title: string | null;
  comparison_title: string | null;
  project_cta_text: string | null;
  features_title: string | null;
  sticky_cta_text: string | null;
  sticky_cta_link: string | null;
  button_text: string | null; // KYRA FIX: Ist hier sauber typisiert
  
  // Stats
  views: number;
  avg_rating: number;
  review_count: number;
  
  // System
  is_active: boolean;
  is_internal_generated: boolean;
  sort_order: number;
  faq_data: any;
  navigation_settings?: NavigationSettings;
  
  // Design & Media
  hero_image_url?: string;
  card_image_url?: string;
  custom_css?: string;
  sidebar_ad_html?: string;
  sidebar_ad_image?: string;
  comparison_widget_code?: string | null;
  comparison_widget_type?: "html" | "mr-money" | null;
  comparison_widget_config?: Record<string, unknown> | null;
  custom_html_override?: string;
};

const CATEGORY_PUBLIC_LIST_SELECT = `
  id,
  slug,
  name,
  description,
  icon,
  theme,
  template,
  meta_title,
  meta_description,
  h1_title,
  comparison_title,
  button_text,
  is_active,
  sort_order,
  card_image_url,
  hero_image_url,
  custom_css
`;


export type CategoryOption = Pick<Category, "id" | "name" | "icon" | "sort_order" | "is_active">;

export const useCategoryOptions = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ["category_options", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("categories")
        .select("id, name, icon, sort_order, is_active")
        .order("sort_order");

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CategoryOption[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCategories = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ["categories_v3", includeInactive],
    queryFn: async () => {
      const selectClause = includeInactive ? "*" : CATEGORY_PUBLIC_LIST_SELECT;

      let query = supabase
        .from("categories")
        .select(selectClause)
        .order("sort_order");

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryBySlug = (slug: string) => {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  const shouldBlockLookup = isBlockedTopLevelSlug(normalizedSlug);

  return useQuery({
    queryKey: ["category_v2", normalizedSlug], // KYRA FIX: Cache-Buster
    queryFn: async () => {
      if (shouldBlockLookup) return null;

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", normalizedSlug)
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as Category | null;
    },
    enabled: !shouldBlockLookup && !!normalizedSlug,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: CategoryInput) => {
      const { data, error } = await supabase.from("categories").insert([category]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories_v3"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { error } = await supabase.from("categories").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories_v3"] });
      queryClient.invalidateQueries({ queryKey: ["category_v2"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories_v3"] });
    },
  });
};

// KYRA UPDATE: Hochperformante Duplizier-Engine für Hubs & Seiten
export const useDuplicateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Category) => {
      const { id, created_at, updated_at, views, avg_rating, review_count, ...rest } = category as any;
      
      const uniqueSuffix = Math.floor(Math.random() * 900) + 100;
      const newSlug = `${rest.slug}-kopie-${uniqueSuffix}`;
      const newName = `${rest.name} (Kopie)`;
      
      const { data: newCat, error: catError } = await supabase
        .from("categories")
        .insert({
          ...rest,
          slug: newSlug,
          name: newName,
          is_active: false,
        })
        .select()
        .single();

      if (catError) throw catError;

      const { data: links } = await supabase.from("category_projects").select("*").eq("category_id", id);
      if (links && links.length > 0) {
        const newLinks = links.map(l => ({ category_id: newCat.id, project_id: l.project_id, sort_order: l.sort_order }));
        await supabase.from("category_projects").insert(newLinks);
      }
      
      const { data: footerLinks } = await supabase.from("popular_footer_links").select("*").eq("category_id", id);
      if (footerLinks && footerLinks.length > 0) {
         const newFooterLinks = footerLinks.map(l => ({ category_id: newCat.id, label: l.label, url: l.url, sort_order: l.sort_order }));
         await supabase.from("popular_footer_links").insert(newFooterLinks);
      }

      const { data: legalLinks } = await supabase.from("legal_footer_links").select("*").eq("category_id", id);
      if (legalLinks && legalLinks.length > 0) {
         const newLegalLinks = legalLinks.map(l => ({ category_id: newCat.id, label: l.label, url: l.url, sort_order: l.sort_order }));
         await supabase.from("legal_footer_links").insert(newLegalLinks);
      }

      return newCat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories_v3"] });
    },
  });
};