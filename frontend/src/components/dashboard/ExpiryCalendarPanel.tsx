"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatInr, returnVerdictClass } from "@/lib/helpers";
import { Download, Plus, Calendar, AlertTriangle, ArrowRightLeft, Monitor, Eye, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props { onAction: (msg: string) => void; }

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function ExpiryCalendarPanel({ onAction }: Props) {
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [liveReturns, setLiveReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { getExpiryAlerts, listReturns } = await import("@/lib/api-client");
        const [alerts, returns] = await Promise.all([
          getExpiryAlerts(90).catch(() => []),
          listReturns().catch(() => ({ returns: [] })),
        ]);
        setExpiryAlerts(Array.isArray(alerts) ? alerts : []);
        setLiveReturns(returns?.returns || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleClaim = async (batchId: string, batchName: string) => {
    setClaimingId(batchId);
    try {
      const { claimBrandReturn } = await import("@/lib/api-client");
      await claimBrandReturn(batchId);
      toast.success(`Claim filed for ${batchName}`);
      onAction(`Brand return claim filed for batch ${batchName}`);
    } catch { toast.error("Failed to file claim"); } finally { setClaimingId(null); }
  };

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      const { approveReturn } = await import("@/lib/api-client");
      await approveReturn(id);
      setLiveReturns((prev) => prev.map((r) => r.id === id ? { ...r, status: "APPROVED" } : r));
      toast.success("Return approved");
    } catch { toast.error("Failed to approve"); } finally { setActioningId(null); }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    try {
      const { rejectReturn } = await import("@/lib/api-client");
      await rejectReturn(id, "Rejected by distributor");
      setLiveReturns((prev) => prev.map((r) => r.id === id ? { ...r, status: "REJECTED" } : r));
      toast.success("Return rejected");
    } catch { toast.error("Failed to reject"); } finally { setActioningId(null); }
  };

  // Color-code by alert_window
  const alertColor = (w: string) => {
    if (w === "CRITICAL") return { dot: "bg-rose-500", badge: "bg-rose-500/20 border-rose-500/50 text-rose-400", label: "CRITICAL", blur: "bg-rose-500/10" };
    if (w === "30_DAY_PUSH") return { dot: "bg-amber-500", badge: "bg-amber-500/20 border-amber-500/50 text-amber-400", label: "WARNING", blur: "bg-amber-500/10" };
    return { dot: "bg-emerald-500", badge: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400", label: "SAFE", blur: "bg-emerald-500/10" };
  };

  // Build rolling 14-day calendar from alert dates
  const today = new Date();
  const calendarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const alertsByDate: Record<string, any[]> = {};
  for (const alert of expiryAlerts) {
    const key = alert.expiry_date?.slice(0, 10);
    if (key) { if (!alertsByDate[key]) alertsByDate[key] = []; alertsByDate[key].push(alert); }
  }
  const criticalCount = expiryAlerts.filter((a) => a.alert_window === "CRITICAL").length;
  const warningCount = expiryAlerts.filter((a) => a.alert_window === "30_DAY_PUSH").length;
  const safeCount = expiryAlerts.filter((a) => a.alert_window === "90_DAY_RETURN_WINDOW").length;


  return (
    <section className="space-y-6">
      {/* Page Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tighter text-white">Expiry &amp; Returns</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            Live monitoring â€” {criticalCount} CRITICAL Â· {warningCount} WARNING Â· {safeCount} SAFE
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Widget 1: Calendar (dynamic 14-day rolling) */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="xl:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Batch Expiry Horizon
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe</div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 flex-1">
            {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
            ))}
            {calendarDays.map((d) => {
              const key = d.toISOString().slice(0, 10);
              const dayAlerts = alertsByDate[key] || [];
              const isToday = key === today.toISOString().slice(0, 10);
              return (
                <div key={key} className={`bg-slate-800/50 border border-slate-700/30 rounded-lg p-2 min-h-[80px] flex flex-col gap-1 hover:bg-slate-800 transition-colors ${
                  isToday ? "ring-1 ring-blue-500/30 bg-blue-500/5" : ""
                }`}>
                  <span className={`font-mono text-xs ${dayAlerts.length > 0 ? "text-slate-200" : "text-slate-500 opacity-50"}`}>{d.getDate()}</span>
                  {dayAlerts.map((a: any, i: number) => {
                    const c = alertColor(a.alert_window);
                    return (
                      <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate border ${c.badge}`}>
                        {a.product_name?.slice(0, 12)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Widget 2: Expiry Alert Cards */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-4 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            Action Required
          </h2>
          {loading && <div className="flex items-center gap-2 text-slate-500 text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> Loading alerts...</div>}
          {!loading && expiryAlerts.length === 0 && (
            <div className="text-slate-500 text-sm p-4 border border-dashed border-slate-700 rounded-xl text-center">No expiry alerts in next 90 days.</div>
          )}
          {expiryAlerts.slice(0, 3).map((a: any) => {
            const c = alertColor(a.alert_window);
            return (
              <div key={a.batch_id} className={`bg-slate-800/60 backdrop-blur-[12px] border border-slate-700 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group`}>
                <div className={`absolute top-0 right-0 w-24 h-24 ${c.blur} rounded-full blur-xl -mr-10 -mt-10 group-hover:opacity-150 transition-colors`} />
                <div className="flex justify-between items-start z-10">
                  <div>
                    <div className={`font-mono text-xs mb-1 ${c.badge.split(" ").pop()}`}>BATCH: #{a.batch_id?.slice(0, 10)}</div>
                    <div className="text-sm font-semibold text-slate-200">{a.product_name}</div>
                    <div className="text-xs text-slate-400 mt-1">Est. Value: {formatInr(a.estimated_value)} Â· {a.quantity} units</div>
                  </div>
                  <div className={`${c.badge} text-xs px-2 py-1 rounded text-center border`}>
                    <div className="text-[10px] leading-tight opacity-80">EXPIRES IN</div>
                    <div className="font-bold">{a.days_to_expiry}D</div>
                  </div>
                </div>
                <div className="mt-2 z-10">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2.5 transition-all active:scale-95"
                    disabled={claimingId === a.batch_id}
                    onClick={() => handleClaim(a.batch_id, a.product_name)}>
                    {claimingId === a.batch_id ? "Filing Claim..." : "File Brand Return Claim"}
                  </Button>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Widget 3: Returns Pipeline */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="xl:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              Return Requests Pipeline
            </h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span></span>
              Live Sync
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-slate-800/20 border-b border-slate-800">
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Req ID</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Batch / Reason</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Qty</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Classification</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-slate-300">
                {loading && <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />Loading...</TableCell></TableRow>}
                {!loading && liveReturns.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">No returns on record.</TableCell></TableRow>
                )}
                {liveReturns.map((r: any) => (
                  <TableRow key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="px-4 font-mono text-xs text-slate-500">{r.id?.slice(0, 8)}</TableCell>
                    <TableCell className="px-4">
                      <div className="font-medium text-slate-200 text-xs">{r.batch_number || "â€”"}</div>
                      <div className="text-xs text-slate-500 capitalize">{r.reason?.replace(/_/g, " ")}</div>
                    </TableCell>
                    <TableCell className="px-4 text-xs">{r.quantity}</TableCell>
                    <TableCell className="px-4">
                      <Badge className={`text-xs px-2 py-0.5 ${
                        r.classification === "SUSPICIOUS" ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" :
                        r.classification === "GENUINE" ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" :
                        "bg-slate-800 border border-slate-700 text-slate-400"
                      }`}>{r.classification || "PENDING"}</Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      <span className={`text-xs font-medium ${
                        r.status === "APPROVED" ? "text-emerald-400" :
                        r.status === "REJECTED" ? "text-rose-400" : "text-amber-400"
                      }`}>{r.status}</span>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      {r.status === "PENDING" && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="text-emerald-400 hover:bg-emerald-500/10 p-1.5" disabled={actioningId === r.id}
                            onClick={() => handleApprove(r.id)}>
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 p-1.5" disabled={actioningId === r.id}
                            onClick={() => handleReject(r.id)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Widget 4: VaR Summary Stat */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="xl:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg shadow-black/20">
          <div className="flex justify-between items-start mb-6">
            <div><h2 className="text-base font-semibold text-slate-200 mb-1">Expiry Value at Risk</h2>
              <p className="text-xs text-slate-400">Total estimated value in CRITICAL batches</p>
            </div>
            <Monitor className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex items-end gap-1 text-4xl font-black text-white mb-4">
            â‚¹{formatInr(expiryAlerts.filter((a) => a.alert_window === "CRITICAL").reduce((s: number, a: any) => s + (a.estimated_value || 0), 0))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-auto">
            {[
              { label: "Critical", count: criticalCount, color: "text-rose-400" },
              { label: "Warning", count: warningCount, color: "text-amber-400" },
              { label: "Safe", count: safeCount, color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-black ${stat.color}`}>{stat.count}</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
