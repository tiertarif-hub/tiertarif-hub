import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GeneratedContent {
  contentTop: string;
  contentBottom: string;
  faqs: any[];
  city: string;
  keyword: string;
  wordCount: number;
}

export function useGenerateCityContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (
    city: string,
    keyword: string = "Dating",
    wordCount: number = 1000
  ): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`Starte Generierung für Keyword: ${keyword}...`);

      const { data, error: fnError } = await supabase.functions.invoke("generate-city-content", {
        body: { 
          keyword,      
          wordCount,    
          mode: 'content' 
        },
      });

      if (fnError) throw new Error(fnError.message);
      
      let contentTop = "";
      let contentBottom = "";
      
      if (typeof data === 'object' && data !== null && !data.error) {
          contentTop = data.contentTop || "";
          contentBottom = data.contentBottom || "";
      } else if (typeof data === 'string') {
          try {
              const cleanData = data.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleanData);
              contentTop = parsed.contentTop || "";
              contentBottom = parsed.contentBottom || "";
          } catch (e) {
              console.warn("Parsing Fallback", e);
              contentTop = data;
          }
      }

      // Cleanup HTML & Zentrierung Helper
      const wrapCentered = (html: string) => {
        if (!html) return "";
        let clean = html.replace(/```html/g, "").replace(/```/g, "").trim();
        if (!clean.includes('text-center')) {
            return `<div class="text-center space-y-4 force-center">\n${clean}\n</div>`;
        }
        return clean;
      };

      const finalResult: GeneratedContent = {
        contentTop: wrapCentered(contentTop),
        contentBottom: wrapCentered(contentBottom),
        faqs: [], // Leeres Array, da nur Content
        city,
        keyword,
        wordCount
      };

      return finalResult;

    } catch (err) {
      console.error("Generierungsfehler:", err);
      toast({ title: "Fehler", description: "KI-Generierung fehlgeschlagen.", variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateContent, isGenerating, error };
}