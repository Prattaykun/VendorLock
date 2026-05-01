"use client";

import { useEffect, useState, Fragment } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { coverageZones, ghostVisitAlerts, beatPlan as mockBeatPlan } from "@/lib/mock-data";
import { listSalesmenDirect, getCoverageGaps, getGhostVisitReport, generateBeatPlans } from "@/lib/api-client";
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

const coverageZoneCoordinates: Record<string, [number, number]> = {
  "Dadar West": [19.018, 72.842],
  "Vile Parle East": [19.097, 72.855],
  "Kurla West": [19.071, 72.878],
  "Bhandup East": [19.141, 72.954],
  "Thane Station": [19.189, 72.975],
  "Malad West": [19.186, 72.828],
  Dharavi: [19.045, 72.858],
  "Kalyan East": [19.244, 73.131],
};

const salesmanCoverageProfile = {
  "Rahul Yadav": ["Dadar West", "Kurla West", "Dharavi"],
  "Amit Sharma": ["Vile Parle East", "Malad West", "Dadar West"],
  "Vikram Patil": ["Bhandup East", "Thane Station", "Kalyan East"],
} as const;

const coverageLegend = [
  { label: "High coverage", color: "#22c55e" },
  { label: "Balanced coverage", color: "#f59e0b" },
  { label: "Low coverage", color: "#ef4444" },
];

const coverageIntensityByStatus = {
  VISITED_ORDERS: { color: "#22c55e", halo: "#16a34a", opacity: 0.42, radius: 1 },
  VISITED_NO_ORDERS: { color: "#f59e0b", halo: "#ea580c", opacity: 0.34, radius: 0.78 },
  NOT_VISITED: { color: "#ef4444", halo: "#dc2626", opacity: 0.28, radius: 0.62 },
} as const;

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
      center={[19.0750, 72.8850]}
      zoom={12}
      style={{ height: "100%", width: "100%", minHeight: "340px" }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {coverageZones.map((zone) => {
        const center = coverageZoneCoordinates[zone.sector];

        if (!center) {
          return null;
        }

        const intensity = coverageIntensityByStatus[zone.status];
        const zoneRadius = 1100 + zone.outlets * 60;
        const haloRadius = zoneRadius * intensity.radius;

        return (
          <Fragment key={zone.id}>
            <Circle
              center={center}
              radius={haloRadius}
              pathOptions={{
                color: intensity.halo,
                fillColor: intensity.halo,
                fillOpacity: 0.18,
                weight: 0,
              }}
            />
            <Circle
              center={center}
              radius={zoneRadius}
              pathOptions={{
                color: intensity.color,
                fillColor: intensity.color,
                fillOpacity: intensity.opacity,
                weight: 0,
              }}
            >
              <Tooltip sticky>
                <span className="font-medium text-sm">
                  {zone.sector} · {zone.status.replaceAll("_", " ")}
                </span>
              </Tooltip>
            </Circle>
            <CircleMarker
              center={center}
              radius={7 + zone.outlets / 3}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: intensity.color,
                fillOpacity: 1,
              }}
            />
          </Fragment>
        );
      })}
    </MapContainer>
  );
};

