"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { ZoneCluster } from "@/lib/geo";

// Centro aproximado de la costa de La Guaira/Vargas.
const CENTER: [number, number] = [10.56, -66.82];

function radiusFor(count: number) {
  return Math.max(9, Math.min(42, 6 + Math.sqrt(count) * 0.95));
}

export default function SituationMap({ clusters }: { clusters: ZoneCluster[] }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      aria-label="Mapa de personas buscadas por zona"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusters.map((c) => (
        <CircleMarker
          key={c.name}
          center={[c.lat, c.lng]}
          radius={radiusFor(c.count)}
          pathOptions={{
            color: "#7d121a",
            weight: 1,
            fillColor: "#c01722",
            fillOpacity: 0.55,
          }}
        >
          <Tooltip permanent direction="center" className="vu-cluster-label">
            {c.count}
          </Tooltip>
          <Popup>
            <strong>{c.name}</strong>
            <br />
            {c.count} {c.count === 1 ? "persona buscada" : "personas buscadas"}
            <br />
            <Link href="/busco">Ver en la lista →</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
