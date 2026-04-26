import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Plus, Trash2, ArrowUp, ArrowDown, MessageSquareQuote } from "lucide-react";

type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type HomeFaqSection = {
  badge?: string;
  headline?: string;
  subheadline?: string;
  items?: HomeFaqItem[];
};

type HomeFAQEditorProps = {
  value: HomeFaqSection;
  onChange: (field: keyof HomeFaqSection, value: any) => void;
};

const createFaqItem = (): HomeFaqItem => ({
  id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  question: "Neue Frage",
  answer: "<p>Antwort hier eintragen...</p>",
});

export function HomeFAQEditor({ value, onChange }: HomeFAQEditorProps) {
  const faqItems = Array.isArray(value?.items) ? value.items : [];

  const setItems = (items: HomeFaqItem[]) => onChange("items", items);

  const addFaq = () => setItems([...faqItems, createFaqItem()]);

  const updateFaq = (index: number, field: keyof HomeFaqItem, fieldValue: string) => {
    const nextItems = [...faqItems];
    nextItems[index] = {
      ...nextItems[index],
      [field]: fieldValue,
    };
    setItems(nextItems);
  };

  const removeFaq = (index: number) => {
    const nextItems = [...faqItems];
    nextItems.splice(index, 1);
    setItems(nextItems);
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqItems.length) return;

    const nextItems = [...faqItems];
    [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
    setItems(nextItems);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Badge</Label>
          <Input
            value={value?.badge || ""}
            onChange={(event) => onChange("badge", event.target.value)}
            placeholder="FAQ • Startseite"
          />
        </div>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input
            value={value?.headline || ""}
            onChange={(event) => onChange("headline", event.target.value)}
            placeholder="Häufige Fragen zu Portal"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Einleitung</Label>
        <Input
          value={value?.subheadline || ""}
          onChange={(event) => onChange("subheadline", event.target.value)}
          placeholder="Kurzer Einleitungstext oberhalb der Fragen"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <MessageSquareQuote className="h-4 w-4 text-[#FF8400]" />
              Fragen & Antworten
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              Fragen hinzufügen, entfernen und in der Reihenfolge verschieben. Antworten laufen über den Textbaukasten mit Links und Bildern per URL.
            </p>
          </div>
          <Button type="button" onClick={addFaq} className="bg-[#FF8400] text-white hover:bg-[#e67700]">
            <Plus className="mr-2 h-4 w-4" /> Frage hinzufügen
          </Button>
        </div>

        <div className="mt-5 space-y-5">
          {faqItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Noch keine FAQ vorhanden.
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={addFaq}>
                  <Plus className="mr-2 h-4 w-4" /> Erste Frage anlegen
                </Button>
              </div>
            </div>
          ) : (
            faqItems.map((item, index) => (
              <div key={item.id || `home-faq-item-${index}`} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">FAQ #{index + 1}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">Reihenfolge, Frage und Antwort direkt hier pflegen</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveFaq(index, "up")} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveFaq(index, "down")} disabled={index === faqItems.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeFaq(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 px-4 py-5 sm:px-5 sm:py-6">
                  <div className="space-y-2">
                    <Label>Frage</Label>
                    <Input
                      value={item.question || ""}
                      onChange={(event) => updateFaq(index, "question", event.target.value)}
                      placeholder="z. B. Was ist Portal?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Antwort</Label>
                    <RichTextEditor
                      value={item.answer || ""}
                      onChange={(nextValue) => updateFaq(index, "answer", nextValue)}
                      className="min-h-[240px]"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
