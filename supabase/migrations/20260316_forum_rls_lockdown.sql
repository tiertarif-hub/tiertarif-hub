-- Rank-Scout Forum RLS Lockdown
-- Ziel:
-- 1) Public Frontend darf nur lesende Zugriffe auf veröffentlichte Threads / freigegebene Replies ausführen.
-- 2) Inserts nur für authentifizierte Nutzer.
-- 3) Update/Delete strikt nur für verifizierte ADMIN-Rolle.

BEGIN;

ALTER TABLE IF EXISTS public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_replies ENABLE ROW LEVEL SECURITY;

DO $cleanup$
DECLARE
  pol RECORD;
BEGIN
  IF to_regclass('public.forum_threads') IS NOT NULL THEN
    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'forum_threads'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.forum_threads', pol.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.forum_posts') IS NOT NULL THEN
    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'forum_posts'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.forum_posts', pol.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.forum_replies') IS NOT NULL THEN
    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'forum_replies'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.forum_replies', pol.policyname);
    END LOOP;
  END IF;
END
$cleanup$;

DO $threads$
BEGIN
  IF to_regclass('public.forum_threads') IS NOT NULL THEN
    EXECUTE $policy$
      CREATE POLICY "Public can read published forum threads"
      ON public.forum_threads
      FOR SELECT
      USING (
        COALESCE(is_active, false) = true
        AND COALESCE(status, 'published') = 'published'
      )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can read all forum threads"
      ON public.forum_threads
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Authenticated users can create forum threads"
      ON public.forum_threads
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND (author_id IS NULL OR author_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'))
      )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can update forum threads"
      ON public.forum_threads
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can delete forum threads"
      ON public.forum_threads
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;
  END IF;
END
$threads$;

DO $posts$
BEGIN
  IF to_regclass('public.forum_posts') IS NOT NULL THEN
    EXECUTE $policy$
      CREATE POLICY "Public can read forum posts"
      ON public.forum_posts
      FOR SELECT
      USING (true)
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can read all forum posts"
      ON public.forum_posts
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Authenticated users can create forum posts"
      ON public.forum_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND (author_id IS NULL OR author_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'))
      )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can update forum posts"
      ON public.forum_posts
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can delete forum posts"
      ON public.forum_posts
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;
  END IF;
END
$posts$;

DO $replies$
BEGIN
  IF to_regclass('public.forum_replies') IS NOT NULL THEN
    EXECUTE $policy$
      CREATE POLICY "Public can read active forum replies"
      ON public.forum_replies
      FOR SELECT
      USING (COALESCE(is_active, false) = true AND COALESCE(is_spam, false) = false)
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can read all forum replies"
      ON public.forum_replies
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Authenticated users can create forum replies"
      ON public.forum_replies
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND (author_id IS NULL OR author_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'))
      )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can update forum replies"
      ON public.forum_replies
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Admins can delete forum replies"
      ON public.forum_replies
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'ADMIN'))
    $policy$;
  END IF;
END
$replies$;

NOTIFY pgrst, 'reload schema';

COMMIT;
