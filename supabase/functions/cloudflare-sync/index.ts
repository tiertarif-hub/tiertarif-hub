import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildAbsoluteSiteUrl, normalizeRoutePath, DEFAULT_SITE_URL } from "../_shared/routes.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const LAST_OPERATION_SETTING_KEY = "cloudflare_redirect_sync_last_operation";

type CloudflareEnvelope<T> = {
  success?: boolean;
  result?: T;
  errors?: Array<{ message?: string; code?: number }>;
  messages?: Array<{ message?: string }>;
};

type SeoRedirectRow = {
  id: string;
  source_path: string;
  target_path: string;
  redirect_code: number;
  is_active: boolean;
  updated_at: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function getEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization")?.trim();
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }
  return authHeader;
}

async function ensureAdminUser(supabaseUrl: string, supabaseAnonKey: string, serviceRoleKey: string, authHeader: string) {
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: roleRow } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "ADMIN")
    .maybeSingle();

  if (roleRow) {
    return { user, adminClient };
  }

  const { data: profileRow } = await adminClient
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileRow?.is_admin) {
    throw new Error("Forbidden");
  }

  return { user, adminClient };
}

async function cloudflareRequest<T>(
  path: string,
  init: RequestInit,
  token: string,
): Promise<CloudflareEnvelope<T>> {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: CloudflareEnvelope<T> | null = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.errors?.map((item) => item.message).filter(Boolean).join(" | ") ||
      payload?.messages?.map((item) => item.message).filter(Boolean).join(" | ") ||
      text ||
      `Cloudflare request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload ?? { success: true };
}

function pickNewestRedirectPerSource(rows: SeoRedirectRow[]) {
  const deduped = new Map<string, SeoRedirectRow>();

  for (const row of rows) {
    const sourcePath = normalizeRoutePath(row.source_path);
    const targetPath = normalizeRoutePath(row.target_path);

    if (!sourcePath || !targetPath || sourcePath === "/" || sourcePath === targetPath) {
      continue;
    }

    const normalizedRow: SeoRedirectRow = {
      ...row,
      source_path: sourcePath,
      target_path: targetPath,
    };

    const current = deduped.get(sourcePath);
    if (!current) {
      deduped.set(sourcePath, normalizedRow);
      continue;
    }

    const currentUpdatedAt = new Date(current.updated_at ?? 0).getTime();
    const nextUpdatedAt = new Date(normalizedRow.updated_at ?? 0).getTime();

    if (Number.isNaN(currentUpdatedAt) || nextUpdatedAt >= currentUpdatedAt) {
      deduped.set(sourcePath, normalizedRow);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => a.source_path.localeCompare(b.source_path));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = getBearerToken(req);
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const cloudflareApiToken = getEnv("CLOUDFLARE_API_TOKEN");
    const cloudflareAccountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
    const cloudflareRedirectListId = getEnv("CLOUDFLARE_REDIRECT_LIST_ID");
    const siteUrl = Deno.env.get("SITE_URL")?.trim() || DEFAULT_SITE_URL;

    const { adminClient } = await ensureAdminUser(
      supabaseUrl,
      supabaseAnonKey,
      serviceRoleKey,
      authHeader,
    );

    const { data: lastOperationSetting } = await adminClient
      .from("settings")
      .select("value")
      .eq("key", LAST_OPERATION_SETTING_KEY)
      .maybeSingle();

    const lastOperationId = typeof lastOperationSetting?.value === "object" && lastOperationSetting?.value
      ? (lastOperationSetting.value as Record<string, unknown>).operation_id
      : null;

    if (typeof lastOperationId === "string" && lastOperationId.trim()) {
      try {
        const operationStatus = await cloudflareRequest<{ id: string; status: string }>(
          `/accounts/${cloudflareAccountId}/rules/lists/bulk_operations/${lastOperationId}`,
          { method: "GET" },
          cloudflareApiToken,
        );

        const status = operationStatus.result?.status?.toLowerCase();

        if (status === "pending" || status === "running") {
          return json({
            success: false,
            in_progress: true,
            message: `Cloudflare meldet noch eine laufende Bulk-Operation (${status}). Bitte kurz warten und dann erneut synchronisieren.`,
            operation_id: lastOperationId,
            status,
          });
        }
      } catch (err) {
        // Härtung: Fehler bei abgelaufener Cloudflare-ID ignorieren und neuen Sync zulassen
        console.warn("Letzte Operation-ID ungültig oder abgelaufen. Starte neuen Sync-Prozess.", err instanceof Error ? err.message : String(err));
      }
    }

    const { data: redirects, error: redirectsError } = await adminClient
      .from("seo_redirects")
      .select("id, source_path, target_path, redirect_code, is_active, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (redirectsError) {
      throw redirectsError;
    }

    const dedupedRedirects = pickNewestRedirectPerSource((redirects ?? []) as SeoRedirectRow[]);

    const payload = dedupedRedirects.map((redirect) => ({
      redirect: {
        source_url: buildAbsoluteSiteUrl(redirect.source_path, siteUrl),
        target_url: buildAbsoluteSiteUrl(redirect.target_path, siteUrl),
        status_code: redirect.redirect_code || 301,
      },
    }));

    const syncResponse = await cloudflareRequest<{ operation_id?: string }>(
      `/accounts/${cloudflareAccountId}/rules/lists/${cloudflareRedirectListId}/items`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      cloudflareApiToken,
    ).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("pending") ||
        lowerMessage.includes("running") ||
        lowerMessage.includes("outstanding bulk operation")
      ) {
        return {
          success: false,
          result: undefined,
          errors: [{ message }],
        } as CloudflareEnvelope<{ operation_id?: string }>;
      }

      throw error;
    });

    if (syncResponse.success === false) {
      return json({
        success: false,
        in_progress: true,
        message: syncResponse.errors?.map((item) => item.message).filter(Boolean).join(" | ") || "Cloudflare verarbeitet gerade eine andere Bulk-Operation.",
      });
    }

    const operationId = syncResponse.result?.operation_id ?? null;

    if (operationId) {
      await adminClient
        .from("settings")
        .upsert(
          {
            key: LAST_OPERATION_SETTING_KEY,
            value: {
              operation_id: operationId,
              synced_at: new Date().toISOString(),
            },
          },
          { onConflict: "key" },
        );
    }

    return json({
      success: true,
      exported_count: payload.length,
      source_count: (redirects ?? []).length,
      operation_id: operationId,
      site_url: siteUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return json(
      {
        success: false,
        error: message,
      },
      status,
    );
  }
});
