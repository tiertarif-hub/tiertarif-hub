-- Ergänze fehlende Spalten in categories (= pages)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS sticky_cta_text text DEFAULT 'Jetzt starten',
ADD COLUMN IF NOT EXISTS sticky_cta_link text;

-- Ergänze fehlende Spalten in projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Footer Links Tabelle für einfache Verwaltung
CREATE TABLE IF NOT EXISTS public.footer_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS für footer_links
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active footer_links" 
ON public.footer_links FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage footer_links" 
ON public.footer_links FOR ALL 
USING (has_role(auth.uid(), 'ADMIN'::user_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));