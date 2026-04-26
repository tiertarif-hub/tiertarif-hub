-- Create enums for themes and user roles
CREATE TYPE public.user_role AS ENUM ('ADMIN');
CREATE TYPE public.category_theme AS ENUM ('DATING', 'ADULT', 'CASINO', 'GENERIC');
CREATE TYPE public.country_scope AS ENUM ('AT', 'DE', 'DACH', 'EU');

-- Profiles table for admin users (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  role public.user_role NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📊',
  theme public.category_theme NOT NULL DEFAULT 'GENERIC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects/Portals table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  short_description TEXT,
  country_scope public.country_scope NOT NULL DEFAULT 'DACH',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings table (key-value store with JSONB)
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies (admin only)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all categories"
  ON public.categories FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Projects policies (public read, admin write)
CREATE POLICY "Anyone can view active projects"
  ON public.projects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Settings policies (public read, admin write)
CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can delete settings"
  ON public.settings FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'ADMIN');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('site_title', '"Rank-Scout - Dein Vergleichsportal"'),
  ('site_description', '"Finde die besten Vergleiche für Dating, Casino und mehr."'),
  ('hero_title', '"Entdecke die besten Vergleiche"'),
  ('hero_subtitle', '"Wir vergleichen, damit du die richtige Wahl triffst"'),
  ('trending_links', '[{"label": "Tinder Alternative", "url": "/dating", "emoji": "💕"}, {"label": "Casino Bonus", "url": "/casino", "emoji": "🎰"}, {"label": "Adult Dating", "url": "/adult", "emoji": "🔥"}]'),
  ('nav_links', '[{"label": "Dating", "url": "https://dating.rank-scout.com"}, {"label": "Casino", "url": "https://casino.rank-scout.com"}, {"label": "Adult", "url": "https://adult.rank-scout.com"}]'),
  ('footer_links', '[{"label": "Impressum", "url": "/impressum"}, {"label": "Datenschutz", "url": "/datenschutz"}, {"label": "Kontakt", "url": "/kontakt"}]');

-- Insert sample categories
INSERT INTO public.categories (slug, name, description, icon, theme, sort_order) VALUES
  ('dating-apps', 'Dating Apps', 'Die besten Dating Apps im Vergleich', '💕', 'DATING', 1),
  ('singlebörsen', 'Singlebörsen', 'Seriöse Singlebörsen für ernsthafte Beziehungen', '💑', 'DATING', 2),
  ('casual-dating', 'Casual Dating', 'Plattformen für ungezwungene Treffen', '🔥', 'ADULT', 3),
  ('online-casinos', 'Online Casinos', 'Sichere und lizenzierte Online Casinos', '🎰', 'CASINO', 4),
  ('sportwetten', 'Sportwetten', 'Die besten Sportwetten Anbieter', '⚽', 'CASINO', 5),
  ('affiliate-netzwerke', 'Affiliate Netzwerke', 'Top Affiliate Programme für Publisher', '💼', 'GENERIC', 6);

-- Insert sample projects
INSERT INTO public.projects (category_id, name, slug, url, short_description, country_scope, tags, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'dating-apps'), 'Tinder', 'tinder', 'https://tinder.com', 'Die weltweit beliebteste Dating App', 'EU', ARRAY['swipe', 'dating', 'app'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'dating-apps'), 'Bumble', 'bumble', 'https://bumble.com', 'Dating App wo Frauen den ersten Schritt machen', 'DACH', ARRAY['dating', 'frauen', 'app'], 2),
  ((SELECT id FROM public.categories WHERE slug = 'singlebörsen'), 'Parship', 'parship', 'https://parship.de', 'Deutschlands größte Partnervermittlung', 'DE', ARRAY['partnervermittlung', 'seriös'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'online-casinos'), 'Vulkan Vegas', 'vulkan-vegas', 'https://vulkanvegas.com', 'Beliebtes Online Casino mit großer Spielauswahl', 'AT', ARRAY['casino', 'slots', 'bonus'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'sportwetten'), 'Bet365', 'bet365', 'https://bet365.com', 'Weltweit führender Sportwetten Anbieter', 'EU', ARRAY['sportwetten', 'live', 'betting'], 1),
  ((SELECT id FROM public.categories WHERE slug = 'casual-dating'), 'C-Date', 'c-date', 'https://c-date.de', 'Premium Casual Dating Plattform', 'DACH', ARRAY['casual', 'adult', 'dating'], 1);