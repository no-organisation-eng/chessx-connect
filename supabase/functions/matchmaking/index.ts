import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Invalid token')

    switch (path) {
      case 'queue': {
        const { time_control, stake_usdc } = await req.json()
        
        // TODO: Implement queue logic. 
        // For now, we'll just check for any "open" match_invites that match the criteria
        // or create a new one.
        
        return new Response(JSON.stringify({ status: 'queued', entry_id: crypto.randomUUID() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'status': {
        // TODO: Check if a match has been found
        return new Response(JSON.stringify({ match_id: null, message: 'Still searching...' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
