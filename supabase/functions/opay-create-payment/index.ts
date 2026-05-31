import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Execution steps for progress tracking.
 * These are stored in transaction metadata to diagnose failures.
 */
const EXECUTION_STEPS = {
  START: 'START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  TX_CREATED: 'TX_CREATED',
  OPAY_REQUEST_PREPARED: 'OPAY_REQUEST_PREPARED',
  OPAY_API_RESPONDED: 'OPAY_API_RESPONDED',
  SUCCESS: 'SUCCESS',
} as const;

type ExecutionStep = typeof EXECUTION_STEPS[keyof typeof EXECUTION_STEPS];

/**
 * Helper to mark a transaction as failed in the database.
 * Preserves existing metadata progress and includes the final execution step.
 */
async function markAsFailed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  reference: string,
  errorMessage: string,
  details: Record<string, unknown>,
  responseStatus: number,
  corsHeaders: Record<string, string>,
  finalStep?: ExecutionStep,
  existingMetadata?: Record<string, unknown>,
): Promise<Response> {
  console.error('Marking transaction as failed:', {
    reference,
    errorMessage,
    details,
    finalStep,
  });

  try {
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        metadata: {
          ...existingMetadata,
          gateway: 'opay',
          error: errorMessage,
          finalStep,
          ...details,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Database error marking transaction as failed:', {
        reference,
        error: updateError.message,
        details: updateError.details,
      });
    }
  } catch (dbError) {
    console.error('Exception marking transaction as failed in DB:', {
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

/**
 * Logs a progress step to the transaction's metadata.
 * Uses COALESCE to preserve existing metadata fields.
 */
async function logStep(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  reference: string,
  step: ExecutionStep,
  stepData: Record<string, unknown> = {},
  existingMetadata?: Record<string, unknown>,
): Promise<void> {
  const timestamp = new Date().toISOString();
  const stepEntry = { step, timestamp, ...stepData };

  console.log(`[${step}] Transaction ${reference}:`, stepData);

  try {
    // Initialize steps array if it doesn't exist
    const currentSteps = (existingMetadata?.steps as Array<Record<string, unknown>>) || [];
    const stepsArray = [...currentSteps, stepEntry];

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        metadata: {
          ...(existingMetadata || {}),
          steps: stepsArray,
          currentStep: step,
        },
        updated_at: timestamp,
      })
      .eq('reference', reference)
      .eq('status', 'pending');

    if (updateError) {
      console.error(`Database error logging step ${step} for transaction ${reference}:`, {
        error: updateError.message,
        details: updateError.details,
      });
    }
  } catch (dbError) {
    console.error(`Exception logging step ${step} for transaction ${reference}:`, {
      error: dbError.message,
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Generate a unique trace_id for this request for correlation across logs
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[${EXECUTION_STEPS.START}] Request received:`, {
    traceId,
    method: req.method,
    contentType: req.headers.get('content-type'),
  });

  // Track the current transaction reference for the catch block
  let currentReference: string | undefined;
  let currentMetadata: Record<string, unknown> | undefined;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body early
    const body = await req.json();
    const { amount, userId: bodyUserId, email: bodyEmail, fullName, phone } = body;

    // Get the user from the authorization header or body
    const authHeader = req.headers.get('Authorization');
    let user;

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (authError || !authUser) {
        console.error(`[AUTH] Authorization failed:`, {
          traceId,
          authError: authError?.message,
          hasUser: !!authUser,
        });
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      user = authUser;
    } else if (bodyUserId) {
      // Fallback to body userId if no auth header (as requested)
      user = { id: bodyUserId, email: bodyEmail };
      console.log(`[AUTH] Using user details from body:`, {
        traceId,
        userId: user.id,
        email: user.email,
      });
    }

    if (!user) {
      console.error(`[${EXECUTION_STEPS.START}] Missing authentication:`, { traceId });
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[${EXECUTION_STEPS.AUTH_SUCCESS}] User identified:`, {
      traceId,
      userId: user.id,
      email: user.email,
    });

    if (!amount || amount <= 0) {
      console.error(`[${EXECUTION_STEPS.AUTH_SUCCESS}] Invalid amount:`, {
        traceId,
        userId: user.id,
        amount,
      });
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Defensive check for NaN amounts
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.error(`[${EXECUTION_STEPS.AUTH_SUCCESS}] Amount is NaN:`, {
        traceId,
        userId: user.id,
        rawAmount: amount,
      });
      return new Response(JSON.stringify({ error: 'Invalid amount format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPAY_MERCHANT_ID = Deno.env.get('OPAY_MERCHANT_ID');
    const OPAY_PUBLIC_KEY = Deno.env.get('OPAY_PUBLIC_KEY');
    const OPAY_SECRET_KEY = Deno.env.get('OPAY_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Default to production OPay API URL
    const OPAY_BASE_URL = Deno.env.get('OPAY_BASE_URL') || 'https://api.opaycheckout.com/api/v1';

    console.log('OPay configuration check:', {
      traceId,
      hasMerchantId: !!OPAY_MERCHANT_ID,
      hasPublicKey: !!OPAY_PUBLIC_KEY,
      hasSecretKey: !!OPAY_SECRET_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
      baseUrl: OPAY_BASE_URL,
    });

    if (!OPAY_MERCHANT_ID || !OPAY_PUBLIC_KEY || !OPAY_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const missing = [];
      if (!OPAY_MERCHANT_ID) missing.push('OPAY_MERCHANT_ID');
      if (!OPAY_PUBLIC_KEY) missing.push('OPAY_PUBLIC_KEY');
      if (!OPAY_SECRET_KEY) missing.push('OPAY_SECRET_KEY');
      if (!SUPABASE_URL) missing.push('SUPABASE_URL');
      if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

      console.error('Missing configuration - one or more required environment variables are not set:', {
        traceId,
        missing,
      });
      return new Response(JSON.stringify({ 
        error: 'Payment gateway configuration missing', 
        details: `Missing environment variables: ${missing.join(', ')}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a unique reference
    const reference = `DEP_${user.id.substring(0, 8)}_${Date.now()}`;
    currentReference = reference;

    // Create a pending transaction in Supabase
    const initialMetadata = {
      gateway: 'opay',
      traceId,
      amount: parsedAmount,
      currency: 'NGN',
      steps: [],
    };
    currentMetadata = initialMetadata;

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'deposit',
      amount: parsedAmount,
      status: 'pending',
      reference: reference,
      metadata: initialMetadata,
    });

    if (txError) {
      console.error('Error creating transaction:', JSON.stringify(txError), { traceId });
      throw new Error(`Failed to create transaction record: ${txError.message || txError.details || JSON.stringify(txError)}`);
    }

    console.log(`[${EXECUTION_STEPS.TX_CREATED}] Transaction created:`, {
      traceId,
      reference,
      userId: user.id,
      amount: parsedAmount,
    });

    // Log the step to metadata
    await logStep(supabase, reference, EXECUTION_STEPS.TX_CREATED, {
      userId: user.id,
      amount: parsedAmount,
      traceId,
    }, currentMetadata);
    currentMetadata = { ...currentMetadata, steps: [{ step: EXECUTION_STEPS.TX_CREATED, timestamp: new Date().toISOString() }] };

    // Use user details from body or fetch from profile
    let finalEmail = bodyEmail || user.email;
    let finalFullName = fullName;

    if (!finalFullName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      
      finalFullName = profile?.full_name;
      if (!finalEmail) finalEmail = profile?.email;
    }

    // Prepare OPay request
    // OPay Checkout API v1/cashier/create
    const opayPayload = {
      publicKey: OPAY_PUBLIC_KEY,
      merchantId: OPAY_MERCHANT_ID,
      amount: {
        total: parsedAmount.toFixed(2),
        currency: "NGN"
      },
      reference: reference,
      returnUrl: `${req.headers.get('origin') || 'http://localhost:8080'}/account?status=success&ref=${reference}`,
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/opay-webhook`,
      cancelUrl: `${req.headers.get('origin') || 'http://localhost:8080'}/account?status=cancelled`,
      userEmail: finalEmail || 'user@example.com',
      userName: finalFullName || finalEmail?.split('@')[0] || 'User',
      userPhone: phone || undefined,
      productName: "Wallet Deposit",
      productDesc: "Bet Hub Pro Wallet Deposit",
    };

    console.log(`[${EXECUTION_STEPS.OPAY_REQUEST_PREPARED}] OPay request prepared:`, {
      traceId,
      reference,
      url: `${OPAY_BASE_URL}/cashier/create`,
      // Log payload WITHOUT the secret keys
      payload: {
        publicKey: opayPayload.publicKey ? '[SET]' : '[MISSING]',
        merchantId: OPAY_MERCHANT_ID,
        reference: opayPayload.reference,
        amount: opayPayload.amount,
        returnUrl: opayPayload.returnUrl,
        callbackUrl: opayPayload.callbackUrl,
        userEmail: opayPayload.userEmail,
        userName: opayPayload.userName,
        productName: opayPayload.productName,
        productDesc: opayPayload.productDesc,
      },
    });

    // Log step before API call
    await logStep(supabase, reference, EXECUTION_STEPS.OPAY_REQUEST_PREPARED, {
      url: `${OPAY_BASE_URL}/cashier/create`,
      merchantId: OPAY_MERCHANT_ID,
      amount: parsedAmount,
      traceId,
    }, currentMetadata);

    let response;
    try {
      const startTime = Date.now();
      response = await fetch(`${OPAY_BASE_URL}/cashier/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPAY_SECRET_KEY}`,
        },
        body: JSON.stringify(opayPayload),
      });
      const duration = Date.now() - startTime;

      console.log(`[${EXECUTION_STEPS.OPAY_API_RESPONDED}] OPay API responded:`, {
        traceId,
        reference,
        status: response.status,
        statusText: response.statusText,
        durationMs: duration,
      });
    } catch (fetchError) {
      console.error('Network error calling OPay API:', {
        traceId,
        reference,
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack,
      });

      // Log the failed step
      await logStep(supabase, reference, EXECUTION_STEPS.OPAY_REQUEST_PREPARED, {
        error: 'Network error',
        message: fetchError.message,
        cause: String(fetchError.cause),
        traceId,
      }, currentMetadata);

      return await markAsFailed(
        supabase,
        reference,
        `Failed to connect to payment gateway: ${fetchError.message}`,
        { networkError: fetchError.message, cause: fetchError.cause },
        502,
        corsHeaders,
        EXECUTION_STEPS.OPAY_REQUEST_PREPARED,
        currentMetadata,
      );
    }

    // Log the API response received step
    await logStep(supabase, reference, EXECUTION_STEPS.OPAY_API_RESPONDED, {
      httpStatus: response.status,
      httpStatusText: response.statusText,
      traceId,
    }, currentMetadata);
    currentMetadata = {
      ...(currentMetadata || {}),
      steps: [
        ...((currentMetadata?.steps as Array<Record<string, unknown>>) || []),
        { step: EXECUTION_STEPS.OPAY_API_RESPONDED, timestamp: new Date().toISOString(), httpStatus: response.status },
      ],
    };

    // Capture raw response body FIRST - before any parsing attempts
    let rawBody = '';
    try {
      rawBody = await response.text();
    } catch (textError) {
      console.error('Failed to read response body as text:', {
        traceId,
        reference,
        error: textError.message,
      });
      return await markAsFailed(
        supabase,
        reference,
        'Failed to read payment gateway response',
        { httpStatus: response.status, textError: textError.message },
        502,
        corsHeaders,
        EXECUTION_STEPS.OPAY_API_RESPONDED,
        currentMetadata,
      );
    }

    console.log(`[${EXECUTION_STEPS.OPAY_API_RESPONDED}] Raw response body:`, {
      traceId,
      reference,
      httpStatus: response.status,
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 500),
    });

    // If OPay returned a non-2xx HTTP status, log the full body for debugging
    if (!response.ok) {
      console.error('OPay returned non-2xx status:', {
        traceId,
        reference,
        status: response.status,
        statusText: response.statusText,
        body: rawBody.substring(0, 2000),
      });

      // Try to extract OPay error message from raw body
      let opayMessage = `OPay returned HTTP ${response.status}`;
      try {
        const errorBody = JSON.parse(rawBody);
        if (errorBody.message) {
          opayMessage = errorBody.message;
        }
      } catch {
        // Use the raw body if it's not JSON
        if (rawBody.length > 0 && rawBody.length < 500) {
          opayMessage = rawBody;
        }
      }

      // Log the failed step
      await logStep(supabase, reference, EXECUTION_STEPS.OPAY_API_RESPONDED, {
        error: 'Non-2xx HTTP status',
        httpStatus: response.status,
        httpStatusText: response.statusText,
        rawBody: rawBody.substring(0, 1000),
        opayMessage,
        traceId,
      }, currentMetadata);

      return await markAsFailed(
        supabase,
        reference,
        opayMessage,
        { httpStatus: response.status, httpStatusText: response.statusText, rawBody: rawBody.substring(0, 1000) },
        502,
        corsHeaders,
        EXECUTION_STEPS.OPAY_API_RESPONDED,
        currentMetadata,
      );
    }

    // Now attempt to parse the raw body as JSON
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse OPay response as JSON:', {
        traceId,
        reference,
        status: response.status,
        body: rawBody.substring(0, 2000),
        parseError: parseError.message,
      });

      // Log the failed step
      await logStep(supabase, reference, EXECUTION_STEPS.OPAY_API_RESPONDED, {
        error: 'JSON parse failed',
        httpStatus: response.status,
        rawBody: rawBody.substring(0, 1000),
        parseError: parseError.message,
        traceId,
      }, currentMetadata);

      return await markAsFailed(
        supabase,
        reference,
        'Invalid response from payment gateway',
        { httpStatus: response.status, rawBody: rawBody.substring(0, 1000), parseError: parseError.message },
        502,
        corsHeaders,
        EXECUTION_STEPS.OPAY_API_RESPONDED,
        currentMetadata,
      );
    }

    console.log('OPay response data:', JSON.stringify({
      traceId,
      reference,
      code: data.code,
      message: data.message,
      hasData: !!data.data,
    }));

    if (data.code !== '00000') {
      console.error('OPay returned error code:', {
        traceId,
        reference,
        code: data.code,
        message: data.message,
        fullResponse: data,
      });

      // Log the failed step
      await logStep(supabase, reference, EXECUTION_STEPS.OPAY_API_RESPONDED, {
        error: 'OPay error code',
        opayCode: data.code,
        opayMessage: data.message,
        fullResponse: data,
        traceId,
      }, currentMetadata);

      return await markAsFailed(
        supabase,
        reference,
        data.message || 'OPay integration error',
        { opayCode: data.code, opayMessage: data.message, ...data },
        400,
        corsHeaders,
        EXECUTION_STEPS.OPAY_API_RESPONDED,
        currentMetadata,
      );
    }

    // Log success step
    await logStep(supabase, reference, EXECUTION_STEPS.SUCCESS, {
      opayCode: data.code,
      traceId,
    }, currentMetadata);

    console.log(`[${EXECUTION_STEPS.SUCCESS}] Payment initiated successfully:`, {
      traceId,
      reference,
      opayCode: data.code,
    });

    // Return the OPay cashier data to the frontend (includes cashierUrl or virtualAccount)
    return new Response(JSON.stringify(data.data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in opay-create-payment:', {
      traceId,
      reference: currentReference,
      message: error.message,
      stack: error.stack,
      context: error,
    });

    // If we have a transaction reference, record the failure in the database
    if (currentReference) {
      await logStep(supabase, currentReference, 'UNEXPECTED_ERROR', {
        error: error.message,
        stack: error.stack,
        traceId,
      }, currentMetadata);

      await markAsFailed(
        supabase,
        currentReference,
        error.message || 'Internal server error',
        { unexpectedError: error.message, stack: error.stack },
        500,
        corsHeaders,
        'UNEXPECTED_ERROR',
        currentMetadata,
      );
    }

    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
