"use client";

import { useEffect, useState, Fragment } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { salesmen, ghostVisitAlerts, beatPlan as mockBeatPlan } from "@/lib/mock-data";
import { formatInr } from "@/lib/helpers";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false }
);

const beatTerritories = [
  { name: "Rajeev (Linking Rd)", status: "critical", color: "#ef4444", center: [19.0620, 72.8330] as [number, number] },
  { name: "Amit (SV Rd)", status: "optimal", color: "#10b981", center: [19.0600, 72.8380] as [number, number] },
  { name: "Vikram (Carter Rd)", status: "at-risk", color: "#f97316", center: [19.0560, 72.8310] as [number, number] },
];

const statusColors: Record<string, string> = {
  optimal: "#10b981",
  "at-risk": "#f97316",
  critical: "#ef4444",
};

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const COLORS = {
  bg: "#081425",
  surface: "#152031",
  surfaceLow: "#111c2d",
  surfaceHigh: "#1f2a3c",
  surfaceHighest: "#2a3548",
  primary: "#adc6ff",
  primaryContainer: "#4d8eff",
  error: "#ffb4ab",
  errorContainer: "#93000a",
  onSurface: "#d8e3fb",
  onSurfaceVariant: "#c2c6d6",
  outline: "#8c909f",
  outlineVariant: "#424754",
  secondary: "#b7c8e1",
  tertiary: "#bec6e0",
} as const;

const MapPlaceholder = () => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="flex-1 relative flex items-center justify-center">
        <span className="text-sm" style={{ color: COLORS.outline }}>Map Interface Loading...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[19.0620, 72.8350]}
      zoom={14}
      style={{ height: "100%", width: "100%", minHeight: "340px" }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {beatTerritories.map((beat) => (
        <Fragment key={beat.name}>
          <Circle
            center={beat.center}
            radius={350}
            pathOptions={{
              color: beat.color,
              fillColor: beat.color,
              fillOpacity: 0.2,
              weight: 1,
            }}
          >
            <Tooltip sticky>
              <span className="font-medium text-sm">{beat.name}</span>
            </Tooltip>
          </Circle>
          <CircleMarker
            center={beat.center}
            radius={6}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: beat.color,
              fillOpacity: 1,
            }}
          />
        </Fragment>
      ))}
    </MapContainer>
  );
};

