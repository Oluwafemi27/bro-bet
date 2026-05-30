import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Helper to mark a transaction as failed in the database.
 * Returns a JSON Response with the given status code and error message.
 */
async function markAsFailed(
  supabase: any,
  reference: string,
  errorMessage: string,
  details: Record<string, unknown>,
  responseStatus: number,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  console.error('Marking transaction as failed:', {
    reference,
    errorMessage,
    details,
  });

  try {
    await supabase
      .from('transactions')
      .update({
        status: 'failed',
        metadata: { ...details, gateway: 'opay', error: errorMessage },
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .eq('status', 'pending');
  } catch (dbError) {
    console.error('Failed to update transaction status in DB:', {
      reference,
      error: dbError.message,
    });
  }

  return new Response(
    JSON.stringify({ error: errorMessage, details }),
    {
      status: responseStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

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

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
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
    
    if (!OPAY_MERCHANT_ID || !OPAY_PUBLIC_KEY || !OPAY_SECRET_KEY) {
      console.error('Missing OPay configuration - one or more required credentials are not set');
      return new Response(JSON.stringify({ error: 'Payment gateway configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a unique reference
    const reference = `DEP_${user.id.substring(0, 8)}_${Date.now()}`;

    // Create a pending transaction in Supabase
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      reference: reference,
      metadata: { gateway: 'opay' }
    });

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw new Error('Failed to create transaction record');
    }

    // Fetch user profile for email and name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Prepare OPay request
    // OPay Checkout API v1/cashier/create
    const opayPayload = {
      publicKey: OPAY_PUBLIC_KEY,
      merchantId: OPAY_MERCHANT_ID,
      amount: {
        total: parseFloat(amount).toFixed(2),
        currency: "NGN"
      },
      reference: reference,
      returnUrl: `${req.headers.get('origin') || 'http://localhost:8080'}/account?status=success&ref=${reference}`,
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/opay-webhook`,
      cancelUrl: `${req.headers.get('origin') || 'http://localhost:8080'}/account?status=cancelled`,
      userEmail: profile?.email || user.email,
      userName: profile?.full_name || user.email?.split('@')[0] || 'User',
      productName: "Wallet Deposit",
      productDesc: "Bet Hub Pro Wallet Deposit",
    };

    console.log('Sending request to OPay:', JSON.stringify({
      url: `${OPAY_BASE_URL}/cashier/create`,
      hasPublicKey: !!opayPayload.publicKey,
      merchantId: OPAY_MERCHANT_ID,
      reference,
      amount: opayPayload.amount,
    }));

    let response;
    try {
      response = await fetch(`${OPAY_BASE_URL}/cashier/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPAY_SECRET_KEY}`,
        },
        body: JSON.stringify(opayPayload),
      });
    } catch (fetchError) {
      console.error('Network error calling OPay API:', {
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack,
      });
      return await markAsFailed(
        supabase,
        reference,
        `Failed to connect to payment gateway: ${fetchError.message}`,
        { networkError: fetchError.message, cause: fetchError.cause },
        502,
        corsHeaders,
      );
    }

    console.log('OPay HTTP response status:', response.status, response.statusText);

    // If OPay returned a non-2xx HTTP status, log the full body for debugging
    if (!response.ok) {
      const responseBody = await response.text();
      console.error('OPay returned non-2xx status:', {
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
        // Use the raw body if it's not JSON
        if (responseBody.length > 0 && responseBody.length < 500) {
          opayMessage = responseBody;
        }
      }

      return await markAsFailed(
        supabase,
        reference,
        opayMessage,
        { httpStatus: response.status, httpStatusText: response.statusText, rawBody: responseBody.substring(0, 1000) },
        502,
        corsHeaders,
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const textBody = await response.text();
      console.error('Failed to parse OPay response as JSON:', {
        status: response.status,
        body: textBody.substring(0, 2000),
        parseError: parseError.message,
      });
      return await markAsFailed(
        supabase,
        reference,
        'Invalid response from payment gateway',
        { httpStatus: response.status, rawBody: textBody.substring(0, 1000), parseError: parseError.message },
        502,
        corsHeaders,
      );
    }

    console.log('OPay response data:', JSON.stringify({
      code: data.code,
      message: data.message,
      hasData: !!data.data,
    }));

    if (data.code !== '00000') {
      console.error('OPay returned error code:', {
        code: data.code,
        message: data.message,
        fullResponse: data,
      });
      return await markAsFailed(
        supabase,
        reference,
        data.message || 'OPay integration error',
        { opayCode: data.code, opayMessage: data.message, ...data },
        400,
        corsHeaders,
      );
    }

    // Return the OPay cashier data to the frontend (includes cashierUrl or virtualAccount)
    return new Response(JSON.stringify(data.data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in opay-create-payment:', {
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
