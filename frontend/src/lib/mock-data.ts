import type {
  Alert, ActionCard, Order, Retailer, CreditOrder, VelocityAlert,
  Scheme, RetailerScheme, Salesman, CoverageZone, GhostVisitAlert,
  BeatPlanEntry, ExpiryBatch, ReturnRequest, EventLog,
} from "@/types/dashboard";

// ── Alerts ──────────────────────────────────────────────────────────────────────
export const alerts: Alert[] = [
  { id: "a-1", type: "CRITICAL", title: "Credit breach risk", message: "Sharma Kirana may exceed limit by ₹35,000 after pending order.", createdAt: "2026-04-25T08:30:00.000Z", resolved: false },
  { id: "a-2", type: "CRITICAL", title: "Ghost visit risk", message: "Rahul logged 6 check-ins with no orders and no two-way chat.", createdAt: "2026-04-25T08:00:00.000Z", resolved: false },
  { id: "a-3", type: "CRITICAL", title: "Expiry window closing", message: "Batch HUL2024B return window closes in 2 days.", createdAt: "2026-04-25T07:55:00.000Z", resolved: false },
  { id: "a-4", type: "WARNING", title: "Rising utilization", message: "Patel Stores utilization spiked 34% in 7 days.", createdAt: "2026-04-25T07:00:00.000Z", resolved: false },
  { id: "a-5", type: "WARNING", title: "Scheme leakage detected", message: "₹47,000 benefit not passed to retailers on Colgate scheme.", createdAt: "2026-04-25T06:50:00.000Z", resolved: false },
  { id: "a-6", type: "INFO", title: "Certificate generated", message: "Trust certificate generated for Rao Mart.", createdAt: "2026-04-25T06:40:00.000Z", resolved: true },
];

// ── Action Cards ────────────────────────────────────────────────────────────────
export const actionCards: ActionCard[] = [
  { id: "ac-1", retailerName: "Sharma Kirana, Dadar", issueType: "Overdue", recommendedAction: "Send payment reminder via Telegram. Outstanding ₹38,400, 18 days overdue." },
  { id: "ac-2", retailerName: "Patel Stores, Vile Parle", issueType: "Credit Hold", recommendedAction: "Approve with reduced credit limit by 20%. Utilization currently at 94%." },
  { id: "ac-3", retailerName: "Gupta General, Kurla", issueType: "Return Fraud", recommendedAction: "Block return and ask for invoice photo evidence. No matching purchase found." },
];

// ── Orders ──────────────────────────────────────────────────────────────────────
export const orderFeed: Order[] = [
  { id: "ORD-202604250001", retailerName: "Rao Mart, Bhandup", status: "CONFIRMED", orderValue: 12400, itemCount: 7, createdAt: "2026-04-25T09:18:00.000Z" },
  { id: "ORD-202604250002", retailerName: "Singh Traders, Thane", status: "PENDING_CONFIRMATION", orderValue: 8200, itemCount: 4, createdAt: "2026-04-25T09:11:00.000Z" },
  { id: "ORD-202604250003", retailerName: "देसाई स्टोर्स, कल्याण", status: "BLOCKED", orderValue: 6750, itemCount: 3, createdAt: "2026-04-25T09:09:00.000Z" },
  { id: "ORD-202604250004", retailerName: "Khan Wholesale, Dharavi", status: "CONFIRMED", orderValue: 22000, itemCount: 11, createdAt: "2026-04-25T08:58:00.000Z" },
  { id: "ORD-202604250005", retailerName: "Mehta & Co, Malad", status: "PENDING_CONFIRMATION", orderValue: 4100, itemCount: 2, createdAt: "2026-04-25T08:52:00.000Z" },
];

