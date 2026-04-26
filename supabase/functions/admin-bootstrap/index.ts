// Bootstrap a single admin user using the password stored in settings.admin_password.
// POST { password } -> creates/updates an admin user (admin@star.local) and returns a session.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "admin@star.local";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { password } = await req.json();
    if (!password) throw new Error("password required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Securely verify password via SECURITY DEFINER RPC (bcrypt hash compare)
    const { data: ok, error: verErr } = await supabase.rpc("verify_admin_password", {
      _password: password,
    });
    if (verErr) throw verErr;
    if (!ok) {
      return new Response(JSON.stringify({ error: "كلمة المرور غير صحيحة" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create admin user
    let userId: string | null = null;
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === ADMIN_EMAIL);
    if (existing) {
      userId = existing.id;
      // Sync password
      await supabase.auth.admin.updateUserById(existing.id, { password });
    } else {
      const { data: created, error: cErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password,
        email_confirm: true,
      });
      if (cErr) throw cErr;
      userId = created.user.id;
    }

    // Ensure admin role
    await supabase.from("user_roles").upsert(
      { user_id: userId!, role: "admin" },
      { onConflict: "user_id,role" },
    );

    return new Response(
      JSON.stringify({ email: ADMIN_EMAIL, password }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});