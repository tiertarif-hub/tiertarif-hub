-- Fix user_roles RLS policies to require authentication (not anonymous)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate with explicit authenticated role requirement
CREATE POLICY "Authenticated users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'))
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));