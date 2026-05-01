/**
 * VendorLock API Client — connects the distributor frontend to the FastAPI backend.
 * Handles auth, data fetching, and Agent pipeline invocations.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Auth Token Management ─────────────────────────────────────────────────────

let authToken: string | null = null;

/** Persist token across sessions (remember me). */
export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("vendorlock_token", token);
  }
}

/** Persist token for this tab only (clears on tab close). */
export function setAuthTokenSession(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    sessionStorage.setItem("vendorlock_token", token);
  }
}

/** Returns token from memory, localStorage, or sessionStorage (in priority order). */
export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("vendorlock_token") ||
      sessionStorage.getItem("vendorlock_token")
    );
  }
  return null;
}

/** Clear token from all storage locations. */
export function clearAuthToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("vendorlock_token");
    sessionStorage.removeItem("vendorlock_token");
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

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized globally
    if (res.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized. Please log in again.");
    }

    if (!res.ok) {
      let errorMsg = `API Error ${res.status}`;
      try {
        const body = await res.json();
        errorMsg = body.detail || body.message || errorMsg;
      } catch {
        const text = await res.text();
        if (text) errorMsg += `: ${text}`;
      }
      
      // Dispatch custom event for UI global toast notifications
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error", { detail: { message: errorMsg, status: res.status } }));
      }
      
      throw new Error(errorMsg);
    }

    // Some endpoints might return empty 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (error: any) {
    // Catch network errors (CORS, offline, etc)
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error", { detail: { message: "Network error. Please check your connection." } }));
      }
    }
    throw error;
  }
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
  return apiFetch<{
    user_id: string;
    tenant_id: string;
    role: string;
    email: string;
    full_name?: string;
  }>("/auth/me");
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (_) {
    // Ignore errors — always clear client-side token
  } finally {
    clearAuthToken();
  }
}

// ── Retailer ─────────────────────────────────────────────────────────────────

export interface CreateRetailerPayload {
  name: string;
  mobile: string;
  address: string;
  pincode: string;
  gstin?: string;
  telegram_chat_id?: number;
}

export async function createRetailer(payload: CreateRetailerPayload) {
  return apiFetch("/retailer/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRetailer(retailerId: string) {
  return apiFetch(`/retailer/${retailerId}`);
}

export async function getRetailerLedger(retailerId: string, limit = 50, offset = 0) {
  return apiFetch(`/retailer/${retailerId}/ledger?limit=${limit}&offset=${offset}`);
}

export async function updateCreditLimit(retailerId: string, newLimit: number, reason: string) {
  return apiFetch(`/retailer/${retailerId}/credit-limit`, {
    method: "PATCH",
    body: JSON.stringify({ new_limit: newLimit, reason }),
  });
}

// ── Salesman (direct) ─────────────────────────────────────────────────────────

export interface CreateSalesmanPayload {
  name: string;
  mobile: string;
  route: string;
  telegram_chat_id?: number;
}

export async function listSalesmenDirect() {
  return apiFetch<{ salesmen: any[] }>("/salesman/");
}

export async function addSalesman(payload: CreateSalesmanPayload) {
  return apiFetch("/salesman/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSalesmanReliability(salesmanId: string) {
  return apiFetch(`/salesman/${salesmanId}/reliability`);
}

export async function getSalesmanBeatHistory(
  salesmanId: string,
  fromDate?: string,
  toDate?: string
) {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch(`/salesman/${salesmanId}/beat-history${qs}`);
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

export async function cancelOrder(orderId: string) {
  return apiFetch(`/orders/${orderId}/cancel`, { method: "PATCH" });
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

// Alias with clearer names used by new components
export const listRiskAlerts = listAlerts;
export async function runRiskScan() {
  return apiFetch("/risk-alerts/run-scan", { method: "POST" });
}
export const triggerRiskScan = runRiskScan;

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

export async function getSchemePassThrough(schemeId: string) {
  return apiFetch(`/schemes/${schemeId}/pass-through`);
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

export async function getPassThroughMetrics() {
  try {
    return await apiFetch("/analytics/pass-through-metrics");
  } catch (error) {
    console.warn("Failed to fetch pass-through metrics from API, using mock data:", error);
    // Import mock data as fallback
    const { passThroughMetrics } = await import("./mock-data");
    return passThroughMetrics;
  }
}

export async function getTrustDistribution() {
  return apiFetch("/analytics/trust-distribution");
}

// Extended analytics methods
export async function getTrustDistributionAnalytics() {
  return apiFetch("/analytics/trust-distribution");
}

export async function getRevenueHeatmap(periodDays = 30) {
  return apiFetch(`/analytics/revenue-heatmap?period_days=${periodDays}`);
}

export async function getQuickCommerceThreat(pincode?: string, skuId?: string) {
  // Coming Soon — Agent 5 QC price monitoring is not yet implemented
  return { threats: [], last_scan: null, status: "COMING_SOON" };
}

export async function getSecondarySalesEstimate() {
  // Coming Soon — Agent 5 demand forecast output not yet wired
  return { sku_estimates: [], status: "COMING_SOON" };
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

// ── Telegram Webhook ──────────────────────────────────────────────────────────

export async function setTelegramWebhook(webhookUrl: string) {
  return apiFetch(`/webhook/telegram/set-webhook?webhook_url=${encodeURIComponent(webhookUrl)}`, {
    method: "POST",
  });
}

export async function getTelegramMessages(limit = 50) {
  try {
    return await apiFetch(`/webhook/telegram/messages?limit=${limit}`);
  } catch (error) {
    console.warn("Failed to fetch Telegram messages, using mock data:", error);
    return [
      { id: "1", sender: "Ramesh Kirana", intent: "ORDER", confidence: 0.95, status: "parsed", timestamp: new Date().toISOString(), text: "Bhai 10 peti soap bhej do", translation: "Brother, send 10 boxes of soap" },
      { id: "2", sender: "Salesman Raju", intent: "PAYMENT", confidence: 0.99, status: "confirmed", timestamp: new Date(Date.now() - 300000).toISOString(), text: "Received 5000 from Ramesh", translation: "Received 5000 from Ramesh" },
      { id: "3", sender: "Unknown (chat_id: 12345)", intent: "START", confidence: 1.0, status: "pending", timestamp: new Date(Date.now() - 600000).toISOString(), text: "/start", translation: "/start" },
    ];
  }
}

export async function getDisputedCollections() {
  try {
    return await apiFetch("/orders/disputed-collections");
  } catch (error) {
    return [];
  }
}



