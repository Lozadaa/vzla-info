"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "../components/Notice";

export function LoginForm() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase no está configurado.");
      setSending(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    if (error) {
      setError("Credenciales incorrectas.");
      setSending(false);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-extrabold">Acceso de moderación</h1>
      <p className="text-sm text-[var(--color-ink-soft)]">
        Solo para el equipo de moderadores y administradores.
      </p>
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <label htmlFor="email" className="field-label">Correo</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
        {sending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
