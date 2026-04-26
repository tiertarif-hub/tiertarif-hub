-- Force PostgREST schema cache refresh
-- This is needed because the forum tables exist but PostgREST hasn't cached them

-- Touch the forum_threads table to ensure it's recognized
COMMENT ON TABLE public.forum_threads IS 'Magazine/Forum threads for content management';
COMMENT ON TABLE public.forum_replies IS 'Replies to forum/magazine threads';
COMMENT ON TABLE public.forum_categories IS 'Categories for organizing forum/magazine content';
COMMENT ON TABLE public.forum_reply_likes IS 'Likes/upvotes on forum replies';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';