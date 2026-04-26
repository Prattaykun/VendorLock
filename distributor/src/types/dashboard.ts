export type AlertType = "CRITICAL" | "WARNING" | "INFO";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface ActionCard {
  id: string;
  retailerName: string;
  issueType: string;
  recommendedAction: string;
}

export type OrderStatus = "CONFIRMED" | "PENDING_CONFIRMATION" | "BLOCKED";

export interface Order {
  id: string;
  retailerName: string;
  status: OrderStatus;
  orderValue: number;
  itemCount: number;
  createdAt: string;
}

export type RetailerTier = "A" | "B" | "C" | "D";
export type RetailerTrend = "UP" | "DOWN" | "STABLE";

export interface RetailerFactors {
  paymentDiscipline: number;
  orderConsistency: number;
  cancellationRate: number;
  returnFrequency: number;
  communicationReliability: number;
  tradeStability: number;
}

export interface Retailer {
  id: string;
  name: string;
  trustScore: number;
  tier: RetailerTier;
  outstanding: number;
  creditLimit: number;
  lastPaymentDate: string;
  trend: RetailerTrend;
  factors: RetailerFactors;
}

// ── Panel 3: Credit Decisions ──────────────────────────────────────────────────

export type CreditVerdict = "APPROVE" | "CONDITIONAL" | "BLOCK";

export interface CreditOrder {
  id: string;
  retailerName: string;
  retailerTrustScore: number;
  orderValue: number;
  items: string[];
  currentOutstanding: number;
  postOrderOutstanding: number;
  verdict: CreditVerdict;
  draftMessage: string;
  utilisationPercent: number;
}

export interface VelocityAlert {
  retailerId: string;
  retailerName: string;
  utilisationJump: number; // percent increase in 7 days
  currentUtilisation: number;
}

// ── Panel 4: Scheme Leakage ────────────────────────────────────────────────────

export interface Scheme {
  id: string;
  brand: string;
  sku: string;
  schemePercent: number;
  benefitReceived: number;
  benefitPassed: number;
  leakage: number;
}

export interface RetailerScheme {
  retailerName: string;
  benefitEntitled: number;
  benefitPassed: number;
  status: "FULL" | "PARTIAL" | "NONE";
}

// ── Panel 5: Beat Intelligence ─────────────────────────────────────────────────

export interface Salesman {
  id: string;
  name: string;
  outletsAssigned: number;
  outletsWithChat: number;
  ghostVisitCount: number;
  reliabilityScore: number;
  missedRevenue: number;
}

export type CoverageStatus = "VISITED_ORDERS" | "VISITED_NO_ORDERS" | "NOT_VISITED";

export interface CoverageZone {
  id: string;
  sector: string;
  pincode: string;
  status: CoverageStatus;
  outlets: number;
  lastVisit: string;
}

export interface GhostVisitAlert {
  salesmanName: string;
  checkIns: number;
  orders: number;
  messages: number;
  missedRevenue: number;
}

export interface BeatPlanEntry {
  salesmanName: string;
  outletName: string;
  prioritySKUs: string[];
  riskFlags: string[];
  time: string;
}

// ── Panel 6: Expiry & Returns ──────────────────────────────────────────────────

export type ExpiryRisk = "RED" | "AMBER" | "GREEN";

export interface ExpiryBatch {
  id: string;
  batchCode: string;
  product: string;
  quantity: number;
  value: number;
  expiryDate: string;
  risk: ExpiryRisk;
  daysUntilExpiry: number;
  brandReturnWindowDays: number;
}

export type ReturnVerdict = "GENUINE" | "SUSPICIOUS" | "EXPIRED_WINDOW";

export interface ReturnRequest {
  id: string;
  retailerName: string;
  items: string;
  quantity: number;
  claimedReason: string;
  agentVerdict: ReturnVerdict;
  value: number;
}

// ── Panel 7: Audit Trail ───────────────────────────────────────────────────────

export type AuditEventType =
  | "ORDER"
  | "PAYMENT"
  | "SCORE_CHANGE"
  | "RETURN"
  | "ALERT"
  | "SCHEME"
  | "BEAT_VISIT";

export interface EventLog {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  retailer: string;
  description: string;
  sha256Hash: string;
  status: "INTACT" | "TAMPERED";
}
