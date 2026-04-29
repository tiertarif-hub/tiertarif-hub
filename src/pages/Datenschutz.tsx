import "@/styles/article-content.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Lock, ShieldCheck, Server, BarChart3, Globe, Mail } from "lucide-react";
import { Helmet } from "react-helmet-async"; // KYRA FIX
import { buildAbsoluteSiteUrl } from "@/lib/routes";

const Datenschutz = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* KYRA FIX: Unique Title für Datenschutz */}
      <Helmet>
        <title>Datenschutzerklärung | TierTarif</title>
        <meta name="description" content="Informationen zum Datenschutz auf TierTarif. Wie wir deine Daten schützen." />
        <link rel="canonical" href={buildAbsoluteSiteUrl("/datenschutz")} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />
      
      {/* --- HEADER BEREICH (ZENTRIERT) --- */}
      <div className="bg-primary pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90" />

         <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
              Datenschutzerklärung
            </h1>
            <p className="text-lg text-slate-300 mx-auto max-w-2xl">
              Transparenz ist uns wichtig. Hier erfahren Sie, wie wir Ihre Daten schützen.
            </p>
            <p className="text-sm text-secondary font-medium mt-2">Stand: 25.01.2026</p>
         </div>
      </div>

      <main className="flex-grow container mx-auto px-4 -mt-12 relative z-20 pb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          
          <div className="space-y-16">
            
            {/* 1. Datenschutz auf einen Blick */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Lock className="w-6 h-6" /></div>
                1. Datenschutz auf einen Blick
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">Verantwortliche Stelle</h3>
                  <div className="text-slate-700 text-sm leading-relaxed space-y-1">
                    <p className="font-bold">Media-Bro</p>
                    <p>Leonfeldnerstraße</p>
                    <p>4040 Linz, Österreich</p>
                    <p className="text-secondary font-bold pt-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> kontakt@tiertarif.com
                    </p>
                  </div>
                </div>
                <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">Verschlüsselung</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Diese Seite nutzt SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie am „https://“ und dem Schloss-Symbol in Ihrer Browserzeile.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Ihre Rechte & Widerruf */}
            <section className="bg-primary text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-6 relative z-10 text-white">2. Ihre Rechte & Widerruf</h2>
              <p className="text-slate-300 mb-8 relative z-10">
                Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten sowie ein Recht auf Berichtigung, Sperrung oder Löschung.
              </p>
              <div className="bg-white/10 border-l-4 border-secondary p-6 relative z-10">
                <h3 className="text-secondary font-bold uppercase tracking-wider text-sm mb-2">WIDERSPRUCHSRECHT (ART. 21 DSGVO)</h3>
                <p className="text-sm text-slate-200 m-0">
                  Erfolgt die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO, haben Sie jederzeit das Recht auf Widerspruch aus Gründen Ihrer besonderen Situation oder gegen Direktwerbung.
                </p>
              </div>
            </section>

            {/* 3. Hosting & Content Delivery */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Server className="w-6 h-6" /></div>
                3. Hosting & Content Delivery
              </h2>
              <div className="article-content article-content--legal max-w-none text-slate-700 space-y-6">
                <div className="p-6 rounded-xl border border-slate-100 bg-white">
                  <p><strong>Externes Hosting (Vercel / Supabase):</strong> Diese Website wird bei Vercel Inc. & Supabase Inc. gehostet. Erfasste Daten (IP-Adressen, Meta-Daten) werden auf deren Servern gespeichert (Art. 6 Abs. 1 lit. f DSGVO).</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-100 bg-white">
                  <p><strong>Cloudflare (CDN & Sicherheit):</strong> Wir nutzen Cloudflare Inc. zur Abwehr von Angriffen und Optimierung der Ladezeiten. Datentransfers stützen sich auf Standardvertragsklauseln der EU-Kommission.</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-100 bg-white">
                  <p><strong>E-Mail Hosting (IONOS):</strong> E-Mails werden auf Servern der IONOS SE in Deutschland gespeichert. Wir haben Verträge zur Auftragsverarbeitung (AVV) geschlossen.</p>
                </div>
              </div>
            </section>

            {/* NEU: Integration von Vergleichsrechnern */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Server className="w-6 h-6" /></div>
                Eingebundene Vergleichsrechner (Partnerprogramme)
              </h2>
              <div className="space-y-6 text-slate-700 p-6 rounded-xl border border-slate-100 bg-slate-50">
                <p>Auf unserer Website binden wir iFrames und Vergleichsrechner von externen Partnern ein (insbesondere der TARIFCHECK24 GmbH und CHECK24). Wenn Sie diese Rechner nutzen und Daten in die Formulare eingeben, werden diese Daten direkt auf den Servern der jeweiligen Partner verarbeitet. Wir selbst speichern die in den Rechnern eingegebenen sensiblen Formulardaten nicht.</p>
                <p>Der jeweilige Partner ist datenschutzrechtlich für die im Rechner eingegebenen Daten verantwortlich. Weitere Informationen zur Datenverarbeitung finden Sie in den Datenschutzerklärungen der jeweiligen Partner in den iFrames.</p>
              </div>
            </section>

            {/* 4. Datenerfassung */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Globe className="w-6 h-6" /></div>
                4. Datenerfassung auf dieser Website
              </h2>
              <div className="space-y-6 text-slate-700">
                <p><strong>Cookies:</strong> Wir verwenden Session-Cookies und permanente Cookies. Notwendige Cookies sind technisch erforderlich. Analyse-Cookies setzen wir nur mit Ihrer aktiven Einwilligung (Opt-In).</p>
                <p><strong>Server-Log-Dateien:</strong> Der Provider erhebt automatisch Log-Daten (Browsertyp, IP, Uhrzeit). Eine Zusammenführung mit anderen Daten erfolgt nicht.</p>
              </div>
            </section>

            {/* 5. Analyse */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><BarChart3 className="w-6 h-6" /></div>
                5. Analyse-Tools & Werbung
              </h2>
              <div className="space-y-6 text-slate-700">
                <p><strong>Google Analytics 4:</strong> Nutzung mit IP-Anonymisierung auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Daten werden geräteübergreifend pseudonymisiert analysiert.</p>
                <p><strong>Affiliate & AdSense:</strong> Tracking-Technologien für Google AdSense und Amazon werden erst geladen, wenn Sie im Cookie-Banner dem Bereich "Marketing" zugestimmt haben.</p>
              </div>
            </section>

            {/* 6. Plugins & Newsletter */}
            <section className="border-t border-slate-100 pt-12">
              <h2 className="text-xl font-bold text-primary mb-4">6. Plugins & Newsletter</h2>
              <p className="text-slate-700 mb-4"><strong>Google Web Fonts:</strong> Zur einheitlichen Darstellung werden Schriften von Google geladen, wobei Ihre IP-Adresse übertragen wird.</p>
              <p className="text-slate-700"><strong>Newsletter ("Unfair Advantage"):</strong> Wir nutzen Double-Opt-In zur Verifizierung Ihrer E-Mail. Die Einwilligung können Sie jederzeit widerrufen.</p>
            </section>

            {/* 7. Cookie Management */}
            <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
              <h2 className="text-xl font-bold text-primary mb-4 font-display">7. Cookie-Einstellungen verwalten</h2>
              <p className="text-sm text-slate-600 mb-6">Sie können Ihre Entscheidung jederzeit ändern.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-secondary/20 transition-all uppercase text-sm tracking-widest"
              >
                Cookie-Einstellungen öffnen
              </button>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Datenschutz;
