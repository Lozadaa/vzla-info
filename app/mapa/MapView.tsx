"use client";

import dynamic from "next/dynamic";
import type { ZoneCluster } from "@/lib/geo";

const SituationMap = dynamic(() => import("./SituationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-soft)]">
      Cargando mapa…
    </div>
  ),
});

export function MapView({ clusters }: { clusters: ZoneCluster[] }) {
  return <SituationMap clusters={clusters} />;
}
