import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiting (per-request basis)
// In production, use Redis or similar for distributed rate limiting
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.resetTime - now) / 1000) 
    };
  }
  
  record.count++;
  return { allowed: true };
}

function getClientIp(req: Request): string {
  // Try various headers for the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  // Fallback (won't be accurate behind proxy, but better than nothing)
  return 'unknown';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          } 
        }
      )
    }

    const url = new URL(req.url)
    const slug = url.searchParams.get('slug')

    if (!slug) {
      console.error('No slug provided')
      return new Response(
        JSON.stringify({ error: 'Slug parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate slug format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(slug) || slug.length > 100) {
      console.error('Invalid slug format:', slug)
      return new Response(
        JSON.stringify({ error: 'Invalid slug format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing redirect for slug: ${slug}, IP: ${clientIp}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Increment click and get target URL using the database function
    const { data: targetUrl, error } = await supabase.rpc('increment_redirect_click', {
      redirect_slug: slug
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Redirect not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!targetUrl) {
      console.error('No target URL found for slug:', slug)
      return new Response(
        JSON.stringify({ error: 'Redirect not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate target URL before redirecting
    try {
      const targetParsed = new URL(targetUrl);
      if (!['http:', 'https:'].includes(targetParsed.protocol)) {
        console.error('Invalid target URL protocol:', targetUrl)
        return new Response(
          JSON.stringify({ error: 'Invalid redirect target' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch {
      console.error('Invalid target URL format:', targetUrl)
      return new Response(
        JSON.stringify({ error: 'Invalid redirect target' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Redirecting ${slug} to ${targetUrl}`)

    // Return redirect response
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': targetUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
