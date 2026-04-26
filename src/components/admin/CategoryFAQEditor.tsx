import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CategoryInput } from "@/lib/schemas";

interface FAQItem {
  question: string;
  answer: string;
}

interface CategoryFAQEditorProps {
  form: UseFormReturn<CategoryInput>;
}

export function CategoryFAQEditor({ form }: CategoryFAQEditorProps) {
  // SAFETY CHECK: Verhindert den Absturz, falls form undefined ist
  if (!form) {
    return <div className="p-4 text-red-500 bg-red-50 rounded">Fehler: Formular-Kontext fehlt für FAQ Editor.</div>;
  }

  // Watch ensures we always see current data
  const faqs = (form.watch("faq_data") as FAQItem[]) || [];

  const addFAQ = () => {
    const current = form.getValues("faq_data") || [];
    // Force update with new item
    form.setValue("faq_data", [...current, { question: "", answer: "" }], { 
        shouldValidate: true, 
        shouldDirty: true,
        shouldTouch: true 
    });
  };

  const removeFAQ = (index: number) => {
    const current = [...faqs];
    current.splice(index, 1);
    form.setValue("faq_data", current, { shouldValidate: true, shouldDirty: true });
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const current = [...faqs];
    current[index] = { ...current[index], [field]: value };
    form.setValue("faq_data", current, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div>
            <h3 className="font-bold text-blue-900">FAQ Manager</h3>
            <p className="text-sm text-blue-700">Erstelle hier die Fragen & Antworten. Sie werden automatisch zentriert angezeigt.</p>
        </div>
        <Button onClick={addFAQ} type="button" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Frage hinzufügen
        </Button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm relative group bg-white">
            <CardContent className="p-4 pt-5 space-y-4">
                <div className="absolute right-2 top-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" type="button" onClick={() => removeFAQ(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                
                <div className="flex gap-4 items-start">
                    <div className="pt-3 cursor-move text-gray-300">
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Frage</Label>
                            <Input 
                                placeholder="z.B. Ist die Anmeldung kostenlos?" 
                                value={faq.question} 
                                onChange={(e) => updateFAQ(index, "question", e.target.value)}
                                className="font-bold border-gray-200 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Antwort</Label>
                            <Textarea 
                                placeholder="Antworttext hier eingeben..." 
                                value={faq.answer} 
                                onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                                rows={2}
                                className="resize-y min-h-[60px] border-gray-200 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && (
            <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 bg-gray-50/50">
                <p>Noch keine Fragen angelegt.</p>
                <Button variant="link" onClick={addFAQ} className="text-blue-600">Erste Frage erstellen</Button>
            </div>
        )}
      </div>
    </div>
  );
}