import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AIProvider = "google" | "openai";

interface AIConfig {
  provider: AIProvider;
  googleKey: string;
  openaiKey: string;
}

export const useGenerateCategoryContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const getConfig = (): AIConfig => {
    return {
      provider: (localStorage.getItem("ai_provider") as AIProvider) || "google",
      googleKey: localStorage.getItem("ai_key_google") || "",
      openaiKey: localStorage.getItem("ai_key_openai") || "",
    };
  };

  // Wir suchen das beste Modell (Priorität auf Flash für Speed, Pro für Quality wenn verfügbar)
  const findBestGoogleModel = async (apiKey: string): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!response.ok) return "models/gemini-1.5-flash"; 
      const data = await response.json();
      const models = data.models || [];
      const textModels = models.filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"));
      
      const flash = textModels.find((m: any) => m.name.includes("flash"));
      const pro = textModels.find((m: any) => m.name.includes("gemini-1.5-pro"));
      const anyPro = textModels.find((m: any) => m.name.includes("pro"));
      
      // Flash ist oft stabiler verfügbar, daher Priorität 1
      if (flash) return flash.name;
      if (pro) return pro.name;
      if (anyPro) return anyPro.name;
      return "models/gemini-1.5-flash";
    } catch {
      return "models/gemini-1.5-flash";
    }
  };

  const generateCategoryContent = async (categoryName: string, topicPrompt: string) => {
    setIsGenerating(true);
    const config = getConfig();
    const finalTopic = topicPrompt || categoryName;
    console.log(`Starte Premium-Design-Mode (${config.provider}) für: ${finalTopic}`);

    // --- DER "MASTER-PROMPT" ---
    // Enthält Design-Vorgaben, Bild-Logik und Struktur
    const systemPrompt = `
      Du bist Lead-Designer und Chefredakteur dieses Portals.
      THEMA: "${finalTopic}"

      AUFGABE:
      Erstelle ein JSON-Objekt mit visuell beeindruckendem Content.
      Der Text muss "scannbar" sein (keine Textwüsten!). Nutze visuelle Anker.

      DESIGN & HTML VORGABEN (Tailwind CSS):
      1. **Highlight-Boxen (Blau)**: Für Tipps/Expertenwissen nutze:
         <div class="bg-blue-50 border-l-4 border-blue-500 p-5 my-6 rounded-r-lg shadow-sm">
           <h4 class="text-blue-700 font-bold text-lg mb-1 flex items-center gap-2">💡 Redaktioneller Tipp</h4>
           <p class="text-slate-700 text-sm leading-relaxed">DEIN TEXT...</p>
         </div>

      2. **Warn-Boxen (Rot)**: Für Risiken/Warnungen nutze:
         <div class="bg-red-50 border-l-4 border-red-500 p-5 my-6 rounded-r-lg shadow-sm">
           <h4 class="text-red-700 font-bold text-lg mb-1 flex items-center gap-2">⚠️ Achtung</h4>
           <p class="text-slate-700 text-sm leading-relaxed">DEINE WARNUNG...</p>
         </div>

      3. **Checklisten (Grün)**: Statt normaler Listen nutze:
         <ul class="space-y-2 my-6">
           <li class="flex items-start gap-3 p-2 bg-green-50/50 rounded-lg"><span class="text-green-600 font-bold text-lg">✓</span> <span class="text-slate-700 font-medium">POSITIVER PUNKT 1</span></li>
           <li class="flex items-start gap-3 p-2 bg-green-50/50 rounded-lg"><span class="text-green-600 font-bold text-lg">✓</span> <span class="text-slate-700 font-medium">POSITIVER PUNKT 2</span></li>
         </ul>

      4. **CTA Button**: Baue mitten im Text einmal diesen Button ein:
         <div class="my-8 text-center">
           <a href="#vergleich" class="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:-translate-y-1">🏆 Zur Top-Empfehlung springen</a>
         </div>

      STRUKTUR DES ARTIKELS:
      1. **Intro**: Starker Einstieg (Textmarker-Effekt nutzen: <span class="bg-yellow-200 px-1">Wichtiges Keyword</span>).
      2. **Deep Dive (H2)**: Fachwissen. Setze hier eine "Experten-Box" ein.
      3. **Vergleich/Analyse (H2)**: Nutze hier die "Grüne Checkliste".
      4. **Kritik (H2)**: Nutze hier die "Rote Warn-Box".
      5. **Fazit (H2)**: Zusammenfassung.

      BILDER REGELN (Pollinations Flux):
      - Füge 2-3 Bilder ein.
      - URL: https://image.pollinations.ai/prompt/KEYWORD?width=1080&height=720&nologo=true&model=flux
      - (Ersetze KEYWORD durch ein englisches Wort, z.B. 'business meeting', 'dating couple', 'bitcoin chart').

      OUTPUT FORMAT (JSON Only):
      {
        "htmlContent": "HTML STRING...",
        "faqData": [
          { "question": "Frage 1?", "answer": "Antwort 1." },
          { "question": "Frage 2?", "answer": "Antwort 2." },
          { "question": "Frage 3?", "answer": "Antwort 3." },
          { "question": "Frage 4?", "answer": "Antwort 4." },
          { "question": "Frage 5?", "answer": "Antwort 5." }
        ]
      }
    `;

    try {
      // Wir schießen den Payload direkt sicher an unsere Edge Function
      const { data, error } = await supabase.functions.invoke("tiertarif-ai", {
        body: { 
          topic: finalTopic,
          systemPrompt: systemPrompt
        }
      });

      if (error) throw new Error(`Server API Fehler: ${error.message}`);
      if (!data || !data.contentTop) throw new Error("Keine Textantwort von der KI erhalten.");

      // Die KI liefert unseren JSON-String innerhalb von contentTop zurück
      const rawText = data.contentTop;
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      return { 
        contentTop: parsedData.htmlContent, 
        contentBottom: "",
        faqData: parsedData.faqData 
      };

    } catch (error: any) {
      console.error("KI Fehler:", error);
      toast({ title: "Fehler bei der KI-Generierung", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateCategoryContent, isGenerating };
};