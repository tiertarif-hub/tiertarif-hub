-- TierTarif Sprint 1: Money-Seiten + Startseiten-Verlinkung
-- Copy-paste-ready für Supabase SQL Editor.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS template text DEFAULT 'comparison',
  ADD COLUMN IF NOT EXISTS color_theme text DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS site_name text,
  ADD COLUMN IF NOT EXISTS hero_headline text,
  ADD COLUMN IF NOT EXISTS hero_pretitle text,
  ADD COLUMN IF NOT EXISTS hero_cta_text text,
  ADD COLUMN IF NOT EXISTS hero_badge_text text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS h1_title text,
  ADD COLUMN IF NOT EXISTS long_content_top text,
  ADD COLUMN IF NOT EXISTS long_content_bottom text,
  ADD COLUMN IF NOT EXISTS footer_designer_name text DEFAULT 'Digital-Perfect',
  ADD COLUMN IF NOT EXISTS footer_designer_url text DEFAULT 'https://digital-perfect.at',
  ADD COLUMN IF NOT EXISTS navigation_settings jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS show_comparison_table boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS target_domain text,
  ADD COLUMN IF NOT EXISTS faq_data jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS show_ad boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ad_type text DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS is_internal_generated boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_css text,
  ADD COLUMN IF NOT EXISTS is_city boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS comparison_widget_code text,
  ADD COLUMN IF NOT EXISTS card_image_url text,
  ADD COLUMN IF NOT EXISTS intro_title text,
  ADD COLUMN IF NOT EXISTS comparison_title text,
  ADD COLUMN IF NOT EXISTS project_cta_text text,
  ADD COLUMN IF NOT EXISTS features_title text,
  ADD COLUMN IF NOT EXISTS sticky_cta_text text,
  ADD COLUMN IF NOT EXISTS sticky_cta_link text,
  ADD COLUMN IF NOT EXISTS button_text text,
  ADD COLUMN IF NOT EXISTS comparison_widget_type text,
  ADD COLUMN IF NOT EXISTS comparison_widget_config jsonb,
  ADD COLUMN IF NOT EXISTS custom_html_override text;