// ── Retailers ───────────────────────────────────────────────────────────────────
export const retailers: Retailer[] = [
  { id: "r-1", name: "Rao Mart", hindiName: "राव मार्ट", trustScore: 88, tier: "A", outstanding: 18000, creditLimit: 90000, lastPaymentDate: "2026-04-18", trend: "UP", factors: { paymentDiscipline: 92, orderConsistency: 84, cancellationRate: 87, returnFrequency: 91, communicationReliability: 82, tradeStability: 89 } },
  { id: "r-2", name: "Sharma General Store", hindiName: "शर्मा जनरल स्टोर", trustScore: 61, tier: "B", outstanding: 38400, creditLimit: 70000, lastPaymentDate: "2026-04-07", trend: "DOWN", factors: { paymentDiscipline: 58, orderConsistency: 66, cancellationRate: 64, returnFrequency: 63, communicationReliability: 60, tradeStability: 62 } },
  { id: "r-3", name: "Patel Stores", hindiName: "पटेल स्टोर्स", trustScore: 55, tier: "C", outstanding: 52000, creditLimit: 62000, lastPaymentDate: "2026-03-29", trend: "DOWN", factors: { paymentDiscipline: 48, orderConsistency: 59, cancellationRate: 51, returnFrequency: 57, communicationReliability: 61, tradeStability: 56 } },
  { id: "r-4", name: "Gupta Provisions", hindiName: "गुप्ता प्रोविज़न्स", trustScore: 44, tier: "C", outstanding: 29100, creditLimit: 46000, lastPaymentDate: "2026-03-22", trend: "STABLE", factors: { paymentDiscipline: 42, orderConsistency: 47, cancellationRate: 45, returnFrequency: 44, communicationReliability: 48, tradeStability: 43 } },
  { id: "r-5", name: "Desai Wholesalers", hindiName: "देसाई होलसेलर्स", trustScore: 38, tier: "D", outstanding: 52000, creditLimit: 48000, lastPaymentDate: "2026-03-10", trend: "DOWN", factors: { paymentDiscipline: 31, orderConsistency: 40, cancellationRate: 35, returnFrequency: 37, communicationReliability: 42, tradeStability: 36 } },
  { id: "r-6", name: "Verma Retail", hindiName: "वर्मा रिटेल", trustScore: 72, tier: "B", outstanding: 32000, creditLimit: 78000, lastPaymentDate: "2026-04-14", trend: "UP", factors: { paymentDiscipline: 75, orderConsistency: 69, cancellationRate: 72, returnFrequency: 70, communicationReliability: 73, tradeStability: 74 } },
  { id: "r-7", name: "Mehta & Co", hindiName: "मेहता एंड कंपनी", trustScore: 49, tier: "C", outstanding: 26700, creditLimit: 59000, lastPaymentDate: "2026-04-01", trend: "STABLE", factors: { paymentDiscipline: 46, orderConsistency: 52, cancellationRate: 48, returnFrequency: 50, communicationReliability: 51, tradeStability: 47 } },
  { id: "r-8", name: "Singh Traders", hindiName: "सिंह ट्रेडर्स", trustScore: 81, tier: "A", outstanding: 14200, creditLimit: 85000, lastPaymentDate: "2026-04-20", trend: "UP", factors: { paymentDiscipline: 85, orderConsistency: 78, cancellationRate: 82, returnFrequency: 80, communicationReliability: 77, tradeStability: 83 } },
];

