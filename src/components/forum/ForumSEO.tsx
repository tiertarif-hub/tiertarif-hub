import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { ForumCategory } from "@/hooks/useForum";
import { buildCanonicalUrl } from "@/lib/seo";
import { getForumCategoryRoute, getForumIndexRoute } from "@/lib/routes";
import { useSiteBrandName } from "@/hooks/useSettings";

interface ForumSEOProps {
  activeCategory?: ForumCategory | null;
  bannerConfig?: any;
}

export const ForumSEO = ({ activeCategory, bannerConfig }: ForumSEOProps) => {
  const location = useLocation();
  const brandName = useSiteBrandName();
  
  // Canonical URL sauber aufbauen (ohne Query Params)
  const canonicalUrl = activeCategory
    ? buildCanonicalUrl(getForumCategoryRoute(activeCategory.slug))
    : buildCanonicalUrl(getForumIndexRoute());

  // --- LOGIK: Titel & Beschreibung bestimmen ---
  let title = `Community Forum | ${brandName}`;
  let description = "Das große Vergleichsportal Forum. Diskutiere mit Experten über Software, Finanzen und mehr.";

  // 1. Sind wir in einer Kategorie?
  if (activeCategory) {
    // A) Titel: Admin-Feld hat Vorrang
    if (activeCategory.seo_title && activeCategory.seo_title.trim().length > 0) {
      title = activeCategory.seo_title;
    } else {
      title = `${activeCategory.name} Forum - Erfahrungen & Diskussionen | ${brandName}`;
    }

    // B) Beschreibung: Admin-Feld hat ABSOLUTEN Vorrang
    if (activeCategory.seo_description && activeCategory.seo_description.trim().length > 0) {
      description = activeCategory.seo_description;
    } 
    // Fallback: Normale Beschreibung
    else if (activeCategory.description && activeCategory.description.trim().length > 0) {
      description = activeCategory.description.substring(0, 155);
    } 
    // Notfall-Fallback
    else {
      description = `Willkommen im Bereich ${activeCategory.name}. Diskutiere jetzt mit der ${brandName} Community über ${activeCategory.name}.`;
    }
  } 
  // 2. Startseite (Forum Home)
  else {
    if (bannerConfig?.headline) title = `${bannerConfig.headline} | ${brandName}`;
    if (bannerConfig?.subheadline) description = bannerConfig.subheadline;
  }

  return (
    // WICHTIG: 'key' zwingt React, diesen Block bei jedem URL-Wechsel komplett neu zu bauen.
    // Damit wird verhindert, dass alte Meta-Daten "kleben" bleiben.
    <Helmet key={location.pathname}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Social Media Sync */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Sync */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};