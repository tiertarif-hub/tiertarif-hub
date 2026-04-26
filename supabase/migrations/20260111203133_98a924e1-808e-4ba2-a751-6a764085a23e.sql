-- Add category_id to footer_links table for category-specific legal links
ALTER TABLE public.footer_links 
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add index for faster lookups
CREATE INDEX idx_footer_links_category_id ON public.footer_links(category_id);

-- Update RLS policy to allow viewing category-specific links
DROP POLICY IF EXISTS "Anyone can view active footer_links" ON public.footer_links;
CREATE POLICY "Anyone can view active footer_links" 
ON public.footer_links 
FOR SELECT 
USING (is_active = true);