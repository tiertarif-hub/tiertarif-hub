import { describe, expect, it } from "vitest";
import { optimizeSupabaseImageUrl, rewriteSupabaseStorageUrls } from "@/lib/sanitizeHtml";

const objectUrl = "https://example.supabase.co/storage/v1/object/public/branding/katze.webp";
const renderUrl = "https://example.supabase.co/storage/v1/render/image/public/branding/katze.webp?width=768&quality=82";

describe("sanitizeHtml Supabase Bildschutz", () => {
  it("optimiert Supabase-Bilder nicht mehr auf die render/image Route", () => {
    expect(optimizeSupabaseImageUrl(objectUrl, 1536, 82)).toBe(objectUrl);
    expect(optimizeSupabaseImageUrl(renderUrl, 1536, 82)).toBe(objectUrl);
  });

  it("normalisiert Bilder innerhalb von CMS-HTML", () => {
    const html = `<p>Test</p><img src="${renderUrl}" alt="Katze" />`;
    const result = rewriteSupabaseStorageUrls(html, 1536, 82);

    expect(result).toContain(`src="${objectUrl}"`);
    expect(result).not.toContain("/render/image/public/");
    expect(result).not.toContain("quality=82");
  });
});
