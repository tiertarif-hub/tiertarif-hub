# TierTarif Rank-Scout Cleanup Manifest

## Geänderte Dateien

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/ui/LoadingScreen.tsx`
- `src/hooks/useSettings.ts`
- `src/components/home/HomeSEOText.tsx`
- `src/components/home/NewsSection.tsx`
- `src/components/home/SEOContentSection.tsx`
- `src/components/home/HowItWorksSection.tsx`
- `src/components/home/BigThreeSection.tsx`
- `src/components/home/HomeComparisonSlider.tsx`
- `src/components/forum/RelatedForumThreads.tsx`
- `src/components/forum/ForumSEO.tsx`
- `src/components/layout/CookieBanner.tsx`
- `src/components/templates/ComparisonTemplate.tsx`
- `src/components/templates/HubTemplate.tsx`
- `src/components/admin/HomeFAQEditor.tsx`
- `src/hooks/useGenerateCategoryContent.ts`
- `src/hooks/useSeoRedirects.ts`
- `src/lib/constants.ts`
- `src/lib/schemas.ts`
- `src/lib/aboutContent.ts`
- `src/pages/About.tsx`
- `src/pages/admin/Layout.tsx`
- `src/pages/admin/MultiPublisher.tsx`
- `src/pages/admin/Login.tsx`
- `src/pages/admin/Forum.tsx`
- `src/pages/admin/About.tsx`
- `src/pages/admin/Categories.tsx`
- `fix_tiertarif_brand_settings.sql`

## Nicht geändert

- `dsl-vergleich-rank-scout` Slugs in Forum-Sidebar/-Slider wurden bewusst nicht geändert, weil das URL-/Slug-Änderungen wären und ohne Redirect 404-Risiko erzeugen.
- `rank-scout-ai` Edge-Function-Name wurde bewusst nicht geändert, weil das ein technischer Funktionsname ist und sonst die Supabase Function brechen kann.

## Build-Hinweis

Der hochgeladene ZIP-Auszug enthält nur `src/` und nicht das vollständige Projekt mit `package.json`. Daher konnte kein kompletter `npm run build` ausgeführt werden.
