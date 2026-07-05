import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key.
// This key must NEVER be exposed to the browser — it only lives here, in /api.
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Verifies the bearer token sent from the client and returns the authenticated user,
// or null if the token is missing/invalid. Every /api function should call this first.
export async function requireUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export { supabaseAdmin };
