"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { expiryBatches, returnRequests } from "@/lib/mock-data";
import { formatInr, expiryRiskClass, returnVerdictClass } from "@/lib/helpers";

interface Props { onAction: (msg: string) => void; }

const whatIfBatches = expiryBatches.filter((b) => b.risk === "RED");
const whatIfTotal = whatIfBatches.reduce((sum, b) => sum + b.value, 0);
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function ExpiryCalendarPanel({ onAction }: Props) {
  return (
    <section className="space-y-4">
      {/* What-If Loss Projection */}
      <motion.div {...fadeUp}>
        <Card className="border-rose-500/30 bg-gradient-to-r from-rose-500/8 to-amber-500/4 glow-rose overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent" />
            <div className="relative flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-300">⚠ What-If Loss Projection</p>
                <p className="text-sm text-zinc-400 mt-1">
                  If no action on {whatIfBatches.length} batches this week → estimated write-off:
                </p>
              </div>
              <p className="text-4xl font-black text-rose-400 tabular-nums">{formatInr(whatIfTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expiry Calendar View */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Expiry Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-rose-500" /> &lt;30 days</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> 30–90 days</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-emerald-500" /> Safe (&gt;90 days)</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {expiryBatches.map((b, i) => {
                const riskBorder = b.risk === "RED" ? "border-rose-500/30" : b.risk === "AMBER" ? "border-amber-500/30" : "border-emerald-500/30";
                return (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`rounded-xl border ${riskBorder} bg-[#1f2024] p-4 card-lift`}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`border text-xs px-2 py-0.5 ${expiryRiskClass(b.risk)}`}>{b.daysUntilExpiry}d left</Badge>
                      <p className="text-xs font-mono text-zinc-500">{b.batchCode}</p>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{b.product}</h3>
                    <p className="text-xs text-zinc-400">{b.quantity} units · {formatInr(b.value)}</p>
                    <p className="text-xs text-zinc-500 mt-1">Expiry: {b.expiryDate}</p>
                    {b.risk === "RED" && b.brandReturnWindowDays > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] text-amber-300 mb-1.5 font-medium">⏳ Return window closes in {b.brandReturnWindowDays} day{b.brandReturnWindowDays > 1 ? "s" : ""}</p>
                        <Button size="sm" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 h-8 text-xs"
                          onClick={() => onAction(`Claim filed for batch ${b.batchCode} — ${b.product}`)}>
                          📋 File Claim
                        </Button>
                      </div>
                    )}
                    {b.risk === "RED" && b.brandReturnWindowDays === 0 && (
                      <p className="text-[10px] text-rose-400 mt-2 font-semibold">⛔ Return window expired</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Return Requests Queue */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="border-zinc-800/60 bg-[var(--card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Return Requests Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-sm">
              <TableHeader className="bg-zinc-800/50">
                <TableRow>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Retailer</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Items</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Qty</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Value</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Reason</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">AI Verdict</TableHead>
                  <TableHead className="px-3 py-2 text-zinc-400 text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnRequests.map((rr) => (
                  <TableRow key={rr.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition">
                    <TableCell className="px-3 py-3 font-medium">{rr.retailerName}</TableCell>
                    <TableCell className="px-3 py-3 text-zinc-300">{rr.items}</TableCell>
                    <TableCell className="px-3 py-3 tabular-nums">{rr.quantity}</TableCell>
                    <TableCell className="px-3 py-3 tabular-nums">{formatInr(rr.value)}</TableCell>
                    <TableCell className="px-3 py-3 text-zinc-300">{rr.claimedReason}</TableCell>
                    <TableCell className="px-3 py-3">
                      <Badge className={`text-xs px-2 py-0.5 ${returnVerdictClass(rr.agentVerdict)}`}>{rr.agentVerdict.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 h-7 text-xs px-2"
                          onClick={() => onAction(`Return approved for ${rr.retailerName} — ${rr.items}`)}>
                          ✓ Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 h-7 text-xs px-2"
                          onClick={() => onAction(`Return held for investigation — ${rr.retailerName}`)}>
                          ⏸ Hold
                        </Button>
                      </div>
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
