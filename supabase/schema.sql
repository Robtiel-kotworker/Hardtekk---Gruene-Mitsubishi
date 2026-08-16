-- ============================================================================
-- Hardtekk-Grüne Mitsubishi – Supabase-Schema
-- ============================================================================
-- Im Supabase-Dashboard unter "SQL Editor" ausführen (einmalig pro Projekt).
-- Die Authentifizierung selbst (Login/Registrierung per E-Mail+Passwort)
-- übernimmt Supabase Auth automatisch (Tabelle auth.users) – hier wird nur
-- die Tabelle für die Spielstände angelegt.
-- ============================================================================

create table if not exists public.saves (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;

-- Jede:r Nutzer:in darf ausschließlich den eigenen Spielstand lesen ...
create policy "saves_select_own"
  on public.saves for select
  using (auth.uid() = user_id);

-- ... anlegen ...
create policy "saves_insert_own"
  on public.saves for insert
  with check (auth.uid() = user_id);

-- ... und aktualisieren.
create policy "saves_update_own"
  on public.saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional, aber empfohlen: automatisches updated_at bei jedem Update.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_saves_updated_at on public.saves;
create trigger trg_saves_updated_at
  before update on public.saves
  for each row
  execute function public.set_updated_at();
