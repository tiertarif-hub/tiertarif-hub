# TierTarif Cleanup Manifest – Paket A

## Ziel

Sichere Entfernung der technischen Rank-Scout-Datei-Altlasten aus dem TierTarif-Repository, ohne Routen, Slugs oder bestehende Vergleichsseiten zu ändern.

## Geänderte/neu angelegte Asset-Pfade

- `public/brand/tiertarif-logo.webp`
- `public/big-threes/tiertarif-forum-magazin-hero.webp`
- `public/big-threes/tiertarif-versicherungen-startseitenbild.webp`
- `public/big-threes/tiertarif-tierversicherung-startseitenbild.webp`

## Entfernte Altlasten

- `Rank-Scout-Logo.webp`
- `public/rank-scout-logo.webp`
- `public/big-threes/rank-scout-logo.webp`
- `public/big-threes/forum_magazin_herobild_rank-scout.webp`
- `public/big-threes/versicherungen_vergleich_rank-scout_startseitenbild.webp`
- `public/big-threes/versicherungen_vergleich_rank-scout_startseitenbild1.webp`
- `supabase/functions/rank-scout-ai/`
- `rank_scout_db.sql`

## Neue/umbenannte technische Pfade

- `supabase/functions/tiertarif-ai/`
- `tiertarif_db.sql`

## Angepasste Code-Referenzen

- `src/components/forum/ForumComparisonSlider.tsx`
- `src/components/home/HeroSection.tsx`
- `src/pages/Forum.tsx`
- `src/hooks/useGenerateCategoryContent.ts`
- `supabase/functions/tiertarif-ai/index.ts`

## Bewusst nicht geändert

- `dsl-vergleich-rank-scout` Slugs in `ForumComparisonSidebar.tsx` und `ForumComparisonSlider.tsx` bleiben unverändert, weil Slug-/URL-Änderungen ohne Redirect-Konzept 404-Risiko erzeugen.
- `dist/` wurde bewusst nicht manuell angepasst. Der Ordner muss durch `npm run build` neu erzeugt werden.
- Historische Dokumente wie `CHANGELOG.md` oder `MIGRATION_LOG.md` können noch alte Projektnamen enthalten. Diese sind nicht runtime-relevant.

## Build-Hinweis

Nach Deployment-Vorbereitung bitte lokal ausführen:

```bash
npm run build
```

Danach im Browser-Netzwerk prüfen:

- keine Requests auf `rank-scout-logo.webp`
- keine Requests auf `forum_magazin_herobild_rank-scout.webp`
- keine Requests auf `forum_magazin_herobild_standard-portal.webp`
- keine Function Calls auf `rank-scout-ai`
