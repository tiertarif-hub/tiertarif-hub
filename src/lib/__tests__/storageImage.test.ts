import { describe, expect, it } from "vitest";
import {
  normalizeSupabasePublicImageUrl,
  normalizeSupabasePublicSrcSet,
  isSupabasePublicStorageUrl,
} from "@/lib/storageImage";

const objectUrl = "https://example.supabase.co/storage/v1/object/public/branding/hund.webp";
const renderUrl = "https://example.supabase.co/storage/v1/render/image/public/branding/hund.webp?width=768&quality=82&resize=cover";

describe("storageImage", () => {
  it("erkennt Supabase Public Storage URLs", () => {
    expect(isSupabasePublicStorageUrl(objectUrl)).toBe(true);
    expect(isSupabasePublicStorageUrl(renderUrl)).toBe(true);
    expect(isSupabasePublicStorageUrl("https://cdn.example.com/hund.webp")).toBe(false);
  });

  it("setzt Supabase render/image URLs zurück auf object/public", () => {
    expect(normalizeSupabasePublicImageUrl(renderUrl)).toBe(objectUrl);
  });

  it("entfernt Transform-Parameter von object/public URLs", () => {
    expect(normalizeSupabasePublicImageUrl(`${objectUrl}?width=1536&quality=82#hero`)).toBe(`${objectUrl}#hero`);
  });

  it("lässt fremde CDN-URLs unverändert", () => {
    const cdnUrl = "https://cdn.example.com/image.webp?width=500";
    expect(normalizeSupabasePublicImageUrl(cdnUrl)).toBe(cdnUrl);
  });

  it("normalisiert Supabase srcset Einträge ohne Descriptor zu verlieren", () => {
    const srcset = `${renderUrl} 768w, ${objectUrl}?quality=82 1536w`;
    expect(normalizeSupabasePublicSrcSet(srcset)).toBe(`${objectUrl} 768w, ${objectUrl} 1536w`);
  });
});
