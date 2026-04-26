"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auditEvents } from "@/lib/mock-data";
import { formatTimestamp, eventTypeClass } from "@/lib/helpers";
import type { AuditEventType } from "@/types/dashboard";

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

  return (
    <section className="space-y-4">
      {/* Hash Chain Verification */}
      <motion.div {...fadeUp}>
        <Card className={`border ${chainIntact ? "border-emerald-500/30 bg-emerald-500/5 glow-cyan" : "border-rose-500/30 bg-rose-500/5 glow-rose"}`}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{chainIntact ? "✅" : "🔴"}</span>
              <div>
                <p className="font-semibold">Hash Chain Verification</p>
                <p className="text-sm text-zinc-400">
                  {chainIntact
                    ? "All records intact — SHA-256 chain verified"
                    : `${tamperedCount} record(s) show potential tampering`}
                </p>
              </div>
            </div>
            <Badge className={`border text-xs px-3 py-1 ${chainIntact ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
              {chainIntact ? "INTACT" : "TAMPERED"}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1.5">Event Type</label>
                <select
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none transition"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as AuditEventType | "ALL")}
                >
                  <option value="ALL">All Events</option>
                  {allEventTypes.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1.5">Retailer</label>
                <input
                  type="text"
                  placeholder="Search retailer..."
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none transition"
                  value={filterRetailer}
                  onChange={(e) => setFilterRetailer(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 h-9" onClick={handleExport}>
                ↓ Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Log Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.16 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">
              Event Log ({filtered.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-sm">
              <TableHeader className="bg-zinc-800/50">
                <TableRow>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Timestamp</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Type</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Retailer</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Description</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">SHA-256</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ev, i) => (
                  <motion.tr key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition ${ev.status === "TAMPERED" ? "bg-rose-500/5" : ""}`}>
                    <TableCell className="px-3 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">{formatTimestamp(ev.timestamp)}</TableCell>
                    <TableCell className="px-3 py-3">
                      <Badge className={`text-[10px] px-1.5 py-0.5 ${eventTypeClass(ev.eventType)}`}>{ev.eventType.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3 font-medium">{ev.retailer}</TableCell>
                    <TableCell className="px-3 py-3 text-zinc-300 max-w-xs truncate">{ev.description}</TableCell>
                    <TableCell className="px-3 py-3 font-mono text-[10px] text-zinc-500 max-w-[120px] truncate">{ev.sha256Hash}</TableCell>
                    <TableCell className="px-3 py-3">
                      {ev.status === "INTACT"
                        ? <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">✓ <span className="text-[10px]">Intact</span></span>
                        : <span className="inline-flex items-center gap-1 text-rose-400 text-sm font-bold">✗ <span className="text-[10px]">Tampered</span></span>}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
