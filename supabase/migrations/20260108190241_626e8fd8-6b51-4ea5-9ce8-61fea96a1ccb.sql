-- Add analytics_code and banner_override fields to categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS analytics_code TEXT,
ADD COLUMN IF NOT EXISTS banner_override TEXT;

-- Add global banner setting
INSERT INTO public.settings (key, value)
VALUES ('global_banner', '{"html": "", "enabled": false}')
ON CONFLICT (key) DO NOTHING;