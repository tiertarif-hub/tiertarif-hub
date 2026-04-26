-- Add custom_html_override column for full HTML override mode
ALTER TABLE public.categories 
ADD COLUMN custom_html_override TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.categories.custom_html_override IS 'Full HTML override for custom landing page designs. Use {{APPS}} placeholder for project list.';