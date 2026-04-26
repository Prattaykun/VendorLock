"use client";

import { useMemo, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, Map, CreditCard, BarChart3, Navigation,
  CalendarClock, ShieldCheck, AlertTriangle, Phone, Menu, X,
  Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Retailer, RetailerTier } from "@/types/dashboard";
import { alerts, actionCards, orderFeed, retailers } from "@/lib/mock-data";
import {
  formatInr, formatTimeStable, formatDateStable,
  alertPillClass, orderStatusClass, tierClass, trendArrow, trendClass, scoreColor, scoreBarColor,
} from "@/lib/helpers";
import CreditDecisionPanel from "./CreditDecisionPanel";
import SchemeLeakagePanel from "./SchemeLeakagePanel";
import BeatIntelligencePanel from "./BeatIntelligencePanel";
import ExpiryCalendarPanel from "./ExpiryCalendarPanel";
import AuditTrailPanel from "./AuditTrailPanel";

type PanelKey = "command-center" | "trust-map" | "credit-decisions" | "scheme-leakage" | "beat-intelligence" | "expiry-calendar" | "audit-trail";
type SortKey = "name" | "trustScore" | "tier" | "outstanding" | "creditLimit" | "lastPaymentDate" | "trend";

const panelItems: { key: PanelKey; label: string; icon: ReactNode }[] = [
  { key: "command-center", label: "Command Center", icon: <LayoutDashboard size={18} /> },
  { key: "trust-map", label: "Trust Map", icon: <Map size={18} /> },
  { key: "credit-decisions", label: "Credit Decisions", icon: <CreditCard size={18} /> },
  { key: "scheme-leakage", label: "Scheme Leakage", icon: <BarChart3 size={18} /> },
  { key: "beat-intelligence", label: "Beat Intelligence", icon: <Navigation size={18} /> },
  { key: "expiry-calendar", label: "Expiry & Returns", icon: <CalendarClock size={18} /> },
  { key: "audit-trail", label: "Audit Trail", icon: <ShieldCheck size={18} /> },
];

const atRiskRetailers = [...retailers].sort((a, b) => a.trustScore - b.trustScore).slice(0, 3);

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

function factorData(r: Retailer) {
  return [
    { label: "Payment Discipline (30%)", value: r.factors.paymentDiscipline },
    { label: "Order Consistency (20%)", value: r.factors.orderConsistency },
    { label: "Cancellation Rate (15%)", value: r.factors.cancellationRate },
    { label: "Return Frequency (15%)", value: r.factors.returnFrequency },
    { label: "Communication (10%)", value: r.factors.communicationReliability },
    { label: "Trade Stability (10%)", value: r.factors.tradeStability },
  ];
}

