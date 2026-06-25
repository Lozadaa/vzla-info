import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DEMO_MURO } from "../demo";
import type { MuroCategory, MuroPost, ReportStatus } from "../types";

// Almacén local en archivo para el Muro. Se usa cuando Supabase no está
// disponible (modo demo / desarrollo sin backend). Misma forma de datos que la
// tabla `muro_posts`, así que migrar a Supabase no cambia la interfaz.

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "muro-posts.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    // Semilla inicial con los datos demo para tener contenido al arrancar.
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEMO_MURO, null, 2), "utf8");
  }
}

function readAll(): MuroPost[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as MuroPost[];
  } catch {
    return [];
  }
}

function writeAll(posts: MuroPost[]): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf8");
}

const byNewest = (a: MuroPost, b: MuroPost) =>
  +new Date(b.created_at) - +new Date(a.created_at);

export function storeListApproved(): MuroPost[] {
  return readAll()
    .filter((p) => p.status === "approved")
    .sort(byNewest);
}

export function storeListByStatus(status: ReportStatus): MuroPost[] {
  return readAll()
    .filter((p) => p.status === status)
    .sort(byNewest);
}

export function storeInsert(post: MuroPost): MuroPost {
  const posts = readAll();
  if (posts.some((p) => p.tweet_id === post.tweet_id)) {
    throw new Error("Ese tweet ya fue enviado.");
  }
  posts.unshift(post);
  writeAll(posts);
  return post;
}

export function storeSetStatus(
  id: string,
  status: ReportStatus,
  category?: MuroCategory,
): MuroPost | null {
  const posts = readAll();
  const i = posts.findIndex((p) => p.id === id);
  if (i === -1) return null;
  posts[i] = {
    ...posts[i],
    status,
    ...(category ? { category } : {}),
  };
  writeAll(posts);
  return posts[i];
}
