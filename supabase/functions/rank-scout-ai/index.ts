import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { topic, keyword, systemPrompt } = body;
    const finalTopic = topic || keyword || "Allgemeines Thema";

    // 1. Lokale API Config (via Deno Env, Fallback auf unsere Werte)
    const ollamaUrl = Deno.env.get('OLLAMA_API_URL');
const ollamaKey = Deno.env.get('OLLAMA_API_KEY');

if (!ollamaUrl || !ollamaKey) {
  throw new Error("OLLAMA_API_URL oder OLLAMA_API_KEY fehlt.");
}

    console.log(`[LOKAL] Rank-Scout AI (Llama 3) für: ${finalTopic}`);

    // 2. Prompt
    const defaultSystem = "Du bist Redakteur. Schreibe HTML.";
    const combinedPrompt = `${systemPrompt || defaultSystem}\n\nAUFGABE: Schreibe über "${finalTopic}". Nur HTML.`;

    // 3. Request (Lokal Ollama)
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ollamaKey}`
      },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt: combinedPrompt,
        stream: false
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama API Error: ${err}`);
    }

    const data = await response.json();
    let content = data.response;
    
    if (!content) throw new Error("Kein Text von Llama 3 erhalten.");

    content = content.replace(/```html/g, '').replace(/```/g, '').trim();

    return new Response(JSON.stringify({ contentTop: content, contentBottom: "" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Server Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});