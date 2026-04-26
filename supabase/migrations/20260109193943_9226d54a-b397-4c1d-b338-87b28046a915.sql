-- Fix 1: Drop overly permissive subscribers INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;

-- Fix 2: Create new policy with email format validation
CREATE POLICY "Anyone can subscribe with valid email" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  -- Email must match valid format
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Email length limit
  AND length(email) <= 255
  -- Source page length limit (optional field)
  AND (source_page IS NULL OR length(source_page) <= 500)
);

-- Fix 3: Add database constraint for email format (defense in depth)
ALTER TABLE public.subscribers
ADD CONSTRAINT subscribers_email_format_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Fix 4: Add email length constraint
ALTER TABLE public.subscribers
ADD CONSTRAINT subscribers_email_length_check 
CHECK (length(email) <= 255);

-- Fix 5: Add source_page length constraint
ALTER TABLE public.subscribers
ADD CONSTRAINT subscribers_source_page_length_check 
CHECK (source_page IS NULL OR length(source_page) <= 500);

-- Fix 6: Also fix the settings table "Anyone can view" policy - this is intentional for public read
-- No change needed as SELECT with USING (true) is acceptable for public content

-- Fix 7: Fix category_projects "Anyone can view" - also intentional for public display
-- No change needed