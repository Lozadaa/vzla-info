-- ============================================================
-- Venezuela Unida — esquema Postgres + Row Level Security
-- Modelo de seguridad: el público solo LEE registros "approved"
-- e INSERTA registros que entran como "pending". Solo moderadores
-- autenticados pueden aprobar/rechazar y leer lo pendiente.
-- ============================================================

create extension if not exists pgcrypto;

-- ---- Roles de moderación ----
-- Cada moderador es un usuario de Supabase Auth con una fila aquí.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'volunteer' check (role in ('admin', 'volunteer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_moderator()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---- Campos comunes vía plantilla ----
-- (status + created_at se repiten en cada tabla de contenido)

-- 01 · Estoy a salvo
create table if not exists public.safe_reports (
  id uuid primary key default gen_random_uuid(),
  folio text not null,
  full_name text not null,
  zone text not null,
  message text,
  contact_whatsapp text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- 02 · Busco a alguien
create table if not exists public.missing_persons (
  id uuid primary key default gen_random_uuid(),
  folio text not null,
  full_name text not null,
  age int,
  photo_url text,
  last_seen_zone text not null,
  last_seen_at date,
  description text,
  reporter_relation text,
  contact_whatsapp text,
  found boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- 03 · Tengo información (sensible: NO es público, solo moderadores)
create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  missing_person_id uuid references public.missing_persons (id) on delete set null,
  person_name text,
  info text not null,
  zone text,
  contact_whatsapp text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- 04 · Necesito / ofrezco ayuda
create table if not exists public.help_listings (
  id uuid primary key default gen_random_uuid(),
  folio text not null,
  kind text not null check (kind in ('need','offer')),
  category text not null default 'otros',
  title text not null,
  description text,
  zone text not null,
  lat double precision,
  lng double precision,
  contact_whatsapp text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- 05 · Muro de información ciudadana (tweets recopilados de redes)
create table if not exists public.muro_posts (
  id uuid primary key default gen_random_uuid(),
  tweet_id text not null unique,
  tweet_url text not null,
  author_name text not null,
  author_handle text,
  author_verified boolean not null default false,
  text text not null default '',
  image_url text,
  hashtags text[] not null default '{}',
  category text not null default 'sin_clasificar'
    check (category in ('desaparecido','necesita_ayuda','ofrece_ayuda','sin_clasificar')),
  zone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Solicitudes de modificación (el usuario propone, el moderador aplica)
create table if not exists public.modification_requests (
  id uuid primary key default gen_random_uuid(),
  target_table text not null,
  target_id uuid not null,
  requested_full_name text,
  requested_photo_url text,
  requested_zone text,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.safe_reports        enable row level security;
alter table public.missing_persons     enable row level security;
alter table public.tips                enable row level security;
alter table public.help_listings       enable row level security;
alter table public.muro_posts          enable row level security;
alter table public.modification_requests enable row level security;

-- profiles: cada quien ve su fila; admins ven todas.
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Plantilla de políticas para tablas de contenido PÚBLICO
-- (safe_reports, missing_persons, help_listings)
do $$
declare t text;
begin
  foreach t in array array['safe_reports','missing_persons','help_listings','muro_posts']
  loop
    execute format($f$
      create policy "public reads approved" on public.%1$I
        for select using (status = 'approved' or public.is_moderator());
      create policy "anyone inserts pending" on public.%1$I
        for insert with check (status = 'pending');
      create policy "moderators update" on public.%1$I
        for update using (public.is_moderator()) with check (public.is_moderator());
      create policy "admins delete" on public.%1$I
        for delete using (public.is_admin());
    $f$, t);
  end loop;
end $$;

-- tips: NO público. Solo moderadores leen; cualquiera inserta (pending).
create policy "moderators read tips" on public.tips
  for select using (public.is_moderator());
create policy "anyone inserts tips" on public.tips
  for insert with check (status = 'pending');
create policy "moderators update tips" on public.tips
  for update using (public.is_moderator()) with check (public.is_moderator());
create policy "admins delete tips" on public.tips
  for delete using (public.is_admin());

-- modification_requests: igual que tips.
create policy "moderators read mods" on public.modification_requests
  for select using (public.is_moderator());
create policy "anyone inserts mods" on public.modification_requests
  for insert with check (status = 'pending');
create policy "moderators update mods" on public.modification_requests
  for update using (public.is_moderator()) with check (public.is_moderator());

-- ============================================================
-- Privilegios de tabla (GRANT). RLS controla las FILAS; GRANT controla
-- el acceso a la TABLA. Ambos son necesarios: sin GRANT, el rol anon
-- recibe "permission denied for table ...".
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- ============================================================
-- Storage: bucket público de fotos (lectura pública, inserción anónima)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos public read" on storage.objects
  for select using (bucket_id = 'fotos');
create policy "fotos anyone upload" on storage.objects
  for insert with check (bucket_id = 'fotos');

-- ============================================================
-- Para crear un moderador: registra el usuario en Auth y luego:
--   insert into public.profiles (id, email, role)
--   values ('<uuid-del-usuario>', 'mod@correo.com', 'admin');
-- ============================================================
