-- Add template column to categories table
-- 'comparison' = default comparison table layout
-- 'review' = single review/experience report layout
ALTER TABLE public.categories 
ADD COLUMN template text NOT NULL DEFAULT 'comparison' 
CHECK (template IN ('comparison', 'review'));