// ── Credit Orders ───────────────────────────────────────────────────────────────
export const creditOrders: CreditOrder[] = [
  { id: "co-1", retailerName: "Sharma Kirana", retailerTrustScore: 61, orderValue: 24000, items: ["Surf Excel 1kg x10", "Vim Bar x20", "Lifebuoy x30"], currentOutstanding: 38400, postOrderOutstanding: 62400, verdict: "CONDITIONAL", draftMessage: "Sharma ji, aapka order ₹24,000 ka hai. Pehle ₹15,000 ka payment clear karo, phir dispatch hoga. 🙏", utilisationPercent: 89 },
  { id: "co-2", retailerName: "देसाई स्टोर्स", retailerTrustScore: 38, orderValue: 18500, items: ["Maggi x50", "Nescafe 200g x10"], currentOutstanding: 52000, postOrderOutstanding: 70500, verdict: "BLOCK", draftMessage: "Desai bhai, ₹52,000 outstanding hai aur credit limit ₹48,000 hai. Pehle payment karo, phir naya order lenge. 📞", utilisationPercent: 108 },
  { id: "co-3", retailerName: "Rao Mart", retailerTrustScore: 88, orderValue: 31000, items: ["Tata Salt x100", "Bournvita 500g x20", "Parle-G x50"], currentOutstanding: 18000, postOrderOutstanding: 49000, verdict: "APPROVE", draftMessage: "Rao sahab, order confirmed! ₹31,000 ka dispatch kal subah hoga. Thank you! ✅", utilisationPercent: 54 },
  { id: "co-4", retailerName: "Gupta General", retailerTrustScore: 44, orderValue: 12000, items: ["Colgate 100g x40", "Closeup x20"], currentOutstanding: 29100, postOrderOutstanding: 41100, verdict: "CONDITIONAL", draftMessage: "Gupta ji, ₹12,000 ka order hai lekin ₹29,100 abhi bhi pending hai. ₹10,000 payment karke confirm karo. 🔔", utilisationPercent: 89 },
];

export const velocityAlerts: VelocityAlert[] = [
  { retailerId: "r-3", retailerName: "Patel Stores", utilisationJump: 34, currentUtilisation: 94 },
  { retailerId: "r-5", retailerName: "देसाई स्टोर्स", utilisationJump: 41, currentUtilisation: 108 },
];

// ── Schemes ─────────────────────────────────────────────────────────────────────
export const schemes: Scheme[] = [
  { id: "s-1", brand: "Colgate", sku: "Colgate Max Fresh 150g", schemePercent: 12, benefitReceived: 84000, benefitPassed: 37000, leakage: 47000 },
  { id: "s-2", brand: "HUL", sku: "Surf Excel 1kg", schemePercent: 8, benefitReceived: 62000, benefitPassed: 48500, leakage: 13500 },
  { id: "s-3", brand: "ITC", sku: "Aashirvaad Atta 5kg", schemePercent: 5, benefitReceived: 38000, benefitPassed: 34200, leakage: 3800 },
  { id: "s-4", brand: "Nestle", sku: "Maggi 70g (12-pack)", schemePercent: 10, benefitReceived: 55000, benefitPassed: 41000, leakage: 14000 },
];

export const retailerSchemes: RetailerScheme[] = [
  { retailerName: "Rao Mart", benefitEntitled: 12400, benefitPassed: 12400, status: "FULL" },
  { retailerName: "Sharma Kirana", benefitEntitled: 9800, benefitPassed: 5200, status: "PARTIAL" },
  { retailerName: "Patel Stores", benefitEntitled: 8500, benefitPassed: 8500, status: "FULL" },
  { retailerName: "Gupta General", benefitEntitled: 7200, benefitPassed: 0, status: "NONE" },
  { retailerName: "Verma Retail", benefitEntitled: 11000, benefitPassed: 8800, status: "PARTIAL" },
  { retailerName: "देसाई स्टोर्स", benefitEntitled: 6100, benefitPassed: 0, status: "NONE" },
];

// ── Beat Intelligence ───────────────────────────────────────────────────────────
export const salesmen: Salesman[] = [
  { id: "sm-1", name: "Rahul Yadav", outletsAssigned: 42, outletsWithChat: 28, ghostVisitCount: 6, reliabilityScore: 54, missedRevenue: 14000, avatarUrl: "https://i.pravatar.cc/150?img=11" },
  { id: "sm-2", name: "Amit Sharma", outletsAssigned: 38, outletsWithChat: 35, ghostVisitCount: 1, reliabilityScore: 91, missedRevenue: 2200, avatarUrl: "https://i.pravatar.cc/150?img=33" },
  { id: "sm-3", name: "Vikram Patil", outletsAssigned: 45, outletsWithChat: 30, ghostVisitCount: 4, reliabilityScore: 68, missedRevenue: 9500, avatarUrl: "https://i.pravatar.cc/150?img=60" },
];

