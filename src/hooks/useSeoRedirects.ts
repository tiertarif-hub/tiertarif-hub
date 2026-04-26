import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildAbsoluteSiteUrl, normalizeRoutePath } from "@/lib/routes";
import { DEFAULT_SITE_URL } from "@/lib/constants";

type DatabaseSeoRedirect = Database["public"]["Tables"]["seo_redirects"]["Row"];
type DatabaseSeoRedirectEntityTable = DatabaseSeoRedirect["entity_table"];

export type SeoRedirectEntityTable = DatabaseSeoRedirectEntityTable | "forum";
export type SeoRedirect = Omit<DatabaseSeoRedirect, "entity_table"> & {
  entity_table: SeoRedirectEntityTable;
};

export type SeoRedirectFilters = {
  includeInactive?: boolean;
  entityTable?: SeoRedirectEntityTable | "all";
  search?: string;
};

export type CreateSeoRedirectInput = {
  sourcePath: string;
  targetPath: string;
  entityId: string;
  entityTable: SeoRedirectEntityTable;
  redirectCode?: number;
  isAutomatic?: boolean;
  isActive?: boolean;
};

function escapeIlikeTerm(value: string) {
  return value.replace(/[%_,]/g, " ").trim();
}

function isNoRowsError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "PGRST116"
  );
}

function normalizeSeoRoutePath(path: string) {
  return normalizeRoutePath(path);
}

export function useSeoRedirects(filters: SeoRedirectFilters = {}) {
  const { includeInactive = true, entityTable = "all", search = "" } = filters;

  return useQuery({
    queryKey: ["seo-redirects", includeInactive, entityTable, search],
    queryFn: async () => {
      let query = (supabase as any)
        .from("seo_redirects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      if (entityTable !== "all") {
        query = query.eq("entity_table", entityTable);
      }

      const safeSearch = escapeIlikeTerm(search);

      if (safeSearch.length > 0) {
        const pattern = `%${safeSearch}%`;
        query = query.or(`source_path.ilike.${pattern},target_path.ilike.${pattern}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []) as SeoRedirect[];
    },
  });
}

export function useCreateSeoRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSeoRedirectInput) => {
      const sourcePath = normalizeSeoRoutePath(input.sourcePath);
      const targetPath = normalizeSeoRoutePath(input.targetPath);

      if (!sourcePath || !targetPath || sourcePath === targetPath) {
        return null;
      }

      const seoRedirects = () => (supabase as any).from("seo_redirects");

      // Loop-Schutz: Deaktiviere Rückwärts-Redirects
      const { data: reverseRedirects, error: reverseError } = await seoRedirects()
        .select("*")
        .eq("source_path", targetPath)
        .eq("target_path", sourcePath)
        .eq("is_active", true);

      if (reverseError) throw reverseError;

      for (const reverseRedirect of (reverseRedirects ?? []) as SeoRedirect[]) {
        if (reverseRedirect.is_locked) {
          throw new Error(`Redirect-Schleife blockiert: ${reverseRedirect.source_path} ist gelockt.`);
        }
        await seoRedirects().update({ is_active: false }).eq("id", reverseRedirect.id);
      }

      const { data: existingRedirect, error: existingError } = await seoRedirects()
        .select("*")
        .eq("source_path", sourcePath)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError && !isNoRowsError(existingError)) throw existingError;

      const payload = {
        source_path: sourcePath,
        target_path: targetPath,
        entity_id: input.entityId,
        entity_table: input.entityTable,
        redirect_code: input.redirectCode ?? 301,
        is_automatic: input.isAutomatic ?? true,
        is_active: input.isActive ?? true,
      };

      if (existingRedirect) {
        if (existingRedirect.is_locked && existingRedirect.target_path !== targetPath) {
          throw new Error(`Redirect für ${sourcePath} ist gelockt.`);
        }
        const { data, error } = await seoRedirects().update(payload).eq("id", existingRedirect.id).select("*").single();
        if (error) throw error;
        return data as SeoRedirect;
      }

      const { data, error } = await seoRedirects().insert(payload).select("*").single();
      if (error) throw error;
      return data as SeoRedirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-redirects"] });
    },
  });
}

export function useUpdateSeoRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<SeoRedirect> }) => {
      const payload: any = { ...input };
      if (payload.target_path) payload.target_path = normalizeSeoRoutePath(payload.target_path);

      const { data, error } = await (supabase as any)
        .from("seo_redirects")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data as SeoRedirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-redirects"] });
    },
  });
}

export function useDeleteSeoRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seo_redirects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-redirects"] });
    },
  });
}

export function buildSeoRedirectCloudflareCsv(redirects: SeoRedirect[], siteUrl = DEFAULT_SITE_URL) {
  const rows = ["SOURCE_URL,TARGET_URL,STATUS_CODE"];
  redirects.filter(r => r.is_active).forEach(r => {
    rows.push([buildAbsoluteSiteUrl(r.source_path, siteUrl), buildAbsoluteSiteUrl(r.target_path, siteUrl), String(r.redirect_code ?? 301)].join(","));
  });
  return rows.join("\n");
}

export function downloadSeoRedirectCloudflareCsv(redirects: SeoRedirect[], fileName = "cloudflare-bulk-redirects.csv", siteUrl = DEFAULT_SITE_URL) {
  const csv = buildSeoRedirectCloudflareCsv(redirects, siteUrl);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl; link.setAttribute("download", fileName);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}