-- Add site_name and hero_headline fields to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS site_name text,
ADD COLUMN IF NOT EXISTS hero_headline text;

-- Comment for documentation
COMMENT ON COLUMN public.categories.site_name IS 'Custom site name for header (e.g. SinglesSalzburgAt)';
COMMENT ON COLUMN public.categories.hero_headline IS 'Custom hero headline (e.g. Finde Singles in {city} & Umgebung)';