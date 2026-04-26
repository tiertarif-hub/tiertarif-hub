import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeNavigableHref } from "@/lib/routes";

interface LegalFooterLink {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

function normalizeLegalFooterLinks(items: LegalFooterLink[] | null | undefined): LegalFooterLink[] {
  return (items || []).map((item) => ({
    ...item,
    url: normalizeNavigableHref(item.url),
  }));
}

export function useLegalFooterLinks(categoryId: string | null) {
  return useQuery({
    queryKey: ["legal-footer-links", categoryId],
    queryFn: async () => {
      // If we have a category ID, first try to get category-specific links
      if (categoryId) {
        const { data: categoryLinks, error: categoryError } = await supabase
          .from("footer_links")
          .select("id, label, url, sort_order")
          .eq("is_active", true)
          .eq("category_id", categoryId)
          .order("sort_order", { ascending: true });

        if (categoryError) throw categoryError;

        // If category has its own links, return those
        if (categoryLinks && categoryLinks.length > 0) {
          return normalizeLegalFooterLinks(categoryLinks as LegalFooterLink[]);
        }
      }

      // Fallback: get global links (no category)
      const { data: globalLinks, error: globalError } = await supabase
        .from("footer_links")
        .select("id, label, url, sort_order")
        .eq("is_active", true)
        .is("category_id", null)
        .order("sort_order", { ascending: true });

      if (globalError) throw globalError;
      return normalizeLegalFooterLinks((globalLinks || []) as LegalFooterLink[]);
    },
  });
}
