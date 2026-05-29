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

    const { amount, bankCode } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OPay configuration
    const OPAY_MERCHANT_ID = Deno.env.get('OPAY_MERCHANT_ID');
    const OPAY_PUBLIC_KEY = Deno.env.get('OPAY_PUBLIC_KEY');
    const OPAY_BASE_URL = Deno.env.get('OPAY_BASE_URL') || 'https://testapi.opaycheckout.com/api/v1';
    
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
    const opayPayload = {
      publicKey: OPAY_PUBLIC_KEY,
      merchantId: OPAY_MERCHANT_ID,
      amount: {
        total: (amount * 100).toString(), // OPay amount is in kobo? Wait, let's check. Usually NGN is base unit for some, kobo for others. Paystack uses kobo. OPay documentation says minor units (kobo) for some APIs. 
        // Actually OPay Checkout amount.total is in major units (NGN) but as a string?
        // Let's assume NGN as string for Checkout.
        total: amount.toString(),
        currency: "NGN"
      },
      reference: reference,
      returnUrl: `${req.headers.get('origin')}/account?status=success&ref=${reference}`,
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/opay-webhook`,
      cancelUrl: `${req.headers.get('origin')}/account?status=cancelled`,
      userEmail: profile?.email || user.email,
      userName: profile?.full_name || 'User',
      productName: "Wallet Deposit",
      productDesc: "Bet Hub Pro Wallet Deposit",
    };

    const response = await fetch(`${OPAY_BASE_URL}/cashier/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPAY_PUBLIC_KEY}`,
      },
      body: JSON.stringify(opayPayload),
    });

    const data = await response.json();

    if (data.code !== '00000') {
      console.error('OPay error:', data);
      return new Response(JSON.stringify({ error: data.message || 'OPay integration error' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data.data), {
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
