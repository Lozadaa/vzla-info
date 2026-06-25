-- ============================================================
-- Soporte para la sincronización automática de desaparecidos.
-- (cron de GitHub Actions → scripts/sync-desaparecidos.mjs)
--
-- Necesitamos un upsert idempotente: re-correr el sync NO debe duplicar.
-- La clave natural es nombre+ubicación+contacto normalizados (misma
-- estrategia "B" con la que se importó la semilla). Guardamos esa clave
-- en `dedupe_key` con índice único y hacemos ON CONFLICT (dedupe_key).
-- ============================================================

-- 1) Columna de clave de deduplicación.
alter table public.missing_persons
  add column if not exists dedupe_key text;

-- 2) Backfill SOLO de la semilla importada (folios TVE-%). La normalización
--    debe coincidir EXACTAMENTE con la del script (lower + colapsar espacios
--    + recortar). Se restringe a TVE-% para no chocar el índice único con
--    reportes que el público haya enviado por el formulario (esos conservan
--    dedupe_key NULL y conviven sin problema).
-- Nota: el espacio-no-rompible (U+00A0) cuenta como espacio en el `\s` de
-- JavaScript pero NO siempre en el de Postgres; lo convertimos a espacio
-- normal primero para que ambas normalizaciones coincidan exactamente
-- (sin esto, ~10 filas de la semilla se duplicarían en el primer sync).
update public.missing_persons
set dedupe_key =
      lower(btrim(regexp_replace(replace(coalesce(full_name,''),       U&'\00A0', ' '), '\s+', ' ', 'g'))) || '|' ||
      lower(btrim(regexp_replace(replace(coalesce(last_seen_zone,''),  U&'\00A0', ' '), '\s+', ' ', 'g'))) || '|' ||
      lower(btrim(regexp_replace(replace(coalesce(contact_whatsapp,''),U&'\00A0', ' '), '\s+', ' ', 'g')))
where dedupe_key is null
  and folio like 'TVE-%';

-- 3) Índice único (los NULL no colisionan entre sí, así que los reportes
--    enviados por el formulario público —sin dedupe_key— conviven sin chocar).
create unique index if not exists missing_persons_dedupe_key_uidx
  on public.missing_persons (dedupe_key);

-- 4) Folios automáticos para las personas NUEVAS que traiga el sync.
--    Empieza después de las 1944 de la semilla (TVE-0001..TVE-1944).
--    El sync omite `folio` en su payload → estas filas reciben el default,
--    y en los upsert de actualización el folio existente no se toca.
create sequence if not exists public.missing_folio_seq start 1945;
alter table public.missing_persons
  alter column folio set default
    'TVE-' || lpad(nextval('public.missing_folio_seq')::text, 4, '0');
