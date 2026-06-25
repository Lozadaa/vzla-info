-- ============================================================
-- Analítica propia de visitas (sin terceros).
-- Cada visita real (filtrada de bots en el servidor) se registra como una fila.
-- El público INSERTA; solo moderadores LEEN las cifras.
-- ============================================================

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,        -- id anónimo del navegador (localStorage)
  path text not null,              -- ruta visitada
  referrer text,                   -- de dónde llegó (si lo comparte el navegador)
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_idx on public.page_views (visitor_id);

alter table public.page_views enable row level security;

-- ¿El usuario actual es super-admin? Comprueba el correo VERIFICADO en
-- auth.users (no el de profiles, que se inserta a mano y podría falsearse).
-- security definer para poder leer auth.users. La lista debe coincidir con la
-- constante SUPER_ADMINS del servidor (app/admin/page.tsx).
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and lower(email) in ('rubendsemprunc@gmail.com', 'rlozada808@gmail.com')
  );
$$;

-- Cualquiera puede registrar una visita; SOLO super-admins pueden leerlas.
drop policy if exists "anyone logs a view" on public.page_views;
create policy "anyone logs a view" on public.page_views
  for insert with check (true);

drop policy if exists "moderators read views" on public.page_views;
drop policy if exists "superadmins read views" on public.page_views;
create policy "superadmins read views" on public.page_views
  for select using (public.is_superadmin());

grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;

-- Agregados para el panel. security definer (puede contar todo), pero PRIMERO
-- exige super-admin: cualquier otro correo recibe null aunque llame al RPC.
create or replace function public.visit_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    return null;
  end if;
  return (
    select json_build_object(
      'total_views',     (select count(*) from public.page_views),
      'unique_visitors', (select count(distinct visitor_id) from public.page_views),
      'views_24h',       (select count(*) from public.page_views where created_at > now() - interval '24 hours'),
      'unique_24h',      (select count(distinct visitor_id) from public.page_views where created_at > now() - interval '24 hours'),
      'views_7d',        (select count(*) from public.page_views where created_at > now() - interval '7 days'),
      'top_paths',       (select coalesce(json_agg(t), '[]'::json) from (
                            select path, count(*)::int as views
                            from public.page_views
                            group by path
                            order by count(*) desc
                            limit 8
                          ) t)
    )
  );
end;
$$;

grant execute on function public.is_superadmin() to anon, authenticated;
grant execute on function public.visit_stats() to anon, authenticated;
