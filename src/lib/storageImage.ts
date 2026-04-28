const SUPABASE_OBJECT_PUBLIC_SEGMENT = "/storage/v1/object/public/";
const SUPABASE_RENDER_PUBLIC_SEGMENT = "/storage/v1/render/image/public/";

const TRANSFORM_QUERY_PARAMS = new Set([
  "width",
  "height",
  "quality",
  "resize",
  "format",
]);

function splitUrlParts(url: string) {
  const trimmed = String(url ?? "").trim();
  const hashIndex = trimmed.indexOf("#");
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");
  const base = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";

  return { base, query, hash };
}

function stripTransformQueryParams(rawQuery: string) {
  if (!rawQuery) return "";

  const params = new URLSearchParams(rawQuery);
  TRANSFORM_QUERY_PARAMS.forEach((paramName) => params.delete(paramName));

  return params.toString();
}

export function isSupabasePublicStorageUrl(url?: string | null): boolean {
  const value = String(url ?? "").trim();
  return value.includes(SUPABASE_OBJECT_PUBLIC_SEGMENT) || value.includes(SUPABASE_RENDER_PUBLIC_SEGMENT);
}

export function normalizeSupabasePublicImageUrl(url?: string | null): string {
  if (!url) return "";

  const trimmedUrl = String(url).trim();
  if (!trimmedUrl) return "";

  const { base, query, hash } = splitUrlParts(trimmedUrl);
  const normalizedBase = base.includes(SUPABASE_RENDER_PUBLIC_SEGMENT)
    ? base.replace(SUPABASE_RENDER_PUBLIC_SEGMENT, SUPABASE_OBJECT_PUBLIC_SEGMENT)
    : base;

  if (!isSupabasePublicStorageUrl(base)) {
    return trimmedUrl;
  }

  const safeQuery = stripTransformQueryParams(query);
  return `${normalizedBase}${safeQuery ? `?${safeQuery}` : ""}${hash}`;
}

export function normalizeSupabasePublicSrcSet(srcset?: string | null): string {
  if (!srcset) return "";

  return String(srcset)
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return trimmed;

      const firstWhitespace = trimmed.search(/\s/);
      if (firstWhitespace === -1) {
        return normalizeSupabasePublicImageUrl(trimmed);
      }

      const url = trimmed.slice(0, firstWhitespace);
      const descriptor = trimmed.slice(firstWhitespace).trim();
      return `${normalizeSupabasePublicImageUrl(url)}${descriptor ? ` ${descriptor}` : ""}`;
    })
    .filter(Boolean)
    .join(", ");
}
