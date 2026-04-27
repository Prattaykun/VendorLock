import type { Alert, OrderStatus, RetailerTier, RetailerTrend, CreditVerdict, ExpiryRisk, ReturnVerdict, CoverageStatus, AuditEventType } from "@/types/dashboard";

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function formatTimeStable(isoTime: string) {
  const date = new Date(isoTime);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDateStable(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

export function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${mon} ${h}:${m}`;
}

export function alertPillClass(type: Alert["type"]) {
  if (type === "CRITICAL") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (type === "WARNING") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-sky-500/15 text-sky-400 border-sky-500/30";
}

export function orderStatusClass(status: OrderStatus) {
  if (status === "CONFIRMED") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  if (status === "PENDING_CONFIRMATION") return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
}

export function tierClass(tier: RetailerTier) {
  if (tier === "A") return "bg-emerald-500/15 text-emerald-400";
  if (tier === "B") return "bg-blue-500/15 text-blue-400";
  if (tier === "C") return "bg-amber-500/15 text-amber-400";
  return "bg-rose-500/15 text-rose-400";
}

export function trendArrow(trend: RetailerTrend) {
  if (trend === "UP") return "↑";
  if (trend === "DOWN") return "↓";
  return "→";
}

export function trendClass(trend: RetailerTrend) {
  if (trend === "UP") return "text-emerald-400";
  if (trend === "DOWN") return "text-rose-400";
  return "text-zinc-400";
}

export function verdictClass(verdict: CreditVerdict) {
  if (verdict === "APPROVE") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (verdict === "CONDITIONAL") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-400 border-rose-500/30";
}

export function expiryRiskClass(risk: ExpiryRisk) {
  if (risk === "RED") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  if (risk === "AMBER") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
}

export function returnVerdictClass(verdict: ReturnVerdict) {
  if (verdict === "GENUINE") return "bg-emerald-500/15 text-emerald-400";
  if (verdict === "SUSPICIOUS") return "bg-rose-500/15 text-rose-400";
  return "bg-amber-500/15 text-amber-400";
}

export function coverageStatusClass(status: CoverageStatus) {
  if (status === "VISITED_ORDERS") return "border-emerald-500 bg-emerald-500";
  if (status === "VISITED_NO_ORDERS") return "border-amber-500 bg-amber-500";
  return "border-rose-500 bg-rose-500";
}

export function coverageIndicatorClass(status: CoverageStatus) {
  if (status === "VISITED_ORDERS") return "bg-emerald-500";
  if (status === "VISITED_NO_ORDERS") return "bg-amber-500";
  return "bg-rose-500";
}

export function coverageLabel(status: CoverageStatus) {
  if (status === "VISITED_ORDERS") return "Visited + Orders";
  if (status === "VISITED_NO_ORDERS") return "Visited, No Orders";
  return "Not Visited 7+ Days";
}

export function eventTypeClass(type: AuditEventType) {
  const map: Record<AuditEventType, string> = {
    ORDER: "bg-blue-500/15 text-blue-400",
    PAYMENT: "bg-emerald-500/15 text-emerald-400",
    SCORE_CHANGE: "bg-purple-500/15 text-purple-400",
    RETURN: "bg-amber-500/15 text-amber-400",
    ALERT: "bg-rose-500/15 text-rose-400",
    SCHEME: "bg-cyan-500/15 text-cyan-400",
    BEAT_VISIT: "bg-orange-500/15 text-orange-400",
  };
  return map[type];
}

export function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

export function scoreBarColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}
