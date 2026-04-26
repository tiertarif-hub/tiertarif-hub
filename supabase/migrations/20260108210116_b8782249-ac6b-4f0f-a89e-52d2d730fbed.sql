-- 1. Erweitere categories (pages) um Popup-Felder
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS popup_headline text,
ADD COLUMN IF NOT EXISTS popup_text text,
ADD COLUMN IF NOT EXISTS popup_link text;

-- 2. Erweitere projects um pros/cons Listen
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS pros_list text[],
ADD COLUMN IF NOT EXISTS cons_list text[];

-- 3. Erweitere footer_links um column
ALTER TABLE public.footer_links
ADD COLUMN IF NOT EXISTS column_name text DEFAULT 'legal';

-- 4. Erstelle testimonials Tabelle
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  text text NOT NULL,
  rating numeric DEFAULT 5,
  city_reference text,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies für testimonials
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL USING (has_role(auth.uid(), 'ADMIN'::user_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));

-- 5. Füge globale Settings ein (falls nicht vorhanden)
INSERT INTO public.settings (key, value) VALUES 
  ('top_bar_text', '"🔥 Jetzt kostenlos anmelden!"'::jsonb),
  ('top_bar_link', '""'::jsonb),
  ('top_bar_active', 'false'::jsonb),
  ('custom_css', '""'::jsonb),
  ('footer_copyright', '"© 2026 Rank-Scout. Alle Rechte vorbehalten."'::jsonb)
ON CONFLICT (key) DO NOTHING;