"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface WineWithCoords {
  id: number;
  lat?: number;
  lng?: number;
  location?: string | null;
  region?: string | null;
}

interface ProfileMapPreviewProps {
  wines: WineWithCoords[];
}

const DEFAULT_CENTER: [number, number] = [39.8, -98.6];
const DEFAULT_ZOOM = 4;

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (positions.length === 1) {
      map.setView(positions[0], 6);
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
  }, [map, positions]);

  return null;
}

export function ProfileMapPreview({ wines }: ProfileMapPreviewProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  const purpleCircleIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="
          width: 10px;
          height: 10px;
          background-color: #9333EA;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        "></div>`,
        className: "profile-map-preview-marker",
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      }),
    []
  );

  const coords = useMemo(() => {
    const out: [number, number][] = [];
    for (const w of wines) {
      if (w.lat != null && w.lng != null) out.push([w.lat, w.lng]);
    }
    return out;
  }, [wines]);

  const winesWithCoords = useMemo(
    () => wines.filter((w) => w.lat != null && w.lng != null),
    [wines]
  );

  return (
    <div className="h-[150px] w-full overflow-hidden rounded-xl border border-neutral-200">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <FitBounds positions={coords} />
        {winesWithCoords.map((w) => (
          <Marker
            key={w.id}
            position={[w.lat!, w.lng!]}
            icon={purpleCircleIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
}
