# TierTarif Paket B – Branding & Layout

## Geänderte Dateien

- `src/index.css`
- `tailwind.config.ts`
- `src/App.tsx`
- `src/hooks/useSettings.ts`
- `src/pages/admin/Settings.tsx`
- `src/components/home/HeroSection.tsx`
- `src/components/home/BigThreeSection.tsx`

## Hilfsdatei

- `set_tiertarif_theme.sql`

## Änderungen

- Neues Theme `[data-theme="tiertarif"]` mit Trust Vet Teal.
- `tiertarif` ist im Admin unter Settings auswählbar.
- Theme-Fallback im App-ThemeManager auf `tiertarif`.
- `useActiveTheme()` verwendet `tiertarif` als Default.
- HeroSection wurde auf helle TierTarif-Hero umgebaut.
- Rechts in der Hero steht eine helle Fake-Vergleichsrechner-Karte.
- Trust-Bar ist direkt unter der Hero integriert.
- BigThreeSection wurde von dunklen Vollbild-Overlay-Karten auf helle Prüfkarten umgebaut.
- Alte `rsblue`-Tailwind-Variable wurde aus der Tailwind-Konfiguration entfernt.
- Keine Slugs oder Routen geändert.
- `dist/` ist nicht enthalten und wurde nicht manuell gepatcht.

## Nach dem Entpacken

```bash
npm run build
```

Falls das Theme in Supabase noch nicht aktiv ist:

```sql
-- set_tiertarif_theme.sql ausführen
```

## Live-Test

- `/`
- `/kategorien`
- `/forum`
- `/admin/settings`

Im Frontend prüfen:

- Hero ist hell/teal statt dunkles Overlay.
- Rechts ist die Vergleichsrechner-Karte sichtbar.
- Trust-Bar steht direkt unter der Hero.
- BigThree-Karten sind hell mit Prüfpunkten und CTA.
