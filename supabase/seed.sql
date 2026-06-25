-- Datos de ejemplo para desarrollo local (se aplican con `supabase db reset`).
-- Solo contenido aprobado; el moderador se crea aparte vía Auth (ver README).

insert into public.missing_persons
  (folio, full_name, age, last_seen_zone, last_seen_at, description, reporter_relation, status)
values
  ('VU-7K2A9','Carlos Pérez Rivas',34,'Av. Sucre, Maracay','2026-06-21','Camisa azul y jeans, usa lentes.','hermana','approved'),
  ('VU-3F1Q4','Ana Lucía Mendoza',19,'Terminal de Petare, Caracas','2026-06-23','Cabello rizado, mochila roja.','madre','approved')
on conflict do nothing;

insert into public.help_listings
  (folio, kind, category, title, description, zone, lat, lng, status)
values
  ('VU-AY1X2','offer','refugio','2 cupos para dormir','Familia con espacio por unos días.','San Cristóbal, Táchira',7.7669,-72.225,'approved'),
  ('VU-AY7B8','need','medico','Necesito insulina refrigerada','Para adulto mayor diabético.','Maracaibo, Zulia',10.6545,-71.6406,'approved')
on conflict do nothing;
