-- TierTarif Hotfix: Redirects + Daily Stats aktivieren
-- Ziel:
-- 1) Redirect-Admin wieder produktiv nutzbar machen
-- 2) page-pulse Tracking mit page_views_analytics + daily_stats verbinden
-- 3) Feature Toggles für Redirects + Analytics aktivieren, Footer-Links/Leads bleiben aus

BEGIN;

-- =========================================================
-- REDIRECTS: Tabelle auf das aktuelle Frontend-Schema bringen
-- =========================================================
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text,
  target_url text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_clicked_at timestamptz
);

ALTER TABLE public.redirects
  ADD COLUMN IF NOT EXISTS source_path text,
  ADD COLUMN IF NOT EXISTS target_url text,
  ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_clicked_at timestamptz;

-- Falls eine alte Redirect-Struktur mit slug/click_count existiert, sauber übernehmen.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'redirects' AND column_name = 'slug'
  ) THEN
    EXECUTE $copy_slug$
      UPDATE public.redirects
      SET source_path = COALESCE(NULLIF(source_path, ''), NULLIF(slug, ''))
      WHERE source_path IS NULL OR source_path = ''
    $copy_slug$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'redirects' AND column_name = 'click_count'
  ) THEN
    EXECUTE $copy_clicks$
      UPDATE public.redirects
      SET clicks = COALESCE(clicks, click_count, 0)
    $copy_clicks$;
  END IF;
END $$;

UPDATE public.redirects
SET source_path = id::text
WHERE source_path IS NULL OR btrim(source_path) = '';

UPDATE public.redirects
SET source_path = regexp_replace(btrim(source_path), '^/+|/+$', '', 'g'),
    clicks = COALESCE(clicks, 0),
    is_active = COALESCE(is_active, true),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now());

ALTER TABLE public.redirects
  ALTER COLUMN source_path SET NOT NULL,
  ALTER COLUMN target_url SET NOT NULL,
  ALTER COLUMN clicks SET NOT NULL,
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS redirects_source_path_unique
  ON public.redirects (source_path);

CREATE INDEX IF NOT EXISTS redirects_active_source_path_idx
  ON public.redirects (source_path, is_active);

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active redirects" ON public.redirects;
DROP POLICY IF EXISTS "Admins can view all redirects" ON public.redirects;
DROP POLICY IF EXISTS "Admins can insert redirects" ON public.redirects;
DROP POLICY IF EXISTS "Admins can update redirects" ON public.redirects;
DROP POLICY IF EXISTS "Admins can delete redirects" ON public.redirects;

CREATE POLICY "Admins can view all redirects"
ON public.redirects
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'::public.user_role));

CREATE POLICY "Admins can insert redirects"
ON public.redirects
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'::public.user_role));

CREATE POLICY "Admins can update redirects"
ON public.redirects
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'::public.user_role))
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'::public.user_role));

CREATE POLICY "Admins can delete redirects"
ON public.redirects
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'::public.user_role));

DROP TRIGGER IF EXISTS update_redirects_updated_at ON public.redirects;
CREATE TRIGGER update_redirects_updated_at
BEFORE UPDATE ON public.redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_redirect_click(redirect_slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target text;
  normalized_slug text;
BEGIN
  normalized_slug := regexp_replace(btrim(COALESCE(redirect_slug, '')), '^/+|/+$', '', 'g');

  UPDATE public.redirects
  SET clicks = COALESCE(clicks, 0) + 1,
      last_clicked_at = now(),
      updated_at = now()
  WHERE source_path = normalized_slug
    AND is_active = true
  RETURNING target_url INTO target;

  RETURN target;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_redirect_click(text) TO anon, authenticated;

-- =========================================================
-- ANALYTICS: Unique Daily Views + Daily Aggregate
-- =========================================================
CREATE TABLE IF NOT EXISTS public.page_views_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  page_type text NOT NULL,
  visitor_hash text NOT NULL,
  country text NOT NULL DEFAULT 'Unknown',
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS page_views_analytics_unique_daily_visitor_idx
  ON public.page_views_analytics (page_name, visitor_hash, view_date);

CREATE INDEX IF NOT EXISTS page_views_analytics_view_date_idx
  ON public.page_views_analytics (view_date DESC);

CREATE INDEX IF NOT EXISTS page_views_analytics_page_idx
  ON public.page_views_analytics (page_name, page_type);

ALTER TABLE public.page_views_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view page analytics" ON public.page_views_analytics;
CREATE POLICY "Admins can view page analytics"
ON public.page_views_analytics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'::public.user_role));

CREATE TABLE IF NOT EXISTS public.daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL,
  type text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_stats_item_type_date_unique
  ON public.daily_stats (item_id, type, stat_date);

CREATE INDEX IF NOT EXISTS daily_stats_item_type_idx
  ON public.daily_stats (item_id, type);

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view daily stats" ON public.daily_stats;
CREATE POLICY "Admins can view daily stats"
ON public.daily_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'::public.user_role));

DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON public.daily_stats;
CREATE TRIGGER update_daily_stats_updated_at
BEFORE UPDATE ON public.daily_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_daily_stats_from_page_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_stats (item_id, type, count, stat_date)
  VALUES (NEW.page_name, NEW.page_type, 1, NEW.view_date)
  ON CONFLICT (item_id, type, stat_date)
  DO UPDATE SET
    count = public.daily_stats.count + 1,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS page_views_analytics_increment_daily_stats ON public.page_views_analytics;
CREATE TRIGGER page_views_analytics_increment_daily_stats
AFTER INSERT ON public.page_views_analytics
FOR EACH ROW
EXECUTE FUNCTION public.increment_daily_stats_from_page_view();

-- Optionaler Backfill aus bereits vorhandenen Unique Views
INSERT INTO public.daily_stats (item_id, type, count, stat_date)
SELECT page_name, page_type, COUNT(*)::integer, view_date
FROM public.page_views_analytics
GROUP BY page_name, page_type, view_date
ON CONFLICT (item_id, type, stat_date)
DO UPDATE SET
  count = EXCLUDED.count,
  updated_at = now();

-- =========================================================
-- FEATURE TOGGLES: Redirects + Analytics aktivieren
-- =========================================================
INSERT INTO public.settings (key, value)
VALUES (
  'feature_toggles',
  jsonb_build_object(
    'has_projects', true,
    'has_pages', true,
    'has_apps', false,
    'has_forum', false,
    'has_finance', false,
    'has_mass_generator', false,
    'has_ads', false,
    'has_amazon', false,
    'has_adsense', false,
    'has_scouty', true,
    'has_leads', false,
    'has_redirects', true,
    'has_footer_links', false,
    'has_about', true,
    'has_indexing_tools', false,
    'has_analytics', true,
    'has_magazine', true
  )
)
ON CONFLICT (key)
DO UPDATE SET
  value = COALESCE(public.settings.value, '{}'::jsonb)
    || jsonb_build_object(
      'has_redirects', true,
      'has_analytics', true,
      'has_footer_links', false,
      'has_leads', false
    ),
  updated_at = now();

COMMIT;
