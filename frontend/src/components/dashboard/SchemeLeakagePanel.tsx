"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatInr } from "@/lib/helpers";
import { AlertTriangle, TrendingUp, TrendingDown, Calendar, ArrowRight, Eye, Gavel, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function SchemeLeakagePanel() {
  const [leakageData, setLeakageData] = useState<any>(null);
  const [liveSchemes, setLiveSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [{ getSchemeLeakage }, { listSchemes }] = await Promise.all([
          import("@/lib/api-client"),
          import("@/lib/api-client"),
        ]);
        const [leakage, schemes] = await Promise.all([
          getSchemeLeakage(30).catch(() => null),
          listSchemes().catch(() => null),
        ]);
        setLeakageData(leakage);
        setLiveSchemes(schemes?.schemes || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalLeakage = leakageData?.total_leakage || 0;
  const leakageReports = leakageData?.leakage_reports || [];

  const chartData = leakageReports.map((r: any) => ({
    name: r.scheme_name?.length > 20 ? r.scheme_name.slice(0, 20) + "…" : r.scheme_name,
    leakage: r.leakage_rupee,
  }));

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Scheme Leakage Monitor</h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            Real-time tracking of promotional scheme distribution integrity.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Oct 2023 (MTD)
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Left: MTD Total Leakage */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="col-span-12 lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-slate-500 font-label-md text-label-md">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              MTD TOTAL LEAKAGE
            </div>
            <Eye className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-200" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-rose-400 tracking-tight">{formatInr(totalLeakage)}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                12.4%
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800/30 pt-4 flex justify-between font-mono text-xs text-slate-500">
            <div className="flex flex-col">
              <span>Schemes Affected</span>
              <span className="text-white">{leakageData?.scheme_count ?? "—"}</span>
            </div>
            <div className="flex flex-col text-right">
              <span>Period</span>
              <span className="text-slate-300">MTD (30D)</span>
            </div>
          </div>
        </motion.div>

        {/* Active Schemes Table */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="col-span-12 lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-200">Active Schemes Monitored</h3>
            <span className="text-xs text-slate-500">{liveSchemes.length} schemes</span>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader>
                <TableRow className="border-b border-slate-800/50 font-label-md text-label-md text-slate-500">
                  <TableHead className="pb-3 pl-2">Brand / Scheme</TableHead>
                  <TableHead className="pb-3">Discount</TableHead>
                  <TableHead className="pb-3">Valid Until</TableHead>
                  <TableHead className="pb-3 text-right pr-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body-sm text-body-sm">
                {liveSchemes.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-8">No active schemes. Create one in the Schemes tab.</TableCell></TableRow>
                )}
                {liveSchemes.map((s: any) => {
                  const isExpired = new Date(s.valid_to) < new Date();
                  return (
                    <TableRow key={s.id} className="border-b border-slate-800/20 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="py-4 pl-2">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-medium">{s.scheme_name}</span>
                          <span className="text-xs text-slate-500">{s.brand}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono text-xs">{s.discount_percent}% Off</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-xs text-slate-400">{s.valid_to ? new Date(s.valid_to).toLocaleDateString("en-IN") : "—"}</span>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          isExpired
                            ? "bg-slate-700/20 text-slate-400 border-slate-600/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-slate-500" : "bg-emerald-400 animate-pulse"}`} />
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Bottom Left: Leakage Bar Chart per Scheme */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
          <h3 className="text-base font-semibold text-slate-200 mb-6">Leakage by Scheme</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500"><RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
          ) : leakageReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 border border-slate-800 border-dashed rounded-xl">
              <p className="text-sm">No scheme leakage detected.</p>
              <p className="text-xs mt-1 text-slate-600">Agent 3 will flag leakage automatically when it detects discrepancies.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" stroke="#475569" fontSize={10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    formatter={(val: any) => [`₹${formatInr(val)}`, "Leakage"]}
                  />
                  <Bar dataKey="leakage" radius={[0, 6, 6, 0]}>
                    {chartData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? "#f43f5e" : i === 1 ? "#f97316" : "#eab308"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Bottom Right: Retailer Drill-down Table */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-200">Retailer Leakage Hotspots</h3>
            <div className="relative">
              <select className="appearance-none bg-slate-800 border border-slate-700 rounded py-1 pl-3 pr-8 text-xs text-slate-200 focus:border-blue-500 outline-none">
                <option>VitaGlow 15% Extra</option>
                <option>NutriCrunch ₹50 Off</option>
              </select>
              <ArrowRight className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader>
                <TableRow className="border-b border-slate-800/50 font-label-md text-label-md text-slate-500">
                  <TableHead className="pb-2 pl-2">Retailer ID / Name</TableHead>
                  <TableHead className="pb-2">Zone</TableHead>
                  <TableHead className="pb-2 text-right">Leakage Est.</TableHead>
                  <TableHead className="pb-2 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body-sm text-body-sm">
                <TableRow className="border-b border-slate-800/10">
                  <TableCell className="py-3 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-200">R-8842 (SuperMart X)</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-500">North-West</TableCell>
                  <TableCell className="py-3 text-right font-mono text-rose-400">₹45,200</TableCell>
                  <TableCell className="py-3 text-center">
                    <button className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10 transition-colors">
                      <Gavel className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-slate-800/10">
                  <TableCell className="py-3 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-200">R-1092 (Daily Needs)</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-500">South-East</TableCell>
                  <TableCell className="py-3 text-right font-mono text-rose-400">₹38,500</TableCell>
                  <TableCell className="py-3 text-center">
                    <button className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10 transition-colors">
                      <Gavel className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-200">R-5521 (Metro Grocers)</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-500">Central</TableCell>
                  <TableCell className="py-3 text-right font-mono text-rose-400/70">₹12,800</TableCell>
                  <TableCell className="py-3 text-center">
                    <button className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10 transition-colors">
                      <Gavel className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
