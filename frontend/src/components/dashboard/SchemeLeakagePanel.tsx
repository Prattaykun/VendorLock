"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { schemes as mockSchemes, retailerSchemes } from "@/lib/mock-data";
import { formatInr } from "@/lib/helpers";
import { AlertTriangle, TrendingUp, Download, Calendar, ArrowRight, Eye, Gavel } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function SchemeLeakagePanel() {
  const [liveSchemes, setLiveSchemes] = useState<any[]>([]);

  useEffect(() => {
    import("@/lib/api-client").then(({ listSchemes }) => {
      listSchemes().then((data) => {
        if (data && data.schemes && data.schemes.length > 0) {
          setLiveSchemes(data.schemes);
        }
      }).catch(console.error);
    });
  }, []);

  const displaySchemes = liveSchemes.length > 0 ? liveSchemes : mockSchemes;
  const totalLeakage = displaySchemes.reduce((sum, s) => sum + (s.leakage || 0), 0);

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
            <span className="text-4xl font-black text-rose-400 tracking-tight">₹{formatInr(totalLeakage)}</span>
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
              <span>Total Schemes Val</span>
              <span className="text-white">₹38.5L</span>
            </div>
            <div className="flex flex-col text-right">
              <span>Avg Leakage Rate</span>
              <span className="text-rose-400">11.1%</span>
            </div>
          </div>
        </motion.div>

        {/* Top Right: Active Schemes List */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="col-span-12 lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-200">Active Schemes Monitored</h3>
            <button className="text-blue-400 hover:text-blue-300 font-label-md text-label-md flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader>
                <TableRow className="border-b border-slate-800/50 font-label-md text-label-md text-slate-500">
                  <TableHead className="pb-3 pl-2">Brand / SKU</TableHead>
                  <TableHead className="pb-3">Scheme Target</TableHead>
                  <TableHead className="pb-3">Distribution Split</TableHead>
                  <TableHead className="pb-3 text-right pr-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body-sm text-body-sm">
                <TableRow className="border-b border-slate-800/20 hover:bg-slate-800/30 transition-colors">
                  <TableCell className="py-4 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium">VitaGlow Plus</span>
                      <span className="text-xs text-slate-500">SKU: VG-500ML-B</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono">15% Extra</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-blue-400">Dist: 5%</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">Ret: 10%</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-2">
                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full text-xs font-medium border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                      High Alert
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-slate-800/20 hover:bg-slate-800/30 transition-colors">
                  <TableCell className="py-4 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium">CleanSweep Pro</span>
                      <span className="text-xs text-slate-500">SKU: CS-1KG-P</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono">Buy 2 Get 1</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-blue-400">Dist: 0%</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">Ret: 100%</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-2">
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Stable
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-slate-800/30 transition-colors">
                  <TableCell className="py-4 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium">NutriCrunch Oats</span>
                      <span className="text-xs text-slate-500">SKU: NC-500G-BOX</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono">₹50 Off SRP</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-blue-400">Dist: 20%</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">Ret: 80%</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-2">
                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full text-xs font-medium border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                      Investigating
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Bottom Left: Leakage Bar Chart per Scheme */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
          <h3 className="text-base font-semibold text-slate-200 mb-6">Leakage by Scheme</h3>
          <div className="flex flex-col gap-6">
            {/* Scheme 1 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-200">VitaGlow 15% Extra</span>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm text-rose-400">₹1.8L Lost</span>
                  <span className="text-[10px] text-slate-500">Passed: 65% / Received: 42%</span>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/30">
                <div className="h-full bg-blue-500/40 w-[65%] border-r border-slate-900"></div>
                <div className="h-full bg-rose-500 w-[23%] relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9zdmc+')] opacity-50"></div>
                </div>
              </div>
            </div>
            {/* Scheme 2 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-200">NutriCrunch ₹50 Off</span>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm text-rose-400">₹1.2L Lost</span>
                  <span className="text-[10px] text-slate-500">Passed: 90% / Received: 75%</span>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/30">
                <div className="h-full bg-blue-500/40 w-[90%] border-r border-slate-900"></div>
                <div className="h-full bg-rose-500 w-[15%] relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9zdmc+')] opacity-50"></div>
                </div>
              </div>
            </div>
            {/* Scheme 3 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-200">CleanSweep Buy 2 Get 1</span>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm text-slate-400">₹0.1L Lost</span>
                  <span className="text-[10px] text-slate-500">Passed: 95% / Received: 93%</span>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/30">
                <div className="h-full bg-blue-500/40 w-[95%] border-r border-slate-900"></div>
                <div className="h-full bg-slate-400 w-[2%]"></div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 font-label-md text-label-md text-xs text-slate-500 justify-center">
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500/40 rounded-sm"></span> Claimed Passed</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Leakage Gap</div>
            </div>
          </div>
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
