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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get credentials from request body or environment
    const body = await req.json().catch(() => ({}));
    const email = body.email || Deno.env.get('ADMIN_EMAIL');
    const password = body.password || Deno.env.get('ADMIN_PASSWORD');
    const fullName = body.fullName || Deno.env.get('ADMIN_NAME') || 'Admin';

    if (!email || !password) {
      throw new Error('Missing admin email and password. Provide via request body or environment variables.');
    }

    let userId: string | undefined;

    // Create user in auth (or get existing)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    // If user already exists, try to get them
    if (authError?.message?.includes('already exists')) {
      // Query to get the user ID - we'll use a workaround
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);

      if (users && users.length > 0) {
        userId = users[0].id;
      }
    } else if (authError) {
      throw authError;
    } else {
      userId = authData?.user?.id;
    }

    if (!userId) {
      throw new Error('Failed to get or create user');
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId);

    if (!existingProfile || existingProfile.length === 0) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email,
          balance: 0,
          bonus_balance: 0,
          kyc_verified: false,
          referral_code: Math.random().toString(36).substring(2, 11).toUpperCase(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
    }

    // Check if user already has admin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (!existingRole || existingRole.length === 0) {
      // Set user as admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        throw new Error(`Role assignment failed: ${roleError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user setup complete',
        userId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
