-- Create table for popular footer links (editable per category or global)
CREATE TABLE public.popular_footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.popular_footer_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active popular_footer_links" 
ON public.popular_footer_links 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage popular_footer_links" 
ON public.popular_footer_links 
FOR ALL 
USING (has_role(auth.uid(), 'ADMIN'::user_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));

-- Add footer settings columns to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS footer_site_name TEXT,
ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT,
ADD COLUMN IF NOT EXISTS footer_designer_name TEXT DEFAULT 'Digital-Perfect',
ADD COLUMN IF NOT EXISTS footer_designer_url TEXT DEFAULT 'https://digital-perfect.at';

-- Insert some default popular links (global, no category_id)
INSERT INTO public.popular_footer_links (category_id, label, url, sort_order) VALUES
(NULL, 'ONS Österreich', '/ons-oesterreich', 1),
(NULL, 'Seitensprung Österreich', '/seitensprung-oesterreich', 2),
(NULL, 'Sexdate Salzburg', '/sexdate-salzburg', 3),
(NULL, 'Sexdate Wien', '/sexdate-wien', 4),
(NULL, 'Sexkontakte Berlin', '/sexkontakte-berlin', 5),
(NULL, 'Sexkontakte Nürnberg', '/sexkontakte-nuernberg', 6),
(NULL, 'Online Speed Dating München', '/speed-dating-muenchen', 7);