INSERT INTO public.categories (slug, name, description, icon, theme, template, color_theme, site_name, hero_headline, hero_pretitle, hero_cta_text, hero_badge_text, meta_title, meta_description, h1_title, long_content_top, long_content_bottom, footer_designer_name, footer_designer_url, navigation_settings, is_active, sort_order, show_comparison_table, target_domain, faq_data, show_ad, ad_type, is_internal_generated, custom_css, is_city, hero_image_url, comparison_widget_code, card_image_url, intro_title, comparison_title, project_cta_text, features_title, sticky_cta_text, sticky_cta_link, button_text, comparison_widget_type, comparison_widget_config, custom_html_override, updated_at)
VALUES
  ('pferde-op-versicherung-vergleich', 'Pferde OP Versicherung Vergleich', 'OP-Schutz, Pferdekrankenversicherung und Haftpflicht-Themen für Pferde sachlich prüfen.', '🐴', 'GENERIC', 'comparison', 'light', 'TierTarif', 'OP-Schutz, Kosten, Wartezeit und Erstattung strukturiert einordnen.', 'Pferdeversicherung prüfen', 'Pferde-OP-Tarife prüfen', 'Sachlicher Überblick', 'Pferde OP Versicherung Vergleich 2026 | TierTarif', 'Pferde OP Versicherung vergleichen: Kosten, Wartezeit, Erstattung und Tarifmerkmale für Pferde sachlich prüfen.', 'Pferde OP Versicherung Vergleich: Tarife und Leistungen prüfen', '<p class="lead">Eine Pferde OP Versicherung kann relevante Kostenpunkte rund um chirurgische Eingriffe, Narkose, Voruntersuchung und Nachsorge abbilden. Für Pferdehalter ist vor allem wichtig, welche Eingriffe versichert sind, welche Wartezeiten gelten, bis zu welchem GOT-Satz erstattet wird und ob Leistungsgrenzen vorgesehen sind.</p>
<p>TierTarif stellt diese Tarifmerkmale sachlich dar. Der Vergleich ersetzt keine eigene Prüfung der Versicherungsbedingungen, hilft aber dabei, zentrale Unterschiede schneller zu erkennen.</p>', '<div class="prose prose-lg prose-slate max-w-none">
<h2>Pferde OP Versicherung: welche Punkte relevant sind</h2>
<p>Bei Pferden können Operationen je nach Eingriff, Klinik, Narkoseform und Nachsorge hohe Kosten verursachen. Eine OP-Versicherung konzentriert sich auf operative Eingriffe. Ambulante Behandlungen, Diagnostik ohne Operation oder Vorsorgeleistungen sind je nach Tarif nicht automatisch enthalten.</p>
<h2>OP-Schutz oder Pferdekrankenversicherung?</h2>
<p>Eine Pferdekrankenversicherung kann je nach Tarif breiter angelegt sein und neben Operationen auch weitere Behandlungen umfassen. Der OP-Schutz ist enger fokussiert. Für den Vergleich zählen daher Leistungsumfang, Erstattungssatz, Selbstbeteiligung, jährliche Grenzen und mögliche Ausschlüsse.</p>
<h2>Wartezeit, Erstattung und Leistungsgrenzen</h2>
<p>Viele Tarife arbeiten mit Wartezeiten. Zusätzlich können bestimmte Erkrankungen, Vorerkrankungen oder planbare Eingriffe gesondert geregelt sein. Auch die Erstattung nach GOT-Satz und die maximale Jahreshöhe sind zentrale Vergleichspunkte.</p>
<h2>Pferdehaftpflicht ergänzend einordnen</h2>
<p>Die Pferdehaftpflicht ist ein eigenes Thema. Sie betrifft Schäden gegenüber Dritten und sollte getrennt vom OP- oder Krankenversicherungsschutz betrachtet werden. Auf TierTarif wird dieser Unterschied bewusst getrennt erklärt.</p>
<h2>Kosten sachlich prüfen</h2>
<p>Beiträge hängen unter anderem von Alter, Nutzung, gewünschtem Leistungsumfang, Selbstbeteiligung und Tarifbedingungen ab. Ein niedriger Beitrag ist allein kein ausreichendes Prüfkriterium, wenn wichtige Leistungsgrenzen oder Ausschlüsse übersehen werden.</p>
</div>', 'Digital-Perfect', 'https://digital-perfect.at', '{"show_18plus_hint_box":false}'::jsonb, true, 1, true, 'tiertarif.com', '[{"question":"Was deckt eine Pferde OP Versicherung ab?","answer":"Eine Pferde OP Versicherung bezieht sich in der Regel auf operative Eingriffe. Je nach Tarif können Voruntersuchung, Narkose, Operation und Nachsorge unterschiedlich geregelt sein."},{"question":"Was ist der Unterschied zur Pferdekrankenversicherung?","answer":"Die Pferdekrankenversicherung kann je nach Tarif weiter reichen und auch Behandlungen ohne Operation umfassen. Der OP-Schutz ist enger auf chirurgische Eingriffe ausgerichtet."},{"question":"Welche Wartezeiten können gelten?","answer":"Viele Tarife sehen Wartezeiten vor. Für Unfälle, Krankheiten oder bestimmte Eingriffe können unterschiedliche Fristen und Bedingungen gelten."},{"question":"Welche Kostenpunkte sind wichtig?","answer":"Relevant sind Beitrag, Selbstbeteiligung, GOT-Erstattung, Jahreshöchstleistung, Ausschlüsse und Regelungen für Nachsorge oder Klinikaufenthalte."},{"question":"Ist Pferdehaftpflicht dasselbe wie OP-Schutz?","answer":"Nein. Pferdehaftpflicht betrifft Schäden gegenüber Dritten. OP-Schutz betrifft medizinische Eingriffe am Pferd. Beide Bereiche erfüllen unterschiedliche Funktionen."},{"question":"Wie nutzt TierTarif diese Informationen?","answer":"TierTarif ordnet Tarifmerkmale neutral und redaktionell ein. Maßgeblich bleiben immer die Versicherungsbedingungen des jeweiligen Anbieters."}]'::jsonb, false, 'image', true, '', false, 'https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-pferde-haftpflicht-op-schutz-vergleichsrechner.webp', NULL, 'https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-pferde-haftpflicht-op-schutz-vergleichsrechner.webp', 'Pferde OP Versicherung im Überblick', 'Pferde-OP-Tarife strukturiert prüfen', 'Tarifdetails prüfen', 'Pferde-Cluster', 'Pferde prüfen', '/pferde-op-versicherung-vergleich#vergleich', 'Pferde prüfen', 'mr-money', '{"sp":"tkvp"}'::jsonb, NULL, now()),
  ('katzenversicherung-vergleich', 'Katzenversicherung Vergleich', 'Katzenversicherung, OP-Schutz, Zahn-OP, FORL, Kosten und Wartezeiten sachlich prüfen.', '🐱', 'GENERIC', 'comparison', 'light', 'TierTarif', 'OP-Schutz, FORL, Zahn-OP, Kosten und Wartezeiten strukturiert einordnen.', 'Katzenversicherung prüfen', 'Katzentarife prüfen', 'Neutraler Überblick', 'Katzenversicherung Vergleich 2026 | TierTarif', 'Katzenversicherung vergleichen: OP-Schutz, Krankenversicherung, Kosten, Wartezeit und Zahn-OP-Tarife sachlich prüfen.', 'Katzenversicherung Vergleich: OP- und Krankenversicherung prüfen', '<p class="lead">Eine Katzenversicherung kann je nach Tarif OP-Kosten, Krankheitsbehandlungen oder weitere Leistungen rund um die tierärztliche Versorgung abbilden. Besonders relevant sind Wartezeiten, Erstattungssätze, Selbstbeteiligung, Zahn-OPs und Regelungen zu Erkrankungen wie FORL.</p>
<p>TierTarif ordnet diese Punkte sachlich ein und verlinkt auf den passenden Vergleichsbereich. Die konkrete Leistungsprüfung bleibt immer an die Bedingungen des jeweiligen Tarifs gebunden.</p>', '<div class="prose prose-lg prose-slate max-w-none">
<h2>Katzenversicherung: OP-Schutz oder Krankenversicherung?</h2>
<p>Eine Katzen-OP-Versicherung konzentriert sich auf operative Eingriffe. Eine Katzenkrankenversicherung kann je nach Tarif auch ambulante Behandlungen, Diagnostik, Medikamente oder Vorsorge-Bausteine enthalten. Entscheidend ist, welche Leistungen tatsächlich im Tarif geregelt sind.</p>
<h2>FORL, Zahn-OP und besondere Leistungsbereiche</h2>
<p>Zahnbehandlungen und FORL sind für Katzenhalter besonders wichtige Prüfpunkte. Nicht jeder Tarif behandelt Zahn-OPs, Zahnextraktionen, Diagnostik oder Nachsorge gleich. Deshalb sollten diese Punkte separat betrachtet werden.</p>
<h2>Wartezeit und Erstattung</h2>
<p>Viele Tarife sehen Wartezeiten vor. Für Unfälle, Krankheiten, Zahnleistungen oder bekannte Erkrankungen können unterschiedliche Regeln gelten. Zusätzlich ist wichtig, bis zu welchem GOT-Satz erstattet wird und ob jährliche Limits bestehen.</p>
<h2>Katzenversicherung für Freigänger</h2>
<p>Bei Freigängern können Verletzungsrisiken anders zu bewerten sein als bei reinen Wohnungskatzen. Ob und wie sich Haltungsart, Alter oder Gesundheitszustand auf Beiträge und Annahme auswirken, hängt vom Anbieter ab.</p>
<h2>Kosten neutral einordnen</h2>
<p>Die Kosten hängen unter anderem von Alter, gewünschtem Leistungsumfang, Selbstbeteiligung und Erstattungsgrenzen ab. Der Vergleich sollte daher nicht nur den Beitrag betrachten, sondern auch die Bedingungen hinter dem Beitrag.</p>
</div>', 'Digital-Perfect', 'https://digital-perfect.at', '{"show_18plus_hint_box":false}'::jsonb, true, 2, true, 'tiertarif.com', '[{"question":"Was ist eine Katzenversicherung?","answer":"Eine Katzenversicherung kann je nach Tarif OP-Kosten, Krankheitsbehandlungen oder weitere tierärztliche Leistungen abbilden."},{"question":"Was ist der Unterschied zwischen OP-Schutz und Krankenversicherung?","answer":"OP-Schutz fokussiert operative Eingriffe. Eine Krankenversicherung kann je nach Tarif breiter angelegt sein und weitere Behandlungen umfassen."},{"question":"Sind Zahn-OPs und FORL immer enthalten?","answer":"Nein. Zahnleistungen und FORL sind tarifabhängig. Wichtig sind genaue Regelungen zu Diagnostik, Operation, Extraktion, Nachsorge und möglichen Limits."},{"question":"Gibt es Katzenversicherungen ohne Wartezeit?","answer":"Bei Unfällen können andere Regeln gelten als bei Krankheiten. Viele Tarife arbeiten mit Wartezeiten, die in den Bedingungen festgelegt sind."},{"question":"Was kostet eine Katzenversicherung?","answer":"Die Kosten hängen von Alter, Leistungsumfang, Selbstbeteiligung, Erstattung und Tarifbedingungen ab. OP-Tarife und Krankenversicherung können unterschiedlich kalkuliert sein."},{"question":"Worauf achten bei Freigängern?","answer":"Bei Freigängern können Verletzungen, Unfälle und Infektionsrisiken stärker in die persönliche Prüfung einfließen. Maßgeblich sind die Annahme- und Tarifbedingungen."}]'::jsonb, false, 'image', true, '', false, 'https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-katzen-versicherung-zahn-op-vergleichsrechner-bild.webp', NULL, 'https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-katzen-versicherung-zahn-op-vergleichsrechner-bild.webp', 'Katzenversicherung im Überblick', 'Katzenversicherungen strukturiert prüfen', 'Tarifdetails prüfen', 'Katzen-Cluster', 'Katzen prüfen', '/katzenversicherung-vergleich#vergleich', 'Katzen prüfen', 'mr-money', '{"sp":"tkvk"}'::jsonb, NULL, now()),
  ('hundekrankenversicherung-vergleich', 'Hundekrankenversicherung Vergleich', 'Hundekrankenversicherung, OP-Schutz, Vollschutz, Kosten und Wartezeiten sachlich prüfen.', '🐶', 'GENERIC', 'comparison', 'light', 'TierTarif', 'OP-Schutz, Vollschutz, Kosten, Wartezeit und Erstattung strukturiert einordnen.', 'Hundekrankenversicherung prüfen', 'Hundetarife prüfen', 'Sachlicher Überblick', 'Hundekrankenversicherung Vergleich 2026 | TierTarif', 'Hundekrankenversicherung vergleichen: OP-Schutz, Vollschutz, Kosten, Wartezeit und Tarifmerkmale für Hunde prüfen.', 'Hundekrankenversicherung Vergleich: OP- und Vollschutz prüfen', '<p class="lead">Eine Hundekrankenversicherung kann je nach Tarif OP-Kosten, ambulante Behandlungen, Diagnostik, Medikamente oder Vorsorge-Bausteine abbilden. Für Hundehalter zählen vor allem Leistungsumfang, Wartezeit, Selbstbeteiligung, GOT-Erstattung und mögliche Jahresgrenzen.</p>
<p>TierTarif fasst diese Merkmale neutral zusammen und führt zum passenden Vergleichsbereich. Maßgeblich bleiben immer die konkreten Versicherungsbedingungen.</p>', '<div class="prose prose-lg prose-slate max-w-none">
<h2>Hundekrankenversicherung: OP-Schutz oder Vollschutz?</h2>
<p>Eine Hunde-OP-Versicherung bezieht sich auf operative Eingriffe. Ein Vollschutz kann je nach Tarif zusätzlich ambulante Behandlungen, Diagnostik, Medikamente, Physiotherapie oder Vorsorgeleistungen enthalten. Der genaue Umfang unterscheidet sich je nach Anbieter.</p>
<h2>Wichtige Tarifmerkmale</h2>
<p>Beim Vergleich sind Wartezeiten, Selbstbeteiligung, GOT-Erstattung, Jahreshöchstleistung, Nachsorge und Ausschlüsse besonders relevant. Auch rassebezogene Regelungen und Eintrittsalter können eine Rolle spielen.</p>
<h2>Kosten für Hundekrankenversicherung</h2>
<p>Die Beitragshöhe hängt unter anderem von Alter, Rasse, Gesundheitszustand, Leistungsumfang und Selbstbeteiligung ab. Ein niedriger Monatsbeitrag sollte immer mit den Leistungsgrenzen und Ausschlüssen zusammen betrachtet werden.</p>
<h2>Wartezeit und Leistungsbeginn</h2>
<p>Viele Tarife unterscheiden zwischen Unfall, Krankheit und besonderen Leistungsbereichen. Daher ist wichtig, wann Leistungen beginnen und welche Einschränkungen in der Anfangszeit gelten.</p>
<h2>Welpen, ältere Hunde und Vorerkrankungen</h2>
<p>Bei Welpen können frühe Abschlussmöglichkeiten relevant sein. Bei älteren Hunden oder bekannten Vorerkrankungen können Annahme, Beitrag oder Leistungsausschlüsse anders geregelt sein.</p>
</div>', 'Digital-Perfect', 'https://digital-perfect.at', '{"show_18plus_hint_box":false}'::jsonb, true, 3, true, 'tiertarif.com', '[{"question":"Was ist eine Hundekrankenversicherung?","answer":"Eine Hundekrankenversicherung kann je nach Tarif OP-Kosten, Behandlungen, Diagnostik, Medikamente oder weitere Leistungen rund um die tierärztliche Versorgung abbilden."},{"question":"Was unterscheidet OP-Schutz und Vollschutz?","answer":"OP-Schutz fokussiert operative Eingriffe. Vollschutz kann je nach Tarif weitere ambulante und diagnostische Leistungen enthalten."},{"question":"Was kostet eine Hundekrankenversicherung?","answer":"Die Kosten hängen von Alter, Rasse, Leistungsumfang, Selbstbeteiligung, Erstattungsgrenzen und Tarifbedingungen ab."},{"question":"Gibt es Hundekrankenversicherung ohne Wartezeit?","answer":"Bei Unfällen können andere Regeln gelten als bei Krankheiten. Viele Tarife enthalten Wartezeiten, die je nach Leistungsbereich unterschiedlich sein können."},{"question":"Welche Rolle spielt die Hunderasse?","answer":"Rasse, Größe, Alter und Gesundheitszustand können je nach Anbieter Einfluss auf Beitrag, Annahme und Bedingungen haben."},{"question":"Was ist bei Welpen wichtig?","answer":"Bei Welpen sind Eintrittsalter, Wartezeit, Vorsorge-Bausteine, Zahnregelungen und spätere Beitragsentwicklung wichtige Prüfpunkte."}]'::jsonb, false, 'image', true, '', false, 'https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-hunde-krankenversicherung-op-schutz-gilgn-bosco-vergleichsportal-beitragsbild.webp', NULL, 'https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-hunde-krankenversicherung-op-schutz-gilgn-bosco-vergleichsportal-beitragsbild.webp', 'Hundekrankenversicherung im Überblick', 'Hundetarife strukturiert prüfen', 'Tarifdetails prüfen', 'Hunde-Cluster', 'Hunde prüfen', '/hundekrankenversicherung-vergleich#vergleich', 'Hunde prüfen', 'mr-money', '{"sp":"tkv"}'::jsonb, NULL, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  theme = EXCLUDED.theme,
  template = EXCLUDED.template,
  color_theme = EXCLUDED.color_theme,
  site_name = EXCLUDED.site_name,
  hero_headline = EXCLUDED.hero_headline,
  hero_pretitle = EXCLUDED.hero_pretitle,
  hero_cta_text = EXCLUDED.hero_cta_text,
  hero_badge_text = EXCLUDED.hero_badge_text,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  h1_title = EXCLUDED.h1_title,
  long_content_top = EXCLUDED.long_content_top,
  long_content_bottom = EXCLUDED.long_content_bottom,
  footer_designer_name = EXCLUDED.footer_designer_name,
  footer_designer_url = EXCLUDED.footer_designer_url,
  navigation_settings = EXCLUDED.navigation_settings,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  show_comparison_table = EXCLUDED.show_comparison_table,
  target_domain = EXCLUDED.target_domain,
  faq_data = EXCLUDED.faq_data,
  show_ad = EXCLUDED.show_ad,
  ad_type = EXCLUDED.ad_type,
  is_internal_generated = EXCLUDED.is_internal_generated,
  custom_css = EXCLUDED.custom_css,
  is_city = EXCLUDED.is_city,
  hero_image_url = EXCLUDED.hero_image_url,
  comparison_widget_code = EXCLUDED.comparison_widget_code,
  card_image_url = EXCLUDED.card_image_url,
  intro_title = EXCLUDED.intro_title,
  comparison_title = EXCLUDED.comparison_title,
  project_cta_text = EXCLUDED.project_cta_text,
  features_title = EXCLUDED.features_title,
  sticky_cta_text = EXCLUDED.sticky_cta_text,
  sticky_cta_link = EXCLUDED.sticky_cta_link,
  button_text = EXCLUDED.button_text,
  comparison_widget_type = EXCLUDED.comparison_widget_type,
  comparison_widget_config = EXCLUDED.comparison_widget_config,
  custom_html_override = EXCLUDED.custom_html_override,
  updated_at = now();

INSERT INTO public.settings (key, value, updated_at)
VALUES
  ('header_config', '{"hub_links":[{"url":"/kategorien","icon":"LayoutGrid","label":"Alle Bereiche"},{"url":"/pferde-op-versicherung-vergleich","icon":"FileText","label":"Pferde OP"}],"nav_links":[{"url":"/hundekrankenversicherung-vergleich","label":"Hunde"},{"url":"/katzenversicherung-vergleich","label":"Katzen"},{"url":"/pferde-op-versicherung-vergleich","label":"Pferde"}],"button_url":"/#schwerpunkte","button_text":"Jetzt vergleichen","tools_links":[{"url":"/wie-wir-vergleichen","icon":"ShieldCheck","label":"Wie wir vergleichen"}]}'::jsonb, now()),
  ('footer_config', '{"title":"TierTarif","disclaimer":"*Werbehinweis: Wir finanzieren uns teilweise über sogenannte Affiliate-Links. Wenn du über einen Link oder Vergleichsrechner auf dieser Seite weitergehst, erhalten wir möglicherweise eine Provision. Der Preis für dich ändert sich dadurch nicht. Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt.","legal_links":[{"url":"/kontakt","label":"Kontakt"},{"url":"/wie-wir-vergleichen","label":"Wie wir vergleichen"},{"url":"/kategorien","label":"Alle Kategorien"},{"url":"/impressum","label":"Impressum"},{"url":"/datenschutz","label":"Datenschutz"},{"url":"/agb","label":"AGB"},{"url":"/ueber-uns","label":"Über uns"},{"url":"/cookie-einstellungen","label":"Cookie-Einstellungen"}],"text_update":"Aktualisiert: 2026","tools_links":[{"url":"/kategorien","label":"Alle Bereiche"},{"url":"/wie-wir-vergleichen","label":"Wie wir vergleichen"},{"url":"/kontakt","label":"Kontakt"},{"url":"/cookie-einstellungen","label":"Cookie-Einstellungen"}],"made_in_text":"in Austria","text_checked":"Redaktioneller Überblick","popular_links":[{"url":"/hundekrankenversicherung-vergleich","label":"Hundekrankenversicherung"},{"url":"/katzenversicherung-vergleich","label":"Katzenversicherung"},{"url":"/pferde-op-versicherung-vergleich","label":"Pferde OP Versicherung"}],"copyright_text":"© 2026 TierTarif. Alle Rechte vorbehalten.","made_with_text":"Made with","text_description":"TierTarif strukturiert Tierversicherungen, Tierarztkosten und OP-Schutz sachlich für Hunde-, Katzen- und Pferdehalter."}'::jsonb, now()),
  ('home_content', '{"seo":{"intro":"TierTarif bündelt Informationen rund um Tierversicherungen, Tierarztkosten, OP-Schutz und Haftpflicht-Themen für Hunde, Katzen und Pferde.","headline":"TierTarif als sachlicher Tippgeber","long_text":"","block1_text":"Wir strukturieren Tarifmerkmale wie Wartezeit, Selbstbeteiligung, Erstattung, Leistungsgrenzen und mögliche Ausschlüsse übersichtlich.","block2_text":"Unsere Inhalte werden fortlaufend gepflegt, damit Tierhalter relevante Unterschiede eigenständig einordnen können.","block1_title":"Neutraler Überblick","block2_title":"Redaktionelle Pflege"},"hero":{"badge":"TierTarif Überblick","stats":[{"label":"Leistungen prüfen","title":"Transparent"},{"label":"Kosten einordnen","title":"Sachlich"},{"label":"Wartezeiten beachten","title":"Sicher"}],"title":"Tierversicherungen strukturiert prüfen","headline":"Tierversicherungen prüfen: Hunde, Katzen & Pferde","subtitle":"Prüfe Hunde-, Katzen- und Pferdeversicherungen nach Leistungen, Kostenpunkten, Wartezeiten und Erstattungslogik.","button_text":"Jetzt vergleichen","subheadline":"Drei fokussierte Vergleichsbereiche für Tierhalter: Hundekrankenversicherung, Katzenversicherung und Pferde-OP-Schutz.","search_label":"Finden","mobile_image_url":"https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-hero-hund-katze-pferd-tierversicherung-mobile.webp","desktop_image_url":"https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-hero-hund-katze-pferd-tierversicherung-desktop-aussen.webp","search_placeholder":"Was suchst du? (z. B. Katzen OP, Pferde OP)"},"news":{"count":3,"headline":"Ratgeber & Wissen","read_more":"Artikel lesen","button_url":"/kategorien","button_text":"Alle Bereiche ansehen","subheadline":"Erklärungen zu Tierarztkosten, OP-Schutz und Tarifmerkmalen"},"trust":{"badge":"TierTarif Überblick","headline":"Tiergesundheit sachlich vergleichen","link_text":"Kategorien ansehen →","subheadline":"Hunde, Katzen und OP-Schutz transparent prüfen"},"why_us":{"features":[{"icon":"shield","title":"Klare Kriterien","text":"Leistungen, Wartezeiten und Erstattungslogik werden strukturiert dargestellt."},{"icon":"heart","title":"Tierhalter-Fokus","text":"Hunde, Katzen und Pferde werden mit eigenen Vergleichsbereichen abgebildet."},{"icon":"zap","title":"Schnelle Orientierung","text":"Direkte Einstiege zu den wichtigsten Money-Seiten auf Desktop und Smartphone."},{"icon":"chart","title":"Laufende Pflege","text":"Ratgeber und Vergleichsinhalte werden schrittweise erweitert."}],"headline":"Warum TierTarif?","subheadline":"Drei klare Einstiege für Tierhalter, die Versicherungsmerkmale sachlich prüfen möchten."},"home_faq":{"badge":"FAQ • TierTarif","items":[{"id":"home-faq-1","question":"Was ist TierTarif?","answer":"<p>TierTarif ist ein sachliches Informations- und Vergleichsportal für Tierhalter. Der Fokus liegt auf Hundekrankenversicherung, Katzenversicherung und Pferde-OP-Schutz.</p>"},{"id":"home-faq-2","question":"Welche Themen finde ich auf TierTarif?","answer":"<p>Du findest strukturierte Inhalte zu Leistungen, Kosten, Wartezeiten, Selbstbeteiligung, Erstattungsgrenzen, Zahn-OPs, FORL und OP-Schutz.</p>"},{"id":"home-faq-3","question":"Ersetzt TierTarif eine Vertragsprüfung?","answer":"<p>Nein. TierTarif hilft bei der Orientierung und ersetzt nicht die eigenständige Prüfung der jeweiligen Versicherungsbedingungen.</p>"}],"headline":"Häufige Fragen zu TierTarif","subheadline":"Kompakte Antworten zu Tierversicherungen, Tierarztkosten und Vergleichsinhalten."},"big_three":{"items":[{"id":"1","title":"Hunde","desc":"OP- und Vollschutz für Hunde strukturiert prüfen.","icon":"shield","link":"/hundekrankenversicherung-vergleich","theme":"teal","image_url":"https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-hunde-krankenversicherung-op-schutz-gilgn-bosco-vergleichsportal-beitragsbild.webp","button_text":"Hunde prüfen"},{"id":"2","title":"Katzen","desc":"OP-Schutz, FORL, Zahn-OP und Kosten einordnen.","icon":"heart","link":"/katzenversicherung-vergleich","theme":"coral","image_url":"https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-katzen-versicherung-zahn-op-vergleichsrechner-bild.webp","button_text":"Katzen prüfen"},{"id":"3","title":"Pferde","desc":"OP-Schutz, Krankenversicherung und Haftpflicht-Themen prüfen.","icon":"trending","link":"/pferde-op-versicherung-vergleich","theme":"teal","image_url":"https://veuysjxlptmobxuhgwnc.supabase.co/storage/v1/object/public/branding/tiertarif-pferde-haftpflicht-op-schutz-vergleichsrechner.webp","button_text":"Pferde prüfen"}],"headline":"Unsere Schwerpunkte","finance_desc":"Leistungen, Erstattung und Kosten für Hunde prüfen.","finance_link":"/hundekrankenversicherung-vergleich","finance_title":"Hundekrankenversicherung","services_desc":"OP-Schutz, Krankenversicherung und Haftpflicht-Themen für Pferde strukturieren.","services_link":"/pferde-op-versicherung-vergleich","software_desc":"OP-Schutz, Zahn-OP und Wartezeiten für Katzen einordnen.","software_link":"/katzenversicherung-vergleich","finance_button":"Hundeschutz prüfen","services_title":"Pferde OP Versicherung","software_title":"Katzenversicherung","services_button":"Pferdeschutz prüfen","software_button":"Katzenschutz prüfen"},"seo_title":"TierTarif | Tierversicherungen prüfen","categories":{"count":6,"headline":"Alle TierTarif-Bereiche im Überblick","button_card":"Bereich öffnen","button_more":"Alle Bereiche anzeigen"},"forum_teaser":{"headline":"Tierhalter-Community","link_text":"Alle Foren anzeigen","subheadline":"Tausche dich mit anderen Tierhaltern aus und teile Erfahrungen rund um Hunde, Katzen und Versicherungsschutz.","mobile_button":"Zur Community"},"how_it_works":{"badge":"In 3 Schritten zum Vergleich","steps":[{"title":"Tierart wählen","status":"Hund, Katze oder Pferd","text":"Starte mit dem Bereich, der zu deinem Tier und deinem konkreten Versicherungsbedarf passt."},{"title":"Merkmale prüfen","status":"Leistung, Kosten, Wartezeit","text":"Vergleiche Wartezeiten, Erstattung, Selbstbeteiligung, Leistungsgrenzen und wichtige Ausschlüsse."},{"title":"Rechner öffnen","status":"Tarifdetails einordnen","text":"Öffne den passenden Vergleichsbereich und prüfe die verfügbaren Tarifdetails in Ruhe."}],"headline":"So funktioniert TierTarif","subheadline":"Tierart wählen, Tarifmerkmale prüfen und den passenden Vergleichsbereich öffnen."},"seo_description":"TierTarif strukturiert Hunde-, Katzen- und Pferdeversicherungen nach Leistungen, Kosten, Wartezeit und Erstattung."}'::jsonb, now()),
  ('site_title', '"TierTarif | Tierversicherungen prüfen"'::jsonb, now()),
  ('site_description', '"TierTarif strukturiert Hunde-, Katzen- und Pferdeversicherungen nach Leistungen, Kosten, Wartezeit und Erstattung."'::jsonb, now()),
  ('site_settings', '{"name":"TierTarif","active":true,"description":"Sachliches Portal für Tierversicherungen"}'::jsonb, now()),
  ('ticker_headline', '"Beliebte TierTarif-Bereiche"'::jsonb, now()),
  ('ticker_badge_text', '"TierTarif Überblick"'::jsonb, now()),
  ('ticker_link_text', '"Alle Bereiche ansehen →"'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

DO $$
DECLARE
  v_table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'seo_redirects'
  ) INTO v_table_exists;

  IF v_table_exists THEN
    INSERT INTO public.seo_redirects (source_path, target_path, entity_id, entity_table, redirect_code, is_automatic, is_active, is_locked, updated_at)
    SELECT '/hunde', '/hundekrankenversicherung-vergleich', id, 'categories', 301, true, true, false, now()
    FROM public.categories WHERE slug = 'hundekrankenversicherung-vergleich'
    ON CONFLICT (source_path) DO UPDATE SET target_path = EXCLUDED.target_path, entity_id = EXCLUDED.entity_id, redirect_code = 301, is_active = true, updated_at = now();

    INSERT INTO public.seo_redirects (source_path, target_path, entity_id, entity_table, redirect_code, is_automatic, is_active, is_locked, updated_at)
    SELECT '/katzen', '/katzenversicherung-vergleich', id, 'categories', 301, true, true, false, now()
    FROM public.categories WHERE slug = 'katzenversicherung-vergleich'
    ON CONFLICT (source_path) DO UPDATE SET target_path = EXCLUDED.target_path, entity_id = EXCLUDED.entity_id, redirect_code = 301, is_active = true, updated_at = now();

    INSERT INTO public.seo_redirects (source_path, target_path, entity_id, entity_table, redirect_code, is_automatic, is_active, is_locked, updated_at)
    SELECT '/pferde', '/pferde-op-versicherung-vergleich', id, 'categories', 301, true, true, false, now()
    FROM public.categories WHERE slug = 'pferde-op-versicherung-vergleich'
    ON CONFLICT (source_path) DO UPDATE SET target_path = EXCLUDED.target_path, entity_id = EXCLUDED.entity_id, redirect_code = 301, is_active = true, updated_at = now();
  END IF;
END $$;

COMMIT;

-- Schnelltest nach Ausführung:
-- SELECT slug, meta_title, comparison_widget_type, comparison_widget_config FROM public.categories WHERE slug IN ('pferde-op-versicherung-vergleich','katzenversicherung-vergleich','hundekrankenversicherung-vergleich') ORDER BY sort_order;
-- SELECT key, value FROM public.settings WHERE key IN ('header_config','footer_config','home_content','site_title','site_description');
