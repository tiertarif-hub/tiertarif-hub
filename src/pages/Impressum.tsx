import "@/styles/article-content.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet-async"; // KYRA FIX
import { buildAbsoluteSiteUrl } from "@/lib/routes";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* KYRA FIX: Unique Title für Impressum */}
      <Helmet>
        <title>Impressum | TierTarif</title>
        <meta name="description" content="Impressum und rechtliche Hinweise von TierTarif." />
        <link rel="canonical" href={buildAbsoluteSiteUrl("/impressum")} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />

      {/* --- HEADER BEREICH (ZENTRIERT) --- */}
      <div className="bg-primary pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90" />
         
         <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
              Impressum
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Offenlegung gemäß § 25 Mediengesetz & E-Commerce-Gesetz.
            </p>
         </div>
      </div>

      <main className="flex-grow container mx-auto px-4 -mt-12 relative z-20 pb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3">
                <MapPin className="w-5 h-5" /> Betreiberdaten
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p><strong className="text-primary block mb-1">Medieninhaber & Herausgeber:</strong> Media-Bro</p>
                <p>Leonfeldnerstraße<br />4040 Linz, Österreich</p>
                <p className="flex items-center gap-2 mt-6 text-secondary font-bold">
                  <Mail className="w-4 h-4" /> kontakt@tiertarif.com
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" /> Rechtliches
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p><strong className="text-primary block mb-1">Unternehmensgegenstand:</strong> Betrieb eines redaktionellen Vergleichsportals für digitale Dienstleistungen.</p>
                <p><strong className="text-primary block mb-1">Kammerzugehörigkeit:</strong> Wirtschaftskammer Oberösterreich (WKO).</p>
                <p><strong className="text-primary block mb-1">Redaktion:</strong> Digital-Perfect</p>
              </div>
            </div>
          </div>

          <div className="article-content article-content--lg article-content--legal max-w-none text-slate-700 space-y-12">
            <section>
              <h3 className="text-primary font-display font-bold text-2xl mb-4 underline decoration-secondary decoration-4 underline-offset-8">Haftungsausschluss & Hinweise</h3>
              <p><strong>Transparenzhinweis (Affiliate):</strong> TierTarif finanziert sich teilweise über Affiliate-Links. Bei qualifizierten Käufen über unsere Partnerlinks erhalten wir eine Vergütung. Dies hat keinen Einfluss auf unsere Bewertungen oder den Preis für Sie.</p>
              <p><strong>Haftung für Inhalte & Links:</strong> Trotz sorgfältiger Prüfung übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>

              {/* NEU: Tarifcheck Compliance Block */}
              <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <h4 className="font-bold text-slate-800 mb-2">Hinweis zu Versicherungs- und Finanzvergleichen</h4>
                <p className="mb-4">TierTarif tritt bei Versicherungs- und Finanzvergleichen ausschließlich als Tippgeber auf und ist nicht der Versicherungsvermittler.</p>
                <p className="font-semibold mb-2">Einzelne Vergleichsrechner und Formulare werden von externen Partnern wie TARIFCHECK24 GmbH oder CHECK24 bereitgestellt.</p>
                <p>Zollstr. 11b<br/>21465 Wentorf bei Hamburg<br/>Tel. 040 - 73098288<br/>Fax 040 - 73098289<br/>E-Mail: info@tarifcheck.de</p>
                <div className="mt-6 w-full overflow-hidden">
                  <iframe src="https://a.partner-versicherung.de/filestore/ad/1166/index.php?partner_id=199238" width="100%" height="300" scrolling="yes" frameBorder="0" className="border-0"></iframe>
                </div>
              </div>
            </section>

            <section className="bg-primary text-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-display font-bold text-xl mb-4 text-white">Streitbeilegung</h3>
              <p className="text-slate-300">Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten: <a href="http://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold">http://ec.europa.eu/odr</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
