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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, bankCode, bankName, accountNumber, accountName } = await req.json();

    if (!amount || amount <= 0 || !bankCode || !accountNumber) {
      return new Response(JSON.stringify({ error: 'Invalid withdrawal details. amount, bankCode, and accountNumber are required.' }), {
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
      console.error('Error initiating withdrawal via RPC:', {
        rpcError: JSON.stringify(rpcError),
        initiated,
      });
      return new Response(JSON.stringify({ error: rpcError?.message || 'Insufficient balance or failed to initiate withdrawal', details: rpcError ? JSON.stringify(rpcError) : undefined }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OPay configuration
    const OPAY_MERCHANT_ID = Deno.env.get('OPAY_MERCHANT_ID');
    const OPAY_PUBLIC_KEY = Deno.env.get('OPAY_PUBLIC_KEY');
    const OPAY_SECRET_KEY = Deno.env.get('OPAY_SECRET_KEY');
    // Default to production OPay API URL
    const OPAY_BASE_URL = Deno.env.get('OPAY_BASE_URL') || 'https://api.opaycheckout.com/api/v1';

    console.log('OPay configuration check:', {
      hasMerchantId: !!OPAY_MERCHANT_ID,
      hasPublicKey: !!OPAY_PUBLIC_KEY,
      hasSecretKey: !!OPAY_SECRET_KEY,
      baseUrl: OPAY_BASE_URL,
    });

    if (!OPAY_MERCHANT_ID || !OPAY_SECRET_KEY) {
      console.error('Missing OPay configuration for withdrawal - merchant ID or secret key not set');
      // Refund user balance since we can't proceed
      const { error: refundError } = await supabase.rpc('refund_withdrawal', { _reference: reference });
      if (refundError) {
        console.error('Failed to refund withdrawal:', JSON.stringify(refundError));
      }
      return new Response(JSON.stringify({ error: 'Withdrawal configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OPay Transfer API
    const opayPayload = {
      merchantId: OPAY_MERCHANT_ID,
      source: "balance",
      amount: parseFloat(amount).toFixed(2),
      currency: "NGN",
      reference: reference,
      destBankCode: bankCode,
      destBankAccountNumber: accountNumber,
      destBankAccountName: accountName || "User",
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/opay-webhook`,
    };

    console.log('Initiating OPay transfer:', JSON.stringify({
      url: `${OPAY_BASE_URL}/transfer/create`,
      merchantId: OPAY_MERCHANT_ID,
      reference,
      amount: opayPayload.amount,
      destBankCode: bankCode,
      destBankAccount: accountNumber?.substring(0, 4) + '****',
    }));

    let response;
    try {
      response = await fetch(`${OPAY_BASE_URL}/transfer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPAY_SECRET_KEY}`,
        },
        body: JSON.stringify(opayPayload),
      });
    } catch (fetchError) {
      console.error('Network error calling OPay Transfer API:', {
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack,
      });
      // Refund the user balance if OPay API call fails
      const { error: refundError1 } = await supabase.rpc('refund_withdrawal', { _reference: reference });
      if (refundError1) {
        console.error('Failed to refund withdrawal after network error:', JSON.stringify(refundError1));
      }
      return new Response(JSON.stringify({ error: `Failed to connect to payment gateway: ${fetchError.message}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('OPay transfer HTTP response status:', response.status, response.statusText);

    // Handle non-2xx HTTP responses from OPay
    if (!response.ok) {
      const responseBody = await response.text();
      console.error('OPay transfer returned non-2xx status:', {
        status: response.status,
        statusText: response.statusText,
        body: responseBody.substring(0, 2000),
      });

      // Try to extract OPay error message from response body
      let opayMessage = `OPay returned HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(responseBody);
        if (errorBody.message) {
          opayMessage = errorBody.message;
        }
      } catch {
        if (responseBody.length > 0 && responseBody.length < 500) {
          opayMessage = responseBody;
        }
      }

      // Refund the user balance since OPay rejected the request
      const { error: refundError2 } = await supabase.rpc('refund_withdrawal', { _reference: reference });
      if (refundError2) {
        console.error('Failed to refund withdrawal after non-2xx response:', JSON.stringify(refundError2));
      }
      return new Response(JSON.stringify({ error: opayMessage }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const textBody = await response.text();
      console.error('Failed to parse OPay transfer response as JSON:', {
        status: response.status,
        body: textBody.substring(0, 2000),
        parseError: parseError.message,
      });
      // Refund the user balance if OPay API response is invalid
      const { error: refundError3 } = await supabase.rpc('refund_withdrawal', { _reference: reference });
      if (refundError3) {
        console.error('Failed to refund withdrawal after parse error:', JSON.stringify(refundError3));
      }
      return new Response(JSON.stringify({ error: 'Invalid response from payment gateway' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('OPay transfer response:', JSON.stringify({
      code: data.code,
      message: data.message,
    }));

    if (data.code !== '00000') {
      console.error('OPay transfer returned error code:', {
        code: data.code,
        message: data.message,
        fullResponse: data,
      });
      
      // Refund the user balance if OPay API call fails immediately
      const { error: refundError4 } = await supabase.rpc('refund_withdrawal', {
          _reference: reference
      });
      if (refundError4) {
        console.error('Failed to refund withdrawal after OPay error code:', JSON.stringify(refundError4));
      }

      return new Response(JSON.stringify({ error: data.message || 'OPay transfer failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, reference, data: data.data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in opay-withdrawal:', {
      message: error.message,
      stack: error.stack,
      context: error,
    });
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
