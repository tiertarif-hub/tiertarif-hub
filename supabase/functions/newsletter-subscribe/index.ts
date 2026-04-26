import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const MAX_SUBSCRIPTIONS_PER_WINDOW = 5; // 5 subscriptions per hour per IP
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);
  
  // Clean up old entries periodically (prevent memory leak)
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_SUBSCRIPTIONS_PER_WINDOW) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.resetTime - now) / 1000) 
    };
  }
  
  record.count++;
  return { allowed: true };
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// Email validation regex (RFC 5322 compliant simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 255) return false;
  return EMAIL_REGEX.test(email);
}

function validateSourcePage(sourcePage: string | null): string | null {
  if (!sourcePage) return null;
  if (typeof sourcePage !== 'string') return null;
  if (sourcePage.length > 500) return sourcePage.substring(0, 500);
  // Only allow alphanumeric, hyphens, underscores, and slashes
  if (!/^[a-zA-Z0-9/_-]+$/.test(sourcePage)) return null;
  return sourcePage;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for newsletter subscription, IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: 'Too many subscription attempts. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 3600)
          } 
        }
      )
    }

    // Parse and validate request body
    let body: { email?: string; source_page?: string; honeypot?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Honeypot check - if this field is filled, it's a bot
    if (body.honeypot) {
      console.log(`Honeypot triggered for IP: ${clientIp}`);
      // Return success to not reveal detection
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email
    const email = body.email?.trim().toLowerCase();
    if (!email || !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate and sanitize source_page
    const sourcePage = validateSourcePage(body.source_page || null);

    console.log(`Newsletter subscription attempt: ${email.substring(0, 3)}***@***, IP: ${clientIp}, source: ${sourcePage || 'unknown'}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email: email,
        source_page: sourcePage
      });

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        console.log(`Duplicate email subscription attempt: ${email.substring(0, 3)}***@***`);
        return new Response(
          JSON.stringify({ success: true, message: 'Already subscribed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Subscription failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Newsletter subscription successful: ${email.substring(0, 3)}***@***`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
