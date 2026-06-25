import "server-only";
import { createClient } from "../supabase/server";
import { tweetUrlToPost } from "./oembed";
import { fetchTweetScreenshot, saveScreenshotLocal } from "./screenshot";
import {
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
      // Screenshot → Supabase Storage (bucket público "fotos").
      const buf = await fetchTweetScreenshot(post.tweet_url);
      if (buf) {
        const filePath = `muro/${post.tweet_id}.png`;
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, buf, { contentType: "image/png", upsert: true });
        if (!upErr) {
          post.image_url = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath).data.publicUrl;
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

  post.image_url = await saveScreenshotLocal(post.tweet_url, post.id);
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
      const { error } = await supabase
        .from("muro_posts")
        .update(patch)
        .eq("id", id);
      if (!error) return true;
    } catch {
      // fallback local
    }
  }
  return storeSetStatus(id, status, category) !== null;
}