export const coverageZones: CoverageZone[] = [
  { id: "cz-1", sector: "Dadar West", pincode: "400028", status: "VISITED_ORDERS", outlets: 12, lastVisit: "2026-04-25" },
  { id: "cz-2", sector: "Vile Parle East", pincode: "400057", status: "VISITED_NO_ORDERS", outlets: 8, lastVisit: "2026-04-24" },
  { id: "cz-3", sector: "Kurla West", pincode: "400070", status: "NOT_VISITED", outlets: 15, lastVisit: "2026-04-16" },
  { id: "cz-4", sector: "Bhandup East", pincode: "400042", status: "VISITED_ORDERS", outlets: 10, lastVisit: "2026-04-25" },
  { id: "cz-5", sector: "Thane Station", pincode: "400601", status: "VISITED_ORDERS", outlets: 14, lastVisit: "2026-04-25" },
  { id: "cz-6", sector: "Malad West", pincode: "400064", status: "NOT_VISITED", outlets: 9, lastVisit: "2026-04-12" },
  { id: "cz-7", sector: "Dharavi", pincode: "400017", status: "VISITED_NO_ORDERS", outlets: 11, lastVisit: "2026-04-23" },
  { id: "cz-8", sector: "Kalyan East", pincode: "421306", status: "NOT_VISITED", outlets: 7, lastVisit: "2026-04-10" },
];

export const ghostVisitAlerts: GhostVisitAlert[] = [
  { salesmanName: "Rahul Yadav", checkIns: 6, orders: 0, messages: 0, missedRevenue: 14000 },
  { salesmanName: "Vikram Patil", checkIns: 4, orders: 1, messages: 1, missedRevenue: 9500 },
];

export const beatPlan: BeatPlanEntry[] = [
  { salesmanName: "Rahul Yadav", outletName: "Sharma Kirana", prioritySKUs: ["Surf Excel 1kg", "Vim Bar"], riskFlags: ["Overdue ₹38K"], time: "09:30" },
  { salesmanName: "Rahul Yadav", outletName: "Gupta General", prioritySKUs: ["Colgate 100g"], riskFlags: ["Return dispute"], time: "10:15" },
  { salesmanName: "Amit Sharma", outletName: "Rao Mart", prioritySKUs: ["Tata Salt", "Bournvita"], riskFlags: [], time: "09:00" },
  { salesmanName: "Amit Sharma", outletName: "Verma Retail", prioritySKUs: ["Maggi 70g"], riskFlags: [], time: "10:30" },
  { salesmanName: "Vikram Patil", outletName: "Patel Stores", prioritySKUs: ["Surf Excel", "Lifebuoy"], riskFlags: ["Credit spike 34%"], time: "09:45" },
  { salesmanName: "Vikram Patil", outletName: "देसाई स्टोर्स", prioritySKUs: ["Nescafe 200g"], riskFlags: ["Over credit limit", "Trust Score 38"], time: "11:00" },
];

