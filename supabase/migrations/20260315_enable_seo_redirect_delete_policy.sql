-- Allow admins to delete accidental seo_redirects entries
ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can delete seo redirects" ON public.seo_redirects;

CREATE POLICY "Admins can delete seo redirects"
ON public.seo_redirects
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::user_role));
