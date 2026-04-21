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
    const path = url.pathname.split('/').filter(Boolean).pop()

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Invalid token')

    switch (path) {
      case 'balance': {
        const { data, error } = await supabase
          .from('users')
          .select('chx_balance, usdc_balance, wallet_address')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'escrow': {
        const { match_id, amount } = await req.json()
        
        // 1. Check if user has enough balance
        const { data: profile } = await supabase.from('users').select('usdc_balance').eq('id', user.id).single()
        if (!profile || Number(profile.usdc_balance) < Number(amount)) {
          throw new Error('Insufficient balance for escrow')
        }

        // 2. Atomic Update: Deduct balance and create escrow record
        // In a production app, use a RPC/database function for atomicity.
        // For this demo/skeleton, we'll do sequential updates.
        const { error: updateError } = await supabase
          .from('users')
          .update({ usdc_balance: Number(profile.usdc_balance) - Number(amount) })
          .eq('id', user.id)

        if (updateError) throw updateError

        await supabase.from('escrow_records').insert({
          match_id,
          user_id: user.id,
          amount_usdc: amount,
          status: 'held'
        })

        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: amount,
          type: 'escrow_hold',
          direction: 'out',
          notes: `Stake for match ${match_id}`
        })

        return new Response(JSON.stringify({ status: 'success', message: 'Funds held in escrow' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'payout': {
        // Payout logic: Usually triggered by match completion trigger or admin
        // For simplicity, we implement it here as an endpoint.
        const { match_id } = await req.json()
        
        const { data: match } = await supabase.from('matches').select('*').eq('id', match_id).single()
        if (!match || match.status !== 'completed') throw new Error('Match not found or not completed')

        const winnerId = match.result === 'white' ? match.white_user_id : (match.result === 'black' ? match.black_user_id : null)
        const totalStake = Number(match.stake_usdc) * 2

        if (winnerId) {
          // Add to winner's balance
          const { data: winProfile } = await supabase.from('users').select('usdc_balance').eq('id', winnerId).single()
          await supabase.from('users').update({ usdc_balance: Number(winProfile?.usdc_balance ?? 0) + totalStake }).eq('id', winnerId)
          
          await supabase.from('transactions').insert({
            user_id: winnerId,
            amount: totalStake,
            type: 'match_payout',
            direction: 'in',
            notes: `Winning from match ${match_id}`
          })
        } else {
          // Draw: Refund both
          // ... refund logic ...
        }

        await supabase.from('escrow_records').update({ status: 'released', resolved_at: new Date().toISOString() }).eq('match_id', match_id)

        return new Response(JSON.stringify({ status: 'success', message: 'Payout processed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      default:
        return new Response(JSON.stringify({ error: `Not found: ${path}` }), {
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
