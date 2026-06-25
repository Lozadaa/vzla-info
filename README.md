# Vzla Info

PWA de respuesta a emergencias para que las personas puedan **reportar su estado, buscar familiares, aportar información verificada y ubicar ayuda cercana**, con integración a WhatsApp y un mapa comunitario moderado.

Una web con 4 acciones grandes, accesible, rápida y clara:

1. **Estoy a salvo** — avisa a tu gente que estás bien.
2. **Busco a alguien** — reporta o encuentra a un familiar.
3. **Tengo información de alguien** — aporta un dato o avistamiento.
4. **Necesito / ofrezco ayuda** — refugio, comida, médico y más, en el mapa.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — sistema de diseño propio (accesible, WCAG AA, móvil primero)
- **Supabase** (Postgres + Storage + Auth) con **Row Level Security**
- **Leaflet + OpenStreetMap** para el mapa de ayuda
- **PWA** instalable con service worker y shell offline
- Integración con **WhatsApp** (`wa.me` + Web Share API)

## Modelo de seguridad

El público **no necesita cuenta**. Todo lo que se envía entra como `pending` y
**solo se publica tras la revisión de un moderador**. Las pistas (`tips`) y las
solicitudes de modificación nunca son públicas: solo las ven los moderadores.
Esto está garantizado a nivel de base de datos con políticas RLS (ver
`supabase/schema.sql`).

Roles de moderación: `admin` (gestiona todo, exporta CSV) y `volunteer`
(aprueba/rechaza).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena con tus credenciales de Supabase
npm run dev
```

Sin las variables de Supabase, la app corre en **modo demo**: muestra datos de
muestra y los formularios simulan el envío (no guardan nada). Útil para revisar
el diseño.

### Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta `supabase/schema.sql` en el SQL Editor (crea tablas, RLS y el bucket
   de fotos).
3. Copia la URL y la `anon key` (Project Settings → API) a `.env.local`.
4. Crea un usuario en Auth y agrégalo como moderador:
   ```sql
   insert into public.profiles (id, email, role)
   values ('<uuid-del-usuario>', 'mod@correo.com', 'admin');
   ```
5. Entra en `/admin` con ese usuario.

## Exportación para ONGs

Desde `/admin`, un administrador puede descargar CSV (con BOM para Excel) de
cada categoría para compartir con ONGs, voluntarios o autoridades.

## Despliegue

Pensado para **Vercel**. Configura las variables de entorno de Supabase en el
panel del proyecto y despliega.

---

Plataforma comunitaria. No reemplaza a las autoridades ni a servicios de emergencia.
