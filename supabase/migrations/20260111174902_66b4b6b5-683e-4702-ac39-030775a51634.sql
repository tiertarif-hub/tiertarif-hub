-- Add new customizable hero fields
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS hero_pretitle TEXT DEFAULT 'Finde Singles in',
ADD COLUMN IF NOT EXISTS hero_cta_text TEXT,
ADD COLUMN IF NOT EXISTS hero_badge_text TEXT;