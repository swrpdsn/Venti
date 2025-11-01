// supabase/functions/admin-update-role/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'

// Fix: Add type definition for the Deno global to resolve TypeScript error in non-Deno environments.
declare const Deno: {
    env: {
        get: (key: string) => string | undefined;
    };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { targetUserId, newRole } = await req.json();

    if (newRole !== 'user' && newRole !== 'admin') {
        return new Response(JSON.stringify({ error: 'Invalid role specified' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    // 1. Verify caller is a superadmin
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError) throw profileError;

    if (profile.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    if (user.id === targetUserId) {
        return new Response(JSON.stringify({ error: 'Cannot change your own role' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    // 2. Use service role client to perform update
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { error: updateError } = await serviceClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);
    
    if (updateError) throw updateError;
    
    return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})