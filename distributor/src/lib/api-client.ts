/**
 * VendorLock API Client — connects the distributor frontend to the FastAPI backend.
 * Handles auth, data fetching, and Agent pipeline invocations.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Auth Token Management ─────────────────────────────────────────────────────

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("vendorlock_token", token);
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("vendorlock_token");
  }
  return null;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("vendorlock_token");
  }
}

// ── Base Fetcher ──────────────────────────────────────────────────────────────

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API Error ${res.status}: ${body}`);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string, tenantId: string) {
  const data = await apiFetch<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, tenant_id: tenantId }),
  });
  setAuthToken(data.access_token);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
  tenant_id: string;
  role?: string;
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe() {
  return apiFetch("/auth/me");
}

// ── Distributor ───────────────────────────────────────────────────────────────

export async function getDistributorProfile() {
  return apiFetch("/distributor/profile");
}

export async function getDashboardSummary() {
  return apiFetch("/distributor/dashboard/summary");
}

export async function getRetailers(tier?: string, limit = 50, offset = 0) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (tier) params.set("tier", tier);
  return apiFetch(`/distributor/retailers?${params}`);
}

export async function getSalesmen() {
  return apiFetch("/distributor/salesmen");
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  retailer_id: string;
  items: { sku_id: string; product_name: string; quantity: number; unit_price?: number }[];
  payment_type?: string;
  notes?: string;
  channel?: string;
  raw_message?: string;
}

export async function createOrder(payload: CreateOrderPayload) {
  return apiFetch("/orders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrder(orderId: string) {
  return apiFetch(`/orders/${orderId}`);
}

export async function listOrders(params?: { retailer_id?: string; status_filter?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.retailer_id) searchParams.set("retailer_id", params.retailer_id);
  if (params?.status_filter) searchParams.set("status_filter", params.status_filter);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  return apiFetch(`/orders/?${searchParams}`);
}

export async function confirmOrder(orderId: string) {
  return apiFetch(`/orders/${orderId}/confirm`, { method: "PATCH" });
}

export async function disputeOrder(orderId: string, note?: string) {
  const params = note ? `?note=${encodeURIComponent(note)}` : "";
  return apiFetch(`/orders/${orderId}/dispute${params}`, { method: "PATCH" });
}

// ── Trust Scores ──────────────────────────────────────────────────────────────

export async function getTrustScore(retailerId: string) {
  return apiFetch(`/trust-score/${retailerId}`);
}

export async function getTrustBreakdown(retailerId: string) {
  return apiFetch(`/trust-score/${retailerId}/breakdown`);
}

export async function getTrustHistory(retailerId: string, days = 90) {
  return apiFetch(`/trust-score/${retailerId}/history?days=${days}`);
}

export async function recalculateScore(retailerId: string) {
  return apiFetch(`/trust-score/recalculate/${retailerId}`, { method: "POST" });
}

// ── Risk Alerts ───────────────────────────────────────────────────────────────

export async function listAlerts(params?: { severity?: string; alert_type?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.severity) searchParams.set("severity", params.severity);
  if (params?.alert_type) searchParams.set("alert_type", params.alert_type);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  return apiFetch(`/risk-alerts/?${searchParams}`);
}

export async function acknowledgeAlert(alertId: string) {
  return apiFetch(`/risk-alerts/${alertId}/acknowledge`, { method: "PATCH" });
}

export async function triggerRiskScan() {
  return apiFetch("/risk-alerts/run-scan", { method: "POST" });
}

// ── Schemes ───────────────────────────────────────────────────────────────────

export async function listSchemes() {
  return apiFetch("/schemes/");
}

export async function createScheme(payload: any) {
  return apiFetch("/schemes/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSchemeLeakage(periodDays = 30) {
  return apiFetch(`/schemes/leakage?period_days=${periodDays}`);
}

// ── Beat Plan ─────────────────────────────────────────────────────────────────

export async function getBeatPlan(salesmanId: string) {
  return apiFetch(`/beat-plan/${salesmanId}`);
}

export async function getCoverageGaps(days = 7) {
  return apiFetch(`/beat-plan/coverage/gaps?days=${days}`);
}

export async function getGhostVisitReport(salesmanId?: string) {
  const params = salesmanId ? `?salesman_id=${salesmanId}` : "";
  return apiFetch(`/beat-plan/ghost-visits/report${params}`);
}

export async function generateBeatPlans() {
  return apiFetch("/beat-plan/generate", { method: "POST" });
}

// ── Expiry ────────────────────────────────────────────────────────────────────

export async function getExpiryAlerts(daysThreshold = 90) {
  return apiFetch(`/expiry/alerts?days_threshold=${daysThreshold}`);
}

export async function listBatches(params?: { sku_id?: string; expiring_within_days?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.sku_id) searchParams.set("sku_id", params.sku_id);
  if (params?.expiring_within_days) searchParams.set("expiring_within_days", String(params.expiring_within_days));
  return apiFetch(`/expiry/batches?${searchParams}`);
}

// ── Returns ───────────────────────────────────────────────────────────────────

export async function submitReturn(payload: any) {
  return apiFetch("/returns/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listReturns(statusFilter?: string) {
  const params = statusFilter ? `?status_filter=${statusFilter}` : "";
  return apiFetch(`/returns/${params}`);
}

export async function approveReturn(returnId: string) {
  return apiFetch(`/returns/${returnId}/approve`, { method: "PATCH" });
}

export async function rejectReturn(returnId: string, reason?: string) {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return apiFetch(`/returns/${returnId}/reject${params}`, { method: "PATCH" });
}

// ── Certificates ──────────────────────────────────────────────────────────────

export async function generateCertificate(retailerId: string) {
  return apiFetch("/certificate/generate", {
    method: "POST",
    body: JSON.stringify({ retailer_id: retailerId, requested_by: "distributor" }),
  });
}

export async function verifyCertificate(certificateId: string) {
  return apiFetch(`/certificate/verify/${certificateId}`);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getTrustDistribution() {
  return apiFetch("/analytics/trust-distribution");
}

export async function getAuditTrail(limit = 50, entityId?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (entityId) params.set("entity_id", entityId);
  return apiFetch(`/analytics/audit-trail?${params}`);
}

// ── Agent Pipeline ────────────────────────────────────────────────────────────

export type AgentName =
  | "agent_1_trade_capture"
  | "agent_2_trust_scoring"
  | "agent_3_risk_intelligence"
  | "agent_4_action_recommendation"
  | "agent_5_demand_forecast"
  | "agent_6_beat_intelligence";

export async function runAgent(agent: AgentName, inputPayload?: Record<string, any>) {
  return apiFetch("/agents/run", {
    method: "POST",
    body: JSON.stringify({ agent, input_payload: inputPayload }),
  });
}

export async function parseMessage(message: string, senderId = "test-retailer") {
  return apiFetch(`/agents/parse-message?message=${encodeURIComponent(message)}&sender_id=${senderId}`, {
    method: "POST",
  });
}
