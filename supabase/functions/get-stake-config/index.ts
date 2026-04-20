// Returns the public stake config (treasury wallet + network) so the client
// can build a USDC transfer to the right address. No secrets returned.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const treasury = Deno.env.get('BASE_TREASURY_ADDRESS') ?? '';
  const network = (Deno.env.get('BASE_NETWORK') ?? 'base-sepolia') as 'base-sepolia' | 'base-mainnet';
  const configured = !!treasury && treasury !== '0x0000000000000000000000000000000000000000';
  return new Response(JSON.stringify({ treasury, network, configured }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
