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

      case 'transactions': {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'withdraw': {
        const { amount, currency, destination_address } = await req.json()
        // TODO: Implement on-chain withdrawal logic (Safe, Base SDK, etc.)
        return new Response(JSON.stringify({ status: 'pending', message: 'Withdrawal initiated' }), {
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
