"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Wine {
  id: number;
  producer: string;
  vintage: number;
  varietal: string;
  region: string | null;
  location: string | null;
  rating: number;
  lat?: number;
  lng?: number;
}

interface WineMapProps {
  wines: Wine[];
}

export function WineMap({ wines }: WineMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  const purpleIcon = useMemo(() => {
    return L.divIcon({
      html: `<div style="
        width: 25px;
        height: 41px;
        background-color: #9333EA;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>`,
      className: "custom-purple-marker",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }, []);

  const winesWithCoords = wines.filter((w) => w.lat != null && w.lng != null);

  return (
    <MapContainer
      center={[39.8, -98.6]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      {winesWithCoords.map((wine) => (
        <Marker
          key={wine.id}
          position={[wine.lat!, wine.lng!]}
          icon={purpleIcon}
        >
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-neutral-900">{wine.producer}</p>
              <p className="text-sm text-neutral-600">
                {wine.vintage} · {wine.varietal}
              </p>
              <p className="text-sm font-medium text-purple-600 mt-1">
                Rating: {wine.rating.toFixed(1)}/10
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
