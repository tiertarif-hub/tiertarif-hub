-- TierTarif Paket B: aktives Frontend-Theme auf Trust Vet Teal setzen
-- Ändert keine Slugs, Routen oder Kategorien.

INSERT INTO public.settings (key, value, updated_at)
VALUES ('active_theme', '"tiertarif"'::jsonb, now())
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
