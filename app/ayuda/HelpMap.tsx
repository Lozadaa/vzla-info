"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HelpListing, categoryEmoji } from "@/lib/types";
import { waLink } from "@/lib/utils";

// Marcadores como "pin" de color según necesita/ofrece — sin imágenes externas.
function pin(kind: HelpListing["kind"]) {
  const color = kind === "offer" ? "#2e7d5b" : "#c77d2e";
  return L.divIcon({
    className: "vu-pin",
    html: `<span style="
      display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);background:${color};
      border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.35)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20],
  });
}

const VENEZUELA_CENTER: [number, number] = [7.9, -66.0];

export default function HelpMap({ listings }: { listings: HelpListing[] }) {
  const withCoords = listings.filter((l) => l.lat != null && l.lng != null);

  return (
    <MapContainer
      center={VENEZUELA_CENTER}
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      aria-label="Mapa de ayuda disponible y solicitada"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((l) => (
        <Marker key={l.id} position={[l.lat as number, l.lng as number]} icon={pin(l.kind)}>
          <Popup>
            <strong>
              {categoryEmoji(l.category)} {l.title}
            </strong>
            <br />
            <span style={{ color: l.kind === "offer" ? "#2e7d5b" : "#c77d2e", fontWeight: 600 }}>
              {l.kind === "offer" ? "Ofrece" : "Necesita"}
            </span>{" "}
            · {l.zone}
            {l.contact_whatsapp && (
              <>
                <br />
                <a href={waLink(l.contact_whatsapp, `Hola, te escribo por “${l.title}” en Venezuela Unida.`)} target="_blank" rel="noopener">
                  Contactar por WhatsApp
                </a>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
