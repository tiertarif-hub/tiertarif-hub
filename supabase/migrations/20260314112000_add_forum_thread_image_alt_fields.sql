alter table public.forum_threads
  add column if not exists featured_image_alt text,
  add column if not exists ad_image_alt text;
