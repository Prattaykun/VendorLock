"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { salesmen, coverageZones, ghostVisitAlerts, beatPlan } from "@/lib/mock-data";
import { formatInr, coverageStatusClass, coverageLabel, scoreColor, scoreBarColor } from "@/lib/helpers";

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function BeatIntelligencePanel() {
  return (
    <section className="space-y-4">
      {/* Ghost Visit Alert Banner */}
      {ghostVisitAlerts.length > 0 && (
        <motion.div {...fadeUp}>
          <Card className="border-rose-500/30 bg-rose-500/6 glow-rose">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-2">👻 Ghost Visit Alerts</p>
              {ghostVisitAlerts.map((g) => (
                <p key={g.salesmanName} className="text-sm text-rose-200">
                  <span className="font-semibold">{g.salesmanName}:</span> {g.checkIns} check-ins, {g.orders} orders, {g.messages} messages → <span className="font-bold text-rose-400">{formatInr(g.missedRevenue)} missed revenue</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Salesman Cards */}
      <CardHeader className="px-0 pb-2 pt-0">
        <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Salesman Overview</CardTitle>
      </CardHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {salesmen.map((sm, i) => (
          <motion.div key={sm.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-zinc-800/60 bg-[var(--card)] card-lift">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{sm.name}</h3>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Reliability</p>
                    <p className={`text-xl font-bold ${scoreColor(sm.reliabilityScore)}`}>{sm.reliabilityScore}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 mb-3">
                  <motion.div className={`h-2 rounded-full ${scoreBarColor(sm.reliabilityScore)}`}
                    initial={{ width: 0 }} animate={{ width: `${sm.reliabilityScore}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-zinc-800/50 p-2.5 border border-zinc-800/60">
                    <p className="text-[10px] uppercase text-zinc-500">Outlets</p>
                    <p className="font-semibold">{sm.outletsAssigned}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-800/50 p-2.5 border border-zinc-800/60">
                    <p className="text-[10px] uppercase text-zinc-500">With Chat</p>
                    <p className="font-semibold">{sm.outletsWithChat}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-800/50 p-2.5 border border-zinc-800/60">
                    <p className="text-[10px] uppercase text-zinc-500">Ghost Visits</p>
                    <p className={`font-semibold ${sm.ghostVisitCount > 3 ? "text-rose-400" : "text-zinc-100"}`}>{sm.ghostVisitCount}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-800/50 p-2.5 border border-zinc-800/60">
                    <p className="text-[10px] uppercase text-zinc-500">Missed Rev.</p>
                    <p className="font-semibold text-amber-400">{formatInr(sm.missedRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Coverage Heatmap Placeholder */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Coverage Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-emerald-500" /> Visited + Orders</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> Visited, No Orders</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-rose-500" /> Not Visited 7+ Days</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {coverageZones.map((z, i) => (
                <motion.div key={z.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-zinc-800/60 p-3.5 relative overflow-hidden card-lift">
                  <div className={`absolute inset-0 ${coverageStatusClass(z.status)} opacity-[0.06]`} />
                  <div className="relative">
                    <div className={`inline-block h-2.5 w-2.5 rounded-full ${coverageStatusClass(z.status)} mb-2`} />
                    <p className="font-semibold text-sm">{z.sector}</p>
                    <p className="text-xs text-zinc-400">{z.pincode} · {z.outlets} outlets</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{coverageLabel(z.status)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Beat Plan Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Today&apos;s Beat Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-sm">
              <TableHeader className="bg-zinc-800/50">
                <TableRow>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Time</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Salesman</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Outlet</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Priority SKUs</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Risk Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beatPlan.map((bp, i) => (
                  <TableRow key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition">
                    <TableCell className="px-3 py-3 font-mono text-zinc-300">{bp.time}</TableCell>
                    <TableCell className="px-3 py-3">{bp.salesmanName}</TableCell>
                    <TableCell className="px-3 py-3 font-medium">{bp.outletName}</TableCell>
                    <TableCell className="px-3 py-3 text-zinc-300">{bp.prioritySKUs.join(", ")}</TableCell>
                    <TableCell className="px-3 py-3">
                      {bp.riskFlags.length > 0 ? bp.riskFlags.map((f) => (
                        <Badge key={f} className="mr-1 bg-rose-500/15 text-rose-400 text-[10px] px-1.5 py-0.5">{f}</Badge>
                      )) : <span className="text-zinc-500">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