// ── Expiry & Returns ────────────────────────────────────────────────────────────
export const expiryBatches: ExpiryBatch[] = [
  { id: "eb-1", batchCode: "HUL2024B", product: "Britannia Good Day Biscuits", quantity: 200, value: 18400, expiryDate: "2026-05-12", risk: "RED", daysUntilExpiry: 17, brandReturnWindowDays: 2 },
  { id: "eb-2", batchCode: "ITC2024A", product: "Sunfeast Dark Fantasy", quantity: 150, value: 22500, expiryDate: "2026-05-20", risk: "RED", daysUntilExpiry: 25, brandReturnWindowDays: 5 },
  { id: "eb-3", batchCode: "NST2024C", product: "Maggi Noodles 70g", quantity: 400, value: 12000, expiryDate: "2026-06-15", risk: "AMBER", daysUntilExpiry: 51, brandReturnWindowDays: 30 },
  { id: "eb-4", batchCode: "HUL2024D", product: "Lifebuoy Soap 100g", quantity: 300, value: 9000, expiryDate: "2026-07-28", risk: "GREEN", daysUntilExpiry: 94, brandReturnWindowDays: 60 },
  { id: "eb-5", batchCode: "CLG2024E", product: "Colgate Max Fresh 150g", quantity: 250, value: 15000, expiryDate: "2026-08-10", risk: "GREEN", daysUntilExpiry: 107, brandReturnWindowDays: 90 },
  { id: "eb-6", batchCode: "ITC2024F", product: "Aashirvaad Atta 5kg", quantity: 80, value: 28800, expiryDate: "2026-05-05", risk: "RED", daysUntilExpiry: 10, brandReturnWindowDays: 0 },
];

export const returnRequests: ReturnRequest[] = [
  { id: "rr-1", retailerName: "Gupta General", items: "Colgate Max Fresh 150g", quantity: 40, claimedReason: "Damaged packaging", agentVerdict: "SUSPICIOUS", value: 4800 },
  { id: "rr-2", retailerName: "Sharma Kirana", items: "Maggi Noodles 70g", quantity: 20, claimedReason: "Near expiry received", agentVerdict: "GENUINE", value: 600 },
  { id: "rr-3", retailerName: "देसाई स्टोर्स", items: "Sunfeast Dark Fantasy", quantity: 15, claimedReason: "Wrong SKU delivered", agentVerdict: "EXPIRED_WINDOW", value: 2250 },
];

// ── Pass-Through Analytics ──────────────────────────────────────────────────────
export const passThroughMetrics = {
  aggregate_pass_through: {
    percentage: 68.5,
    trend: "UP",
    trend_period: "Last 30 days",
    total_disbursed: "₹1,847,200",
    verified_reach: "₹1,264,008"
  },
  regional_leakage: [
    {
      region_id: "rg-1",
      region_name: "South Mumbai",
      leakage_percentage: 24.5,
      status: "CRITICAL",
      confidence: 94,
      latency_days: 3,
      likely_cause: "Margin pooling in Dadar-Vile Parle corridor"
    },
    {
      region_id: "rg-2",
      region_name: "Thane & Surrounding",
      leakage_percentage: 31.2,
      status: "CRITICAL",
      confidence: 89,
      latency_days: 2,
      likely_cause: "Unauthorized redistributors, gray market"
    },
    {
      region_id: "rg-3",
      region_name: "Central Mumbai",
      leakage_percentage: 18.7,
      status: "WARNING",
      confidence: 85,
      latency_days: 4,
      likely_cause: "Small retailers holding excess inventory"
    }
  ],
  monthly_trends: [
    { month: "Feb 2026", pass_through: 62.3, cost_basis: 1420000 },
    { month: "Mar 2026", pass_through: 65.1, cost_basis: 1580000 },
    { month: "Apr 2026", pass_through: 68.5, cost_basis: 1847200, is_current: true }
  ],
  sku_fragility: [
    {
      category: "Soaps & Detergents",
      leakage_percentage: 28.5,
      status: "CRITICAL",
      insight: "Low weight, high value density attracts diversion"
    },
    {
      category: "Noodles & Instant Foods",
      leakage_percentage: 35.2,
      status: "CRITICAL",
      insight: "Longest supply chain exposure; gray market hotbed"
    },
    {
      category: "Beverages",
      leakage_percentage: 22.1,
      status: "WARNING",
      insight: "High volume but moderate leakage"
    },
    {
      category: "Biscuits & Snacks",
      leakage_percentage: 19.4,
      status: "WARNING",
      insight: "Perishable nature limits diversion window"
    }
  ],
  intelligence_advisory: {
    priority: "CRITICAL",
    summary: "Thane & surrounding region experiencing severe scheme benefit leakage (31% loss). Gray market redistribution detected.",
    detail: "Analysis of order patterns and retailer transaction data reveals systematic benefit leakage in the Thane-Kalyan-Navi Mumbai corridor. Unauthorized secondary distributors moving high-margin schemes (Maggi, Noodles) outside formal channel.",
    mitigation_strategy: "1. Activate GPS-tracked logistics for Thane shipments. 2. Implement batch-level QR verification at retailer receipt points. 3. Increase audit frequency for top 5 retailers in Thane. 4. Deploy field agents for compliance checks.",
    confidence: 87
  }
};

