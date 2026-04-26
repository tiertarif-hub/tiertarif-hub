import "@/styles/article-content.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Info,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { buildAbsoluteSiteUrl } from "@/lib/routes";

const AGB = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Helmet>
        <title>Allgemeine Geschäftsbedingungen (AGB) | Standard Portal</title>
        <meta
          name="description"
          content="Allgemeine Geschäftsbedingungen für die Nutzung von Standard Portal sowie Hinweise zu eingebundenen Vergleichsrechnern, Formularen und externen Partnerdiensten."
        />
        <link rel="canonical" href={buildAbsoluteSiteUrl("/agb")} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />

      <div className="bg-primary pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Nutzungsbedingungen für das Online-Angebot von Standard Portal.
          </p>
          <p className="text-sm text-secondary font-medium mt-4 flex items-center justify-center gap-2">
            <Info className="w-4 h-4" /> Stand: 19.03.2026
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 -mt-12 relative z-20 pb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <Scale className="w-6 h-6" />
                </div>
                1. Geltungsbereich
              </h2>
              <div className="article-content article-content--legal max-w-none text-slate-700">
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform <strong>Standard Portal</strong>
                  sowie der darüber bereitgestellten Inhalte, Funktionen, Rechner, Formulare, Vergleichsstrecken,
                  redaktionellen Beiträge und sonstigen digitalen Dienste durch Nutzer der Webseite.
                </p>
                <p>
                  Anbieter und Betreiber von Standard Portal ist der jeweils im Impressum genannte Seitenbetreiber.
                  Maßgeblich ist die zum Zeitpunkt der jeweiligen Nutzung gültige Fassung dieser AGB.
                </p>
                <p>
                  Abweichende Bedingungen des Nutzers werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung
                  wurde ausdrücklich schriftlich zugestimmt.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                2. Leistungsgegenstand
              </h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 space-y-4">
                <p>
                  Standard Portal ist eine redaktionelle Informations-, Recherche- und Vergleichsplattform für ausgewählte
                  Themenbereiche, insbesondere Versicherungen, Finanzen, Energie, Telekommunikation, Software,
                  digitale Dienstleistungen sowie weitere Verbraucher- und Alltagsthemen.
                </p>
                <p>
                  Standard Portal stellt eigene Inhalte, redaktionelle Übersichten, Ratgeber, FAQ-Inhalte, neutrale
                  Hilfswerkzeuge, Rechner, Checklisten und Verweise auf externe Partnerangebote bereit. Ein Anspruch auf
                  eine bestimmte Verfügbarkeit, Aktualität oder Vollständigkeit einzelner Inhalte oder Funktionen besteht
                  nicht.
                </p>
                <p>
                  Soweit auf Standard Portal Vergleichsrechner, Formulare, iFrames, Tarifstrecken, Kurzrechner,
                  Angebotsstrecken oder sonstige Partner-Widgets eingebunden sind, werden diese technisch und inhaltlich
                  ganz oder teilweise von externen Partnern bereitgestellt.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <FileText className="w-6 h-6" />
                </div>
                3. Hinweise zu externen Vergleichsrechnern, Formularen und Partnerangeboten
              </h2>
              <div className="space-y-6 text-slate-700">
                <div className="p-6 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <p>
                    Standard Portal tritt – soweit nicht ausdrücklich anders angegeben – nicht selbst als Versicherer,
                    Kreditinstitut, Energieversorger, Telekommunikationsanbieter, Reiseveranstalter, Mietwagenanbieter,
                    Makler oder sonstiger Produktanbieter auf.
                  </p>
                  <p>
                    Bei eingebundenen Rechnern, Vergleichsformularen, Tarifstrecken, Lead-Formularen oder iFrames kommt
                    ein möglicher Vertrag ausschließlich zwischen dem Nutzer und dem jeweils ausgewählten Anbieter bzw.
                    dem jeweils verantwortlichen externen Partner zustande.
                  </p>
                  <p>
                    Standard Portal selbst wird nicht Vertragspartei eines über externe Vergleichsrechner, Formulare oder
                    Partnerstrecken angebahnten oder geschlossenen Vertrags.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-secondary/20 bg-secondary/5 space-y-4">
                  <p className="font-semibold text-primary">
                    Ergänzende Bedingungen und Datenschutzbestimmungen externer Partner
                  </p>
                  <p>
                    Für die Nutzung von eingebundenen Vergleichsrechnern, Formularen und Angebotsstrecken externer
                    Partner gelten ergänzend die Bedingungen und Datenschutzbestimmungen des jeweils eingebundenen
                    Partners, sofern und soweit deren Dienste genutzt werden.
                  </p>
                  <p>
                    Sofern auf Standard Portal Vergleichsrechner oder Formulare von <strong>TARIFCHECK24 GmbH</strong> bzw.
                    <strong> TARIF CHECK24 / CHECK24-Partnerstrecken</strong> eingesetzt werden, gelten ergänzend deren
                    AGB- und Datenschutzinformationen:
                  </p>
                  <a
                    href="https://files.check24.net/ads/113/agb-datenschutz.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-secondary hover:text-primary transition-colors"
                  >
                    AGB- und Datenschutzinformationen des Partners öffnen
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-sm text-slate-600">
                    Die jeweils konkret eingesetzten Partnerdienste und Verantwortlichkeiten können zusätzlich direkt am
                    jeweiligen Rechner, Formular, Widget, Partnerhinweis oder in der Datenschutzerklärung kenntlich
                    gemacht werden.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                4. Keine Beratung, keine Garantie, keine Vollständigkeit des Marktes
              </h2>
              <div className="article-content article-content--legal max-w-none text-slate-700">
                <p>
                  Die auf Standard Portal bereitgestellten Inhalte dienen der allgemeinen Information, Orientierung und
                  eigenständigen Vorbereitung von Entscheidungen. Sie stellen keine Rechts-, Steuer-, Finanz-,
                  Versicherungs- oder Anlageberatung dar.
                </p>
                <p>
                  Angaben zu Preisen, Tarifen, Konditionen, Leistungen, Fristen, Ersparnissen, Förderungen,
                  Verfügbarkeiten oder sonstigen Produktmerkmalen können sich jederzeit ändern. Maßgeblich sind stets
                  ausschließlich die Angaben, Bedingungen und Vertragsunterlagen des jeweiligen Anbieters oder des
                  eingebundenen Partners.
                </p>
                <p>
                  Standard Portal ist nicht verpflichtet, den gesamten Markt, alle Anbieter, sämtliche Tarife oder jede am
                  Markt verfügbare Produktvariante abzubilden, zu vergleichen oder aktuell zu halten.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <Scale className="w-6 h-6" />
                </div>
                5. Pflichten der Nutzer
              </h2>
              <div className="article-content article-content--legal max-w-none text-slate-700">
                <p>
                  Nutzer sind verpflichtet, bei der Verwendung von Formularen, Rechnern, Kontaktstrecken oder
                  Anfragefunktionen ausschließlich wahrheitsgemäße, vollständige und aktuelle Angaben zu machen.
                </p>
                <p>
                  Jede missbräuchliche Nutzung der Plattform ist untersagt. Dies gilt insbesondere für automatisierte
                  Zugriffe, Störversuche, die Umgehung technischer Schutzmaßnahmen, die Eingabe falscher oder fremder
                  Daten sowie die Nutzung zu rechtswidrigen Zwecken.
                </p>
                <p>
                  Soweit externe Partnerrechner oder Partnerformulare genutzt werden, gelten ergänzend die jeweils dort
                  einsehbaren Teilnahme-, Nutzungs-, Datenschutz- und Verarbeitungsbedingungen des betreffenden Partners.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                6. Haftung &amp; Gewährleistung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-red-100 bg-red-50/50">
                  <h3 className="font-bold text-red-900 mb-2">Inhaltliche Richtigkeit</h3>
                  <p className="text-sm text-red-800">
                    Standard Portal bemüht sich um aktuelle und sorgfältig aufbereitete Inhalte. Eine Gewähr für Richtigkeit,
                    Vollständigkeit, Aktualität, Eignung oder fortlaufende Verfügbarkeit der bereitgestellten Inhalte,
                    Rechnergebnisse oder Drittinformationen wird jedoch nicht übernommen.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-primary mb-2">Technische Verfügbarkeit</h3>
                  <p className="text-sm text-slate-600">
                    Eine jederzeitige, unterbrechungsfreie und fehlerfreie Verfügbarkeit der Webseite, einzelner Tools,
                    Rechner, Partnerwidgets oder externer Integrationen wird nicht geschuldet. Wartungen,
                    Schnittstellenprobleme oder Ausfälle externer Dienste können die Nutzung vorübergehend einschränken.
                  </p>
                </div>
              </div>
              <div className="article-content article-content--legal max-w-none text-slate-700 mt-6">
                <p>
                  Soweit gesetzlich zulässig, ist die Haftung von Standard Portal für leichte Fahrlässigkeit ausgeschlossen.
                  Dies gilt nicht bei Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, bei
                  zwingender gesetzlicher Haftung sowie bei der Verletzung wesentlicher Vertragspflichten.
                </p>
                <p>
                  Bei der Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vertragstypischen,
                  vorhersehbaren Schaden begrenzt. Eine Haftung für Inhalte, Leistungen, Angebote, Datenverarbeitungen,
                  Vertragsannahmen oder sonstige Handlungen externer Anbieter oder Partner ist ausgeschlossen, soweit
                  gesetzlich zulässig.
                </p>
                <p>
                  Standard Portal schuldet keinen bestimmten wirtschaftlichen, finanziellen, versicherungsbezogenen oder
                  vertraglichen Erfolg. Insbesondere übernimmt Standard Portal keine Haftung dafür, dass über eingebundene
                  Rechner, Formulare oder Partnerstrecken dargestellte oder angebahnte Tarife, Verträge,
                  Versicherungsleistungen oder sonstige Angebote den individuellen Bedürfnissen des Nutzers entsprechen,
                  von einem Anbieter angenommen werden oder im Leistungsfall eine bestimmte Deckung, Auszahlung oder
                  sonstige Leistung erbringen.
                </p>
                <p>
                  Die Prüfung von Eignung, Umfang, Ausschlüssen, Obliegenheiten, Annahmerichtlinien und konkreten
                  Vertragsbedingungen obliegt ausschließlich dem Nutzer sowie dem jeweiligen Anbieter, Vermittler oder
                  externen Partner.
                </p>
              </div>
            </section>

            <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <h2 className="text-xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" /> 7. Schlussbestimmungen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 font-display">
                    Anwendbares Recht
                  </p>
                  <p className="text-slate-700">
                    Es gilt das Recht der Republik Österreich, sofern dem keine zwingenden gesetzlichen
                    Verbraucherschutzvorschriften entgegenstehen.
                  </p>
                </div>
                <div>
                  <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 font-display">
                    Gerichtsstand
                  </p>
                  <p className="text-slate-700">
                    Für Unternehmer ist – soweit gesetzlich zulässig – der Gerichtsstand Linz. Für Verbraucher gelten
                    die gesetzlichen Gerichtsstände.
                  </p>
                </div>
              </div>
              <div className="mt-8 article-content article-content--legal max-w-none text-slate-700">
                <p>
                  Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die
                  Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt die
                  gesetzliche Regelung.
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 md:gap-6 items-start md:items-center">
                <p className="text-slate-500 text-xs italic leading-relaxed min-w-0">
                  Ergänzende Informationen zu Datenschutz, Drittanbietern und Partnerstrecken findest du zusätzlich in
                  unserer Datenschutzerklärung und im Impressum.
                </p>
                <a
                  href="mailto:kontakt@example.com"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-colors hover:border-secondary/30 hover:text-primary md:justify-self-end"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">kontakt@example.com</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AGB;
