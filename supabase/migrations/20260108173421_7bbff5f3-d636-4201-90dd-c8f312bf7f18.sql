-- Extend categories table with content fields
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS h1_title text,
ADD COLUMN IF NOT EXISTS long_content_top text,
ADD COLUMN IF NOT EXISTS long_content_bottom text;

-- Extend projects table with badge and features
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS badge_text text,
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;

-- Create redirects table for click tracking
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  target_url text NOT NULL,
  click_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on redirects
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Public read for active redirects
CREATE POLICY "Anyone can view active redirects" 
ON public.redirects 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Admin policies for redirects
CREATE POLICY "Admins can view all redirects" 
ON public.redirects 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::user_role));

CREATE POLICY "Admins can insert redirects" 
ON public.redirects 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));

CREATE POLICY "Admins can update redirects" 
ON public.redirects 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::user_role));

CREATE POLICY "Admins can delete redirects" 
ON public.redirects 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::user_role));

-- Trigger for updated_at on redirects
CREATE TRIGGER update_redirects_updated_at
BEFORE UPDATE ON public.redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment click count (can be called by anon)
CREATE OR REPLACE FUNCTION public.increment_redirect_click(redirect_slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target text;
BEGIN
  UPDATE public.redirects 
  SET click_count = click_count + 1 
  WHERE slug = redirect_slug AND is_active = true
  RETURNING target_url INTO target;
  
  RETURN target;
END;
$$;