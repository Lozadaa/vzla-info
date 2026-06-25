"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type Quake, magHex, fmtMag, fmtDepth, fmtWhen } from "@/lib/sismos";

// Mapa de epicentros — círculos proporcionales a la magnitud y coloreados por
// severidad. Sin imágenes externas: todo es vectorial (CircleMarker).
const VENEZUELA_CENTER: [number, number] = [9.5, -67.5];

// Radio del círculo en píxeles, crece con la magnitud.
function radius(mag: number | null): number {
  const m = mag ?? 1;
  return Math.max(4, m * 2.2);
}

export default function SismosMap({ quakes }: { quakes: Quake[] }) {
  const pts = quakes.filter((k) => Number.isFinite(k.lat) && Number.isFinite(k.lng));

  return (
    <MapContainer
      center={VENEZUELA_CENTER}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      aria-label="Mapa de epicentros de sismos en Venezuela"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pts.map((k) => {
        const color = magHex(k.mag);
        return (
          <CircleMarker
            key={k.id}
            center={[k.lat, k.lng]}
            radius={radius(k.mag)}
            pathOptions={{ color: "#fff", weight: 1.5, fillColor: color, fillOpacity: 0.78 }}
          >
            <Popup>
              <strong style={{ color }}>Magnitud {fmtMag(k.mag)}</strong>
              <br />
              {k.place}
              <br />
              <span style={{ color: "#515b68" }}>
                {fmtWhen(k.time)} · Prof. {fmtDepth(k.depthKm)}
              </span>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
