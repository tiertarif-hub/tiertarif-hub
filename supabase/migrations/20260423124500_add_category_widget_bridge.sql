alter table public.categories
  add column if not exists comparison_widget_type text,
  add column if not exists comparison_widget_config jsonb;

comment on column public.categories.comparison_widget_type is
  'Steuert den externen Widget-Renderer, z. B. html oder mr-money.';

comment on column public.categories.comparison_widget_config is
  'Flexible JSONB-Konfiguration für externe Widgets, z. B. {"sp":"tkvk"} für Mr. Money.';
