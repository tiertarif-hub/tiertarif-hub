-- Create function to verify admin access server-side
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'ADMIN');
$$;

-- Add comment to document the critical has_role function
COMMENT ON FUNCTION public.has_role IS 'CRITICAL SECURITY FUNCTION: Used by all RLS policies. Any changes must be reviewed for security implications. SECURITY DEFINER bypasses RLS on user_roles table. Never modify without security review.';