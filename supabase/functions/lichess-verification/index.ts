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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    switch (path) {
      case 'initiate': {
        const { lichess_username } = await req.json()
        if (!lichess_username) throw new Error('Missing lichess_username')

        // Generate challenge code (SIWE-style or simple bio code)
        const challenge_code = `chessx-verify-${crypto.randomUUID().slice(0, 8)}`

        const { data, error } = await supabase
          .from('lichess_verifications')
          .insert({
            user_id: user.id,
            lichess_username,
            challenge_code,
            method: 'bio_code',
            status: 'pending'
          })
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ challenge_code, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'confirm': {
        const { verification_id } = await req.json()
        if (!verification_id) throw new Error('Missing verification_id')

        // Fetch the verification record
        const { data: v, error: vError } = await supabase
          .from('lichess_verifications')
          .select('*')
          .eq('id', verification_id)
          .single()

        if (vError || !v) throw new Error('Verification not found')

        // TODO: Call Lichess API to check bio/profile
        // Example: https://lichess.org/api/user/{username}
        // Check if v.challenge_code is in the bio
        
        const isVerified = true // Mocked for skeleton

        if (isVerified) {
          await supabase
            .from('lichess_verifications')
            .update({ status: 'passed', verified_at: new Date().toISOString() })
            .eq('id', verification_id)

          await supabase
            .from('users')
            .update({ 
                lichess_username: v.lichess_username, 
                lichess_verified_at: new Date().toISOString() 
            })
            .eq('id', user.id)
        }

        return new Response(JSON.stringify({ success: isVerified }), {
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
