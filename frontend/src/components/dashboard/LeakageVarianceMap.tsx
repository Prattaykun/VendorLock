"use client";

import { CircleMarker, MapContainer, Popup, Rectangle, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { coverageZones } from "@/lib/mock-data";

type RegionalLeakage = {
  region_id: string;
  region_name: string;
  leakage_percentage: number;
  status: string;
  confidence: number;
  latency_days: number;
  likely_cause: string;
};

const regionCoordinates: Record<string, [number, number]> = {
  "South Mumbai": [18.963, 72.832],
  "Thane & Surrounding": [19.218, 72.978],
  "Central Mumbai": [19.017, 72.857],
};

const beatAreaBounds: Record<string, [[number, number], [number, number]]> = {
  "Dadar West": [[19.01, 72.812], [19.04, 72.845]],
  "Vile Parle East": [[19.077, 72.83], [19.105, 72.86]],
  "Kurla West": [[19.055, 72.87], [19.09, 72.905]],
  "Bhandup East": [[19.128, 72.94], [19.16, 72.975]],
  "Thane Station": [[19.19, 72.96], [19.235, 73.005]],
  "Malad West": [[19.178, 72.805], [19.21, 72.845]],
  "Dharavi": [[19.035, 72.845], [19.065, 72.875]],
  "Kalyan East": [[19.215, 73.11], [19.255, 73.155]],
};

const beatStatusPalette: Record<string, { fill: string; border: string; label: string }> = {
  VISITED_ORDERS: { fill: "#22c55e", border: "#86efac", label: "Visited with Orders" },
  VISITED_NO_ORDERS: { fill: "#f59e0b", border: "#fcd34d", label: "Visited, No Orders" },
  NOT_VISITED: { fill: "#475569", border: "#94a3b8", label: "Not Visited" },
};

export default function LeakageVarianceMap({ regions }: { regions: RegionalLeakage[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70">
      <MapContainer
        center={[19.05, 72.9]}
        zoom={10}
        scrollWheelZoom
        attributionControl={false}
        className="h-80 w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {coverageZones.map((zone) => {
          const area = beatAreaBounds[zone.sector];
          const palette = beatStatusPalette[zone.status] ?? beatStatusPalette.NOT_VISITED;

          if (!area) {
            return null;
          }

          return (
            <Rectangle
              key={zone.id}
              bounds={area}
              pathOptions={{
                color: palette.border,
                weight: 1.5,
                fillColor: palette.fill,
                fillOpacity: 0.1,
                dashArray: zone.status === "NOT_VISITED" ? "4 6" : undefined,
              }}
            />
          );
        })}
        {regions.map((region) => {
          const coordinates = regionCoordinates[region.region_name] ?? [19.05, 72.9];
          const markerRadius = 10 + region.leakage_percentage / 2;

          return (
            <CircleMarker
              key={region.region_id}
              center={coordinates}
              radius={markerRadius}
              pathOptions={{
                color: region.status === "CRITICAL" ? "#f87171" : "#fbbf24",
                fillColor: region.status === "CRITICAL" ? "#ef4444" : "#f59e0b",
                fillOpacity: 0.5,
                weight: 2.5,
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{region.region_name}</p>
                  <p className="text-xs">Leakage: {region.leakage_percentage}%</p>
                  <p className="text-xs">Confidence: {region.confidence}%</p>
                  <p className="text-xs">Latency: {region.latency_days} days</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}