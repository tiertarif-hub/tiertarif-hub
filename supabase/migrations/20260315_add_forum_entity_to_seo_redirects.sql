DO $$
DECLARE
  column_data_type text;
  column_udt_name text;
  check_constraint record;
BEGIN
  SELECT data_type, udt_name
    INTO column_data_type, column_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'seo_redirects'
    AND column_name = 'entity_table';

  IF column_data_type IS NULL THEN
    RAISE EXCEPTION 'public.seo_redirects.entity_table wurde nicht gefunden';
  END IF;

  IF column_data_type = 'USER-DEFINED' THEN
    EXECUTE format('ALTER TYPE public.%I ADD VALUE IF NOT EXISTS %L', column_udt_name, 'forum');
  END IF;

  FOR check_constraint IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'seo_redirects'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%entity_table%'
  LOOP
    EXECUTE format('ALTER TABLE public.seo_redirects DROP CONSTRAINT IF EXISTS %I', check_constraint.conname);
  END LOOP;

  IF column_data_type <> 'USER-DEFINED' THEN
    ALTER TABLE public.seo_redirects
      ADD CONSTRAINT seo_redirects_entity_table_check
      CHECK (entity_table IN ('categories', 'projects', 'forum'));
  END IF;
END $$;
