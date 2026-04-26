import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Request Body ist leer oder ungültiges JSON");
    }

    const { keyword, mode = 'content', wordCount = 1000 } = body;
    
    const openAiKey = Deno.env.get('LOVABLE_API_KEY'); 
    if (!openAiKey) {
      throw new Error("Server-Konfiguration fehlt: LOVABLE_API_KEY");
    }

    console.log(`Verarbeite: ${keyword} (Mode: ${mode})`);

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === 'faq') {
      systemPrompt = `
        Du bist ein Experte. Erstelle 5-7 FAQs zum Thema "${keyword}".
        Antworte NUR mit validem JSON.
        Format: { "faqs": [ { "question": "...", "answer": "..." } ] }
      `;
      userPrompt = `FAQs für: ${keyword}`;
    } else {
      systemPrompt = `
        Du bist Redakteur. Thema: "${keyword}".
        Erstelle Content als JSON: { "contentTop": "HTML", "contentBottom": "HTML" }.
        Regel: Nutze HTML mit class="text-center". KEINE FAQs im Text.
        Umfang: ca. ${wordCount} Wörter.
      `;
      userPrompt = `Schreibe Artikel über: ${keyword}`;
    }

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API Fehler:", errText);
      throw new Error(`KI-Dienst antwortet nicht (Status ${response.status})`);
    }

    const aiData = await response.json();
    let content = aiData.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(content);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      jsonResponse = { 
        contentTop: `<div class="text-center"><p>${content}</p></div>`, 
        contentBottom: "",
        faqs: [] 
      };
    }

    return new Response(
      JSON.stringify(jsonResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Critical Function Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});