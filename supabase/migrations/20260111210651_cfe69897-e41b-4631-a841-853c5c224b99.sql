-- Add color_theme column to categories for per-category theme selection
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS color_theme text NOT NULL DEFAULT 'dark';

-- Add comment explaining the values
COMMENT ON COLUMN public.categories.color_theme IS 'Theme mode: dark, light, or neon';