export default function BeatIntelligencePanel() {
  const [liveBeatPlan, setLiveBeatPlan] = useState<any[]>([]);

  useEffect(() => {
    // Assuming salesmanId 'sm-1' for demo purposes
    import("@/lib/api-client").then(({ getBeatPlan }) => {
      getBeatPlan("sm-1").then((data) => {
        if (data && data.beat_plan && data.beat_plan.length > 0) {
          setLiveBeatPlan(data.beat_plan);
        }
      }).catch(() => {});
    });
  }, []);

  const displayBeatPlan = liveBeatPlan.length > 0 ? liveBeatPlan : mockBeatPlan;
  const totalGhostAlerts = salesmen.reduce((sum, sm) => sum + sm.ghostVisitCount, 0);

  return (
    <section className="flex flex-col h-full overflow-hidden">
      {/* Status Badges */}
      <motion.div {...fadeUp} className="flex gap-4 px-1 py-4 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
          style={{ backgroundColor: `${COLORS.errorContainer}18`, borderColor: `${COLORS.errorContainer}4D` }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.error }} />
          <span className="text-xs font-medium" style={{ color: COLORS.error }}>{totalGhostAlerts} Ghost Alerts</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
          style={{ backgroundColor: `${COLORS.primary}1A`, borderColor: `${COLORS.primary}4D` }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.primaryContainer }} />
          <span className="text-xs font-medium" style={{ color: COLORS.primary }}>Live Sync: Active</span>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid gap-4 pb-4" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
          {/* Coverage Heatmap - Col 8 */}
          <motion.div {...fadeUp} className="col-span-8">
            <div
              className="relative rounded-xl overflow-hidden flex flex-col"
              style={{ height: "340px", backgroundColor: COLORS.surface }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: `${COLORS.surfaceHighest}80` }} />

              <div
                className="px-4 py-3 flex justify-between items-center border-b"
                style={{
                  backgroundColor: `${COLORS.surface}80`,
                  borderColor: COLORS.outlineVariant,
                  backdropFilter: "blur(12px)",
                }}
              >
                <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.onSurface }}>
                  <svg className="w-4 h-4" style={{ color: COLORS.primary }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Coverage Heatmap
                </CardTitle>
                <div className="flex gap-4 text-[10px]" style={{ color: COLORS.onSurfaceVariant }}>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.optimal, boxShadow: `0 0 6px ${statusColors.optimal}` }} />
                    Optimal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors["at-risk"], boxShadow: `0 0 6px ${statusColors["at-risk"]}` }} />
                    At Risk
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.critical, boxShadow: `0 0 6px ${statusColors.critical}` }} />
                    Critical
                  </span>
                </div>
              </div>

              <div className="flex-1 relative" style={{ backgroundColor: COLORS.surfaceLow }}>
                <MapPlaceholder />
              </div>
            </div>
          </motion.div>

          {/* Field Operatives - Col 4 */}
          <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="col-span-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 h-8" style={{ color: COLORS.onSurface }}>
              <svg className="w-4 h-4" style={{ color: COLORS.secondary }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0C6.66 11 5 9.66 5 8s1.66-3 3-3 3 1.34 3 3-1.66 3-3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              Field Operatives
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {salesmen.map((sm, i) => {
                const isFlagged = sm.ghostVisitCount > 3;
                return (
                  <motion.div
                    key={sm.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-lg p-3 relative overflow-hidden transition-colors"
                    style={{
                      backgroundColor: `${COLORS.surface}66`,
                      backdropFilter: "blur(12px)",
                      border: `1px solid ${isFlagged ? `${COLORS.errorContainer}4D` : `${COLORS.outlineVariant}80`}`,
                    }}
                  >
                    {isFlagged && (
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: `${COLORS.error}33` }} />
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={sm.avatarUrl}
                        alt={sm.name}
                        className="w-10 h-10 rounded-full object-cover"
                        style={{ border: `1px solid ${COLORS.outlineVariant}`, backgroundColor: COLORS.surfaceHighest }}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold" style={{ color: COLORS.onSurface }}>{sm.name}</h4>
                        <p className="text-[10px]" style={{ color: isFlagged ? COLORS.error : COLORS.onSurfaceVariant }}>
                          {isFlagged ? "Zone Flagged" : "Zone Active"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className="font-mono text-sm font-medium"
                          style={{
                            color: sm.reliabilityScore >= 85 ? COLORS.secondary : sm.reliabilityScore >= 70 ? COLORS.primary : sm.reliabilityScore >= 50 ? COLORS.tertiary : COLORS.error
                          }}
                        >
                          {sm.reliabilityScore}%
                        </div>
                        <div className="text-[10px]" style={{ color: COLORS.outline }}>Reliability</div>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-3 gap-2 p-2 rounded"
                      style={{ backgroundColor: COLORS.surfaceHighest }}
                    >
                      <div className="text-center">
                        <div className="font-mono text-sm" style={{ color: COLORS.onSurface }}>{sm.outletsAssigned}</div>
                        <div className="text-[9px] uppercase" style={{ color: COLORS.outline }}>Outlets</div>
                      </div>
                      <div className="text-center border-l border-r" style={{ borderColor: `${COLORS.outlineVariant}4D` }}>
                        <div className="font-mono text-sm" style={{ color: COLORS.tertiary }}>{sm.outletsWithChat}</div>
                        <div className="text-[9px] uppercase" style={{ color: COLORS.outline }}>2-Way</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-sm" style={{ color: sm.ghostVisitCount > 0 ? COLORS.error : COLORS.onSurface }}>{sm.ghostVisitCount}</div>
                        <div className="text-[9px] uppercase" style={{ color: `${COLORS.error}B3` }}>Ghosts</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Active Beat Plan - Col 12 (full width) */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="col-span-12">
            <div className="rounded-xl overflow-hidden relative" style={{ backgroundColor: COLORS.surface }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: `${COLORS.surfaceHighest}80` }} />

              <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: COLORS.outlineVariant }}>
                <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.onSurface }}>
                  <svg className="w-4 h-4" style={{ color: COLORS.primary }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.78 11.16l-1.42 1.42a7.003 7.003 0 011.11-9.34L9.81 3.6c.79-.78 2.05-.78 2.83-.01l.06.06c.78.78.78 2.05-.01 2.83l-.56.56 1.28 1.28-5.63 5.63zM11 12c0-1.1.9-2 2-2s2 .9 2 2-1.1 2-2 2-2-.9-2-2z" />
                  </svg>
                  Active Beat Plan
                </CardTitle>
                <button
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: COLORS.primary }}
                >
                  View Full Manifest
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>

              <Table className="text-sm">
                <TableHeader style={{ backgroundColor: `${COLORS.surfaceHighest}80` }}>
                  <TableRow className="border-b">
                    <TableHead className="px-3 py-2 text-xs uppercase">Outlet</TableHead>
                    <TableHead className="px-3 py-2 text-xs uppercase">Assigned To</TableHead>
                    <TableHead className="px-3 py-2 text-xs uppercase">Priority SKUs</TableHead>
                    <TableHead className="px-3 py-2 text-xs uppercase text-right">Risk Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayBeatPlan.map((bp, i) => {
                    const hasRisk = bp.riskFlags && bp.riskFlags.length > 0;
                    return (
                      <TableRow
                        key={i}
                        className="border-b transition"
                        style={{
                          backgroundColor: hasRisk ? `${COLORS.errorContainer}0D` : "transparent",
                          borderColor: `${COLORS.outlineVariant}80`,
                        }}
                      >
                        <TableCell className="px-3 py-3 font-medium" style={{ color: COLORS.onSurface }}>{bp.outletName || bp.outlet_id}</TableCell>
                        <TableCell className="px-3 py-3" style={{ color: hasRisk ? COLORS.error : COLORS.onSurfaceVariant }}>{bp.salesmanName || bp.salesman_id}</TableCell>
                        <TableCell className="px-3 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(bp.prioritySKUs || []).map((sku: string, si: number) => (
                              <span
                                key={si}
                                className="px-2 py-0.5 rounded text-[10px]"
                                style={{
                                  backgroundColor: `${COLORS.primaryContainer}26`,
                                  color: COLORS.primary,
                                  border: `1px solid ${COLORS.primaryContainer}4D`,
                                }}
                              >
                                {sku}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right">
                          {hasRisk ? (
                            <div className="flex justify-end gap-1 flex-wrap">
                              {bp.riskFlags.map((flag: string, fi: number) => (
                                <span
                                  key={fi}
                                  className="px-2 py-1 rounded text-[10px]"
                                  style={{
                                    backgroundColor: `${COLORS.errorContainer}26`,
                                    color: COLORS.error,
                                    border: `1px solid ${COLORS.errorContainer}4D`,
                                  }}
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: COLORS.outline }}>None</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}