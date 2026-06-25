// Configuración de Supabase con degradación elegante.
// Si las variables no están definidas, la app igual carga (modo demo)
// y muestra estados vacíos en vez de fallar.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
