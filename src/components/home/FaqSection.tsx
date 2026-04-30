import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TIERTARIF_HOME_FAQ_ITEMS, TIERTARIF_HOME_FAQ_SCHEMA } from "@/lib/tiertarifHomeContent";
import { CheckCircle2 } from "lucide-react";

export function FaqSection() {
  return (
    <section id="home-faq" className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TIERTARIF_HOME_FAQ_SCHEMA) }}
      />

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-primary/10 bg-card p-5 shadow-[0_18px_60px_hsl(var(--primary)/0.07)] sm:p-8 lg:p-10">
          <div className="max-w-3xl space-y-4">
            <Badge className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-secondary shadow-sm">
              FAQ • TierTarif
            </Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              Häufige Fragen zu TierTarif
            </h2>
            <p className="text-base font-medium leading-8 text-muted-foreground sm:text-lg">
              Kompakte Antworten zu Tiervergleichen, OP-Schutz, Krankenversicherung, GOT und der Rolle von TierTarif als Informationsportal.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            <Accordion type="single" collapsible className="space-y-4">
              {TIERTARIF_HOME_FAQ_ITEMS.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_8px_30px_hsl(var(--primary)/0.05)] transition-all"
                >
                  <AccordionTrigger className="group px-5 py-5 text-left text-base font-extrabold text-foreground transition-colors hover:text-secondary hover:no-underline sm:px-6 sm:text-lg [&>svg]:hidden">
                    <div className="flex w-full items-center justify-between gap-5">
                      <span className="pr-2 leading-snug">{faq.question}</span>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 transition-all duration-300 group-hover:scale-[1.04] group-data-[state=open]:border-secondary/60">
                        <CheckCircle2 className="h-5 w-5 text-primary transition-transform duration-300 group-data-[state=open]:scale-110" />
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border px-5 pb-7 pt-5 text-[16px] font-medium leading-8 text-muted-foreground sm:px-6 sm:pb-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
