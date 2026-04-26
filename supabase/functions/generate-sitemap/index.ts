import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  DEFAULT_SITE_URL,
  buildAbsoluteSiteUrl,
  getCategoriesRoute,
  getCategoryRoute,
  getForumIndexRoute,
  getForumThreadRoute,
  getProjectRoute,
  normalizeRoutePath,
} from "../_shared/routes.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const BUCKET_NAME = "seo-assets";
const SITEMAP_PATH = "sitemap.xml";
const ABOUT_PAGE_SETTING_KEY = "about_page_content";
const DEFAULT_ABOUT_SLUG = "ueber-uns";

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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getIsoDate(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function getStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getBooleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function getAboutPagePath(value: unknown): string | null {
  // Wenn der Admin-Setting-Eintrag fehlt, ist /ueber-uns trotzdem eine echte React-Route.
  // Deshalb wird der Default-Slug bewusst aufgenommen, statt die Seite aus der Sitemap zu verlieren.
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return normalizeRoutePath(DEFAULT_ABOUT_SLUG);
  }

  const content = value as Record<string, unknown>;
  const isEnabled = getBooleanValue(content.enabled ?? content.is_enabled, true);

  if (!isEnabled) {
    return null;
  }

  const slug = getStringValue(content.slug) || DEFAULT_ABOUT_SLUG;
  return normalizeRoutePath(slug);
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

type UrlEntry = {
  path: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

function addUrl(
  map: Map<string, UrlEntry>,
  path: string,
  lastmod: string,
  changefreq: UrlEntry["changefreq"],
  priority: string,
) {
  const normalizedPath = normalizeRoutePath(path);
  if (!normalizedPath) return;

  const existing = map.get(normalizedPath);
  if (!existing) {
    map.set(normalizedPath, {
      path: normalizedPath,
      lastmod,
      changefreq,
      priority,
    });
    return;
  }

  if (existing.lastmod < lastmod) {
    map.set(normalizedPath, {
      ...existing,
      lastmod,
      changefreq,
      priority,
    });
  }
}

async function ensurePublicBucket(adminClient: ReturnType<typeof createClient>) {
  const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
  if (bucketsError) {
    throw bucketsError;
  }

  const exists = (buckets ?? []).some((bucket) => bucket.name === BUCKET_NAME || bucket.id === BUCKET_NAME);
  if (exists) {
    return;
  }

  const { error: createBucketError } = await adminClient.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: "5MB",
  });

  if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
    throw createBucketError;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization")?.trim();
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = Deno.env.get("SITE_URL")?.trim() || DEFAULT_SITE_URL;

    const { adminClient } = await ensureAdminUser(
      supabaseUrl,
      supabaseAnonKey,
      serviceRoleKey,
      authHeader,
    );

    const [categoriesResult, projectsResult, forumThreadsResult, aboutPageResult] = await Promise.all([
      adminClient
        .from("categories")
        .select("slug, updated_at, created_at")
        .eq("is_active", true),
      adminClient
        .from("projects")
        .select("slug, updated_at, created_at")
        .eq("is_active", true),
      adminClient
        .from("forum_threads")
        .select("slug, updated_at, created_at")
        .eq("is_active", true),
      adminClient
        .from("settings")
        .select("value, updated_at")
        .eq("key", ABOUT_PAGE_SETTING_KEY)
        .maybeSingle(),
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (projectsResult.error) throw projectsResult.error;
    if (forumThreadsResult.error) throw forumThreadsResult.error;
    if (aboutPageResult.error) throw aboutPageResult.error;

    const urlMap = new Map<string, UrlEntry>();
    const today = getIsoDate();

    addUrl(urlMap, "/", today, "daily", "1.0");
    addUrl(urlMap, getCategoriesRoute(), today, "daily", "0.9");
    addUrl(urlMap, getForumIndexRoute(), today, "daily", "0.8");
    addUrl(urlMap, "/kontakt", today, "monthly", "0.4");
    addUrl(urlMap, "/impressum", today, "monthly", "0.3");
    addUrl(urlMap, "/datenschutz", today, "monthly", "0.3");
    addUrl(urlMap, "/agb", today, "monthly", "0.3");
    addUrl(urlMap, "/wie-wir-vergleichen", today, "monthly", "0.5");
    addUrl(urlMap, "/top-apps", today, "weekly", "0.6");

    const aboutPath = getAboutPagePath(aboutPageResult.data?.value ?? null);
    if (aboutPath) {
      addUrl(
        urlMap,
        aboutPath,
        getIsoDate(aboutPageResult.data?.updated_at),
        "monthly",
        "0.5",
      );
    }

    for (const category of categoriesResult.data ?? []) {
      const slug = String(category.slug ?? "").trim();
      if (!slug) continue;
      addUrl(urlMap, getCategoryRoute(slug), getIsoDate(category.updated_at ?? category.created_at), "weekly", "0.8");
    }

    for (const project of projectsResult.data ?? []) {
      const slug = String(project.slug ?? "").trim();
      if (!slug) continue;

      const projectRoute = getProjectRoute(slug);
      if (projectRoute.startsWith("/go/")) {
        continue;
      }

      addUrl(urlMap, projectRoute, getIsoDate(project.updated_at ?? project.created_at), "weekly", "0.6");
    }

    for (const thread of forumThreadsResult.data ?? []) {
      const slug = String(thread.slug ?? "").trim();
      if (!slug) continue;
      addUrl(urlMap, getForumThreadRoute(slug), getIsoDate(thread.updated_at ?? thread.created_at), "weekly", "0.7");
    }

    const urlEntries = Array.from(urlMap.values()).sort((a, b) => a.path.localeCompare(b.path));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries
      .map((entry) => `  <url>\n    <loc>${escapeXml(buildAbsoluteSiteUrl(entry.path, siteUrl))}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`)
      .join("\n")}\n</urlset>`;

    await ensurePublicBucket(adminClient);

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(SITEMAP_PATH, new Blob([xml], { type: "application/xml; charset=utf-8" }), {
        upsert: true,
        contentType: "application/xml; charset=utf-8",
        cacheControl: "300",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = adminClient.storage.from(BUCKET_NAME).getPublicUrl(SITEMAP_PATH);

    return json({
      success: true,
      bucket: BUCKET_NAME,
      path: SITEMAP_PATH,
      url_count: urlEntries.length,
      public_url: publicUrlData.publicUrl,
      site_url: siteUrl,
      about_page_path: aboutPath,
      about_page_included: Boolean(aboutPath && urlMap.has(aboutPath)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" || message === "Missing Authorization header"
      ? 401
      : message === "Forbidden"
        ? 403
        : 500;

    return json(
      {
        success: false,
        error: message,
      },
      status,
    );
  }
});
