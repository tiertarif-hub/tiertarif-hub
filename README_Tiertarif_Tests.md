# TierTarif Safety Tests

Dieses Paket ergänzt ein schlankes Test-Sicherheitsnetz für TierTarif.
Es verändert keine Datenbank, nutzt keine Live-Supabase-Daten und hat keinen Einfluss auf den PageSpeed.

## Enthalten

- Vitest-Konfiguration
- Browser-Testumgebung mit jsdom
- React Testing Library Setup
- Supabase-Bildschutz-Tests
- Header-CTA-Test
- Routen-Normalisierungs-Test
- rechtlicher Sprachfilter für neutrale Tippgeber-Sprache
- kleiner Supabase-Test-Mock-Helfer

## Wichtig vor dem ersten Lauf

Dieses ZIP enthält `package.json`, aber bewusst kein manuell erzeugtes `package-lock.json`.
Nach dem Einspielen musst du lokal einmal installieren, damit `package-lock.json` sauber von npm aktualisiert wird.

```bash
npm install
```

Danach vor jedem Push:

```bash
npm run test
npm run build
npm run dev
```

Wenn alles grün ist, committen:

```bash
git add package.json package-lock.json vitest.config.ts src/lib/storageImage.ts src/lib/legalCopy.ts src/test src/lib/__tests__ src/components/layout/__tests__ src/lib/sanitizeHtml.ts src/components/home/NewsSection.tsx README_Tiertarif_Tests.md
git commit -m "add tiertarif safety tests"
git push
```

## Was nicht nötig ist

- keine SQL-Migration
- kein Supabase-Seeding
- keine Live-Datenbank
- keine Edge Function
- keine Änderung an Routen, Slugs oder Redirects

## Warum `sanitizeHtml.ts` und `NewsSection.tsx` dabei sind

Dort wurde die Supabase-Bildlogik korrigiert, damit gespeicherte Public-Bilder nicht mehr auf `/storage/v1/render/image/public/` umgeschrieben werden.
Die Tests sichern genau diesen Fehler ab.
