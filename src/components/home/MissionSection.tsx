import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeContent } from "@/hooks/useSettings";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";
import { Link } from "react-router-dom";
import { ClipboardCheck, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";

const focusCards = [
  {
    title: "Hunde",
    text: "Kranken- und OP-Schutz mit Blick auf Rasse, GOT, Wartezeit und Erstattung prüfen.",
    to: "/hundekrankenversicherung-vergleich",
  },
  {
    title: "Katzen",
    text: "Zahn-OP, FORL, Vollschutz, Wartezeiten und Kostenpunkte sachlich einordnen.",
    to: "/katzenversicherung-vergleich",
  },
  {
    title: "Pferde",
    text: "OP-Schutz, Kolik, Klinikwahl, Standgeld und Haftpflichtthemen gezielt prüfen.",
    to: "/pferde-op-versicherung-vergleich",
  },
] as const;

export function MissionSection() {
  const { content } = useHomeContent();

  const missionImage = content.mission?.image_enabled !== false
    ? String(content.mission?.image_url || "").trim()
    : "";

  const missionImageSrc = missionImage
    ? optimizeSupabaseImageUrl(missionImage, 1200, 84) || missionImage
    : "";

  const missionImageAlt = String(
    content.mission?.image_alt || "Hund, Katze und Pferd als Symbol für sachliche Tierversicherungsvergleiche"
  ).trim();

  return (
    <section id="mission" className="relative overflow-hidden bg-[#f7fbf8] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-9rem] top-[-7rem] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-9rem] right-[-7rem] h-96 w-96 rounded-full bg-secondary/12 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="flex h-full flex-col space-y-7">
            <div className="space-y-5">
              <Badge className="rounded-full border border-secondary/25 bg-secondary/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary shadow-sm">
                Unsere Mission
              </Badge>
              <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-primary sm:text-4xl lg:text-5xl">
                TierTarif macht Tierversicherungen verständlicher.
              </h2>
              <p className="max-w-2xl text-lg font-medium leading-8 text-muted-foreground">
                Tierarztkosten, Wartezeiten und Leistungsgrenzen sind für viele Tierhalter schwer vergleichbar. TierTarif schafft dafür einen ruhigen Einstieg: Du findest Informationen zu Hunde-, Katzen- und Pferdeversicherungen, kannst wichtige Tarifmerkmale prüfen und gelangst von dort zu passenden Vergleichsmöglichkeiten.
              </p>
            </div>

            {missionImageSrc && (
              <figure className="group relative min-h-[460px] flex-1 overflow-hidden rounded-[2rem] border border-secondary/20 bg-white/80 p-2 shadow-xl shadow-primary/5 ring-1 ring-white/70 backdrop-blur-sm lg:min-h-[680px]">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/12 via-transparent to-primary/10 opacity-70" />
                <div className="relative h-full w-full overflow-hidden rounded-[1.55rem]">
                  <img
                    src={missionImageSrc}
                    alt={missionImageAlt}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.015]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </figure>
            )}
          </div>

          <Card className="h-full rounded-[2rem] border-primary/10 bg-white/95 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <CardContent className="space-y-7 p-6 sm:p-8 lg:p-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/12 text-primary ring-1 ring-secondary/25">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-primary">
                    Orientierung statt Einzelberatung
                  </h3>
                </div>
                <p className="text-base font-medium leading-8 text-muted-foreground">
                  TierTarif ist Informationsgeber und kein Versicherungsmakler. Die Inhalte sollen dir helfen, Unterschiede zwischen Tarifarten, Leistungsbausteinen und Bedingungen schneller zu verstehen. Eine individuelle Beratung oder eine verbindliche Tarifauswahl ersetzen sie nicht. Maßgeblich bleiben immer die Vertragsbedingungen des jeweiligen Anbieters.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {focusCards.map((card) => (
                  <Link
                    key={card.to}
                    to={card.to}
                    className="group rounded-2xl border border-primary/10 bg-[#FAF7F0]/70 p-5 transition-all hover:-translate-y-0.5 hover:border-secondary/35 hover:bg-secondary/10 hover:shadow-lg hover:shadow-secondary/10"
                  >
                    <div className="text-sm font-extrabold text-primary">{card.title}</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{card.text}</p>
                    <span className="mt-4 inline-flex text-xs font-extrabold uppercase tracking-wider text-secondary transition-transform group-hover:translate-x-1">
                      Vergleich öffnen →
                    </span>
                  </Link>
                ))}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/70 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-secondary" />
                    <h3 className="text-lg font-extrabold text-primary">Warum Risiken je Tierart anders sind</h3>
                  </div>
                  <p className="text-sm font-medium leading-7 text-muted-foreground">
                    Hunde, Katzen und Pferde verursachen unterschiedliche Kostenrisiken. Bei Hunden können Rasse, Gelenke, OP-Schutz und Vollschutz entscheidend sein. Bei Katzen stehen häufig Zahnleistungen, FORL, chronische Erkrankungen und Wartezeiten im Fokus. Bei Pferden geht es oft um hohe OP-Kosten, Kolik, Transportfähigkeit, Klinikwahl und Standgeld.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-secondary" />
                    <h3 className="text-lg font-extrabold text-primary">Wie der Vergleichs-Check hilft</h3>
                  </div>
                  <p className="text-sm font-medium leading-7 text-muted-foreground">
                    Der Vergleichs-Check führt dich zuerst zur passenden Tierart. Danach kannst du Leistungen, Kostenpunkte, Wartezeiten, Selbstbeteiligung, GOT-Erstattung und Ausschlüsse sachlich prüfen. Weitere Details zur Einordnung findest du auch auf der Seite <Link to="/wie-wir-vergleichen" className="font-extrabold text-primary underline decoration-secondary/50 underline-offset-4 hover:text-secondary">Wie wir vergleichen</Link>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-secondary/25 bg-secondary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-bold leading-7 text-primary">
                    Starte mit der passenden Tierart und prüfe Tarifdetails ohne unnötige Versprechen.
                  </p>
                </div>
                <Link
                  to="/#schwerpunkte"
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  Bereiche ansehen
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
