import "server-only";
import { createClient } from "../supabase/server";
import { tweetUrlToPost } from "./oembed";
import { fetchImageBytes, saveImageLocal } from "./screenshot";
import {
  storeDelete,
  storeInsert,
  storeListApproved,
  storeListByStatus,
  storeSetStatus,
} from "./store";
import type { MuroCategory, MuroPost, ReportStatus } from "../types";

// Operaciones del Muro que funcionan en dos modos, de forma transparente:
//  · con Supabase configurado y accesible  → tabla `muro_posts` + Storage
//  · sin Supabase (o inaccesible en dev)    → archivo local + carpeta de capturas
// Así se puede probar el flujo completo ahora y migrar sin tocar la UI.

const STORAGE_BUCKET = "fotos";

// ---- Lecturas ----

export async function muroListApproved(): Promise<MuroPost[]> {
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("muro_posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (!error && data) return data as MuroPost[];
    } catch {
      // Supabase configurado pero inaccesible (dev): caemos al almacén local.
    }
  }
  return storeListApproved();
}

export async function muroListPending(): Promise<MuroPost[]> {
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("muro_posts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (!error && data) return data as MuroPost[];
    } catch {
      // fallback local
    }
  }
  return storeListByStatus("pending");
}

// ---- Ingesta (URL de tweet → screenshot → cola de moderación) ----

export async function muroIngest(rawUrl: string): Promise<MuroPost> {
  const post = await tweetUrlToPost(rawUrl);
  const supabase = await createClient();

  if (supabase) {
    try {
      // Re-alojamos la imagen del tweet en Supabase Storage (bucket "fotos")
      // para no depender del enlace de twimg. Si no hay imagen, se omite.
      if (post.image_url) {
        const buf = await fetchImageBytes(post.image_url);
        if (buf) {
          const filePath = `muro/${post.tweet_id}.jpg`;
          const { error: upErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, buf, { contentType: "image/jpeg", upsert: true });
          if (!upErr) {
            post.image_url = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(filePath).data.publicUrl;
          }
          // Si la subida falla, dejamos la URL original de twimg como respaldo.
        }
      }

      const { error } = await supabase.from("muro_posts").insert({
        tweet_id: post.tweet_id,
        tweet_url: post.tweet_url,
        author_name: post.author_name,
        author_handle: post.author_handle,
        author_verified: post.author_verified,
        text: post.text,
        image_url: post.image_url,
        hashtags: post.hashtags,
        category: post.category,
        zone: post.zone,
        status: "pending",
      });
      if (error) {
        // Error de datos (p. ej. duplicado): informar, no caer a local.
        throw new Error(
          error.code === "23505"
            ? "Ese tweet ya fue enviado."
            : error.message,
        );
      }
      return post;
    } catch (e) {
      // Si fue un error de validación nuestro, relanzarlo.
      if (e instanceof Error && /ya fue enviado/.test(e.message)) throw e;
      // Si fue de conexión (Supabase caído en dev), caemos al almacén local.
    }
  }

  // Sin Supabase (dev/demo): re-alojamos la imagen en disco si la hay.
  if (post.image_url) {
    post.image_url = await saveImageLocal(post.image_url, post.id);
  }
  return storeInsert(post);
}

// ---- Moderación ----

export async function muroSetStatus(
  id: string,
  status: ReportStatus,
  category?: MuroCategory,
): Promise<boolean> {
  const supabase = await createClient();
  if (supabase) {
    try {
      const patch: Record<string, unknown> = { status };
      if (category) patch.category = category;
      // `.select()` nos devuelve las filas realmente modificadas. Si RLS bloquea
      // la actualización (sesión sin permisos de moderador), el UPDATE afecta 0
      // filas SIN error: antes eso devolvía `true` y la aprobación se perdía en
      // silencio. Ahora exigimos que haya vuelto al menos una fila.
      const { data, error } = await supabase
        .from("muro_posts")
        .update(patch)
        .eq("id", id)
        .select("id");
      if (error) throw error;
      return Boolean(data && data.length > 0);
    } catch {
      // Error de conexión real (Supabase caído en dev): caemos al almacén local.
    }
  }
  return storeSetStatus(id, status, category) !== null;
}

// Elimina definitivamente un tweet del muro (solo admins; lo aplica RLS).
export async function muroDelete(id: string): Promise<boolean> {
  const supabase = await createClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("muro_posts").delete().eq("id", id);
      if (!error) return true;
    } catch {
      // fallback local
    }
  }
  return storeDelete(id);
}
