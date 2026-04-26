# Rank-Scout Hub – System & Development Log

## [19.02.2026] – Status Quo: Full System Manifest (A bis Z)
**Fokus:** Skalierung, Umsatz, Retention & System-Architektur

**1. Core Tech-Stack & Frontend-Architektur**
* **Frameworks:** React 18, Vite (High-Performance Build-Tool), TypeScript (strikte Typisierung). Keine Next.js Abhängigkeiten.
* **Styling & UI:** Tailwind CSS für Utility-First Styling. Vollständige Integration von `shadcn/ui` für hochkonvertierende, wiederverwendbare Komponenten (Buttons, Dialogs, Forms, Accordions, Toasts).
* **Responsive Design:** Strikt Mobile-First. Desktop-Ansicht (Full-Width) ist auf maximale Conversion und Lesbarkeit optimiert. Dark/Light-Mode Support integriert.

**2. Backend & Daten-Infrastruktur (Supabase - "Das Datenbank-Gesetz")**
* **Auth:** Vollständiges Supabase Authentication-System (Login, Registrierung, Session-Handling).
* **Database:** PostgreSQL mit granularem Schema (Projekte, Kategorien, Leads, Footer-Links, Foren-Threads).
* **Storage:** Supabase Storage für Assets und generierte Exporte.

**3. Main Hub Features (Rank-Scout)**
* **Dynamische Kategorien & Projekte:** Darstellung von Projekten, geordnet nach Kategorien mit Detailseiten (`CategoryDetail.tsx`).
* **Lokales SEO & City-Landingpages:** Template-System (`CityLandingTemplate.tsx`) für massenhafte, lokale Landingpages (Content-Tiefe: Fokus auf 4.000+ Wörter).
* **Multi-Publisher System:** Infrastruktur, um Landingpages in Sekunden für verschiedene Publisher zu generieren und zu exportieren (`ExportTemplate.tsx`, `CityExportDialog.tsx`).

**4. Monetarisierung & Affiliate Engine (Umsatz & Marge)**
* **Vergleichsrechner (Native Integration):**
  * Check24 DSL Widget (`Check24DSLWidget.tsx`)
  * Check24 Strom/Power Widget (`Check24PowerWidget.tsx`)
  * TarifCheck Kredit Widget (`TarifCheckCreditWidget.tsx`)
* **Ad-Netzwerke:** Standardisierte Banner-Komponenten für Google AdSense (`AdSenseBanner.tsx`) und Amazon Partnernet (`AmazonBanner.tsx`).
* **Lead-Generierung:** C4F Registration und natives Lead-Capture-System (`Leads.tsx`).

**5. User Retention & Community (Brain-Boost & Gamification)**
* **Forum Engine:** Eigenes Community-Board (`Forum.tsx`, `ForumThread.tsx`, `ForumSidebar.tsx`) zur Steigerung der wiederkehrenden Nutzer (Retention).
* **Arcade/Gamification:** Integrierte `ArcadeSection.tsx` & `AppTicker.tsx` als Hook für Brain-Boost und interaktive Inhalte.
* **Mascot Widget:** Floating Mascot (`MascotWidget.tsx`) für erhöhte Markenbindung und User-Engagement.

**6. SEO & Performance Engine**
* **Harte SEO-Standards:** Automatisierte Durchsetzung über `useSEO.tsx` & `useForceSEO.ts` (Title max. 60 Zeichen, Description max. 155 Zeichen).
* **Indexierung:** Automatisierte Sitemap-Generierung (`generate-sitemap.js`) und saubere `robots.txt`.
* **SEO-Content-Blöcke:** Dynamische SEO-Texte auf Home- und Kategorie-Seiten (`HomeSEOText.tsx`, `SEOContentSection.tsx`).

**7. Admin-Cockpit (Das Chef-Panel)**
* **Zentrales Management:** Komplettes Dashboard (`Dashboard.tsx`) zur Steuerung des Hubs.
* **Module:** Verwaltung von Apps (`Apps.tsx`), Kategorien (`Categories.tsx`), Projekten (`Projects.tsx`), Footer-Links (`FooterLinks.tsx`), Forum-Moderation (`Forum.tsx`) und Leads (`Leads.tsx`).
* **Traffic-Control:** Integrierter Redirect-Manager (`Redirects.tsx`).
* **Content-Editoren:** Rich-Text-Editoren für FAQs und Projektbeschreibungen.

**8. Edge Functions & Automatisierung (AI Integration)**
* **Rank-Scout AI:** Automatisierte Verarbeitung via `rank-scout-ai`.
* **Content-Generator:** Automatisierte Text-Generierung für City-Pages (`generate-city-content`).
* **Marketing Automation:** Newsletter-System (`newsletter-subscribe`).
* **Smart Redirects:** Schnelles Routing via Edge Function (`go-redirect`).

---