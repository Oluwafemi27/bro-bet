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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, bankCode, bankName, accountNumber } = await req.json();

    if (!amount || amount <= 0 || !bankCode || !accountNumber) {
      return new Response(JSON.stringify({ error: 'Invalid withdrawal details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a unique reference
    const reference = `WIT_${user.id.substring(0, 8)}_${Date.now()}`;

    // Atomically check balance and create pending transaction
    const { data: initiated, error: rpcError } = await supabase.rpc('initiate_withdrawal', {
      _user_id: user.id,
      _amount: amount,
      _reference: reference,
      _bank_name: bankName || bankCode,
      _account_number: accountNumber
    });

    if (rpcError || !initiated) {
      return new Response(JSON.stringify({ error: rpcError?.message || 'Insufficient balance or failed to initiate withdrawal' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OPay configuration
    const OPAY_MERCHANT_ID = Deno.env.get('OPAY_MERCHANT_ID');
    const OPAY_PUBLIC_KEY = Deno.env.get('OPAY_PUBLIC_KEY');
    const OPAY_BASE_URL = Deno.env.get('OPAY_BASE_URL') || 'https://testapi.opaycheckout.com/api/v1';

    // Call OPay Transfer API
    const opayPayload = {
      merchantId: OPAY_MERCHANT_ID,
      source: "balance",
      amount: amount.toString(),
      currency: "NGN",
      reference: reference,
      destBankCode: bankCode,
      destBankAccountNumber: accountNumber,
      destBankAccountName: "User", // Ideally fetch this or verify before
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/opay-webhook`,
    };

    const response = await fetch(`${OPAY_BASE_URL}/transfer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPAY_PUBLIC_KEY}`,
      },
      body: JSON.stringify(opayPayload),
    });

    const data = await response.json();

    if (data.code !== '00000') {
      console.error('OPay transfer error:', data);
      
      // Refund the user balance if OPay API call fails immediately
      await supabase.rpc('refund_withdrawal', {
          _reference: reference
      });

      return new Response(JSON.stringify({ error: data.message || 'OPay transfer failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, reference }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
