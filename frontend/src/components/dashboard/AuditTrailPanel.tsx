"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auditEvents } from "@/lib/mock-data";
import { formatTimestamp, eventTypeClass } from "@/lib/helpers";
import type { AuditEventType } from "@/types/dashboard";
import { Search, Download, ShieldCheck, AlertTriangle, History } from "lucide-react";

const allEventTypes: AuditEventType[] = ["ORDER", "PAYMENT", "SCORE_CHANGE", "RETURN", "ALERT", "SCHEME", "BEAT_VISIT"];
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function AuditTrailPanel() {
  const [filterType, setFilterType] = useState<AuditEventType | "ALL">("ALL");
  const [filterRetailer, setFilterRetailer] = useState("");

  const tamperedCount = auditEvents.filter((e) => e.status === "TAMPERED").length;
  const chainIntact = tamperedCount === 0;

  const filtered = useMemo(() => {
    return auditEvents.filter((e) => {
      if (filterType !== "ALL" && e.eventType !== filterType) return false;
      if (filterRetailer && !e.retailer.toLowerCase().includes(filterRetailer.toLowerCase())) return false;
      return true;
    });
  }, [filterType, filterRetailer]);

  const handleExport = () => {
    const header = "Timestamp,Event Type,Retailer,Description,SHA-256 Hash,Status\n";
    const rows = filtered.map((e) => `${e.timestamp},${e.eventType},${e.retailer},"${e.description}",${e.sha256Hash},${e.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendorlock-audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, " ");
  };

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tighter text-white">Audit Trail</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Immutable event ledger with SHA-256 chain verification
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export Ledger
          </Button>
        </div>
      </motion.div>

      {/* Hash Chain Verification */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <Card className={`border ${chainIntact ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
          <CardContent className="flex items-center justify-between p-5 relative overflow-hidden">
            <div className={`absolute inset-0 ${chainIntact ? "bg-gradient-to-r from-emerald-500/5 to-transparent" : "bg-gradient-to-r from-rose-500/5 to-transparent"}`} />
            <div className="flex items-center gap-3 relative z-10">
              {chainIntact ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
              )}
              <div>
                <p className="font-semibold text-white">Hash Chain Verification</p>
                <p className="text-sm text-slate-400">
                  {chainIntact
                    ? "All records intact — SHA-256 chain verified"
                    : `${tamperedCount} record(s) show potential tampering`}
                </p>
              </div>
            </div>
            <Badge className={`text-xs px-3 py-1 ${chainIntact ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
              {chainIntact ? "INTACT" : "TAMPERED"}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <Card className="border-slate-800/60 bg-slate-900/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1.5">Event Type</label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as AuditEventType | "ALL")}>
                  <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-slate-200">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="ALL">All Events</SelectItem>
                    {allEventTypes.map((t) => (
                      <SelectItem key={t} value={t}>{formatEventType(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1.5">Retailer</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Search retailer..."
                    className="w-full pl-10 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500"
                    value={filterRetailer}
                    onChange={(e) => setFilterRetailer(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Log Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="border-slate-800/60 bg-slate-900/60 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800 bg-slate-800/30">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500">
              Event Log ({filtered.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-slate-800/20 border-b border-slate-800">
                    <TableHead className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Retailer</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Description</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">SHA-256</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-slate-300">
                  {filtered.map((ev, i) => (
                    <motion.tr
                      key={ev.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition ${ev.status === "TAMPERED" ? "bg-rose-500/5" : ""}`}
                    >
                      <TableCell className="px-6 font-mono text-xs text-slate-500 whitespace-nowrap">{formatTimestamp(ev.timestamp)}</TableCell>
                      <TableCell className="px-4">
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${eventTypeClass(ev.eventType)}`}>
                          {formatEventType(ev.eventType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 font-medium text-slate-200">{ev.retailer}</TableCell>
                      <TableCell className="px-4 text-slate-300 max-w-xs truncate">{ev.description}</TableCell>
                      <TableCell className="px-4 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">{ev.sha256Hash}</TableCell>
                      <TableCell className="px-6 text-right">
                        {ev.status === "INTACT" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Intact</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-sm font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Tampered</span>
                          </span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
