import { useHomeContent } from "@/hooks/useSettings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { sanitizeCmsHtmlWithBreaks } from "@/lib/sanitizeHtml";
import { Check } from "lucide-react";

export function HomeFAQSection() {
  const { content } = useHomeContent();
  const faqSection = content.home_faq;
  const faqItems = Array.isArray(faqSection?.items)
    ? faqSection.items.filter((item: any) => String(item?.question || "").trim().length > 0)
    : [];

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section id="home-faq" className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_18px_60px_hsl(var(--primary)/0.07)] sm:p-8 lg:p-10">
          <div className="max-w-3xl space-y-4">
            {faqSection?.badge ? (
              <Badge className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary shadow-sm">
                {faqSection.badge}
              </Badge>
            ) : null}
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {faqSection?.headline || "Häufige Fragen"}
            </h2>
            {faqSection?.subheadline ? (
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                {faqSection.subheadline}
              </p>
            ) : null}
          </div>

          <div className="mt-8 sm:mt-10">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((faq: any, index: number) => (
                <AccordionItem
                  key={faq.id || `home-faq-${index}`}
                  value={faq.id || `home-faq-${index}`}
                  className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_8px_30px_hsl(var(--primary)/0.05)] transition-all"
                >
                  <AccordionTrigger className="group px-5 py-5 text-left text-lg font-bold text-foreground transition-colors hover:text-secondary hover:no-underline sm:px-6 [&>svg]:hidden">
                    <div className="flex w-full items-center justify-between gap-5">
                      <span className="pr-2 leading-snug">{faq.question}</span>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 shadow-[inset_0_2px_8px_hsl(var(--card)/0.8),0_10px_24px_hsl(var(--primary)/0.12)] transition-all duration-300 group-hover:scale-[1.04] group-data-[state=open]:border-secondary/60 group-data-[state=open]:shadow-[inset_0_3px_12px_hsl(var(--card)/0.85),0_14px_32px_hsl(var(--secondary)/0.18)]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-[0_6px_16px_hsl(var(--secondary)/0.28)] transition-transform duration-300 group-data-[state=open]:scale-110 group-data-[state=open]:rotate-[6deg]">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border px-5 pb-7 pt-5 text-[16px] leading-8 text-muted-foreground sm:px-6 sm:pb-8">
                    <div
                      className="home-faq-answer max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtmlWithBreaks(String(faq.answer || "")) }}
                    />
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
