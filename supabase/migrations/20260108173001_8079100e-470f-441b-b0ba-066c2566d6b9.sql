-- Add missing columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS affiliate_link text,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 9.8,
ADD COLUMN IF NOT EXISTS description text;

-- Add foreign key constraint if not exists (category_id already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_category_id_fkey' 
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE public.projects 
    ADD CONSTRAINT projects_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add SEO fields to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Ensure RLS policies allow public read for active records
-- Drop and recreate to ensure correct configuration

-- Categories: Public read for active
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Projects: Public read for active  
DROP POLICY IF EXISTS "Anyone can view active projects" ON public.projects;
CREATE POLICY "Anyone can view active projects" 
ON public.projects 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Settings: Public read (already exists but ensure it works for anon)
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Anyone can view settings" 
ON public.settings 
FOR SELECT 
TO anon, authenticated
USING (true);