"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, Info, CheckCircle2, RefreshCw, X, ChevronRight, IndianRupee, Zap } from "lucide-react";
import { formatInr } from "@/lib/helpers";
import { toast } from "sonner";

const SEVERITY_CONFIG = {
  CRITICAL: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: ShieldAlert, dot: "bg-rose-400" },
  WARNING:  { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertTriangle, dot: "bg-amber-400" },
  INFO:     { color: "text-blue-400",  bg: "bg-blue-500/10",  border: "border-blue-500/20",  icon: Info,        dot: "bg-blue-400"  },
};

const TYPE_LABELS: Record<string, string> = {
  CREDIT_RISK:       "Credit Risk",
  SCHEME_LEAKAGE:    "Scheme Leakage",
  RETURN_SUSPICIOUS: "Return Fraud",
  EXPIRY_WARNING:    "Expiry",
  GST_COMPLIANCE:    "GST",
  GHOST_VISIT:       "Ghost Visit",
  PAYMENT_DUE:       "Payment Due",
  QUICK_COMMERCE:    "QC Threat",
};

export default function RiskAlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { listRiskAlerts } = await import("@/lib/api-client");
      const params: Record<string, string> = {};
      if (filterSeverity !== "ALL") params.severity = filterSeverity;
      if (filterType !== "ALL") params.alert_type = filterType;
      const data = await listRiskAlerts(params);
      const all = data?.alerts || [];
      setAlerts(showAcknowledged ? all : all.filter((a: any) => !a.acknowledged));
    } catch (e) {
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [filterSeverity, filterType, showAcknowledged]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { acknowledgeAlert } = await import("@/lib/api-client");
      await acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
      if (selectedAlert?.id === alertId) setSelectedAlert((prev: any) => ({ ...prev, acknowledged: true }));
      toast.success("Alert acknowledged");
    } catch {
      toast.error("Failed to acknowledge");
    }
  };

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const { runRiskScan } = await import("@/lib/api-client");
      const result = await runRiskScan();
      toast.success(`Scan complete — ${result.alerts_generated || 0} new alerts generated`);
      await fetchAlerts();
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL" && !a.acknowledged).length;
  const visibleAlerts = showAcknowledged ? alerts : alerts.filter(a => !a.acknowledged);

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] text-slate-200 min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Risk Intelligence
            {criticalCount > 0 && (
              <span className="text-xs bg-rose-500 text-white rounded-full px-2 py-0.5 font-bold animate-pulse">
                {criticalCount} CRITICAL
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Agent 3 — AI-powered risk scanning across your retailer network</p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-lg"
        >
          {scanning ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</>
          ) : (
            <><Zap className="w-4 h-4" /> Run Risk Scan</>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-800/50 flex flex-wrap gap-3 items-center">
        {/* Severity filter */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {["ALL", "CRITICAL", "WARNING", "INFO"].map(s => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${filterSeverity === s
                ? s === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : s === "WARNING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : s === "INFO" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-700 text-white"
                : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-600"
        >
          <option value="ALL">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {/* Acknowledged toggle */}
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer ml-auto">
          <div
            onClick={() => setShowAcknowledged(p => !p)}
            className={`w-9 h-5 rounded-full transition-colors ${showAcknowledged ? "bg-blue-600" : "bg-slate-700"} relative`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showAcknowledged ? "translate-x-4" : ""}`} />
          </div>
          Show Acknowledged
        </label>
      </div>

      {/* Alert List + Detail Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Alert List */}
        <div className={`flex flex-col overflow-y-auto border-r border-slate-800 transition-all ${selectedAlert ? "w-1/2" : "w-full"}`}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading alerts...
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-600/40 mb-3" />
              <p className="font-medium">All Clear</p>
              <p className="text-xs mt-1 text-slate-600">No active risk alerts matching your filters.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {visibleAlerts.map(alert => {
                  const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.INFO;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => setSelectedAlert(alert)}
                      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 cursor-pointer hover:brightness-110 transition-all relative group ${
                        alert.acknowledged ? "opacity-50" : ""
                      } ${selectedAlert?.id === alert.id ? "ring-2 ring-blue-500/40" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg} border ${cfg.border} shrink-0`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                                {alert.severity}
                              </span>
                              <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                {TYPE_LABELS[alert.alert_type] || alert.alert_type}
                              </span>
                              {alert.acknowledged && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Acknowledged</span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-white truncate">{alert.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{alert.description}</p>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {alert.rupee_impact != null && (
                            <span className={`text-xs font-mono font-bold ${cfg.color}`}>₹{formatInr(alert.rupee_impact)}</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                        <span className="text-[10px] text-slate-600 font-mono">
                          {new Date(alert.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {!alert.acknowledged && (
                          <button
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="text-[10px] text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded border border-slate-700 hover:border-emerald-500/30 transition-all"
                          >
                            ✓ Acknowledge
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Alert Detail Pane */}
        <AnimatePresence>
          {selectedAlert && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/2 overflow-y-auto p-6 space-y-5"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white pr-4">{selectedAlert.title}</h3>
                <button onClick={() => setSelectedAlert(null)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  ["Type", TYPE_LABELS[selectedAlert.alert_type] || selectedAlert.alert_type],
                  ["Severity", selectedAlert.severity],
                  ["Affects", `${selectedAlert.affected_entity_type}: ${selectedAlert.affected_entity_id?.slice(0, 8)}...`],
                  ["Rupee Impact", selectedAlert.rupee_impact != null ? `₹${formatInr(selectedAlert.rupee_impact)}` : "—"],
                  ["Created", new Date(selectedAlert.created_at).toLocaleString("en-IN")],
                  ["Status", selectedAlert.acknowledged ? "Acknowledged" : "Open"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-200 text-right max-w-[60%]">{val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedAlert.description}</p>
              </div>

              {selectedAlert.recommended_action && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">💡 Recommended Action</h4>
                  <p className="text-sm text-blue-200 leading-relaxed">{selectedAlert.recommended_action}</p>
                </div>
              )}

              {!selectedAlert.acknowledged && (
                <button
                  onClick={(e) => handleAcknowledge(selectedAlert.id, e)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Acknowledged
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
