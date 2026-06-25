-- ============================================================
-- Deduplicación AUTOMÁTICA (sin cola, sin admin).
-- Cambia vu_match_missing: cuando un desaparecido aprobado duplica a otro
-- MÁS ANTIGUO (mismo nombre ≥72% + zona parecida ≥40%), el nuevo se marca
-- status='rejected' al instante. Conserva siempre el registro más antiguo del
-- grupo. Reversible y respetado por el sync externo (omite los 'rejected').
-- Los reencuentros (safe ↔ busco) siguen igual.
-- ============================================================

create or replace function public.vu_match_missing(m_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  select id, full_name, last_seen_zone, created_at into m
  from missing_persons where id = m_id and status = 'approved' and missing_persons.found = false;
  if not found then return; end if;

  perform set_config('pg_trgm.similarity_threshold', '0.62', true);

  -- Duplicado: si ya existe un reporte aprobado igual y "más antiguo"
  -- (created_at menor, o igual con id menor para desempatar), ESTE es el
  -- repetido → se rechaza automáticamente. Garantiza un único superviviente.
  if exists (
    select 1 from missing_persons x
    where x.id <> m.id and x.status = 'approved' and x.found = false
      and vu_norm(x.full_name) % vu_norm(m.full_name)
      and similarity(vu_norm(m.full_name), vu_norm(x.full_name)) >= vu_dup_name_threshold()
      and similarity(vu_norm(m.last_seen_zone), vu_norm(x.last_seen_zone)) >= vu_dup_zone_threshold()
      and (x.created_at < m.created_at or (x.created_at = m.created_at and x.id < m.id))
  ) then
    update missing_persons set status = 'rejected' where id = m.id;
    return; -- ya no es público; no buscamos reencuentros para un duplicado
  end if;

  -- Reencuentro: alguien con nombre muy parecido se marcó "a salvo".
  insert into possible_matches (kind, missing_id, safe_id, score)
  select 'reencuentro', m.id, s.id, similarity(vu_norm(m.full_name), vu_norm(s.full_name))
  from safe_reports s
  where s.status = 'approved'
    and vu_norm(s.full_name) % vu_norm(m.full_name)
    and similarity(vu_norm(m.full_name), vu_norm(s.full_name)) >= vu_reunion_threshold()
  on conflict do nothing;
exception when others then
  return;
end $$;
