import DOMPurify from "dompurify";
import { normalizeNavigableHref } from "@/lib/routes";

const CMS_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "ul", "ol", "li",
  "strong", "em", "b", "i", "u",
  "a", "span", "div", "section",
  "img", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "details", "summary", "code", "pre", "figure", "figcaption"
];

const CMS_ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "srcset", "alt", "title",
  "class", "id", "style",
  "width", "height", "loading", "decoding",
  "colspan", "rowspan", "scope"
];

const DOMPURIFY_FORBID_TAGS = [
  "script", "iframe", "object", "embed",
  "form", "input", "button", "textarea", "select",
  "style", "svg", "math"
];

const DOMPURIFY_FORBID_ATTR = [
  "onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover", "onmousemove", "onmouseout",
  "onmouseenter", "onmouseleave", "onkeydown", "onkeypress", "onkeyup", "onfocus", "onblur",
  "onchange", "oninput", "onsubmit", "onreset", "onload", "onerror", "onabort", "onwheel",
  "ondrag", "ondragstart", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondrop",
  "ontouchstart", "ontouchmove", "ontouchend", "onpointerdown", "onpointermove", "onpointerup"
];

const STORAGE_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";
const MAX_FORUM_IMAGE_WIDTH = 1400;
const MIN_FORUM_IMAGE_WIDTH = 180;
const DEFAULT_FORUM_IMAGE_WIDTH = 1100;
const RESPONSIVE_TABLE_WRAPPER_CLASS = "overflow-x-auto my-6 rounded-2xl border border-slate-200 bg-white shadow-sm";
const SAFE_INLINE_STYLE_PROPERTIES = new Set([
  "background",
  "background-color",
  "color",
  "text-align",
  "border",
  "border-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "border-bottom-color",
  "border-radius",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "display",
  "justify-content",
  "align-items",
  "gap",
  "white-space",
  "text-decoration",
  "box-shadow",
  "max-width",
  "width",
  "height",
]);
const UNSAFE_STYLE_VALUE_PATTERN = /(?:expression\s*\(|javascript:|vbscript:|data:text\/html|@import|behavior\s*:|url\s*\()/i;
const INTERNAL_PATH_PATTERN = /^\/(?!\/)/;

function isInternalPathUrl(url?: string | null) {
  if (!url) return false;
  return INTERNAL_PATH_PATTERN.test(String(url).trim());
}

function normalizeLinkRelValue(rel?: string | null) {
  if (!rel) return null;

  const safeTokens = Array.from(
    new Set(
      String(rel)
        .split(/\s+/)
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean)
        .filter((token) => !["nofollow", "noopener", "noreferrer"].includes(token))
    )
  );

  return safeTokens.length ? safeTokens.join(" ") : null;
}

function sanitizeInlineStyle(styleText?: string | null): string | null {
  if (!styleText) return null;

  const safeDeclarations = styleText
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colonIndex = declaration.indexOf(":");
      if (colonIndex === -1) return null;

      const property = declaration.slice(0, colonIndex).trim().toLowerCase();
      const value = declaration.slice(colonIndex + 1).trim().replace(/\s+/g, " ");

      if (!SAFE_INLINE_STYLE_PROPERTIES.has(property) || !value || UNSAFE_STYLE_VALUE_PATTERN.test(value)) {
        return null;
      }

      return `${property}: ${value}`;
    })
    .filter((value): value is string => Boolean(value));

  return safeDeclarations.length ? safeDeclarations.join("; ") : null;
}

function normalizeAnchorElement(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute("href");
  const safeStyle = sanitizeInlineStyle(anchor.getAttribute("style"));

  if (safeStyle) {
    anchor.setAttribute("style", safeStyle);
  } else {
    anchor.removeAttribute("style");
  }

  if (rawHref) {
    const normalizedHref = normalizeNavigableHref(rawHref, "/");
    anchor.setAttribute("href", normalizedHref);

    if (isInternalPathUrl(normalizedHref)) {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
      return;
    }
  }

  const safeRel = normalizeLinkRelValue(anchor.getAttribute("rel"));
  if (safeRel) {
    anchor.setAttribute("rel", safeRel);
  } else {
    anchor.removeAttribute("rel");
  }
}

