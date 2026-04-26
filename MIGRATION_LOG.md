# MIGRATION_LOG.md

## Ziel

Phase 1: sichere Umstellung vom harten Rank-Scout-Branding auf ein neutrales White-Label-Frontend.

## Neue zentrale Datei

- `src/lib/constants.ts`

## Neue Variablen / Helper

- `DEFAULT_BRAND_NAME`
- `DEFAULT_SITE_URL`
- `DEFAULT_CONTACT_EMAIL`
- `DEFAULT_SITE_DESCRIPTION`
- `DEFAULT_AUTHOR_NAME`
- `DEFAULT_ASSISTANT_IMAGE`
- `DEFAULT_HERO_IMAGE`
- `buildAbsoluteSiteUrl(path)`

## Bewusst nicht angefasst

- `supabase/functions/**`
- interne Nginx-Labels
- historische SQL-Dumps / Changelog / README
- Edge-Function-Name `rank-scout-ai`

## Inventur der entfernten harten Referenzen

| Datei | Zeile | Entfernte Referenz | Ersatz |
|---|---:|---|---|
| `src/lib/routes.ts` | 1 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/seo.ts` | 3 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 194 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 225 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 240 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 266 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 277 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 278 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 282 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 283 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 287 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 299 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 318 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 322 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/hooks/useSettings.ts` | 344 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 46 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 70 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 73 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 75 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 77 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 78 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 80 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 84 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 86 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 87 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 102 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 112 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 114 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 125 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 127 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 138 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/lib/aboutContent.ts` | 146 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/AffiliateDisclaimer.tsx` | 9 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/layout/Footer.tsx` | 160 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/layout/CookieBanner.tsx` | 102 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/layout/MascotWidget.tsx` | 37 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/forum/ForumSEO.tsx` | 21 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/forum/ForumSEO.tsx` | 30 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/forum/ForumSEO.tsx` | 43 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/forum/ForumSEO.tsx` | 48 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/HomeSEOText.tsx` | 9 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/HomeSEOText.tsx` | 12 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/HomeSEOText.tsx` | 63 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/HowItWorksSection.tsx` | 94 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/NewsSection.tsx` | 175 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/SEOContentSection.tsx` | 24 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/HeroSection.tsx` | 62 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/HomeComparisonSlider.tsx` | 122 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 173 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 199 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 204 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 208 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 213 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 219 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 225 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 253 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 254 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/home/BigThreeSection.tsx` | 264 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/admin/HomeFAQEditor.tsx` | 80 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/admin/HomeFAQEditor.tsx` | 147 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/ComparisonTemplate.tsx` | 114 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/ComparisonTemplate.tsx` | 122 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/ComparisonTemplate.tsx` | 178 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/ComparisonTemplate.tsx` | 207 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/ComparisonTemplate.tsx` | 390 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/ComparisonTemplate.tsx` | 414 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/components/templates/HubTemplate.tsx` | 111 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 43 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 49 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 74 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 81 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 93 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 151 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 152 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Index.tsx` | 157 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/About.tsx` | 97 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/About.tsx` | 253 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 20 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 23 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 25 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 40 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 60 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 65 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 84 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 89 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 95 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 112 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 122 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 137 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 168 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 179 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 220 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 236 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 247 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 248 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 299 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/AGB.tsx` | 303 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 20 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 67 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 69 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 70 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 115 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 116 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 216 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 219 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Contact.tsx` | 234 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Datenschutz.tsx` | 12 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Datenschutz.tsx` | 13 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Datenschutz.tsx` | 14 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Datenschutz.tsx` | 55 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 11 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 19 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 24 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 26 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 42 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 51 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 86 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 116 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 117 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/HowWeCompare.tsx` | 132 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Impressum.tsx` | 12 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Impressum.tsx` | 13 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Impressum.tsx` | 14 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Impressum.tsx` | 47 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Impressum.tsx` | 67 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Impressum.tsx` | 73 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Categories.tsx` | 91 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Categories.tsx` | 92 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 166 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 167 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 173 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 179 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 185 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 201 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/CategoryDetail.tsx` | 266 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 65 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 67 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 97 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 166 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 341 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 346 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 473 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/Forum.tsx` | 503 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/ForumThread.tsx` | 222 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/ForumThread.tsx` | 223 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/ForumThread.tsx` | 240 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/ForumThread.tsx` | 254 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/ForumThread.tsx` | 406 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/ForumThread.tsx` | 419 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `src/pages/NotFound.tsx` | 16 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `index.html` | 6 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `public/robots.txt` | 9 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `public/llms.txt` | 1 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `public/llms.txt` | 2 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `public/llms.txt` | 3 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `public/_redirects` | 1 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `public/_redirects` | 2 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `scripts/generate-sitemap.js` | 18 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `scripts/turbo-ping.js` | 14 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `scripts/turbo-ping.js` | 30 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
| `scripts/turbo-ping.js` | 34 | `Rank-Scout / rank-scout / rank-scout.com` | zentrale Constants, ENV-URL oder neutrales White-Label-Wording |
