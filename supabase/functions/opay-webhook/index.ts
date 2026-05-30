import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    console.log('OPay webhook invoked - checking credentials:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasOpaySecretKey: !!OPAY_SECRET_KEY,
    });

    const bodyText = await req.text();
    const signature = req.headers.get('X-Opay-Signature') || req.headers.get('opay-signature');

    console.log('Received OPay webhook body:', bodyText);
    console.log('Signature:', signature);

    // In a real production environment, you MUST verify the signature
    // if (OPAY_SECRET_KEY && signature) {
    //   const isValid = await verifyOpaySignature(bodyText, signature, OPAY_SECRET_KEY);
    //   if (!isValid) return new Response('Invalid signature', { status: 401 });
    // }

    const payload = JSON.parse(bodyText);
    
    // OPay webhook data structure can vary by API version
    // It usually has a 'payload' or 'data' or is the top level object
    const data = payload.payload || payload.data || payload;
    
    // For cashier/create, status might be in different fields
    const reference = data.reference || data.orderNo;
    const status = data.status;
    const amount = data.amount;

    console.log(`Processing webhook for ref: ${reference}, status: ${status}`);

    if (!reference) {
      console.error('No reference found in webhook payload');
      return new Response(JSON.stringify({ error: 'No reference found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Process successful transactions
    // OPay statuses: 'SUCCESS', 'completed', '00000' (code)
    // Extract amount
    let finalAmount = 0;
    if (typeof amount === 'string') {
      finalAmount = parseFloat(amount);
    } else if (typeof amount === 'number') {
      finalAmount = amount;
    } else if (amount && typeof amount.total !== 'undefined') {
      finalAmount = typeof amount.total === 'string' ? parseFloat(amount.total) : amount.total;
    }

    if (status === 'SUCCESS' || status === 'completed' || payload.code === '00000') {
      const { data: success, error: rpcError } = await supabase.rpc('handle_opay_deposit', {
        _reference: reference,
        _amount: finalAmount,
        _metadata: payload
      });

      if (rpcError) {
        console.error('RPC Error in handle_opay_deposit:', JSON.stringify(rpcError));
        return new Response(JSON.stringify({ error: rpcError.message, details: JSON.stringify(rpcError) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // If success is false, the transaction was already processed or doesn't exist
      // In either case, acknowledge receipt with 200 to prevent OPay from retrying
      if (success === false) {
        console.log(`Transaction ${reference} was already processed or not found. Acknowledging.`);
        return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`Transaction ${reference} processed successfully.`);
      return new Response(JSON.stringify({ success: true, processed: true }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle failed/cancelled transactions
    if (['FAIL', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status)) {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed', 
          metadata: payload, 
          updated_at: new Date().toISOString() 
        })
        .eq('reference', reference)
        .eq('status', 'pending');
      
      if (updateError) {
        console.error('Failed to update transaction to failed/cancelled:', {
          reference,
          status,
          error: JSON.stringify(updateError),
        });
      } else {
        console.log(`Transaction ${reference} marked as failed/cancelled.`);
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in opay-webhook:', {
      message: error.message,
      stack: error.stack,
      context: error,
    });
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
