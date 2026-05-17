import { createClient } from '@supabase/supabase-js';

// Client public (anon key) — exposé au navigateur, OK.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Client admin (service_role) — créé UNIQUEMENT côté serveur.
// Côté navigateur, process.env.SUPABASE_SERVICE_ROLE_KEY = undefined,
// donc supabaseAdmin = null (et ne plante plus).
// Côté API routes, la clé est dispo, le client est bien créé.
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;
