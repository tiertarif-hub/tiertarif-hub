import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type PublishBody = {
  targetId: string;
  html: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const bridgeSharedSecret = Deno.env.get("BRIDGE_SHARED_SECRET");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !bridgeSharedSecret) {
      return new Response(JSON.stringify({ error: "Missing required environment variables" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const body = (await req.json()) as PublishBody;

    if (!body?.targetId || !body?.html) {
      return new Response(JSON.stringify({ error: "Missing targetId or html" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: adminRole, error: roleError } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "ADMIN")
      .maybeSingle();

    if (roleError || !adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const { data: target, error: targetError } = await adminClient
      .from("deployment_targets")
      .select("id, name, bridge_url")
      .eq("id", body.targetId)
      .single();

    if (targetError || !target?.bridge_url) {
      return new Response(JSON.stringify({ error: "Deployment target not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const bridgeResponse = await fetch(target.bridge_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bridge-key": bridgeSharedSecret,
      },
      body: JSON.stringify({
        api_key: bridgeSharedSecret,
        html: body.html,
        target_id: target.id,
        target_name: target.name,
      }),
    });

    const responseText = await bridgeResponse.text();

    if (!bridgeResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Bridge request failed",
          status: bridgeResponse.status,
          response: responseText,
        }),
        {
          status: 502,
          headers: corsHeaders,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        target: target.name,
        response: responseText,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});