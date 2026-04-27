"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { creditOrders, velocityAlerts } from "@/lib/mock-data";
import { formatInr, verdictClass, scoreColor } from "@/lib/helpers";
import { AlertTriangle, TrendingUp, FileCheck, Ban, Edit, Send, Check, ShieldCheck, Gavel, Filter, ArrowRight } from "lucide-react";

interface Props { onAction: (msg: string) => void; }

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function CreditDecisionPanel({ onAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMsg, setEditMsg] = useState("");

  return (
    <section className="ml-64 mt-[64px] p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Header Section */}
      <motion.div {...fadeUp} className="flex justify-between items-end pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">VendorLock Decisions</h1>
          <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
            </span>
            Human-in-the-loop workflow active. 14 pending queue.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-sm text-slate-300 hover:text-white hover:border-slate-500 flex items-center gap-2">
            <Filter className="w-[18px] h-[18px]" />
            Filter Queue
          </Button>
        </div>
      </motion.div>

      {/* Credit Velocity Alert Banner */}
      {velocityAlerts.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-4 shadow-[0_0_15px_rgba(255,180,171,0.05)] backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
            <div className="bg-rose-500/10 p-2 rounded-full text-rose-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-rose-400 mb-1">Credit Velocity Alert</h3>
              <p className="text-sm text-rose-300/80">
                Anomaly detected: &gt;30% spike in aggregate credit requests over the last 4 hours across North Sector. Recommend strict adherence to Trust Score thresholds.
              </p>
            </div>
                <button className="text-rose-400/70 hover:text-rose-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
          </div>
        </motion.div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Left Pane: Queue (8 cols) */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Queue Headers */}
          <div className="grid grid-cols-12 gap-6 px-5 pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-800">
            <div className="col-span-3">Vendor / Order</div>
            <div className="col-span-2 text-right">Items / Value</div>
            <div className="col-span-2 text-center">Trust Score</div>
            <div className="col-span-3 text-right">Exposure (Pre/Post)</div>
            <div className="col-span-2 text-center">Verdict</div>
          </div>

          {/* Queue List (Scrollable) */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
            {creditOrders.map((co, i) => (
              <motion.div
                key={co.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`grid grid-cols-12 gap-6 items-center bg-slate-900/80 border rounded-lg p-5 cursor-pointer relative shadow-[0_0_20px_rgba(173,198,255,0.05)] ${
                  co.verdict === "BLOCK" ? "border-rose-500/50 ring-1 ring-rose-500/20" :
                  co.verdict === "CONDITIONAL" ? "border-amber-500/50" :
                  "border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                {co.verdict === "BLOCK" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full"></div>
                )}
                <div className="col-span-3 flex flex-col py-1">
                  <span className="text-sm font-semibold text-white truncate">{co.retailerName}</span>
                  <span className="font-mono text-xs text-slate-500 mt-1.5">{co.id}</span>
                </div>
                <div className="col-span-2 flex flex-col items-end py-1">
                  <span className="font-mono text-sm text-white">{formatInr(co.orderValue)}</span>
                  <span className="font-mono text-xs text-slate-400 mt-1.5">{co.items.length} SKUs</span>
                </div>
                <div className="col-span-2 flex justify-center py-1">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    co.retailerTrustScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    co.retailerTrustScore >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      co.retailerTrustScore >= 80 ? "bg-emerald-400" :
                      co.retailerTrustScore >= 50 ? "bg-amber-400" :
                      "bg-rose-400"
                    }`}></span>
                    {co.retailerTrustScore}/100
                  </div>
                </div>
                <div className="col-span-3 flex flex-col items-end py-1">
                  <span className="font-mono text-xs text-slate-400 break-all">{formatInr(co.currentOutstanding)} (Limit: {formatInr(co.utilisationPercent ? Math.round(co.currentOutstanding / (co.utilisationPercent / 100)) : 0)})</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ArrowRight className={`w-3.5 h-3.5 ${
                      co.verdict === "BLOCK" ? "text-rose-400" : "text-blue-400"
                    }`} />
                    <span className={`font-mono text-sm font-bold ${
                      co.verdict === "BLOCK" ? "text-rose-400" : "text-blue-400"
                    }`}>
                      {formatInr(co.postOrderOutstanding)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center py-1">
                  <span className={`font-label-md text-xs px-4 py-1.5 rounded-md ${
                    co.verdict === "BLOCK" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                    co.verdict === "CONDITIONAL" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {co.verdict}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Pane: Action & Comms (4 cols) */}
        <div className="col-span-4 flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700/40 to-transparent"></div>
          
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <h2 className="text-lg font-semibold text-white mb-1.5">Decision Matrix</h2>
            <p className="text-sm text-slate-400">V-8922: Metro Mart • ORD-77A-901</p>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto">
            {/* --- CLEAN POLICY VIOLATION ALERT --- */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5 mb-8 relative overflow-hidden">
               
              {/* Header Row: Title & Percentage */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {/* Alert Icon */}
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <h4 className="text-red-400 font-bold tracking-wide text-sm uppercase">
                    Policy Violation Risk
                  </h4>
                </div>
                <span className="text-red-400 font-bold text-xl leading-none">92%</span>
              </div>

              {/* Description Paragraph */}
              <p className="text-slate-300 text-sm leading-relaxed ml-9">
                Order value (₹42,500) pushes outstanding to ₹1.62L, breaching hard limit of ₹1.5L. Trust score drop trend detected.
              </p>
            </div>

            {/* One-Click Actions */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Workflow Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 text-slate-300 py-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group">
                  <Check className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  <span className="font-label-md text-xs">Approve</span>
                </button>
                <button className="bg-slate-800 border border-slate-700 hover:border-amber-500 hover:bg-amber-500/5 text-slate-300 py-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  <span className="font-label-md text-xs">Reduce Limit</span>
                </button>
              </div>
              <button className="w-full bg-rose-500/10 border border-rose-500/50 hover:bg-rose-500 hover:text-white text-rose-400 py-4 rounded-lg flex items-center justify-center gap-3 transition-all font-label-md text-label-md shadow-[0_0_10px_rgba(255,180,171,0.1)]">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                BLOCK + NUDGE
              </button>
            </div>

            {/* Communication Draft */}
            <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> Vendor Comms
                </h3>
                <span className="bg-slate-800 text-slate-400 font-mono text-xs px-3 py-1 rounded border border-slate-700">AUTO-DRAFT</span>
              </div>
              {/* --- CHAT / MESSAGE BOX --- */}
              <div className="relative bg-[#0f172a] border border-slate-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 leading-relaxed pr-6">
                  ye order (ORD-77A-901) block hai. Please clear min ₹12,500 to release dispatch.
                </p>
                {/* Edit Icon */}
                <svg className="w-5 h-5 text-slate-400 absolute right-3 bottom-3 cursor-pointer hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>

              {/* --- SEND BUTTON --- */}
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 px-4 flex items-center justify-center font-medium transition-colors shadow-lg shadow-blue-500/20">
                {/* Warning / Send Icon */}
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span className="truncate whitespace-nowrap">EDIT & SEND VIA TELEGRAM</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