// ── Audit Trail ─────────────────────────────────────────────────────────────────
export const auditEvents: EventLog[] = [
  { id: "ev-1", timestamp: "2026-04-25T09:18:00.000Z", eventType: "ORDER", retailer: "Rao Mart", description: "Order ORD-0001 confirmed — ₹12,400", sha256Hash: "a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", status: "INTACT" },
  { id: "ev-2", timestamp: "2026-04-25T09:11:00.000Z", eventType: "ORDER", retailer: "Singh Traders", description: "Order ORD-0002 pending confirmation — ₹8,200", sha256Hash: "b4c3d9e2f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2", status: "INTACT" },
  { id: "ev-3", timestamp: "2026-04-25T08:30:00.000Z", eventType: "ALERT", retailer: "Sharma Kirana", description: "CRITICAL: Credit breach risk flagged", sha256Hash: "c5d4e0f3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3", status: "INTACT" },
  { id: "ev-4", timestamp: "2026-04-25T08:00:00.000Z", eventType: "BEAT_VISIT", retailer: "Multiple", description: "Ghost visit risk: Rahul Yadav — 6 check-ins, 0 orders", sha256Hash: "d6e5f1a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4", status: "INTACT" },
  { id: "ev-5", timestamp: "2026-04-24T17:00:00.000Z", eventType: "PAYMENT", retailer: "Rao Mart", description: "Payment received ₹22,000 — outstanding cleared", sha256Hash: "e7f6a2b5c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5", status: "INTACT" },
  { id: "ev-6", timestamp: "2026-04-24T14:30:00.000Z", eventType: "SCORE_CHANGE", retailer: "Patel Stores", description: "Trust Score changed: 62 → 55 (payment delay)", sha256Hash: "f8a7b3c6d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6", status: "INTACT" },
  { id: "ev-7", timestamp: "2026-04-24T11:00:00.000Z", eventType: "RETURN", retailer: "Gupta General", description: "Return claim filed — Colgate 40 units — SUSPICIOUS", sha256Hash: "a9b8c4d7e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7", status: "TAMPERED" },
  { id: "ev-8", timestamp: "2026-04-23T16:45:00.000Z", eventType: "SCHEME", retailer: "Sharma Kirana", description: "Scheme benefit ₹9,800 — only ₹5,200 passed (PARTIAL)", sha256Hash: "b0c9d5e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8", status: "INTACT" },
  { id: "ev-9", timestamp: "2026-04-23T10:20:00.000Z", eventType: "ORDER", retailer: "Verma Retail", description: "Order ORD-9812 confirmed — ₹16,500", sha256Hash: "c1d0e6f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9", status: "INTACT" },
  { id: "ev-10", timestamp: "2026-04-22T09:00:00.000Z", eventType: "SCORE_CHANGE", retailer: "Rao Mart", description: "Trust Score changed: 85 → 88 (consistent payments)", sha256Hash: "d2e1f7a0b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0", status: "INTACT" },
];
