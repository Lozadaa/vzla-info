-- Muro de información ciudadana (tweets recopilados). Mismo modelo de
-- seguridad que el resto: público lee 'approved', cualquiera inserta 'pending',
-- solo moderadores aprueban y solo admins borran.

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

alter table public.muro_posts enable row level security;

drop policy if exists "public reads approved" on public.muro_posts;
create policy "public reads approved" on public.muro_posts
  for select using (status = 'approved' or public.is_moderator());
drop policy if exists "anyone inserts pending" on public.muro_posts;
create policy "anyone inserts pending" on public.muro_posts
  for insert with check (status = 'pending');
drop policy if exists "moderators update" on public.muro_posts;
create policy "moderators update" on public.muro_posts
  for update using (public.is_moderator()) with check (public.is_moderator());
drop policy if exists "admins delete" on public.muro_posts;
create policy "admins delete" on public.muro_posts
  for delete using (public.is_admin());

grant select, insert, update, delete on public.muro_posts to anon, authenticated;
