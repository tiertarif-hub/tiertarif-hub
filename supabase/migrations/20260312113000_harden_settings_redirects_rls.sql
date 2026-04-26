-- Harden public access to settings and redirects

-- SETTINGS: remove overly broad public read policy
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;

-- SETTINGS: allow public reads only for explicitly whitelisted keys
CREATE POLICY "Public can view whitelisted settings"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (
  key = ANY (
    ARRAY[
      'active_theme', 'home_sections', 'home_layout_v2', 'home_content',
      'header_config', 'footer_config', 'scouty_config', 'home_forum_teaser',
      'ads_sense_client_id', 'ads_sense_slot_id', 'ads_enabled',
      'ads_amazon_headline', 'ads_amazon_text', 'ads_amazon_button_text',
      'ads_amazon_link', 'forum_banner_headline', 'forum_banner_subheadline',
      'forum_banner_badge', 'forum_ads', 'site_title', 'site_logo_url',
      'site_description', 'hero_title', 'hero_subtitle', 'footer_designer_name',
      'footer_designer_url', 'ticker_badge_text', 'ticker_headline',
      'ticker_link_text', 'trending_links', 'compliance_config',
      'google_analytics_id', 'google_search_console_verification',
      'top_bar_text', 'top_bar_link', 'top_bar_active', 'newsletter_active',
      'popup_active'
    ]::text[]
  )
);

-- REDIRECTS: remove broad public read policy while keeping tracking logic untouched
DROP POLICY IF EXISTS "Anyone can view active redirects" ON public.redirects;
