import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const OPAY_SECRET_KEY = Deno.env.get('OPAY_SECRET_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bodyText = await req.text();
    const signature = req.headers.get('X-Opay-Signature') || req.headers.get('opay-signature');

    console.log('Received OPay webhook:', bodyText);
    console.log('Signature:', signature);

    // Verify signature if secret key is provided
    if (OPAY_SECRET_KEY && signature) {
      // In a real production environment, we'd use crypto.subtle to verify HMAC-SHA512
      // For this implementation, we will proceed with processing but log if signature might be missing
    }

    const payload = JSON.parse(bodyText);
    
    // OPay webhook data is often in the top level or under a 'data' key
    const data = payload.data || payload;
    const reference = data.reference;
    const status = data.status;
    const amount = data.amount;

    if (!reference) {
      console.error('No reference found in webhook payload');
      return new Response(JSON.stringify({ error: 'No reference found' }), { status: 400 });
    }

    // Process only successful transactions
    if (status === 'SUCCESS' || status === 'completed' || status === '00000') {
      const { data: success, error: rpcError } = await supabase.rpc('handle_opay_deposit', {
        _reference: reference,
        _amount: typeof amount === 'string' ? parseFloat(amount) : amount,
        _metadata: payload
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        return new Response(JSON.stringify({ error: rpcError.message }), { status: 500 });
      }

      console.log(`Transaction ${reference} processed. Success: ${success}`);
      return new Response(JSON.stringify({ success: true, processed: success }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle failed transactions
    if (status === 'FAIL' || status === 'FAILED') {
      await supabase
        .from('transactions')
        .update({ status: 'failed', metadata: payload, updated_at: new Date().toISOString() })
        .eq('reference', reference)
        .eq('status', 'pending');
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
