import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleAuth } from "npm:google-auth-library@9.6.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight für den Browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { urls } = await req.json()
    if (!urls || !Array.isArray(urls)) {
        throw new Error("Keine URLs übergeben.")
    }

    // Secrets sicher aus dem Supabase Backend laden
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')
    // WICHTIG: Supabase/Deno Escaping für den Private Key fixen
    const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n')

    if (!clientEmail || !privateKey) {
      throw new Error("Google Credentials fehlen in den Supabase Secrets.")
    }

    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const results = [];

    console.log(`🚀 Starte Ping für ${urls.length} URLs...`);

    // Alle URLs durchgehen und Google v3 API pingen
    for (const url of urls) {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      });

      const text = await response.text();
      if (response.ok) {
        results.push({ url, success: true, message: "OK" });
      } else {
        // Googles HTML Fehlermeldung extrahieren
        const match = text.match(/<title>(.*?)<\/title>/i);
        const errMsg = match ? match[1] : "Unbekannter Fehler von Google";
        results.push({ url, success: false, message: errMsg });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})