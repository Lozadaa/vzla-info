# Muro de emergencia — estado y pendientes

Sección que recopila **tweets** sobre personas desaparecidas, quienes necesitan
ayuda y quienes la ofrecen. La gente pega el enlace de un tweet → se reconstruye
(oEmbed, gratis) + se le toma **screenshot** → entra a **moderación** → al
aprobarse aparece en `/muro` y en el preview del inicio.

> Todo gratis: oEmbed público de X + screenshots vía thum.io. Sin API de pago.

---

## ✅ Lo que ya funciona

- Página `/muro` (feed en cascada + filtros de triage + "en vivo" cada 30 s).
- Aportar tweet pegando la URL (`/muro` → formulario → `POST /api/muro/ingest`).
- Reconstrucción del tweet (autor + texto) con oEmbed.
- Screenshot del tweet (esquiva el muro de login fotografiando el embed).
- Clasificador heurístico de triage (CRÍTICO / URGENTE / RECURSO / sin triage).
- Moderación de tweets en `/muro/revisar` y acceso desde `/admin`
  (aprobar / rechazar / fijar categoría / eliminar publicados).
- Preview con miniaturas en el inicio (`MuroPreview`).
- Capa de datos **resiliente**: usa Supabase si está; si no, archivo local
  (`data/muro-posts.json` + `public/muro-shots/`, ambos en `.gitignore`).
- Tabla `muro_posts` + RLS definidas en `supabase/schema.sql`.

---

## ⛔ Pendiente (en orden de prioridad)

### 1. Permisos/políticas de `muro_posts` en Supabase  ← BLOQUEANTE
La tabla existe en la nube, pero **faltan los GRANT y las políticas RLS**. Sin
esto, enviar un tweet falla con `42501 (row-level security)` y no se puede
aprobar nada. Correr en **Supabase → SQL Editor**:

```sql
-- Permisos de tabla
grant select, insert, update, delete on public.muro_posts to anon, authenticated;

-- Activar RLS
alter table public.muro_posts enable row level security;

-- Políticas (igual que el resto del contenido público)
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
```

### 2. Usuario moderador
Para entrar a `/admin` y moderar hace falta un usuario de Supabase Auth + su
fila en `profiles`:

```sql
-- 1) Crear el usuario en Authentication → Users (o por la app).
-- 2) Con su UUID:
insert into public.profiles (id, email, role)
values ('<uuid-del-usuario>', 'tucorreo@ejemplo.com', 'admin');
```

### 3. Screenshots en producción (Vercel)
El guardado local en `public/muro-shots/` **solo sirve en desarrollo** (Vercel
no persiste disco). En producción ya está implementado subir a **Supabase
Storage (bucket `fotos`)** en `lib/muro/db.ts`. Falta **verificar de punta a
punta** que el bucket `fotos` existe y que sus políticas permiten subir/leer
(ver bloque de Storage en `supabase/schema.sql`).

### 4. Ingesta automática por hashtags (decisión de producto)
Hoy es **manual** (alguien pega la URL). El automático "que jale solo por
hashtag" tiene estas opciones:
- **API oficial de X**: de pago (~US$100/mes). Estable. ❌ presupuesto.
- **RSSHub / Nitter**: gratis pero frágil y contra los términos de X. ⚠️
- **Comunidad (recomendado)**: la gente pega enlaces; gratis y robusto.

Decidir si se deja solo comunidad o se añade un bridge RSS opcional.

### 5. Límites del servicio de screenshots
thum.io (gratis) tiene **límite de uso diario** y a veces tarda. Si el volumen
crece, migrar a **Puppeteer auto-hospedado** (código de referencia comentado en
`lib/muro/screenshot.ts`).

---

## 🔁 Probar el flujo completo (local)

1. Correr el SQL del punto 1 en Supabase.
2. Crear el moderador (punto 2).
3. `npm run dev` (reiniciar si cambió `.env.local`).
4. `/admin` → iniciar sesión.
5. `/muro` → pegar un enlace de tweet → enviar.
6. `/admin` (o `/muro/revisar`) → aprobar → aparece en `/muro` y en el preview
   del inicio.

---

## 🗂️ Archivos de la sección

| Área | Archivos |
|---|---|
| Páginas | `app/muro/page.tsx`, `app/muro/revisar/page.tsx` |
| UI | `app/muro/MuroFeed.tsx`, `TweetCard.tsx`, `SubmitTweet.tsx`, `app/components/MuroPreview.tsx` |
| API | `app/api/muro/route.ts` (feed), `ingest/route.ts`, `moderate/route.ts` |
| Lógica | `lib/muro/db.ts`, `oembed.ts`, `screenshot.ts`, `classify.ts`, `store.ts` |
| Datos | `lib/types.ts` (`MuroPost`, `MURO_CATEGORIES`), `lib/data.ts`, `lib/demo.ts` |
| BD | `supabase/schema.sql` (tabla `muro_posts` + RLS) |

> Nota: `data/` y `public/muro-shots/` son solo de desarrollo (en `.gitignore`).

---
---

# Desaparecidos (terremoto) — importación + sincronización automática

