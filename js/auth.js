// ============================================================================
// AUTH – Supabase-Login mit Gastmodus-Fallback
// ============================================================================
// Ist keine Supabase-URL in config.js hinterlegt, läuft das Spiel im
// Gastmodus weiter (Speicherstand nur lokal im Browser). Sobald Supabase
// konfiguriert ist, übernimmt supabase-auth-js Login/Registrierung und
// der Speicherstand landet serverseitig in der Tabelle "saves".
// ============================================================================

import { SUPABASE_CONFIG } from "./config.js";

let supabaseClient = null;
export const isSupabaseConfigured = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);

async function getClient() {
  if (!isSupabaseConfigured) return null;
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import(
    "https://esm.sh/@supabase/supabase-js@2"
  );
  supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  return supabaseClient;
}

export async function signUp(email, password) {
  const client = await getClient();
  if (!client) return { error: "Supabase ist nicht konfiguriert (siehe js/config.js)." };
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

export async function signIn(email, password) {
  const client = await getClient();
  if (!client) return { error: "Supabase ist nicht konfiguriert (siehe js/config.js)." };
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

export async function signOut() {
  const client = await getClient();
  if (!client) return;
  await client.auth.signOut();
}

export async function getCurrentUser() {
  const client = await getClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user ?? null;
}

export async function saveGameToCloud(userId, gameState) {
  const client = await getClient();
  if (!client) return { error: "Supabase ist nicht konfiguriert." };
  const { error } = await client
    .from("saves")
    .upsert({ user_id: userId, data: gameState, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function loadGameFromCloud(userId) {
  const client = await getClient();
  if (!client) return { error: "Supabase ist nicht konfiguriert." };
  const { data, error } = await client.from("saves").select("data").eq("user_id", userId).maybeSingle();
  if (error) return { error: error.message };
  return { data: data?.data ?? null };
}
