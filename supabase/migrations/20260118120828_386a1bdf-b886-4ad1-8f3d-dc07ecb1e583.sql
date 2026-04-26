-- Add navigation_settings JSONB column to categories table
ALTER TABLE public.categories 
ADD COLUMN navigation_settings JSONB DEFAULT '{
  "show_top3_dating_apps": true,
  "show_singles_in_der_naehe": true,
  "show_chat_mit_einer_frau": true,
  "show_online_dating_cafe": true,
  "show_bildkontakte_login": true,
  "show_18plus_hint_box": true
}'::jsonb;