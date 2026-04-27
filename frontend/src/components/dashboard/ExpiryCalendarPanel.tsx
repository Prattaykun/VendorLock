"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { expiryBatches, returnRequests } from "@/lib/mock-data";
import { formatInr, expiryRiskClass, returnVerdictClass } from "@/lib/helpers";
import { Download, Plus, Calendar, AlertTriangle, ArrowRightLeft, Monitor, Eye } from "lucide-react";

interface Props { onAction: (msg: string) => void; }

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function ExpiryCalendarPanel({ onAction }: Props) {
  const criticalBatches = expiryBatches.filter((b) => b.risk === "RED");
  const warningBatches = expiryBatches.filter((b) => b.risk === "AMBER");
  const safeBatches = expiryBatches.filter((b) => b.risk === "GREEN");

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tighter text-white">Expiry & Returns</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            Live monitoring of pipeline integrity and reverse logistics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Ledger
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Claim
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Widget 1: Calendar View (Batch Expiry Horizon) - 8 cols */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="xl:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Batch Expiry Horizon
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (R)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning (A)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe (G)
              </div>
            </div>
          </div>
          {/* Calendar Grid (2 Week Rolling) */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">{day}</div>
            ))}
            {[
              { day: 12, items: [] },
              { day: 13, items: [{ label: "B-992", type: "Dairy", risk: "critical" }] },
              { day: 14, items: [] },
              { day: 15, items: [] },
              { day: 16, items: [{ label: "B-841", type: "Snacks", risk: "warning" }, { label: "B-842", type: "Snacks", risk: "warning" }] },
              { day: 17, items: [] },
              { day: 18, items: [] },
              { day: 19, items: [] },
              { day: 20, items: [{ label: "B-102", type: "Bev", risk: "safe" }] },
              { day: 21, items: [] },
              { day: 22, items: [] },
              { day: 23, items: [{ label: "B-774", type: "Meat", risk: "critical" }] },
              { day: 24, items: [] },
              { day: 25, items: [] },
            ].map((d) => (
              <div key={d.day} className={`bg-slate-800/50 border border-slate-700/30 rounded-lg p-2 min-h-[100px] flex flex-col gap-1 hover:bg-slate-800 transition-colors ${d.day === 13 ? "ring-1 ring-blue-500/30 bg-blue-500/5" : ""}`}>
                <span className={`font-mono text-xs ${d.items.length > 0 ? "text-slate-200" : "text-slate-500 opacity-50"}`}>{d.day}</span>
                {d.items.map((item, i) => (
                  <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate ${
                    item.risk === "critical" ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" :
                    item.risk === "warning" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                    "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  }`}>
                    {item.label} ({item.type})
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Widget 2: Near-Expiry Alerts - 4 cols */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-4 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            Action Required
          </h2>
          {/* Alert Card 1 */}
          <div className="bg-slate-800/60 backdrop-blur-[12px] border border-slate-700 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-colors"></div>
            <div className="flex justify-between items-start z-10">
              <div>
                <div className="font-mono text-xs text-rose-400 mb-1">BATCH: #D-992A</div>
                <div className="text-sm font-semibold text-slate-200">Premium Greek Yogurt (Vanilla)</div>
                <div className="text-xs text-slate-400 mt-1">Est. Value: {formatInr(4250)} • Zone 4</div>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs px-2 py-1 rounded text-center">
                <div className="text-[10px] leading-tight opacity-80">EXPIRES IN</div>
                <div className="font-bold">12 HRS</div>
              </div>
            </div>
            <div className="mt-2 z-10">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2.5 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all active:scale-95"
                onClick={() => onAction("Claim filed for batch D-992A — Premium Greek Yogurt")}>
                File Claim & Divert
              </Button>
            </div>
          </div>
          {/* Alert Card 2 */}
          <div className="bg-slate-800/60 backdrop-blur-[12px] border border-slate-700 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors"></div>
            <div className="flex justify-between items-start z-10">
              <div>
                <div className="font-mono text-xs text-amber-400 mb-1">BATCH: #S-841X</div>
                <div className="text-sm font-semibold text-slate-200">Organic Almond Clusters</div>
                <div className="text-xs text-slate-400 mt-1">Est. Value: {formatInr(1800)} • Zone 2</div>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs px-2 py-1 rounded text-center">
                <div className="text-[10px] leading-tight opacity-80">EXPIRES IN</div>
                <div className="font-bold">3 DAYS</div>
              </div>
            </div>
            <div className="mt-2 z-10">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs py-2.5 transition-all active:scale-95">
                Initiate Discount Protocol
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Widget 3: Return Requests Pipeline - 8 cols */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="xl:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              Return Requests Pipeline
            </h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
              </span>
              Live Sync Active
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-slate-800/20 border-b border-slate-800">
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Req ID</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Retailer</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Items / Vol</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Verdict</TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-slate-300">
                {returnRequests.map((rr) => (
                  <TableRow key={rr.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="px-6 font-mono text-xs text-slate-500">{rr.id}</TableCell>
                    <TableCell className="px-4">
                      <div className="font-medium text-slate-200">{rr.retailerName}</div>
                      <div className="text-xs text-slate-500">Dist: {rr.id.replace("RR-", "D-")}</div>
                    </TableCell>
                    <TableCell className="px-4">{rr.quantity} units ({rr.items})</TableCell>
                    <TableCell className="px-4">
                      <Badge className={`text-xs px-2.5 py-1 ${
                        rr.agentVerdict === "SUSPICIOUS" ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" :
                        rr.agentVerdict === "GENUINE" ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" :
                        "bg-slate-800 border border-slate-700 text-slate-400"
                      }`}>
                        {rr.agentVerdict}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-2 rounded-md hover:bg-blue-500/10"
                        onClick={() => onAction(`Viewing return request ${rr.id} — ${rr.retailerName}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Widget 4: VaR Projection - 4 cols */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="xl:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg shadow-black/20">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-200 mb-1">VaR Projection</h2>
              <p className="text-xs text-slate-400">Estimated loss risk (30 days)</p>
            </div>
            <Monitor className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex items-end gap-1 text-4xl font-black text-white mb-6">
            $24.5<span className="text-2xl font-semibold text-slate-400 pb-1">k</span>
          </div>
          {/* VaR Chart */}
          <div className="mt-auto h-[140px] flex items-end gap-2 px-2 relative border-b border-slate-800/50 pb-2">
            <div className="absolute inset-x-0 bottom-1/3 border-t border-dashed border-slate-700/30"></div>
            <div className="absolute inset-x-0 bottom-2/3 border-t border-dashed border-slate-700/30"></div>
            {[
              { week: "W1", value: "4.2", height: "30%" },
              { week: "W2", value: "12.1", height: "60%", active: true },
              { week: "W3", value: "8.5", height: "45%" },
              { week: "W4", value: "3.1", height: "20%" },
            ].map((bar) => (
              <div key={bar.week} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className={`w-full rounded-t-sm transition-all relative ${
                  bar.active 
                    ? "bg-gradient-to-t from-blue-500/10 to-blue-500/40 border-t-2 border-blue-500 shadow-[0_-5px_15px_rgba(173,198,255,0.1)]" 
                    : "bg-gradient-to-t from-blue-500/5 to-blue-500/20 border-t-2 border-blue-500/50"
                }`} style={{ height: bar.height }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${bar.value}k
                  </div>
                </div>
                <span className={`text-[10px] ${bar.active ? "text-blue-400 font-bold" : "text-slate-400"}`}>{bar.week}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
