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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Invalid token')

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Map Auth ID to Internal DB UUID
    const { data: profile } = await supabase
      .from('users')
      .select('id, usdc_balance, platform_rating, username')
      .eq('user_id', user.id)
      .single()

    if (!profile) throw new Error('Missing profile')

    switch (path) {
      case 'queue': {
        const { time_control, stake_usdc, time_seconds, increment_seconds } = await req.json()

        // 1. Check balance
        if (Number(profile.usdc_balance) < Number(stake_usdc)) {
          throw new Error('Insufficient USDC balance to join this stake level.')
        }

        // 2. Add to queue (upsert)
        await supabase
          .from('matchmaking_queue')
          .upsert({
            user_id: profile.id,
            elo: profile.platform_rating,
            stake_usdc: stake_usdc,
            time_control: time_control,
            time_seconds: time_seconds,
            increment_seconds: increment_seconds,
          })

        // 3. Pairing Attempt
        const { data: opponent } = await supabase
          .from('matchmaking_queue')
          .select('*')
          .neq('user_id', profile.id)
          .eq('stake_usdc', stake_usdc)
          .eq('time_control', time_control)
          .gte('elo', profile.platform_rating - 200)
          .lte('elo', profile.platform_rating + 200)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (opponent) {
          // Found match! Create the match record.
          const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
              white_user_id: profile.id, // Randomize in production
              black_user_id: opponent.user_id,
              white_username: profile.username,
              black_username: opponent.username, // Need to fetch opponent username if not in queue
              time_control: time_control,
              time_seconds: time_seconds,
              increment_seconds: increment_seconds,
              stake_usdc: stake_usdc,
              status: 'pending',
              started_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (!matchError) {
            // Remove both from queue
            await supabase.from('matchmaking_queue').delete().in('user_id', [profile.id, opponent.user_id])
            
            return new Response(JSON.stringify({ status: 'matched', match_id: match.id }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            })
          }
        }

        return new Response(JSON.stringify({ status: 'queued' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'cancel': {
        await supabase.from('matchmaking_queue').delete().eq('user_id', profile.id)
        return new Response(JSON.stringify({ status: 'cancelled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'status': {
        const { data: match } = await supabase
          .from('matches')
          .select('id, status')
          .or(`white_user_id.eq.${profile.id},black_user_id.eq.${profile.id}`)
          .neq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        return new Response(JSON.stringify({ match_id: match?.id || null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      default:
        throw new Error('Invalid endpoint')
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'unknown' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
