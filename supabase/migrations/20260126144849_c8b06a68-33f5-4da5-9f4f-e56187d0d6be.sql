-- Refresh PostgREST schema cache by notifying pgrst
NOTIFY pgrst, 'reload schema';