-- Create category_projects junction table for assigning projects to categories/cities
CREATE TABLE IF NOT EXISTS public.category_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, project_id)
);

-- Enable RLS
ALTER TABLE public.category_projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active category-project assignments
CREATE POLICY "Anyone can view category_projects"
ON public.category_projects
FOR SELECT
USING (true);

-- Allow admins full access
CREATE POLICY "Admins can manage category_projects"
ON public.category_projects
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::user_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));