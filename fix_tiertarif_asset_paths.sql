-- TierTarif Paket A: Asset-Pfade in Supabase bereinigen
-- Ziel: DB-gespeicherte alte Rank-Scout-Bildpfade auf neutrale TierTarif-Pfade umstellen.
-- Sicher: Keine Slugs/Routen werden geändert.

BEGIN;

-- 1) Logo-Setting auf neuen neutralen Pfad setzen
INSERT INTO public.settings (key, value)
VALUES ('site_logo_url', to_jsonb('/brand/tiertarif-logo.webp'::text))
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- 2) Alte Asset-Pfade in allen Settings-JSON-Werten ersetzen
UPDATE public.settings
SET value = replace(
  replace(
    replace(
      replace(
        replace(value::text,
          '/rank-scout-logo.webp',
          '/brand/tiertarif-logo.webp'
        ),
        '/big-threes/rank-scout-logo.webp',
        '/brand/tiertarif-logo.webp'
      ),
      '/big-threes/forum_magazin_herobild_rank-scout.webp',
      '/big-threes/tiertarif-forum-magazin-hero.webp'
    ),
    '/big-threes/versicherungen_vergleich_rank-scout_startseitenbild.webp',
    '/big-threes/tiertarif-versicherungen-startseitenbild.webp'
  ),
  '/big-threes/versicherungen_vergleich_rank-scout_startseitenbild1.webp',
  '/big-threes/tiertarif-tierversicherung-startseitenbild.webp'
)::jsonb
WHERE value::text ~ 'rank-scout-logo|forum_magazin_herobild_rank-scout|versicherungen_vergleich_rank-scout';

-- 3) Alte Asset-Pfade in Kategorie-Medienfeldern ersetzen, falls dort noch Altpfade gespeichert sind
UPDATE public.categories
SET
  card_image_url = replace(
    replace(
      replace(coalesce(card_image_url, ''),
        '/big-threes/forum_magazin_herobild_rank-scout.webp',
        '/big-threes/tiertarif-forum-magazin-hero.webp'
      ),
      '/big-threes/versicherungen_vergleich_rank-scout_startseitenbild.webp',
      '/big-threes/tiertarif-versicherungen-startseitenbild.webp'
    ),
    '/big-threes/versicherungen_vergleich_rank-scout_startseitenbild1.webp',
    '/big-threes/tiertarif-tierversicherung-startseitenbild.webp'
  ),
  hero_image_url = replace(
    replace(
      replace(coalesce(hero_image_url, ''),
        '/big-threes/forum_magazin_herobild_rank-scout.webp',
        '/big-threes/tiertarif-forum-magazin-hero.webp'
      ),
      '/big-threes/versicherungen_vergleich_rank-scout_startseitenbild.webp',
      '/big-threes/tiertarif-versicherungen-startseitenbild.webp'
    ),
    '/big-threes/versicherungen_vergleich_rank-scout_startseitenbild1.webp',
    '/big-threes/tiertarif-tierversicherung-startseitenbild.webp'
  )
WHERE coalesce(card_image_url, '') ~ 'forum_magazin_herobild_rank-scout|versicherungen_vergleich_rank-scout'
   OR coalesce(hero_image_url, '') ~ 'forum_magazin_herobild_rank-scout|versicherungen_vergleich_rank-scout';

COMMIT;
