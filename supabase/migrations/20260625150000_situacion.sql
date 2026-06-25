-- Vista de apoyo para el "Mapa de situación": conteo de personas buscadas por
-- zona (texto normalizado). Agrega en la BD para no traer ~10k filas al cliente.
create or replace view public.vu_missing_zones as
  select public.vu_norm(last_seen_zone) as zone, count(*)::int as n
  from public.missing_persons
  where status = 'approved'
    and found = false
    and coalesce(btrim(last_seen_zone), '') <> ''
  group by 1;

grant select on public.vu_missing_zones to anon, authenticated;
