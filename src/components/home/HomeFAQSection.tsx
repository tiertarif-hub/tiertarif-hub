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
    <section id="home-faq" className="w-full bg-[#f8fafc] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
          <div className="max-w-3xl space-y-4">
            {faqSection?.badge ? (
              <Badge className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF8400] shadow-sm">
                {faqSection.badge}
              </Badge>
            ) : null}
            <h2 className="text-3xl font-black tracking-tight text-[#0A0F1C] sm:text-4xl">
              {faqSection?.headline || "Häufige Fragen"}
            </h2>
            {faqSection?.subheadline ? (
              <p className="text-base leading-8 text-slate-600 sm:text-lg">
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
                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all"
                >
                  <AccordionTrigger className="group px-5 py-5 text-left text-lg font-bold text-[#0A0F1C] transition-colors hover:text-[#FF8400] hover:no-underline sm:px-6 [&>svg]:hidden">
                    <div className="flex w-full items-center justify-between gap-5">
                      <span className="pr-2 leading-snug">{faq.question}</span>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(255,132,0,0.16)_58%,rgba(255,132,0,0.28))] shadow-[inset_0_2px_8px_rgba(255,255,255,0.75),0_10px_24px_rgba(255,132,0,0.20)] transition-all duration-300 group-hover:scale-[1.04] group-data-[state=open]:border-[#FF8400] group-data-[state=open]:shadow-[inset_0_3px_12px_rgba(255,255,255,0.85),0_14px_32px_rgba(255,132,0,0.26)]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8400] text-white shadow-[0_6px_16px_rgba(255,132,0,0.38)] transition-transform duration-300 group-data-[state=open]:scale-110 group-data-[state=open]:rotate-[6deg]">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-slate-200 px-5 pb-7 pt-5 text-[16px] leading-8 text-slate-700 sm:px-6 sm:pb-8">
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
