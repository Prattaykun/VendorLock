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
import { alerts as mockAlerts, actionCards as mockActionCards, orderFeed as mockOrderFeed, retailers as mockRetailers } from "@/lib/mock-data";
import { getDashboardSummary, getRetailers, listOrders, listAlerts, setAuthToken } from "@/lib/api-client";
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

function ScoreBar({ label, value, color }: { label: string; value: number; color: "blue" | "orange" | "green" }) {
  const colorClasses = {
    blue: { bg: "bg-blue-500", text: "text-blue-400" },
    orange: { bg: "bg-orange-500", text: "text-orange-400" },
    green: { bg: "bg-emerald-500", text: "text-emerald-400" },
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-xs font-mono font-medium ${colorClasses[color].text}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div className={`h-full rounded-full ${colorClasses[color].bg}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function DistributorControlTower() {
  const { theme, toggleTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelKey>("command-center");
  const [lastAction, setLastAction] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<"ALL" | RetailerTier>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("trustScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(mockRetailers[0] || null);
  const [mobileNav, setMobileNav] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Live Data State
  const [alerts, setAlerts] = useState(mockAlerts);
  const [actionCards, setActionCards] = useState(mockActionCards);
  const [orderFeed, setOrderFeed] = useState(mockOrderFeed);
  const [retailers, setRetailers] = useState(mockRetailers);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [sumRes, retRes, ordRes, alertRes] = await Promise.allSettled([
          getDashboardSummary(),
          getRetailers(),
          listOrders({ limit: 10 }),
          listAlerts()
        ]);

        if (sumRes.status === "fulfilled") setSummary(sumRes.value);
        if (retRes.status === "fulfilled" && retRes.value.retailers?.length) {
          // Map DB retailers to UI format
          setRetailers(retRes.value.retailers.map((r: any) => ({
            id: r.id, name: r.name || "Unknown Retailer", tier: (r.trust_scores?.[0]?.tier || "C") as RetailerTier,
            trustScore: r.trust_scores?.[0]?.composite_score || 50, trend: "STABLE", outstanding: r.outstanding || 0,
            creditLimit: r.credit_limit || 50000, lastPaymentDate: r.created_at || new Date().toISOString(),
            factors: r.trust_scores?.[0]?.sub_scores || { paymentDiscipline: 50, orderConsistency: 50, cancellationRate: 50, returnFrequency: 50, communicationReliability: 50, tradeStability: 50 }
          })));
        }
        if (ordRes.status === "fulfilled" && ordRes.value.orders?.length) {
          setOrderFeed(ordRes.value.orders.map((o: any) => ({
            id: o.id, retailerId: o.retailer_id, retailerName: "Retailer " + o.retailer_id.slice(0, 4),
            status: o.status, orderValue: o.total_amount || 0, itemCount: o.items?.length || 1, createdAt: o.created_at
          })));
        }
      } catch (err) {
        // Silently fail and use mock data
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, [activePanel]);

  const atRiskRetailers = [...retailers].sort((a, b) => a.trustScore - b.trustScore).slice(0, 3);
  const unresolvedCritical = alerts.filter((a) => a.type === "CRITICAL" && !a.resolved);
  const alertSummary = {
    CRITICAL: summary?.critical_alerts ?? alerts.filter((a) => a.type === "CRITICAL" && !a.resolved).length,
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
  }, [sortBy, sortDirection, tierFilter, retailers]);

  const onSort = (key: SortKey) => {
    if (sortBy === key) { setSortDirection((p) => (p === "asc" ? "desc" : "asc")); return; }
    setSortBy(key); setSortDirection("desc");
  };

  return (
    <div className="min-h-screen text-[var(--foreground)] bg-transparent">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[264px_1fr] bg-transparent">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen bg-slate-900/60 backdrop-blur-md" style={{ borderRight: "1px solid var(--border-ghost-subtle)" }}>
          {/* Brand */}
          <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid var(--border-ghost-subtle)" }}>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-slate-900 border border-white/10" style={{ boxShadow: "var(--brand-glow)" }}>
                <img src="/logo-round.png" alt="VendorLock Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center translate-y-1">
                <img src="/logo-text.png" alt="VendorLock" className="h-20 w-auto object-contain object-left -ml-2" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold leading-none -mt-3 ml-0.5">Distributor OS</p>
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
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-slate-900 border border-white/10">
                <img src="/logo-round.png" alt="VendorLock Logo" className="w-full h-full object-cover" />
              </div>
              <img src="/logo-text.png" alt="VendorLock" className="h-14 w-auto object-contain object-left -ml-1 translate-y-1" />
            </div>
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
          className="flex min-h-screen flex-col bg-transparent text-white"
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
                <motion.section key="cmd" {...fadeUp} className="flex flex-col gap-6">
                  {/* System Overview Section */}
                  <div
                    className="rounded-xl border p-6 flex flex-col md:flex-row justify-between items-center gap-6"
                    style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", borderColor: "#424754", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                  >
                    <div>
                      <h2 className="text-xl font-semibold mb-1" style={{ color: "#d8e3fb" }}>System Overview</h2>
                      <p className="text-sm flex items-center gap-2" style={{ color: "#c2c6d6" }}>
                        <span className="w-2 h-2 rounded-full bg-[#adc6ff] animate-pulse"></span>
                        Live data stream active across 14 global nodes.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Critical */}
                      <div className="rounded-lg px-4 py-3 flex items-center gap-4 min-w-[140px]" style={{ backgroundColor: "#1f2a3c", border: "1px solid #424754" }}>
                        <div className="p-2 rounded-md" style={{ backgroundColor: "rgba(255, 180, 171, 0.1)" }}>
                          <svg className="w-5 h-5" style={{ color: "#ffb4ab" }} fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs uppercase" style={{ color: "#c2c6d6" }}>Critical</p>
                          <p className="text-2xl font-bold" style={{ color: "#ffb4ab" }}>{alertSummary.CRITICAL}</p>
                        </div>
                      </div>
                      {/* Pending */}
                      <div className="rounded-lg px-4 py-3 flex items-center gap-4 min-w-[140px]" style={{ backgroundColor: "#1f2a3c", border: "1px solid #424754" }}>
                        <div className="p-2 rounded-md" style={{ backgroundColor: "rgba(183, 200, 225, 0.1)" }}>
                          <svg className="w-5 h-5" style={{ color: "#b7c8e1" }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41 1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs uppercase" style={{ color: "#c2c6d6" }}>Pending</p>
                          <p className="text-2xl font-bold" style={{ color: "#b7c8e1" }}>{alertSummary.WARNING}</p>
                        </div>
                      </div>
                      {/* Cleared */}
                      <div className="rounded-lg px-4 py-3 flex items-center gap-4 min-w-[140px]" style={{ backgroundColor: "#1f2a3c", border: "1px solid #424754" }}>
                        <div className="p-2 rounded-md" style={{ backgroundColor: "rgba(77, 142, 255, 0.1)" }}>
                          <svg className="w-5 h-5" style={{ color: "#adc6ff" }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs uppercase" style={{ color: "#c2c6d6" }}>Cleared</p>
                          <p className="text-2xl font-bold" style={{ color: "#adc6ff" }}>892</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Bento Grid */}
                  <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
                    {/* Left Column (8 cols): Priority Actions */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                      {/* Priority Actions Header */}
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold" style={{ color: "#d8e3fb" }}>Priority Actions</h3>
                          <p className="text-sm" style={{ color: "#c2c6d6" }}>Anomalies requiring immediate coordinator review.</p>
                        </div>
                        <button className="text-sm flex items-center gap-1 shrink-0 whitespace-nowrap self-start lg:self-auto" style={{ color: "#adc6ff" }}>
                          View All <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                        </button>
                      </div>

                      {/* Action Cards */}
                      {actionCards.map((card, i) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-xl p-5"
                          style={{ backgroundColor: "#152031", border: "1px solid #424754", boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex gap-4 min-w-0 items-start">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold" style={{ backgroundColor: "#2a3548", border: "1px solid #8c909f", color: "#d8e3fb" }}>
                                {card.retailerName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-lg font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: "#d8e3fb" }}>{card.retailerName}</h4>
                                <p className="text-sm font-mono mt-1" style={{ color: "#c2c6d6" }}>{card.issueType}</p>
                              </div>
                            </div>
                            <span className="self-start px-2 py-1 rounded text-xs font-medium flex items-center gap-1" style={{ backgroundColor: "rgba(255, 180, 171, 0.1)", color: "#ffb4ab", border: "1px solid rgba(255, 180, 171, 0.2)" }}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                              Action Required
                            </span>
                          </div>
                          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "rgba(4, 14, 31, 0.5)", border: "1px solid #424754" }}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                              <div>
                                <p className="text-xs uppercase mb-1 tracking-wider" style={{ color: "#c2c6d6" }}>Issue Detected</p>
                                <p className="text-sm leading-relaxed text-wrap" style={{ color: "#d8e3fb" }}>{card.recommendedAction.split('.')[0]}.</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase mb-1 tracking-wider" style={{ color: "#c2c6d6" }}>System Recommendation</p>
                                <p className="text-sm leading-relaxed text-wrap" style={{ color: "#d8e3fb" }}>{card.recommendedAction.split('.')[1]?.trim() || "Review and approve action."}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
                            <button className="px-4 py-2 rounded-lg border text-sm flex items-center justify-center gap-2" style={{ borderColor: "#424754", color: "#d8e3fb" }}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                              Edit & Send
                            </button>
                            <button className="px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2" style={{ backgroundColor: "#adc6ff", color: "#002e6a" }}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                              Approve Action
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {/* KPI Metric Cards Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl p-5 flex flex-col gap-3"
                          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(66, 71, 84, 0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider" style={{ color: "#c2c6d6" }}>Total Retailers</span>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(77, 142, 255, 0.15)" }}>
                              <svg className="w-4 h-4" style={{ color: "#adc6ff" }} fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            <span className="text-3xl font-bold" style={{ color: "#d8e3fb" }}>847</span>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(77, 142, 255, 0.15)", color: "#adc6ff" }}>+12%</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="rounded-xl p-5 flex flex-col gap-3"
                          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(66, 71, 84, 0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider" style={{ color: "#c2c6d6" }}>Active Orders</span>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(183, 200, 225, 0.15)" }}>
                              <svg className="w-4 h-4" style={{ color: "#b7c8e1" }} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            <span className="text-3xl font-bold" style={{ color: "#d8e3fb" }}>2,341</span>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(183, 200, 225, 0.15)", color: "#b7c8e1" }}>+8%</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="rounded-xl p-5 flex flex-col gap-3"
                          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(66, 71, 84, 0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider" style={{ color: "#c2c6d6" }}>Outstanding</span>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255, 180, 171, 0.15)" }}>
                              <svg className="w-4 h-4" style={{ color: "#ffb4ab" }} fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.15 3 2.15 0 .53-.39 1.39-2.7 1.39-1.78 0-2.63-.85-2.73-2.1h-2.2c.12 1.95 1.3 3.4 3.53 3.83V23h3v-2.15c1.95-.29 3.5-1.5 3.5-3.55 0-2.77-2.49-4.03-4.5-4.41z" /></svg>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            <span className="text-3xl font-bold" style={{ color: "#d8e3fb" }}>₹4.2L</span>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(255, 180, 171, 0.15)", color: "#ffb4ab" }}>-3%</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="rounded-xl p-5 flex flex-col gap-3"
                          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(66, 71, 84, 0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider" style={{ color: "#c2c6d6" }}>Credit Utilization</span>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(190, 198, 224, 0.15)" }}>
                              <svg className="w-4 h-4" style={{ color: "#bec6e0" }} fill="currentColor" viewBox="0 0 24 24"><path d="M23 8h-1.81c-.45 0-.81.37-.81.81h.01c-.01.22-.04.44-.09.66l1.9.01V9zm.01-.5c.01-.44.37-.81.81-.81V9zm-22 .01v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zm.01 1v.19c-.45 0-.81.37-.81.81H1c.45 0 .81-.37.81-.81zM2.82 21h18.36l-1.89.01V23H4.71v-.01l-1.89-.01zM7.24 14h1.66v3.01H7.24zm4.24 0h1.66v3.01h-1.66z" /></svg>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            <span className="text-3xl font-bold" style={{ color: "#d8e3fb" }}>67%</span>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(190, 198, 224, 0.15)", color: "#bec6e0" }}>Stable</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Chart Placeholders Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="rounded-xl p-6 min-h-[280px] flex flex-col"
                          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(66, 71, 84, 0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-semibold" style={{ color: "#d8e3fb" }}>Order Volume Trend</h4>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(77, 142, 255, 0.15)", color: "#adc6ff" }}>Last 30 days</span>
                          </div>
                          <div className="flex-1 flex items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(21, 32, 49, 0.5)" }}>
                            <div className="text-center">
                              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: "#adc6ff" }} fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg>
                              <p className="text-sm" style={{ color: "#8c909f" }}>Line Chart Placeholder</p>
                              <p className="text-xs mt-1" style={{ color: "#636b7a" }}>Orders over time visualization</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="rounded-xl p-6 min-h-[280px] flex flex-col"
                          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(66, 71, 84, 0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-semibold" style={{ color: "#d8e3fb" }}>Credit Distribution</h4>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(183, 200, 225, 0.15)", color: "#b7c8e1" }}>By Tier</span>
                          </div>
                          <div className="flex-1 flex items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(21, 32, 49, 0.5)" }}>
                            <div className="text-center">
                              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: "#b7c8e1" }} fill="currentColor" viewBox="0 0 24 24"><path d="M11 2v20c-5.07-5.08-11-5.08-11-11S5.93 2 11 2zm9.07 4.93l-2.83 2.83c1.26 1.26 1.26 3.3 0 4.56l2.83 2.83c2.07-2.08 2.07-5.45 0-7.53l-2.83-2.83c-1.28 1.28-1.28 3.44 0 4.72zM5.93 16.07C3.85 18.15 3.85 22.5 5.93 24.57l-2.83 2.83c-2.08-2.07-2.08-5.43 0-7.53l2.83-2.83c-1.28 1.28-1.28 3.43 0 4.72z" transform="rotate(45 12 12)" /></svg>
                              <p className="text-sm" style={{ color: "#8c909f" }}>Donut Chart Placeholder</p>
                              <p className="text-xs mt-1" style={{ color: "#636b7a" }}>Credit allocation by tier</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Right Column (4 cols): Live Telemetry */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="rounded-xl flex flex-col h-full" style={{ backgroundColor: "#152031", border: "1px solid #424754" }}>
                        <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: "#1f2a3c", borderColor: "#424754" }}>
                          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "#d8e3fb" }}>
                            <span className="w-2 h-2 rounded-full bg-[#adc6ff] animate-pulse"></span>
                            Live Telemetry
                          </h3>
                          <button>
                            <svg className="w-5 h-5" style={{ color: "#c2c6d6" }} fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {orderFeed.slice(0, 5).map((order, i) => (
                            <div key={order.id} className="relative pl-6">
                              <div className="absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#152031", border: `2px solid ${order.status === "CONFIRMED" ? "#adc6ff" : order.status === "BLOCKED" ? "#ffb4ab" : "#b7c8e1"}` }}>
                                {order.status === "CONFIRMED" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#adc6ff" }}></div>}
                                {order.status === "BLOCKED" && <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-rose-400 text-[8px] leading-none text-white">×</span>}
                              </div>
                              <div className="rounded-lg p-3" style={{ backgroundColor: "#2a3548", border: "1px solid rgba(66, 71, 84, 0.3)" }}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-mono" style={{ color: "#8c909f" }}>{formatTimeStable(order.createdAt)}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: order.status === "CONFIRMED" ? "rgba(77, 142, 255, 0.1)" : order.status === "BLOCKED" ? "rgba(255, 180, 171, 0.1)" : "rgba(183, 200, 225, 0.1)", color: order.status === "CONFIRMED" ? "#adc6ff" : order.status === "BLOCKED" ? "#ffb4ab" : "#b7c8e1", border: `1px solid ${order.status === "CONFIRMED" ? "rgba(77, 142, 255, 0.2)" : order.status === "BLOCKED" ? "rgba(255, 180, 171, 0.2)" : "rgba(183, 200, 225, 0.2)"}` }}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: "#d8e3fb" }}>{order.id}</p>
                                <p className="text-xs truncate" style={{ color: "#8c909f" }}>{order.retailerName}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t text-center" style={{ backgroundColor: "#152031", borderColor: "#424754" }}>
                          <span className="text-xs font-mono animate-pulse" style={{ color: "#8c909f" }}>Establishing secure handshake...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* ── Panel 2: Trust Map (Split Pane) ────────────────────── */}
              {activePanel === "trust-map" && (
                <motion.div key="trust" {...fadeUp} className="bg-[#0f172a] min-h-screen -mx-4 -my-5 px-4 py-5">
                  <div className="grid grid-cols-1 gap-4 h-[calc(100vh-140px)]">
                    {/* Left Pane: Table */}
                    <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden flex flex-col">
                      {/* Header with Search */}
                      <div className="p-4 border-b border-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Retailer Trust Map</h2>
                          <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as "ALL" | RetailerTier)}>
                            <TabsList className="bg-slate-800/50">
                              {(["ALL", "A", "B", "C", "D"] as const).map((t) => (
                                <TabsTrigger key={t} value={t} className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-slate-400 text-xs h-7">
                                  {t === "ALL" ? "All" : `Tier ${t}`}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </Tabs>
                        </div>
                        {/* Search Bar */}
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                          <input type="text" placeholder="Search retailers..." className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
                        </div>
                      </div>
                      {/* Table */}
                      <div className="flex-1 overflow-auto">
                        <Table className="text-sm">
                          <TableHeader className="bg-slate-800/30 sticky top-0">
                            <TableRow className="border-b border-white/5">
                              <SortableHead title="Retailer" value="name" onSort={onSort} className="pl-6" />
                              <SortableHead title="Trust Score" value="trustScore" onSort={onSort} className="pl-6" />
                              <SortableHead title="Tier" value="tier" onSort={onSort} className="pl-6" />
                              <SortableHead title="Outstanding" value="outstanding" onSort={onSort} className="pl-6" />
                              <SortableHead title="Credit Limit" value="creditLimit" onSort={onSort} className="pl-6" />
                              <SortableHead title="Last Payment" value="lastPaymentDate" onSort={onSort} className="pl-6" />
                              <SortableHead title="Trend" value="trend" onSort={onSort} className="pl-6" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trustRows.map((r, i) => (
                              <TableRow key={r.id} className="border-b border-white/5 hover:bg-slate-700/30 cursor-pointer transition-colors" onClick={() => setSelectedRetailer(r)}>
                                <TableCell className="pl-6 pr-3 py-3">
                                  <p className="font-medium text-slate-200">{r.name}</p>
                                  {r.hindiName && <p className="text-xs text-slate-500">{r.hindiName}</p>}
                                </TableCell>
                                <TableCell className="pl-6 pr-3 py-3">
                                  <span className={`font-mono font-medium ${r.trustScore >= 80 ? "text-emerald-400" : r.trustScore >= 50 ? "text-amber-400" : "text-red-400"}`}>{r.trustScore}</span>
                                </TableCell>
                                <TableCell className="pl-6 pr-3 py-3">
                                  <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.tier === "A" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : r.tier === "B" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : r.tier === "C" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                                    Tier {r.tier}
                                  </Badge>
                                </TableCell>
                                <TableCell className="pl-6 pr-3 py-3 font-mono text-slate-300">{formatInr(r.outstanding)}</TableCell>
                                <TableCell className="pl-6 pr-3 py-3 font-mono text-slate-300">{formatInr(r.creditLimit)}</TableCell>
                                <TableCell className="pl-6 pr-3 py-3 font-mono text-slate-400">{formatDateStable(r.lastPaymentDate)}</TableCell>
                                <TableCell className="pl-6 pr-3 py-3"><span className={`text-lg ${trendClass(r.trend)}`}>{trendArrow(r.trend)}</span></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    </div>

                  {/* Detail Sheet (for mobile/small screens) */}
                  <Sheet open={Boolean(selectedRetailer)} onOpenChange={(o) => { if (!o) setSelectedRetailer(null); }}>
                    {selectedRetailer && (
                      <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-md border-l border-white/10 bg-[#0f172a]/95 backdrop-blur-xl px-6 py-8">
                        <SheetHeader className="mb-6">
                          <SheetTitle className="text-2xl font-bold text-slate-100">{selectedRetailer.name}</SheetTitle>
                          <SheetDescription className="text-slate-400 text-sm">
                            Trust Score <span className={`font-mono font-bold ${selectedRetailer.trustScore >= 80 ? "text-emerald-500" : selectedRetailer.trustScore >= 50 ? "text-amber-500" : "text-red-500"}`}>{selectedRetailer.trustScore}</span> · Tier {selectedRetailer.tier}
                          </SheetDescription>
                        </SheetHeader>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                          <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Outstanding</p>
                            <p className="text-lg font-mono font-bold text-slate-200">{formatInr(selectedRetailer.outstanding)}</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Credit Limit</p>
                            <p className="text-lg font-mono font-bold text-slate-200">{formatInr(selectedRetailer.creditLimit)}</p>
                          </div>
                        </div>

                        <div className="mb-8 space-y-5">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Score Breakdown</p>
                          {factorData(selectedRetailer).map((f, i) => (
                            <motion.div key={f.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <p className="text-slate-300 font-medium">{f.label}</p>
                                <p className={`font-mono font-bold ${scoreColor(f.value)}`}>{f.value}/100</p>
                              </div>
                              <div className="h-2 rounded-full bg-slate-800 border border-slate-700/50">
                                <motion.div className={`h-full rounded-full ${scoreBarColor(f.value)}`} initial={{ width: 0 }} animate={{ width: `${Math.max(5, f.value)}%` }} transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }} />
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Action Buttons in Sheet */}
                        <div className="mt-8 pt-6 space-y-3 border-t border-white/10">
                          <button
                            onClick={() => {
                              const botUrl = `https://t.me/VendorLockBot?start=${selectedRetailer.id}`;
                              navigator.clipboard.writeText(`Hello ${selectedRetailer.name}, please place your orders using our AI Bot: ${botUrl}`);
                              toast.success("Bot link copied to clipboard!");
                            }}
                            className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30 rounded-lg py-3 flex items-center justify-center font-medium transition-all"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            Share Bot Link
                          </button>
                          <button className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 rounded-lg py-3 flex items-center justify-center font-medium transition-all">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Issue Trust Certificate
                          </button>
                          <button className="w-full bg-transparent text-slate-300 border border-slate-600 hover:bg-slate-800 rounded-lg py-3 font-medium transition-all">
                            View Full Profile
                          </button>
                        </div>
                      </SheetContent>
                    )}
                  </Sheet>
                </motion.div>
              )}

              {/* ── Panels 3–7 ───────────────────────────────────── */}
              {activePanel === "credit-decisions" && <motion.div key="credit" {...fadeUp}><CreditDecisionPanel onAction={setLastAction} orders={orderFeed} alerts={alerts} retailers={retailers} /></motion.div>}
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

function SortableHead({ title, value, onSort, className }: { title: string; value: SortKey; onSort: (v: SortKey) => void; className?: string }) {
  return (
    <TableHead className={`px-3 py-3 text-slate-400 text-xs uppercase tracking-wider ${className || ""}`}>
      <button onClick={() => onSort(value)} className="inline-flex items-center gap-1 hover:text-slate-200 transition">
        {title} <span className="text-[10px] opacity-50">↕</span>
      </button>
    </TableHead>
  );
}
