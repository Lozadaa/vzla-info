-- ============================================================
-- Motor de reencuentros y deduplicación — Vzla Info
-- Cruza "Estoy a salvo" ↔ "Busco a alguien" y detecta desaparecidos
-- duplicados. NO borra ni fusiona nada solo: deja "posibles coincidencias"
-- en una cola para que un moderador confirme. Se actualiza SOLO mediante
-- triggers (al aprobarse un reporte) — sin loops ni servicios externos.
-- ============================================================

create extension if not exists pg_trgm;

-- Normalización IMMUTABLE (minúsculas + sin acentos) para comparar nombres.
create or replace function public.vu_norm(t text)
returns text language sql immutable as $$
  select btrim(regexp_replace(
    lower(translate(coalesce(t, ''),
      'áàäâãéèëêíìïîóòöôõúùüûñ', 'aaaaaeeeeiiiiooooouuuun')),
    '\s+', ' ', 'g'));
$$;

-- Índices de similitud (aceleran el backfill y el matching).
create index if not exists missing_name_trgm
  on public.missing_persons using gin (public.vu_norm(full_name) gin_trgm_ops);
create index if not exists safe_name_trgm
  on public.safe_reports using gin (public.vu_norm(full_name) gin_trgm_ops);

-- ---- Cola de posibles coincidencias ----
create table if not exists public.possible_matches (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reencuentro', 'duplicado')),
  missing_id uuid not null references public.missing_persons (id) on delete cascade,
  safe_id uuid references public.safe_reports (id) on delete cascade,
  other_missing_id uuid references public.missing_persons (id) on delete cascade,
  score real not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- Evita duplicar la misma sugerencia (manteniendo su estado si ya existe).
create unique index if not exists possible_reencuentro_uniq
  on public.possible_matches (missing_id, safe_id) where kind = 'reencuentro';
create unique index if not exists possible_duplicado_uniq
  on public.possible_matches (least(missing_id, other_missing_id), greatest(missing_id, other_missing_id))
  where kind = 'duplicado';
create index if not exists possible_matches_status on public.possible_matches (status, created_at desc);

-- Umbrales (ajustables).
--   reencuentro: solo nombre (la persona a salvo puede estar en otra zona).
--   duplicado: nombre alto + zona parecida (mismo reporte repetido).
create or replace function public.vu_reunion_threshold() returns real language sql immutable as $$ select 0.62::real $$;
create or replace function public.vu_dup_name_threshold() returns real language sql immutable as $$ select 0.72::real $$;
create or replace function public.vu_dup_zone_threshold() returns real language sql immutable as $$ select 0.40::real $$;

-- ---- Matching para un desaparecido (vs a-salvo y vs otros desaparecidos) ----
create or replace function public.vu_match_missing(m_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  select id, full_name, last_seen_zone into m
  from missing_persons where id = m_id and status = 'approved' and missing_persons.found = false;
  if not found then return; end if;

  -- Umbral del operador % (usa el índice GIN para pre-filtrar candidatos).
  perform set_config('pg_trgm.similarity_threshold', '0.62', true);

  -- Reencuentros: alguien con nombre muy parecido se marcó "a salvo".
  insert into possible_matches (kind, missing_id, safe_id, score)
  select 'reencuentro', m.id, s.id, similarity(vu_norm(m.full_name), vu_norm(s.full_name))
  from safe_reports s
  where s.status = 'approved'
    and vu_norm(s.full_name) % vu_norm(m.full_name)
    and similarity(vu_norm(m.full_name), vu_norm(s.full_name)) >= vu_reunion_threshold()
  on conflict do nothing;

  -- Duplicados: otro desaparecido con el mismo nombre y zona parecida.
  insert into possible_matches (kind, missing_id, other_missing_id, score)
  select 'duplicado', m.id, x.id, similarity(vu_norm(m.full_name), vu_norm(x.full_name))
  from missing_persons x
  where x.id <> m.id and x.status = 'approved'
    and vu_norm(x.full_name) % vu_norm(m.full_name)
    and similarity(vu_norm(m.full_name), vu_norm(x.full_name)) >= vu_dup_name_threshold()
    and similarity(vu_norm(m.last_seen_zone), vu_norm(x.last_seen_zone)) >= vu_dup_zone_threshold()
  on conflict do nothing;
exception when others then
  -- Nunca romper la operación que disparó el trigger.
  return;
end $$;

-- ---- Matching para un "a salvo" (vs desaparecidos) ----
create or replace function public.vu_match_safe(s_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare s record;
begin
  select id, full_name into s from safe_reports where id = s_id and status = 'approved';
  if not found then return; end if;

  perform set_config('pg_trgm.similarity_threshold', '0.62', true);

  insert into possible_matches (kind, missing_id, safe_id, score)
  select 'reencuentro', m.id, s.id, similarity(vu_norm(m.full_name), vu_norm(s.full_name))
  from missing_persons m
  where m.status = 'approved' and m.found = false
    and vu_norm(m.full_name) % vu_norm(s.full_name)
    and similarity(vu_norm(m.full_name), vu_norm(s.full_name)) >= vu_reunion_threshold()
  on conflict do nothing;
exception when others then return;
end $$;

-- ---- Triggers: se actualiza SOLO al aprobarse un reporte ----
create or replace function public.vu_trg_missing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and coalesce(new.found, false) = false then
    perform vu_match_missing(new.id);
  end if;
  return null;
end $$;

create or replace function public.vu_trg_safe()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' then
    perform vu_match_safe(new.id);
  end if;
  return null;
end $$;

drop trigger if exists vu_missing_match on public.missing_persons;
create trigger vu_missing_match
  after insert or update of status, found on public.missing_persons
  for each row execute function public.vu_trg_missing();

drop trigger if exists vu_safe_match on public.safe_reports;
create trigger vu_safe_match
  after insert or update of status on public.safe_reports
  for each row execute function public.vu_trg_safe();

-- ---- Backfill: poblar coincidencias con los datos ya existentes ----
create or replace function public.vu_backfill_matches()
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select id from missing_persons where status = 'approved' and missing_persons.found = false loop
    perform vu_match_missing(r.id);
  end loop;
end $$;

-- ---- RLS: solo moderadores ven y gestionan la cola ----
alter table public.possible_matches enable row level security;
drop policy if exists "mods read matches" on public.possible_matches;
create policy "mods read matches" on public.possible_matches for select using (public.is_moderator());
drop policy if exists "mods update matches" on public.possible_matches;
create policy "mods update matches" on public.possible_matches for update using (public.is_moderator()) with check (public.is_moderator());
drop policy if exists "admins delete matches" on public.possible_matches;
create policy "admins delete matches" on public.possible_matches for delete using (public.is_admin());

grant select, insert, update, delete on public.possible_matches to anon, authenticated;

-- Vista pública de contador: cuántas familias reconectadas.
create or replace view public.vu_reunions_count as
  select count(*)::int as reunions from public.missing_persons where found = true;
grant select on public.vu_reunions_count to anon, authenticated;