export default function DistributorControlTower() {
  const { theme, toggleTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelKey>("command-center");
  const [lastAction, setLastAction] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<"ALL" | RetailerTier>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("trustScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    setIsDataLoading(true);
    const timer = setTimeout(() => setIsDataLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [activePanel]);

  const unresolvedCritical = alerts.filter((a) => a.type === "CRITICAL" && !a.resolved);
  const alertSummary = {
    CRITICAL: alerts.filter((a) => a.type === "CRITICAL" && !a.resolved).length,
    WARNING: alerts.filter((a) => a.type === "WARNING" && !a.resolved).length,
    INFO: alerts.filter((a) => a.type === "INFO" && !a.resolved).length,
  };

  const trustRows = useMemo(() => {
    const filtered = tierFilter === "ALL" ? retailers : retailers.filter((r) => r.tier === tierFilter);
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortBy === "name" || sortBy === "tier" || sortBy === "lastPaymentDate") return a[sortBy].localeCompare(b[sortBy]) * dir;
      if (sortBy === "trend") { const tv = { UP: 3, STABLE: 2, DOWN: 1 }; return (tv[a.trend] - tv[b.trend]) * dir; }
      return (a[sortBy] - b[sortBy]) * dir;
    });
  }, [sortBy, sortDirection, tierFilter]);

  const onSort = (key: SortKey) => {
    if (sortBy === key) { setSortDirection((p) => (p === "asc" ? "desc" : "asc")); return; }
    setSortBy(key); setSortDirection("desc");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[264px_1fr]">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen" style={{ background: "var(--surface-sidebar)", borderRight: "1px solid var(--border-ghost-subtle)" }}>
          {/* Brand */}
          <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid var(--border-ghost-subtle)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-base font-black text-white shadow-lg" style={{ boxShadow: "var(--brand-glow)" }}>V</div>
              <div>
                <p className="text-[17px] font-extrabold tracking-tight text-gradient-brand leading-tight">VendorLock</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 font-medium mt-0.5">Distributor OS</p>
              </div>
            </div>
            {/* User Profile Card */}
            <div className="mt-5 flex items-center gap-3 rounded-xl px-3.5 py-3 relative overflow-hidden" style={{ background: "var(--surface-user-card)", border: "1px solid var(--border-ghost-inner)" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-transparent pointer-events-none" />
              <Avatar className="h-9 w-9 relative z-10">
                <AvatarFallback className="text-white text-xs font-bold bg-gradient-to-br from-cyan-500 to-indigo-600">RM</AvatarFallback>
              </Avatar>
              <div className="min-w-0 relative z-10">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-heading)" }}>Ravi Mehta</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Pune Zone · 8 retailers</p>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p className="px-3 pb-2 text-[9px] uppercase tracking-[0.2em] font-medium" style={{ color: "var(--text-dim)" }}>Navigation</p>
            {panelItems.map((item) => {
              const active = activePanel === item.key;
              return (
                <button key={item.key} onClick={() => setActivePanel(item.key)}
                  className={`nav-item-glow relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] transition-all duration-300 ${active ? "text-[var(--primary)]" : "hover:opacity-80"}`}
                  style={active ? { background: "var(--nav-active-bg)", border: "1px solid var(--nav-active-border)", boxShadow: "var(--nav-active-glow)", color: "var(--primary)" } : { border: "1px solid transparent", color: "var(--text-muted)" }}>
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500" />}
                  <span className={`transition-colors duration-300 ${active ? "" : ""}`} style={{ color: active ? "var(--primary)" : "var(--text-dim)" }}>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.key === "command-center" && alertSummary.CRITICAL > 0 && (
                    <span className="pulse-critical ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500/90 text-[9px] font-bold text-white px-1" style={{ boxShadow: "var(--badge-glow-rose)" }}>{alertSummary.CRITICAL}</span>
                  )}
                </button>
              );
            })}
          </nav>
          {/* Footer with Theme Toggle */}
          <div className="px-5 py-4 space-y-3" style={{ borderTop: "1px solid var(--border-ghost-subtle)" }}>
            <button onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-300"
              style={{ background: "var(--surface-user-card)", border: "1px solid var(--border-ghost-inner)", color: "var(--text-body)" }}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <p className="text-[9px] text-center tracking-wide" style={{ color: "var(--text-dim)" }}>VendorLock v2.0 · AI-Powered</p>
          </div>
        </aside>

        {/* Mobile nav bar */}
        <div className="lg:hidden sticky top-0 z-30 px-3 py-2" style={{ background: "var(--mobile-nav-bg)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border-ghost-subtle)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-extrabold text-gradient-brand">VendorLock</p>
            <Button variant="ghost" className="text-zinc-400 h-9 w-9 p-0" onClick={() => setMobileNav(!mobileNav)}>
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
          <AnimatePresence>
            {mobileNav && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {panelItems.map((item) => (
                    <button key={item.key} onClick={() => { setActivePanel(item.key); setMobileNav(false); }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${activePanel === item.key ? "text-cyan-300" : "text-zinc-400"}`}
                      style={activePanel === item.key ? { background: "var(--sidebar-active)", border: "1px solid var(--nav-active-border)" } : { background: "var(--surface-user-card)" }}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Main Content ────────────────────────────────────────── */}
        <motion.section 
          initial="initial" 
          animate="animate" 
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
          }}
          className="flex min-h-screen flex-col bg-black text-white"
        >
          <motion.header variants={fadeUp} className="sticky top-0 z-20" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex flex-col gap-4 px-5 py-5 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold sm:text-[1.75rem] tracking-tighter text-white">Good morning, Ravi</h1>
                  <p className="text-[11px] mt-1 tracking-wide text-zinc-400">Friday, 25 Apr 2026 · {panelItems.find((p) => p.key === activePanel)?.label}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-rose-500/10 text-rose-400 border-rose-500/20" style={{ boxShadow: "var(--badge-glow-critical)" }}>{alertSummary.CRITICAL} Critical</Badge>
                  <Badge className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border-amber-500/20">{alertSummary.WARNING} Warning</Badge>
                  <Badge className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-sky-500/10 text-sky-400 border-sky-500/20">{alertSummary.INFO} Info</Badge>
                </div>
              </div>
              {unresolvedCritical.length > 0 && (
                <div className="rounded-r-xl p-4 relative overflow-hidden border-l-4 border-[#ff5793] bg-[#ff5793]/10 shadow-sm">
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2.5">
                      <AlertTriangle size={14} className="text-[#ff5793]" />
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white">Pinned Critical Alerts</p>
                    </div>
                    <ul className="space-y-1.5">
                      {unresolvedCritical.map((a) => (
                        <li key={a.id} className="text-[13px] text-zinc-200 leading-relaxed">
                          <span className="font-semibold text-white">{a.title}:</span> {a.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.header>

          <motion.main variants={fadeUp} className="flex-1 px-4 py-5 sm:px-6">
            <AnimatePresence mode="wait">
              {lastAction && (
                <motion.div key="toast" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                  <p className="text-sm text-emerald-300">✓ {lastAction}</p>
                  <button onClick={() => setLastAction("")} className="text-xs text-emerald-500 hover:text-emerald-300">dismiss</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ── Panel 1: Command Center ───────────────────────── */}
              {activePanel === "command-center" && (
                <motion.section key="cmd" {...fadeUp} variants={stagger} className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
                  <motion.div {...fadeUp}>
                    <Card className="card-lift overflow-hidden relative bg-zinc-950 border border-white/10 shadow-2xl">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#ff5793]/5 blur-3xl rounded-full pointer-events-none" />
                      <CardHeader className="pb-3 relative z-10"><CardTitle className="text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2.5 text-zinc-400"><span className="dot-live relative inline-block h-2 w-2 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 8px rgba(34,211,238,0.5)" }} />Pending Agent Actions</CardTitle></CardHeader>
                      <CardContent className="space-y-3 relative z-10">
                        {isDataLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: "var(--surface-inner)" }}>
                              <div className="flex justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-16" /></div>
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          ))
                        ) : actionCards.map((card, i) => (
                          <motion.div key={card.id} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className="overflow-hidden card-lift hover:shadow-lg transition-shadow duration-300 bg-[#0f0f11] border border-white/10">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="text-base font-semibold leading-snug text-white">{card.retailerName}</h3>
                                  <Badge className="shrink-0 rounded-lg px-2.5 py-1 text-xs bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold">{card.issueType}</Badge>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{card.recommendedAction}</p>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Button className="w-full h-9 bg-[#ff5793] hover:bg-[#ff3b7c] text-white font-semibold transition-colors text-[13px] border-0"
                                      onClick={() => {
                                        toast.success("AI Action Executed Successfully", { description: `Approved action for ${card.retailerName}` });
                                        setLastAction(`Approved action for ${card.retailerName}`);
                                      }}>✓ Approve</Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Button variant="ghost" className="w-full h-9 text-[13px] bg-[#1a1c22] hover:bg-[#272a33] text-white transition-colors border border-white/5"
                                      onClick={() => setLastAction(`Opened edit draft for ${card.retailerName}`)}>✏ Edit & Send</Button>
                                  </motion.div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <div className="space-y-4">
                    <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                      <Card className="bg-zinc-950 border border-white/10 shadow-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2.5 text-zinc-400"><span className="dot-live relative inline-block h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.5)" }} />Live Order Feed</CardTitle></CardHeader>
                        <CardContent>
                          <ScrollArea className="max-h-[320px] pr-1 space-y-1">
                            {isDataLoading ? (
                               Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-3 px-4">
                                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div>
                                  <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                               ))
                            ) : orderFeed.map((order, i) => (
                              <motion.div key={order.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.02 }}
                                className={`group flex items-center justify-between rounded-lg px-4 py-2.5 transition-all duration-300 hover:shadow-md ${i % 2 === 0 ? "bg-black/[0.02] dark:bg-white/[0.02]" : "bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"}`}>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate text-white group-hover:text-[#ff5793] transition-colors">{order.retailerName}</p>
                                  <p className="text-xs font-mono text-zinc-400 mt-0.5">{formatInr(order.orderValue)} <span className="opacity-70 text-zinc-500">· {order.itemCount} items</span></p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <Badge className={`px-2 py-0.5 text-[10px] font-semibold ${orderStatusClass(order.status)}`}>
                                    {order.status === "PENDING_CONFIRMATION" ? "Pending" : order.status === "CONFIRMED" ? "Confirmed" : "Blocked"}
                                  </Badge>
                                  <span className="text-[10px] text-zinc-600 font-mono">{formatTimeStable(order.createdAt)}</span>
                                </div>
                              </motion.div>
                            ))}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                      <Card className="bg-zinc-950 border border-white/10 shadow-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2 text-zinc-400"><AlertTriangle size={13} className="text-amber-400" />Top 3 At-Risk Retailers</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {isDataLoading ? (
                             Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--surface-inner)" }}>
                                <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div>
                                <Skeleton className="h-8 w-16" />
                              </div>
                             ))
                          ) : atRiskRetailers.map((r) => (
                            <motion.div key={r.id} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                              <div className="flex items-center justify-between rounded-xl px-4 py-3 hover:shadow-lg transition-all duration-300 bg-[#0f0f11] border border-white/10">
                                <div>
                                  <h3 className="font-medium text-white">{r.name}</h3>
                                  <p className="text-xs font-mono text-zinc-400 mt-0.5">{formatInr(r.outstanding)} <span className="opacity-70 text-zinc-500">outstanding</span></p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className={`text-lg font-bold ${scoreColor(r.trustScore)}`}>{r.trustScore}</p>
                                    <p className="text-[10px] text-zinc-500">Trust Score</p>
                                  </div>
                                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Button variant="outline" size="sm" className="h-8 gap-1.5 transition-colors hover:bg-black/10 border-white/10 text-white"
                                      onClick={() => setLastAction(`Call shortcut for ${r.name}. Confirm manually.`)}><Phone size={12} /> Call</Button>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.section>
              )}

              {/* ── Panel 2: Trust Map ────────────────────────────── */}
              {activePanel === "trust-map" && (
                <motion.div key="trust" {...fadeUp}>
                  <Card className="card-lift overflow-hidden relative" style={{ background: "var(--surface-glass)", border: "1px solid var(--border-ghost)", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
                    <div className="absolute top-0 right-0 w-[80%] h-[150%] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
                    <CardContent className="p-4 relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Retailer Trust Map</h2>
                        <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as "ALL" | RetailerTier)}>
                          <TabsList style={{ background: "var(--surface-inner)" }}>
                            {(["ALL", "A", "B", "C", "D"] as const).map((t) => (
                              <TabsTrigger key={t} value={t} className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-300 transition-all" style={{ color: "var(--text-heading)" }}>
                                {t === "ALL" ? "All" : `Tier ${t}`}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>
                      <div className="overflow-x-auto">
                        <Table className="min-w-[900px] text-sm">
                          <TableHeader className="bg-zinc-800/50">
                            <TableRow>
                              <SortableHead title="Retailer" value="name" onSort={onSort} />
                              <SortableHead title="Trust Score" value="trustScore" onSort={onSort} />
                              <SortableHead title="Tier" value="tier" onSort={onSort} />
                              <SortableHead title="Outstanding" value="outstanding" onSort={onSort} />
                              <SortableHead title="Credit Limit" value="creditLimit" onSort={onSort} />
                              <SortableHead title="Last Payment" value="lastPaymentDate" onSort={onSort} />
                              <SortableHead title="Trend" value="trend" onSort={onSort} />
                              <TableHead className="px-3 py-2 text-zinc-400 text-xs">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trustRows.map((r, i) => (
                              <motion.tr key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="cursor-pointer group hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300" onClick={() => setSelectedRetailer(r)}
                                style={{ background: i % 2 === 0 ? "transparent" : "var(--surface-inner)" }}>
                                <TableCell className="px-3 py-3 font-medium transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400" style={{ color: "var(--text-heading)" }}>{r.name}</TableCell>
                                <TableCell className="px-3 py-3"><span className={`font-mono font-extrabold bg-clip-text text-transparent ${r.trustScore >= 80 ? "bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200" : r.trustScore >= 50 ? "bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-200" : "bg-gradient-to-r from-rose-600 to-rose-400 dark:from-rose-400 dark:to-rose-200"}`}>{r.trustScore}</span></TableCell>
                                <TableCell className="px-3 py-3"><Badge className={`rounded-lg px-2 py-0.5 text-[10px] ${tierClass(r.tier)}`}>Tier {r.tier}</Badge></TableCell>
                                <TableCell className="px-3 py-3 font-mono bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-zinc-200 dark:to-zinc-500">{formatInr(r.outstanding)}</TableCell>
                                <TableCell className="px-3 py-3 font-mono bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-zinc-200 dark:to-zinc-500">{formatInr(r.creditLimit)}</TableCell>
                                <TableCell className="px-3 py-3 font-mono" style={{ color: "var(--text-muted)" }}>{formatDateStable(r.lastPaymentDate)}</TableCell>
                                <TableCell className="px-3 py-3"><span className={`text-lg ${trendClass(r.trend)}`}>{trendArrow(r.trend)}</span></TableCell>
                                <TableCell className="px-3 py-3">
                                  {(r.tier === "A" || r.tier === "B") && (
                                    <Button size="sm" className="h-7 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] px-2 hover:from-cyan-700 hover:to-blue-700"
                                      onClick={(e) => { e.stopPropagation(); setLastAction(`Trust Certificate requested for ${r.name}`); }}>
                                      Certificate
                                    </Button>
                                  )}
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <Sheet open={Boolean(selectedRetailer)} onOpenChange={(o) => { if (!o) setSelectedRetailer(null); }}>
                        {selectedRetailer && (
                          <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-md border-l-0" style={{ background: "var(--surface-header)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)" }}>
                            <SheetHeader>
                              <SheetTitle style={{ color: "var(--text-heading)" }}>{selectedRetailer.name}</SheetTitle>
                              <SheetDescription style={{ color: "var(--text-muted)" }}>
                                Trust Score <span className={`font-mono font-extrabold bg-clip-text text-transparent ${selectedRetailer.trustScore >= 80 ? "bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200" : selectedRetailer.trustScore >= 50 ? "bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-200" : "bg-gradient-to-r from-rose-600 to-rose-400 dark:from-rose-400 dark:to-rose-200"}`}>{selectedRetailer.trustScore}</span> · Tier {selectedRetailer.tier}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Score Breakdown</p>
                              {factorData(selectedRetailer).map((f, i) => (
                                <motion.div key={f.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                                  <div className="mb-1.5 flex items-center justify-between text-sm">
                                    <p style={{ color: "var(--text-body)" }}>{f.label}</p>
                                    <p className={`font-mono font-bold ${scoreColor(f.value)}`}>{f.value}</p>
                                  </div>
                                  <div className="h-3 rounded-full" style={{ background: "var(--surface-inner)" }}>
                                    <motion.div className={`h-3 rounded-full ${scoreBarColor(f.value)} shadow-[0_0_10px_currentColor]`} initial={{ width: 0 }} animate={{ width: `${Math.max(5, f.value)}%` }} transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }} />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-6 pt-4 space-y-2 text-sm" style={{ borderTop: "1px solid var(--border-ghost-subtle)", color: "var(--text-muted)" }}>
                              <p>Outstanding: <span className="font-mono font-semibold" style={{ color: "var(--text-heading)" }}>{formatInr(selectedRetailer.outstanding)}</span></p>
                              <p>Credit Limit: <span className="font-mono font-semibold" style={{ color: "var(--text-heading)" }}>{formatInr(selectedRetailer.creditLimit)}</span></p>
                              <p>Last Payment: <span className="font-mono font-semibold" style={{ color: "var(--text-heading)" }}>{formatDateStable(selectedRetailer.lastPaymentDate)}</span></p>
                            </div>
                          </SheetContent>
                        )}
                      </Sheet>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Panels 3–7 ───────────────────────────────────── */}
              {activePanel === "credit-decisions" && <motion.div key="credit" {...fadeUp}><CreditDecisionPanel onAction={setLastAction} /></motion.div>}
              {activePanel === "scheme-leakage" && <motion.div key="scheme" {...fadeUp}><SchemeLeakagePanel /></motion.div>}
              {activePanel === "beat-intelligence" && <motion.div key="beat" {...fadeUp}><BeatIntelligencePanel /></motion.div>}
              {activePanel === "expiry-calendar" && <motion.div key="expiry" {...fadeUp}><ExpiryCalendarPanel onAction={setLastAction} /></motion.div>}
              {activePanel === "audit-trail" && <motion.div key="audit" {...fadeUp}><AuditTrailPanel /></motion.div>}
            </AnimatePresence>
          </motion.main>
        </motion.section>
      </div>
    </div>
  );
}

function SortableHead({ title, value, onSort }: { title: string; value: SortKey; onSort: (v: SortKey) => void }) {
  return (
    <TableHead className="px-3 py-2 text-zinc-400 text-xs">
      <button onClick={() => onSort(value)} className="inline-flex items-center gap-1 hover:text-zinc-200 transition">
        {title} <span className="text-[10px] opacity-50">↕</span>
      </button>
    </TableHead>
  );
}