function cleanupInternalLinkAttributesInHtml(html: string) {
  return html.replace(/<a\b([^>]*?)\bhref=(['"])(\/[^'"]*)\2([^>]*)>/gi, (fullMatch) => {
    const withoutTarget = fullMatch.replace(/\s+target=(['"]).*?\1/gi, "");
    const withoutRel = withoutTarget.replace(/\s+rel=(['"]).*?\1/gi, "");
    return withoutRel;
  });
}

function splitUrlParts(url: string) {
  const trimmed = url.trim();
  const hashIndex = trimmed.indexOf("#");
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");
  const base = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";

  return { base, query, hash };
}

function buildSupabaseImageUrl(base: string, rawQuery: string, hash: string, width: number, quality: number) {
  const params = new URLSearchParams(rawQuery);
  params.set("width", String(width));
  params.set("quality", String(quality));

  const query = params.toString();
  return base + (query ? "?" + query : "") + hash;
}

function buildSupabasePublicObjectUrl(base: string, rawQuery: string, hash: string) {
  const normalizedBase = base.includes(RENDER_SEGMENT)
    ? base.replace(RENDER_SEGMENT, STORAGE_SEGMENT)
    : base;

  const params = new URLSearchParams(rawQuery);
  ["width", "height", "quality", "resize", "format"].forEach((key) => params.delete(key));

  const query = params.toString();
  return normalizedBase + (query ? "?" + query : "") + hash;
}

function rewriteImageSrcset(srcset: string, width: number, quality: number) {
  return srcset
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return trimmed;

      const firstWhitespace = trimmed.search(/\s/);
      if (firstWhitespace === -1) {
        return optimizeSupabaseImageUrl(trimmed, width, quality);
      }

      const url = trimmed.slice(0, firstWhitespace);
      const descriptor = trimmed.slice(firstWhitespace).trim();
      return `${optimizeSupabaseImageUrl(url, width, quality)}${descriptor ? ` ${descriptor}` : ""}`;
    })
    .join(", ");
}

function normalizeImageWidth(value?: string | null): string | null {
  if (!value) return null;

  const numeric = Number.parseInt(String(value).replace(/px$/i, "").trim(), 10);
  if (!Number.isFinite(numeric)) return null;

  const safeWidth = Math.min(Math.max(numeric, MIN_FORUM_IMAGE_WIDTH), MAX_FORUM_IMAGE_WIDTH);
  return String(safeWidth);
}

function parentAlreadyHandlesTableOverflow(table: HTMLTableElement) {
  const parent = table.parentElement;
  if (!parent) return false;

  if (parent.tagName.toLowerCase() !== "div") return false;

  const className = parent.getAttribute("class") || "";
  const style = parent.getAttribute("style") || "";

  return /(^|\s)overflow-x-auto(\s|$)/.test(className) || /overflow-x\s*:\s*(auto|scroll)/i.test(style);
}

function ensureResponsiveTableWrappers(root: ParentNode) {
  root.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    if (parentAlreadyHandlesTableOverflow(table)) return;

    const wrapper = table.ownerDocument.createElement("div");
    wrapper.setAttribute("class", RESPONSIVE_TABLE_WRAPPER_CLASS);

    const parent = table.parentNode;
    if (!parent) return;

    parent.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

function normalizeForumMarkup(html?: string | null) {
  if (!html) return "";

  const markup = String(html);

  if (typeof DOMParser === "undefined") {
    return markup;
  }

  const documentFragment = new DOMParser().parseFromString(markup, "text/html");

  documentFragment.body.querySelectorAll<HTMLElement>("*").forEach((element) => {
    if (element instanceof HTMLAnchorElement) {
      normalizeAnchorElement(element);
      return;
    }

    const safeStyle = sanitizeInlineStyle(element.getAttribute("style"));
    if (safeStyle) {
      element.setAttribute("style", safeStyle);
    } else {
      element.removeAttribute("style");
    }
  });

  documentFragment.querySelectorAll("img").forEach((img) => {
    const widthAttr = normalizeImageWidth(img.getAttribute("width"));
    const styleWidth = normalizeImageWidth((img as HTMLElement).style?.width || null);
    const resolvedWidth = widthAttr || styleWidth || String(DEFAULT_FORUM_IMAGE_WIDTH);

    if (resolvedWidth) {
      img.setAttribute("width", resolvedWidth);
    } else {
      img.removeAttribute("width");
    }

    img.removeAttribute("class");
    img.removeAttribute("style");

    if (!img.getAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }

    if (!img.getAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }
  });

  ensureResponsiveTableWrappers(documentFragment.body);

  return documentFragment.body.innerHTML;
}

function sanitizeWithCmsPolicy(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: CMS_ALLOWED_TAGS,
    ALLOWED_ATTR: CMS_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: DOMPURIFY_FORBID_TAGS,
    FORBID_ATTR: DOMPURIFY_FORBID_ATTR,
  });
}

export function optimizeSupabaseImageUrl(url?: string | null, width = 800, quality = 80): string {
  if (!url) return "";

  const trimmedUrl = String(url).trim();
  if (!trimmedUrl) return "";

  const { base, query, hash } = splitUrlParts(trimmedUrl);

  // TierTarif: Supabase Image-Transform (/render/image/public/) liefert im Live-Projekt
  // bei Branding-Bucket-Bildern 403. Deshalb nutzen Frontend-Karten und CMS-Bilder
  // wieder die direkte /object/public/-URL und entfernen Transform-Parameter.
  if (base.includes(RENDER_SEGMENT) || base.includes(STORAGE_SEGMENT)) {
    return buildSupabasePublicObjectUrl(base, query, hash);
  }

  return trimmedUrl;
}

export function rewriteSupabaseStorageUrls(html?: string | null, width = 800, quality = 80): string {
  if (!html) return "";

  const markup = normalizeForumMarkup(html);

  if (typeof DOMParser === "undefined") {
    return cleanupInternalLinkAttributesInHtml(
      markup.replace(/<img\b([^>]*)\bsrc=(["'])([^"']+)\2([^>]*)>/gi, (_full, before, quote, src, after) => {
        const optimizedSrc = optimizeSupabaseImageUrl(src, width, quality);
        return `<img${before}src=${quote}${optimizedSrc}${quote}${after}>`;
      })
    );
  }

  const documentFragment = new DOMParser().parseFromString(markup, "text/html");

  documentFragment.querySelectorAll("img[src]").forEach((img) => {
    const currentSrc = img.getAttribute("src");
    if (currentSrc) {
      img.setAttribute("src", optimizeSupabaseImageUrl(currentSrc, width, quality));
    }

    const currentSrcset = img.getAttribute("srcset");
    if (currentSrcset) {
      img.setAttribute("srcset", rewriteImageSrcset(currentSrcset, width, quality));
    }
  });

  return documentFragment.body.innerHTML;
}

export function sanitizeCmsHtml(html?: string | null): string {
  if (!html) return "";

  const normalizedHtml = rewriteSupabaseStorageUrls(html, 1400, 80);
  return sanitizeWithCmsPolicy(normalizedHtml);
}

export function sanitizeCmsHtmlWithBreaks(html?: string | null): string {
  if (!html) return "";
  return sanitizeCmsHtml(String(html).replace(/\n/g, "<br/>"));
}

export function sanitizeForumHtml(html?: string | null): string {
  if (!html) return "";

  const normalizedHtml = rewriteSupabaseStorageUrls(html, 1400, 80);
  return sanitizeWithCmsPolicy(normalizedHtml);
}