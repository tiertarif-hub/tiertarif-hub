-- Fix anonymous forum post creation vulnerability
-- Remove overly permissive INSERT policies and require authentication

-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can create threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Anyone can create replies" ON public.forum_replies;

-- Create new policies requiring authentication
CREATE POLICY "Authenticated users can create threads"
  ON public.forum_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND thread_id IN (
      SELECT id FROM public.forum_threads WHERE is_active = true
    )
  );

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';