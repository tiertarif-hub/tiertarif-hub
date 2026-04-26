import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Redirect = {
  id: string;
  source_path: string;
  target_url: string;
  clicks: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  last_clicked_at: string | null;
};

export type RedirectInput = {
  source_path: string;
  target_url: string;
  is_active?: boolean;
};

export function normalizeTrackingSourcePath(rawValue: string) {
  return String(rawValue ?? "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function getTrackingSlug(sourcePath: string) {
  return normalizeTrackingSourcePath(sourcePath);
}

export function useRedirects(includeInactive = false) {
  return useQuery({
    queryKey: ["redirects", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((redirect) => ({
        ...redirect,
        source_path: getTrackingSlug(redirect.source_path),
        clicks: Number(redirect.clicks ?? 0),
        is_active: Boolean(redirect.is_active),
      })) as Redirect[];
    },
  });
}

export function useCreateRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RedirectInput) => {
      const { data, error } = await supabase
        .from("redirects")
        .insert({
          source_path: normalizeTrackingSourcePath(input.source_path),
          target_url: input.target_url,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        source_path: getTrackingSlug(data.source_path),
        clicks: Number(data.clicks ?? 0),
        is_active: Boolean(data.is_active),
      } as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useUpdateRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<RedirectInput>;
    }) => {
      const payload: Record<string, unknown> = {};

      if (input.source_path !== undefined) {
        payload.source_path = normalizeTrackingSourcePath(input.source_path);
      }

      if (input.target_url !== undefined) {
        payload.target_url = input.target_url;
      }

      if (input.is_active !== undefined) {
        payload.is_active = input.is_active;
      }

      const { data, error } = await supabase
        .from("redirects")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        source_path: getTrackingSlug(data.source_path),
        clicks: Number(data.clicks ?? 0),
        is_active: Boolean(data.is_active),
      } as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("redirects").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}
