-- =====================================================
-- ERWEITERUNG: subscribers, settings updates, pages check
-- =====================================================

-- 1. SUBSCRIBERS Tabelle für Newsletter
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source_page TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS für subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can view subscribers" 
ON public.subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'ADMIN'::user_role));

-- Admins can manage subscribers
CREATE POLICY "Admins can manage subscribers" 
ON public.subscribers 
FOR ALL 
USING (has_role(auth.uid(), 'ADMIN'::user_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));

-- 2. Neue Settings einfügen (falls nicht vorhanden)
INSERT INTO public.settings (key, value) VALUES 
  ('newsletter_active', 'true'::jsonb),
  ('onesignal_app_id', '""'::jsonb),
  ('onesignal_active', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Sticky CTA Felder für categories (falls nicht vorhanden)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS sticky_cta_text TEXT DEFAULT 'Jetzt starten';

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS sticky_cta_link TEXT;