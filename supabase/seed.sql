-- Datos de ejemplo para desarrollo local (se aplican con `supabase db reset`).
-- Solo contenido aprobado; el moderador se crea aparte vía Auth (ver README).

insert into public.help_listings
  (folio, kind, category, title, description, zone, lat, lng, status)
values
  ('VU-AY1X2','offer','refugio','2 cupos para dormir','Familia con espacio por unos días.','San Cristóbal, Táchira',7.7669,-72.225,'approved'),
  ('VU-AY7B8','need','medico','Necesito insulina refrigerada','Para adulto mayor diabético.','Maracaibo, Zulia',10.6545,-71.6406,'approved')
on conflict do nothing;