export default function BeatIntelligencePanel() {
  const [liveSalesmen, setLiveSalesmen] = useState<any[]>([]);
  const [salesmenLoading, setSalesmenLoading] = useState(true);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>("sm-1");
  const [liveBeatPlan, setLiveBeatPlan] = useState<any[]>([]);
  const [coverageGaps, setCoverageGaps] = useState<any[]>([]);
  const [ghostVisits, setGhostVisits] = useState<any[]>([]);
  const [generatingPlans, setGeneratingPlans] = useState(false);
  const [activeTab, setActiveTab] = useState<"beat" | "gaps" | "ghosts">("beat");

  useEffect(() => {
    listSalesmenDirect()
      .then((data) => {
        if (data.salesmen?.length) {
          setLiveSalesmen(data.salesmen);
          setSelectedSalesmanId(data.salesmen[0]?.id || "sm-1");
        }
      })
      .catch(() => {})
      .finally(() => setSalesmenLoading(false));

    // Load coverage gaps and ghost visits
    getCoverageGaps(7).then((data) => setCoverageGaps(data?.gaps || [])).catch(() => {});
    getGhostVisitReport().then((data) => setGhostVisits(data?.ghost_visits || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSalesmanId) return;
    import("@/lib/api-client").then(({ getBeatPlan }) => {
      getBeatPlan(selectedSalesmanId).then((data) => {
        if (data?.stops?.length) setLiveBeatPlan(data.stops);
        else setLiveBeatPlan([]);
      }).catch(() => { setLiveBeatPlan([]); });
    });
  }, [selectedSalesmanId]);

  const handleGeneratePlans = async () => {
    setGeneratingPlans(true);
    try { await generateBeatPlans(); } catch {} finally { setGeneratingPlans(false); }
  };

  const salesmen = liveSalesmen.map((sm) => ({
    id: sm.id,
    name: sm.name,
    outletsAssigned: sm.outlets_assigned ?? 0,
    outletsWithChat: sm.outlets_with_chat ?? 0,
    ghostVisitCount: sm.ghost_visit_count ?? 0,
    reliabilityScore: sm.reliability_score ?? 0,
    missedRevenue: sm.missed_revenue ?? 0,
    avatarUrl: `https://i.pravatar.cc/150?u=${sm.id}`,
  }));

  const displayBeatPlan = liveBeatPlan.length > 0 ? liveBeatPlan : mockBeatPlan;
  const totalGhostAlerts = ghostVisits.length;

  return (
    <section className="flex flex-col h-full overflow-hidden">
      {/* Status Badges + Salesman Selector */}
      <motion.div {...fadeUp} className="flex flex-wrap gap-3 px-1 py-4 flex-shrink-0 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: `${COLORS.errorContainer}18`, borderColor: `${COLORS.errorContainer}4D` }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.error }} />
            <span className="text-xs font-medium" style={{ color: COLORS.error }}>{totalGhostAlerts} Ghost Alerts</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: `${COLORS.primary}1A`, borderColor: `${COLORS.primary}4D` }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.primaryContainer }} />
            <span className="text-xs font-medium" style={{ color: COLORS.primary }}>Live Sync: Active</span>
          </div>
          <div className="flex gap-1">
            {(["beat", "gaps", "ghosts"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === tab ? "bg-blue-500/20 border-blue-500/30 text-blue-300" : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200"
                }`}>
                {tab === "beat" ? "Beat Plan" : tab === "gaps" ? `Gaps (${coverageGaps.length})` : `Ghosts (${ghostVisits.length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {liveSalesmen.length > 0 && activeTab === "beat" && (
            <select
              value={selectedSalesmanId}
              onChange={(e) => setSelectedSalesmanId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {liveSalesmen.map((sm) => <option key={sm.id} value={sm.id}>{sm.name}</option>)}
            </select>
          )}
          <button onClick={handleGeneratePlans} disabled={generatingPlans}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
            {generatingPlans ? "Generating..." : "Generate Beat Plans"}
          </button>
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
                  Salesman Coverage Heatmap
                </CardTitle>
                <div className="flex gap-4 text-[10px]" style={{ color: COLORS.onSurfaceVariant }}>
                  {coverageLegend.map((item) => (
                    <span key={item.label} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                      {item.label}
                    </span>
                  ))}
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
              {salesmenLoading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg p-3 animate-pulse" style={{ backgroundColor: `${COLORS.surface}66`, border: `1px solid ${COLORS.outlineVariant}80` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: COLORS.surfaceHighest }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 rounded w-2/3" style={{ backgroundColor: COLORS.surfaceHighest }} />
                          <div className="h-2 rounded w-1/3" style={{ backgroundColor: COLORS.surfaceHighest }} />
                        </div>
                      </div>
                    </div>
                  ))
                : salesmen.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm" style={{ color: COLORS.outline }}>No salesmen found.</p>
                      <p className="text-xs mt-1" style={{ color: COLORS.outlineVariant }}>Add salesmen via the onboarding form.</p>
                    </div>
                  )
                  : salesmen.map((sm, i) => {
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

          {/* Coverage Gaps Tab */}
          {activeTab === "gaps" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-12">
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.surface }}>
                <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: COLORS.outlineVariant }}>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.onSurface }}>Coverage Gaps — Last 7 Days</CardTitle>
                  <span className="text-xs" style={{ color: COLORS.outline }}>{coverageGaps.length} outlets not visited</span>
                </div>
                <Table>
                  <TableHeader style={{ backgroundColor: `${COLORS.surfaceHighest}80` }}>
                    <TableRow className="border-b" style={{ borderColor: COLORS.outlineVariant }}>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Outlet</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Route</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Days Since Visit</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Risk</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase text-right" style={{ color: COLORS.outline }}>Est. Missed Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coverageGaps.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm" style={{ color: COLORS.outline }}>No coverage gaps in the past 7 days.</TableCell></TableRow>
                    )}
                    {coverageGaps.map((g: any) => (
                      <TableRow key={g.outlet_id} className="border-b transition" style={{ borderColor: `${COLORS.outlineVariant}80` }}>
                        <TableCell className="px-3 py-3 font-medium" style={{ color: COLORS.onSurface }}>{g.outlet_name}</TableCell>
                        <TableCell className="px-3 py-3 text-xs" style={{ color: COLORS.onSurfaceVariant }}>{g.route}</TableCell>
                        <TableCell className="px-3 py-3 font-mono" style={{ color: g.days_since_last_visit > 14 ? COLORS.error : COLORS.tertiary }}>
                          {g.days_since_last_visit === 999 ? "Never" : `${g.days_since_last_visit}d`}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{
                            backgroundColor: g.risk_level === "HIGH" ? `${COLORS.errorContainer}26` : g.risk_level === "MEDIUM" ? `${COLORS.tertiary}26` : `${COLORS.secondary}26`,
                            color: g.risk_level === "HIGH" ? COLORS.error : g.risk_level === "MEDIUM" ? COLORS.tertiary : COLORS.secondary,
                          }}>{g.risk_level}</span>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right font-mono text-xs" style={{ color: COLORS.error }}>₹{formatInr(g.estimated_missed_revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Ghost Visits Tab */}
          {activeTab === "ghosts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-12">
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.surface }}>
                <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: COLORS.outlineVariant }}>
                  <CardTitle className="text-sm font-semibold" style={{ color: COLORS.onSurface }}>Ghost Visit Report</CardTitle>
                  <span className="text-xs" style={{ color: COLORS.outline }}>Unverified check-ins with no orders</span>
                </div>
                <Table>
                  <TableHeader style={{ backgroundColor: `${COLORS.surfaceHighest}80` }}>
                    <TableRow className="border-b" style={{ borderColor: COLORS.outlineVariant }}>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Salesman</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Ghost / Total</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Ghost Rate</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase" style={{ color: COLORS.outline }}>Severity</TableHead>
                      <TableHead className="px-3 py-2 text-xs uppercase text-right" style={{ color: COLORS.outline }}>Est. Missed Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ghostVisits.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm" style={{ color: COLORS.outline }}>No ghost visits detected.</TableCell></TableRow>
                    )}
                    {ghostVisits.map((g: any) => (
                      <TableRow key={g.salesman_id} className="border-b transition" style={{ borderColor: `${COLORS.outlineVariant}80` }}>
                        <TableCell className="px-3 py-3 font-medium" style={{ color: COLORS.onSurface }}>{g.salesman_name}</TableCell>
                        <TableCell className="px-3 py-3 font-mono text-xs" style={{ color: COLORS.onSurfaceVariant }}>{g.ghost_count} / {g.total_checkins}</TableCell>
                        <TableCell className="px-3 py-3 font-mono" style={{ color: g.ghost_rate_pct > 30 ? COLORS.error : COLORS.tertiary }}>{g.ghost_rate_pct}%</TableCell>
                        <TableCell className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{
                            backgroundColor: g.severity === "HIGH" ? `${COLORS.errorContainer}26` : `${COLORS.tertiary}26`,
                            color: g.severity === "HIGH" ? COLORS.error : COLORS.tertiary,
                          }}>{g.severity}</span>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right font-mono text-xs" style={{ color: COLORS.error }}>₹{formatInr(g.estimated_missed_revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Beat Plan Tab (existing map + table) */}
          {activeTab === "beat" && (
            <>
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}