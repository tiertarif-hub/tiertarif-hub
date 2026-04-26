-- Step 1: Add USER role to the existing enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'USER';

-- Step 2: Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create has_role function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: Migrate existing admin profiles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM public.profiles WHERE role = 'ADMIN'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
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

-- Step 7: Update handle_new_user to NOT assign admin role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with USER role (non-privileged)
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'USER');
  RETURN NEW;
END;
$$;

-- Step 8: Drop old RLS policies that query profiles table directly

-- Categories policies
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;

-- Projects policies
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;

-- Settings policies
DROP POLICY IF EXISTS "Admins can delete settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

-- Step 9: Recreate RLS policies using has_role function

-- Categories policies
CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

-- Projects policies
CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can insert projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

-- Settings policies
CREATE POLICY "Admins can delete settings"
ON public.settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can insert settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));