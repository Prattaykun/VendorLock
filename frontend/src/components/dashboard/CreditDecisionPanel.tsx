"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { creditOrders, velocityAlerts } from "@/lib/mock-data";
import { formatInr, verdictClass, scoreColor } from "@/lib/helpers";

interface Props { onAction: (msg: string) => void; }

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function CreditDecisionPanel({ onAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMsg, setEditMsg] = useState("");

  return (
    <section className="space-y-4">
      {/* Velocity Alert Banner */}
      {velocityAlerts.length > 0 && (
        <motion.div {...fadeUp}>
          <Card className="border-orange-500/30 bg-orange-500/8 glow-rose">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300 mb-2">
                ⚡ Credit Velocity Alerts
              </p>
              <div className="space-y-1">
                {velocityAlerts.map((v) => (
                  <p key={v.retailerId} className="text-sm text-orange-200">
                    <span className="font-semibold">{v.retailerName}</span> — utilisation spiked{" "}
                    <span className="font-bold text-orange-400">+{v.utilisationJump}%</span> in 7 days
                    (now at {v.currentUtilisation}%)
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <CardHeader className="px-0 pb-2 pt-0">
        <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">
          Pending Credit Orders
        </CardTitle>
      </CardHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {creditOrders.map((co, i) => (
          <motion.div key={co.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-zinc-800/60 bg-[var(--card)] overflow-hidden card-lift">
              <CardContent className="p-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate">{co.retailerName}</h3>
                    <p className="text-xs text-zinc-400">
                      Trust Score:{" "}
                      <span className={`font-bold ${scoreColor(co.retailerTrustScore)}`}>
                        {co.retailerTrustScore}
                      </span>
                    </p>
                  </div>
                  <Badge className={`shrink-0 border px-3 py-1 text-xs font-bold ${verdictClass(co.verdict)}`}>
                    {co.verdict}
                  </Badge>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-2 gap-px bg-zinc-800/40">
                  <div className="bg-[#1c1d21] px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Order Value</p>
                    <p className="text-base font-semibold">{formatInr(co.orderValue)}</p>
                  </div>
                  <div className="bg-[#1c1d21] px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Utilisation</p>
                    <p className={`text-base font-semibold ${co.utilisationPercent > 90 ? "text-rose-400" : co.utilisationPercent > 70 ? "text-amber-400" : "text-emerald-400"}`}>
                      {co.utilisationPercent}%
                    </p>
                  </div>
                  <div className="bg-[#1c1d21] px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Current O/S</p>
                    <p className="text-sm">{formatInr(co.currentOutstanding)}</p>
                  </div>
                  <div className="bg-[#1c1d21] px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Post-Order O/S</p>
                    <p className="text-sm font-semibold text-amber-300">{formatInr(co.postOrderOutstanding)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 py-2.5 border-b border-zinc-800/60">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Items</p>
                  <p className="text-sm text-zinc-300">{co.items.join(" · ")}</p>
                </div>

                {/* Draft Message */}
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Draft Message (Hinglish)</p>
                  {editingId === co.id ? (
                    <div className="space-y-2">
                      <Textarea
                        className="border-zinc-700 bg-zinc-900 text-zinc-100 focus-visible:ring-cyan-500/30"
                        rows={3}
                        value={editMsg}
                        onChange={(e) => setEditMsg(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 text-xs h-8"
                          onClick={() => { onAction(`Message sent to ${co.retailerName} via Telegram`); setEditingId(null); }}>
                          📱 Send via Telegram
                        </Button>
                        <Button size="sm" variant="ghost" className="text-zinc-400 text-xs h-8" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-300 bg-zinc-800/40 rounded-lg px-3 py-2 italic border border-zinc-800/60">
                      &ldquo;{co.draftMessage}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-zinc-800/60 px-4 py-3">
                  {co.verdict === "APPROVE" && (
                    <Button size="sm" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-9"
                      onClick={() => onAction(`Approved credit order for ${co.retailerName} — ${formatInr(co.orderValue)}`)}>
                      ✓ Approve
                    </Button>
                  )}
                  {co.verdict === "CONDITIONAL" && (
                    <>
                      <Button size="sm" className="flex-1 bg-amber-600 text-white hover:bg-amber-700 h-9"
                        onClick={() => onAction(`Approved ${co.retailerName} with reduced limit`)}>
                        Approve (Reduced)
                      </Button>
                      <Button size="sm" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-9"
                        onClick={() => onAction(`Full approval for ${co.retailerName}`)}>
                        Full Approve
                      </Button>
                    </>
                  )}
                  {co.verdict === "BLOCK" && (
                    <Button size="sm" className="flex-1 bg-rose-600 text-white hover:bg-rose-700 h-9"
                      onClick={() => { onAction(`Blocked order for ${co.retailerName} + nudge sent`); }}>
                      🚫 Block + Send Nudge
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 h-9"
                    onClick={() => { setEditingId(co.id); setEditMsg(co.draftMessage); }}>
                    ✏ Edit & Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
