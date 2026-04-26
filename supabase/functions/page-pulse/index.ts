import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getHeader(req: Request, names: string[]): string | null {
  for (const name of names) {
    const value = req.headers.get(name)?.trim();
    if (value) return value;
  }
  return null;
}

function normalizeCountryCode(raw?: string | null): string | null {
  const value = (raw ?? "").trim().toUpperCase();
  if (!value) return null;

  const firstToken = value.split(",")[0]?.trim() || "";

  if (!/^[A-Z]{2}$/.test(firstToken)) return null;
  if (firstToken === "XX" || firstToken === "T1") return null;

  return firstToken;
}

function getClientIp(req: Request): string {
  const directIp = getHeader(req, [
    "cf-connecting-ip",
    "fly-client-ip",
    "x-real-ip",
    "x-client-ip",
    "x-forwarded-for",
  ]);

  if (!directIp) return "unknown";

  if (directIp.includes(",")) {
    const firstIp = directIp.split(",")[0]?.trim();
    return firstIp || "unknown";
  }

  return directIp;
}

function getCountryFromHeaders(req: Request): { code: string | null; source: string } {
  const candidates: Array<{ header: string; value: string | null }> = [
    { header: "cf-ipcountry", value: req.headers.get("cf-ipcountry") },
    { header: "x-vercel-ip-country", value: req.headers.get("x-vercel-ip-country") },
    { header: "x-country-code", value: req.headers.get("x-country-code") },
    { header: "x-appengine-country", value: req.headers.get("x-appengine-country") },
    { header: "cloudfront-viewer-country", value: req.headers.get("cloudfront-viewer-country") },
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCountryCode(candidate.value);
    if (normalized) {
      return { code: normalized, source: `header:${candidate.header}` };
    }
  }

  return { code: null, source: "none" };
}

function isPrivateOrLocalIp(ip: string): boolean {
  const value = ip.trim().toLowerCase();

  if (!value || value === "unknown") return true;

  if (value === "::1" || value === "localhost") return true;

  if (value.includes(":")) {
    return (
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value.startsWith("fe80:") ||
      value.startsWith("::ffff:127.") ||
      value.startsWith("::ffff:10.") ||
      value.startsWith("::ffff:192.168.") ||
      value.startsWith("::ffff:172.")
    );
  }

  if (value.startsWith("127.")) return true;
  if (value.startsWith("10.")) return true;
  if (value.startsWith("192.168.")) return true;

  const match172 = value.match(/^172\.(\d+)\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return false;
}

async function lookupCountryByIp(ip: string): Promise<string | null> {
  if (!ip || ip === "unknown" || isPrivateOrLocalIp(ip)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("page-pulse geo lookup failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json().catch(() => null);
    const code = normalizeCountryCode(data?.country_code);

    return code;
  } catch (error) {
    console.error("page-pulse geo lookup error", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const rawPageName = body?.pageName;
    const rawType = body?.type;

    const pageName = typeof rawPageName === "string" ? rawPageName.trim() : "";
    const type = typeof rawType === "string" ? rawType.trim() : "";

    if (!pageName || !type) {
      return json(
        {
          error: "Missing parameters",
          received: {
            pageName: rawPageName ?? null,
            type: rawType ?? null,
          },
        },
        400
      );
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent")?.trim() || "unknown";
    const today = new Date().toISOString().slice(0, 10);

    const headerCountry = getCountryFromHeaders(req);
    const fallbackCountry = headerCountry.code ? null : await lookupCountryByIp(ip);
    const country = headerCountry.code || fallbackCountry || "Unknown";
    const countrySource = headerCountry.code
      ? headerCountry.source
      : fallbackCountry
        ? "geo-ip-fallback"
        : "unknown";

    const hashInput = `${ip}|${userAgent}|${today}`;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(hashInput)
    );
    const visitorHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        {
          error: "Missing Supabase environment variables",
        },
        500
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const payload = {
      page_name: pageName,
      page_type: type,
      visitor_hash: visitorHash,
      country,
      view_date: today,
    };

    const { error } = await supabaseAdmin
      .from("page_views_analytics")
      .upsert(payload, {
        onConflict: "page_name,visitor_hash,view_date",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("page-pulse db error", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        payload,
      });

      return json(
        {
          error: "DB insert failed",
          details: error.message,
        },
        500
      );
    }

    return json({
      success: true,
      tracked: {
        pageName,
        type,
        country,
        countrySource,
        today,
      },
    });
  } catch (error) {
    console.error("page-pulse fatal error", error);

    return json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});