Espejo de la lista pública del sitio
[desaparecidosterremotovenezuela.com](https://desaparecidosterremotovenezuela.com)
hacia nuestra tabla `missing_persons`. Se descubrió su API oculta
(`https://desaparecidos-terremoto-api.theempire.tech/api/personas`), se importaron
los datos **deduplicados** y se dejó un **cron** que cada 10 min trae lo nuevo.

> Estrategia de dedupe **"B"**: misma persona = `nombre + ubicación + contacto`
> normalizados (minúsculas, espacios colapsados). Se conserva el reporte "más
> rico" del grupo (con foto > descripción más larga > más antiguo).

---

## ✅ Lo que ya funciona (verificado de verdad)

- **Semilla importada**: 2063 → **1944** personas (deduplicadas) cargadas en
  Supabase como `approved`. Visibles en `/busco`.
- **Fix límite de 1000 filas** de Supabase/PostgREST en `lib/data.ts`
  (paginación por bloques) → `/busco` muestra las 1944 completas, no 1000.
- **Paginación "Ver más"** (24 por tanda) en `MissingList`; el inicio pide solo 6
  (`getMissingPersons(6)`), sin bajar todo.
- **Script de sync** (`scripts/sync-desaparecidos.mjs`): fetch **paginado** de la
  API (cambió a `{items, total, page, totalPages}`), dedupe + mapeo. Dry-run
  real: **4401 → 4230** personas, todas con clave única.
- **Paridad SQL↔JS** de `dedupe_key`: medida sobre los datos → **0 desajustes**
  (clave: tratar el espacio-no-rompible `U+00A0` igual en ambos lados).
- **Respeta moderación**: el sync omite las fichas marcadas `rejected`.

---

## ⛔ Pendiente (en orden)

### 1. Aplicar la migración del sync  ← BLOQUEANTE para el cron
```bash
npx supabase db push   # aplica supabase/migrations/20260625060000_missing_sync.sql
```
Añade `dedupe_key` + índice único, backfillea la semilla (`TVE-%`) y crea la
secuencia de folios automáticos (`TVE-1945`…). Es **aditiva**: no toca RLS,
lecturas ni el formulario.

### 2. Secretos en GitHub (repo `Lozadaa/vzla-info` → Settings → Secrets → Actions)
- `SUPABASE_URL` = `https://gxxftzmhkmqeyqjflmqv.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (Supabase → Project Settings →
  API). **Secreta**: solo vive en Actions, nunca en el cliente.

### 3. Commitear/pushear los 3 archivos del sync
Sin esto GitHub Actions no ve el workflow:
`supabase/migrations/20260625060000_missing_sync.sql`,
`scripts/sync-desaparecidos.mjs`, `.github/workflows/sync-desaparecidos.yml`.

### 4. Primer run del workflow  ← NO verificado todavía
GitHub → **Actions** → "Sincronizar desaparecidos" → **Run workflow**. Falta
verificar de punta a punta: la escritura real (upsert con `service_role`), el
índice único / ON CONFLICT y el filtro de rechazos contra la base real.

### 5. Fotos permanentes (opcional)
~**1679 fotos** (~99 MB) son **hotlink** al S3 del sitio original. Si ese bucket
se cae, desaparecen de nuestra web. Pendiente: descargarlas al bucket `fotos` de
Supabase y reescribir `photo_url`. Costo de almacenamiento ≈ $0 (cabe en el plan
Free de 1 GB).

### 6. Limpieza menor
- `app/components/MuroPreview.tsx` quedó **huérfano** (el nuevo `app/page.tsx` del
  rediseño usa un bloque de muro inline, no ese componente).
- `supabase/migrations/20260625043032_muro_posts.sql` es **redundante**: el
  remoto ya trae `20260625040000_muro.sql` (idempotente) para `muro_posts`.

---

## ⚠️ Comportamiento a tener en cuenta

El sync es un **espejo** del origen: en cada corrida **sobrescribe** los campos
de las filas sincronizadas (foto, descripción, "localizado"…). Es decir, una
edición manual de un moderador sobre una ficha del sync **se revierte**. Las
**excepciones** que sí se respetan:
- Fichas **`rejected`** → nunca se re-publican.
- Reportes del **formulario público** (`dedupe_key` NULL) → el sync no los toca.

---

## 🔁 Probar / verificar el sync

1. `npx supabase db push` (punto 1).
2. Crear los 2 secretos en GitHub (punto 2).
3. Commitear/pushear los 3 archivos (punto 3).
4. Actions → "Sincronizar desaparecidos" → Run workflow → revisar el log
   (`Fuente: N → M tras deduplicar`, `✓ Sincronización completa`).
5. Comprobar que `/busco` pasó de ~1944 a ~4230 fichas.
6. (Opcional) Probar el respeto a rechazos: rechazar una ficha en `/admin`,
   re-correr el workflow y confirmar que NO vuelve a aparecer.

---

## 🗂️ Archivos de la sección

| Área | Archivos |
|---|---|
| Importación semilla | `supabase/migrations/20260625050000_import_desaparecidos_terremoto.sql` |
| Migración del sync | `supabase/migrations/20260625060000_missing_sync.sql` |
| Script de sync | `scripts/sync-desaparecidos.mjs` |
| Cron | `.github/workflows/sync-desaparecidos.yml` |
| Lectura/paginación | `lib/data.ts` (`getMissingPersons`), `app/busco/MissingList.tsx` |
| UI fichas | `app/busco/page.tsx`, `app/page.tsx` (preview), `app/components/MissingCard.tsx` |
| Tipos/BD | `lib/types.ts` (`MissingPerson`), `supabase/migrations/20260625033250_init.sql` |
