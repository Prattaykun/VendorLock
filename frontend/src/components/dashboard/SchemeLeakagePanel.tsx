"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { schemes, retailerSchemes } from "@/lib/mock-data";
import { formatInr } from "@/lib/helpers";

const totalLeakage = schemes.reduce((sum, s) => sum + s.leakage, 0);
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function SchemeLeakagePanel() {
  return (
    <section className="space-y-4">
      {/* Month-to-Date Leakage Total */}
      <motion.div {...fadeUp}>
        <Card className="border-rose-500/30 bg-gradient-to-r from-rose-500/8 to-rose-500/3 glow-rose overflow-hidden">
          <CardContent className="flex items-center justify-between p-5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-300">Month-to-Date Leakage</p>
              <p className="text-sm text-zinc-400 mt-1">Scheme benefit received but not passed to retailers</p>
            </div>
            <p className="relative text-4xl font-black text-rose-400 tabular-nums">{formatInr(totalLeakage)}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Schemes */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Active Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schemes.map((s, i) => {
                const passedPct = Math.round((s.benefitPassed / s.benefitReceived) * 100);
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-zinc-800/60 bg-[#1f2024] p-4 card-lift">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold">{s.brand} — {s.sku}</h3>
                        <p className="text-xs text-zinc-400">Scheme: {s.schemePercent}% off</p>
                      </div>
                      <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-1 text-xs">
                        {formatInr(s.leakage)} leaked
                      </Badge>
                    </div>

                    {/* Benefit Passed Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
                        <span>Benefit Passed ({passedPct}%)</span>
                        <span>Leakage ({100 - passedPct}%)</span>
                      </div>
                      <div className="relative">
                        <Progress value={passedPct} className="h-4 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                        <div className="absolute top-0 right-0 h-4 rounded-r-full bg-rose-500/60" style={{ width: `${100 - passedPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Received: {formatInr(s.benefitReceived)}</span>
                        <span>Passed: {formatInr(s.benefitPassed)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-Retailer Scheme Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Per-Retailer Scheme Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-sm">
              <TableHeader className="bg-zinc-800/50">
                <TableRow>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Retailer</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Entitled</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Passed</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Gap</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retailerSchemes.map((rs) => {
                  const gap = rs.benefitEntitled - rs.benefitPassed;
                  const statusClass = rs.status === "FULL" ? "bg-emerald-500/15 text-emerald-400" : rs.status === "PARTIAL" ? "bg-amber-500/15 text-amber-400" : "bg-rose-500/15 text-rose-400";
                  return (
                    <TableRow key={rs.retailerName} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition">
                      <TableCell className="px-3 py-3 font-medium">{rs.retailerName}</TableCell>
                      <TableCell className="px-3 py-3 tabular-nums">{formatInr(rs.benefitEntitled)}</TableCell>
                      <TableCell className="px-3 py-3 tabular-nums">{formatInr(rs.benefitPassed)}</TableCell>
                      <TableCell className="px-3 py-3 font-semibold text-rose-400 tabular-nums">
                        {gap > 0 ? formatInr(gap) : "—"}
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <Badge className={`px-2 py-1 text-xs ${statusClass}`}>{rs.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
