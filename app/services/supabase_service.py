"""
Supabase Service Layer — Centralised data access for all endpoints.
Wraps Supabase client operations with proper error handling.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta, timezone
import hashlib
import json
import uuid

from loguru import logger
from app.core.database import get_supabase


# ── Helpers ───────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _generate_hash(payload: dict, prev_hash: str = "") -> str:
    """SHA-256 hash chain for audit events."""
    data = json.dumps(payload, sort_keys=True, default=str) + prev_hash
    return hashlib.sha256(data.encode()).hexdigest()


async def resolve_tenant_from_chat(chat_id: int) -> str:
    """
    Search retailers, salesmen, and users tables for a matching telegram_chat_id.
    Returns the tenant_id if found, otherwise 'default'.
    """
    sb = get_supabase()
    
    # Try retailers
    res = sb.table("retailers").select("tenant_id").eq("telegram_chat_id", chat_id).execute()
    if res.data: return res.data[0]["tenant_id"]
    
    # Try salesmen
    res = sb.table("salesmen").select("tenant_id").eq("telegram_chat_id", chat_id).execute()
    if res.data: return res.data[0]["tenant_id"]
    
    # Try users
    res = sb.table("users").select("tenant_id").eq("telegram_chat_id", chat_id).execute()
    if res.data: return res.data[0]["tenant_id"]
    
    return "default"


# ── Tenant / Distributor ──────────────────────────────────────────────────────

async def get_tenant(tenant_id: str) -> Optional[Dict]:
    sb = get_supabase()
    result = sb.table("tenants").select("*").eq("id", tenant_id).execute()
    return result.data[0] if result.data else None


async def get_dashboard_summary(tenant_id: str) -> Dict:
    sb = get_supabase()
    # Aggregate retailer tier counts
    retailers_res = sb.table("retailers").select("id").eq("tenant_id", tenant_id).eq("is_active", True).execute()
    total_retailers = len(retailers_res.data) if retailers_res.data else 0

    trust_res = sb.table("trust_scores").select("tier, composite_score").eq("tenant_id", tenant_id).execute()
    tier_counts = {"A": 0, "B": 0, "C": 0, "D": 0}
    for ts in (trust_res.data or []):
        tier = ts.get("tier", "C")
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

    # Alert counts
    alerts_res = sb.table("risk_alerts").select("severity").eq("tenant_id", tenant_id).eq("acknowledged", False).execute()
    open_alerts = len(alerts_res.data) if alerts_res.data else 0
    critical_alerts = sum(1 for a in (alerts_res.data or []) if a.get("severity") == "CRITICAL")

    # Scheme leakage total (from alerts)
    leakage_alerts = sb.table("risk_alerts").select("rupee_impact").eq("tenant_id", tenant_id).eq("alert_type", "SCHEME_LEAKAGE").execute()
    scheme_leakage_mtd = sum(float(a.get("rupee_impact", 0) or 0) for a in (leakage_alerts.data or []))

    # Expiry risk
    expiry_alerts = sb.table("risk_alerts").select("rupee_impact").eq("tenant_id", tenant_id).eq("alert_type", "EXPIRY_WARNING").execute()
    near_expiry_risk = sum(float(a.get("rupee_impact", 0) or 0) for a in (expiry_alerts.data or []))

    # Ghost visits
    ghost_alerts = sb.table("risk_alerts").select("id").eq("tenant_id", tenant_id).eq("alert_type", "GHOST_VISIT").execute()
    ghost_count = len(ghost_alerts.data) if ghost_alerts.data else 0

    return {
        "total_retailers": total_retailers,
        "tier_a_count": tier_counts["A"],
        "tier_b_count": tier_counts["B"],
        "tier_c_count": tier_counts["C"],
        "tier_d_count": tier_counts["D"],
        "open_alerts": open_alerts,
        "critical_alerts": critical_alerts,
        "scheme_leakage_mtd": scheme_leakage_mtd,
        "near_expiry_rupee_risk": near_expiry_risk,
        "ghost_visits_this_week": ghost_count,
    }


# ── Retailers ─────────────────────────────────────────────────────────────────

async def list_retailers(tenant_id: str, tier: Optional[str] = None, limit: int = 50, offset: int = 0) -> Dict:
    sb = get_supabase()
    query = sb.table("retailers").select("*, trust_scores(*)").eq("tenant_id", tenant_id).eq("is_active", True)
    if tier:
        # Filter by tier via join — need separate query
        pass
    result = query.range(offset, offset + limit - 1).execute()
    return {"retailers": result.data or [], "total": len(result.data or [])}


async def get_retailer(retailer_id: str) -> Optional[Dict]:
    sb = get_supabase()
    result = sb.table("retailers").select("*, trust_scores(*)").eq("id", retailer_id).execute()
    return result.data[0] if result.data else None


async def create_retailer(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    data["tenant_id"] = tenant_id
    data["id"] = str(uuid.uuid4())
    result = sb.table("retailers").insert(data).execute()
    return result.data[0] if result.data else data


async def create_initial_trust_score(tenant_id: str, retailer_id: str) -> Dict:
    """Create the initial trust score record (50/100, Tier C) for a newly onboarded retailer."""
    sb = get_supabase()
    existing = sb.table("trust_scores").select("id").eq("retailer_id", retailer_id).execute()
    if existing.data:
        return existing.data[0]
    data = {
        "id": str(uuid.uuid4()),
        "tenant_id": tenant_id,
        "retailer_id": retailer_id,
        "composite_score": 50,
        "tier": "C",
        "trend": "STABLE",
        "consistency_index": 0.5,
        "sub_scores": {},
        "flags": [],
    }
    result = sb.table("trust_scores").insert(data).execute()
    # Seed the history table too
    sb.table("trust_score_history").insert({
        "id": str(uuid.uuid4()),
        "retailer_id": retailer_id,
        "score": 50,
        "tier": "C",
    }).execute()
    return result.data[0] if result.data else data


async def get_retailer_ledger(retailer_id: str, limit: int = 50, offset: int = 0) -> Dict:
    """Fetch paginated orders and returns for a retailer, merged as ledger entries."""
    sb = get_supabase()
    orders_res = sb.table("orders").select("id,status,total_amount,payment_type,created_at,confirmed_at") \
        .eq("retailer_id", retailer_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    returns_res = sb.table("returns").select("id,status,credit_note_amount,reason,created_at") \
        .eq("retailer_id", retailer_id).order("created_at", desc=True).execute()

    orders = [{**o, "entry_type": "ORDER"} for o in (orders_res.data or [])]
    returns = [{**r, "entry_type": "RETURN", "total_amount": r.get("credit_note_amount", 0)} for r in (returns_res.data or [])]

    all_entries = sorted(orders + returns, key=lambda x: x.get("created_at", ""), reverse=True)
    return {
        "retailer_id": retailer_id,
        "transactions": all_entries[:limit],
        "total": len(all_entries),
    }


async def update_retailer_credit_limit(
    retailer_id: str, new_limit: float, reason: str,
    actor_id: str = "system", tenant_id: str = ""
) -> Dict:
    """Update credit limit and write an audit event."""
    sb = get_supabase()
    result = sb.table("retailers").update({"credit_limit": new_limit}).eq("id", retailer_id).execute()
    await create_audit_event(
        tenant_id=tenant_id,
        event_type="CREDIT_LIMIT_CHANGE",
        entity_id=retailer_id,
        payload={"new_credit_limit": new_limit, "reason": reason},
        actor_id=actor_id,
    )
    return {
        "retailer_id": retailer_id,
        "new_credit_limit": new_limit,
        "reason": reason,
        "updated": True,
    }


async def link_retailer_chat(retailer_id: str, chat_id: int) -> Dict:
    sb = get_supabase()
    result = sb.table("retailers").update({"telegram_chat_id": chat_id}).eq("id", retailer_id).execute()
    return result.data[0] if result.data else {"id": retailer_id, "telegram_chat_id": chat_id}


# ── Orders ────────────────────────────────────────────────────────────────────

async def create_order(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "tenant_id": tenant_id,
        "retailer_id": data["retailer_id"],
        "salesman_id": data.get("salesman_id"),
        "status": "PENDING_CONFIRMATION",
        "payment_type": data.get("payment_type", "credit"),
        "channel": data.get("channel", "dashboard"),
        "raw_message": data.get("raw_message"),
        "total_amount": data.get("total_amount", 0),
        "notes": data.get("notes"),
    }
    result = sb.table("orders").insert(order).execute()

    # Insert order items
    for item in data.get("items", []):
        order_item = {
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "product_id": item.get("sku_id"),
            "quantity": item["quantity"],
            "unit_price": item.get("unit_price", 0),
            "total_price": item["quantity"] * item.get("unit_price", 0),
        }
        sb.table("order_items").insert(order_item).execute()

    # Create audit event
    await create_audit_event(tenant_id, "ORDER_CREATED", order_id, order)

    return {
        "order_id": order_id,
        "status": "PENDING_CONFIRMATION",
        "retailer_id": data["retailer_id"],
        "total_items": len(data.get("items", [])),
        "payment_type": data.get("payment_type", "credit"),
        "pending_confirmation": True,
    }


async def get_order(order_id: str, tenant_id: str) -> Optional[Dict]:
    sb = get_supabase()
    result = sb.table("orders").select("*, order_items(*, products(*))").eq("id", order_id).eq("tenant_id", tenant_id).execute()
    return result.data[0] if result.data else None


async def list_orders(tenant_id: str, retailer_id: Optional[str] = None,
                      status_filter: Optional[str] = None, limit: int = 50, offset: int = 0) -> Dict:
    sb = get_supabase()
    query = sb.table("orders").select("*, retailers(name)").eq("tenant_id", tenant_id).order("created_at", desc=True)
    if retailer_id:
        query = query.eq("retailer_id", retailer_id)
    if status_filter:
        query = query.eq("status", status_filter)
    result = query.range(offset, offset + limit - 1).execute()
    return {"orders": result.data or [], "total": len(result.data or []), "limit": limit, "offset": offset}


async def update_order_status(order_id: str, tenant_id: str, status: str) -> Dict:
    sb = get_supabase()
    update_data = {"status": status}
    if status == "CONFIRMED":
        update_data["confirmed_at"] = _now_iso()
    result = sb.table("orders").update(update_data).eq("id", order_id).eq("tenant_id", tenant_id).execute()
    await create_audit_event(tenant_id, f"ORDER_{status}", order_id, {"status": status})
    return result.data[0] if result.data else {"order_id": order_id, "status": status}


# ── Trust Scores ──────────────────────────────────────────────────────────────

async def get_trust_score(retailer_id: str) -> Optional[Dict]:
    sb = get_supabase()
    result = sb.table("trust_scores").select("*").eq("retailer_id", retailer_id).execute()
    return result.data[0] if result.data else None


async def upsert_trust_score(tenant_id: str, retailer_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    existing = await get_trust_score(retailer_id)
    data["tenant_id"] = tenant_id
    data["retailer_id"] = retailer_id
    data["updated_at"] = _now_iso()

    if existing:
        result = sb.table("trust_scores").update(data).eq("retailer_id", retailer_id).execute()
    else:
        data["id"] = str(uuid.uuid4())
        result = sb.table("trust_scores").insert(data).execute()

    # Append to history
    history_entry = {
        "id": str(uuid.uuid4()),
        "retailer_id": retailer_id,
        "score": data.get("composite_score", 50),
        "tier": data.get("tier", "C"),
    }
    sb.table("trust_score_history").insert(history_entry).execute()

    await create_audit_event(tenant_id, "SCORE_CHANGE", retailer_id, data)
    return result.data[0] if result.data else data


async def get_trust_score_history(retailer_id: str, days: int = 90) -> List[Dict]:
    sb = get_supabase()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    result = sb.table("trust_score_history").select("*").eq("retailer_id", retailer_id).gte("recorded_at", cutoff).order("recorded_at").execute()
    return result.data or []


# ── Risk Alerts ───────────────────────────────────────────────────────────────

async def create_risk_alert(tenant_id: str, alert: Dict) -> Dict:
    sb = get_supabase()
    alert["id"] = str(uuid.uuid4())
    alert["tenant_id"] = tenant_id
    result = sb.table("risk_alerts").insert(alert).execute()
    return result.data[0] if result.data else alert


async def list_risk_alerts(tenant_id: str, severity: Optional[str] = None,
                           alert_type: Optional[str] = None, limit: int = 50, offset: int = 0) -> Dict:
    sb = get_supabase()
    query = sb.table("risk_alerts").select("*").eq("tenant_id", tenant_id).eq("acknowledged", False).order("created_at", desc=True)
    if severity:
        query = query.eq("severity", severity)
    if alert_type:
        query = query.eq("alert_type", alert_type)
    result = query.range(offset, offset + limit - 1).execute()
    return {"alerts": result.data or [], "total": len(result.data or [])}


async def acknowledge_alert(alert_id: str, tenant_id: str) -> Dict:
    sb = get_supabase()
    result = sb.table("risk_alerts").update({"acknowledged": True}).eq("id", alert_id).eq("tenant_id", tenant_id).execute()
    return {"alert_id": alert_id, "acknowledged": True}


# ── Schemes ───────────────────────────────────────────────────────────────────

async def create_scheme(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    data["is_active"] = True
    result = sb.table("schemes").insert(data).execute()
    return result.data[0] if result.data else data


async def list_schemes(tenant_id: str) -> List[Dict]:
    sb = get_supabase()
    result = sb.table("schemes").select("*").eq("tenant_id", tenant_id).eq("is_active", True).execute()
    return result.data or []


# ── Batch / Expiry ────────────────────────────────────────────────────────────

async def register_batch(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    result = sb.table("batch_inventory").insert(data).execute()
    return result.data[0] if result.data else data


async def get_expiry_batches(tenant_id: str, days_threshold: int = 90) -> List[Dict]:
    sb = get_supabase()
    cutoff = (date.today() + timedelta(days=days_threshold)).isoformat()
    result = sb.table("batch_inventory").select("*, products(*)").eq("tenant_id", tenant_id).lte("expiry_date", cutoff).gte("expiry_date", date.today().isoformat()).order("expiry_date").execute()
    return result.data or []


# ── Returns ───────────────────────────────────────────────────────────────────

async def create_return(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    data["status"] = "PENDING"
    result = sb.table("returns").insert(data).execute()
    return result.data[0] if result.data else data


async def list_returns(tenant_id: str, status_filter: Optional[str] = None) -> Dict:
    sb = get_supabase()
    query = sb.table("returns").select("*, retailers(name)").eq("tenant_id", tenant_id).order("created_at", desc=True)
    if status_filter:
        query = query.eq("status", status_filter)
    result = query.execute()
    return {"returns": result.data or [], "total": len(result.data or [])}


async def update_return_status(return_id: str, tenant_id: str, status: str, reason: str = "") -> Dict:
    sb = get_supabase()
    update_data = {"status": status}
    if reason:
        update_data["hold_reason"] = reason
    result = sb.table("returns").update(update_data).eq("id", return_id).eq("tenant_id", tenant_id).execute()
    return result.data[0] if result.data else {"return_id": return_id, "status": status}


# ── Beat / Checkins ───────────────────────────────────────────────────────────

async def list_salesmen(tenant_id: str) -> List[Dict]:
    sb = get_supabase()
    result = sb.table("salesmen").select("*").eq("tenant_id", tenant_id).eq("is_active", True).execute()
    return result.data or []


async def create_salesman(tenant_id: str, data: Dict) -> Dict:
    """Insert a new salesman record for the tenant."""
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    data["is_active"] = True
    result = sb.table("salesmen").insert(data).execute()
    return result.data[0] if result.data else data


async def compute_salesman_reliability(tenant_id: str, salesman_id: str) -> Dict:
    """
    Compute reliability score from beat_checkins and orders.
    Ghost visit = check-in with no order placed on the same day.
    """
    sb = get_supabase()

    # Fetch salesman record
    sal_res = sb.table("salesmen").select("name,route").eq("id", salesman_id).execute()
    sal = sal_res.data[0] if sal_res.data else {}

    # Beat checkins for the last 7 days
    from datetime import datetime, timedelta, timezone
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    checkins_res = sb.table("beat_checkins").select("id,checked_in_at,outlet_id") \
        .eq("tenant_id", tenant_id).eq("salesman_id", salesman_id) \
        .gte("checked_in_at", cutoff).execute()
    checkins = checkins_res.data or []

    # Orders by this salesman for the last 7 days
    orders_res = sb.table("orders").select("id,created_at") \
        .eq("tenant_id", tenant_id).eq("salesman_id", salesman_id) \
        .gte("created_at", cutoff).execute()
    orders = orders_res.data or []

    # Unique outlet IDs covered
    outlets_covered = len(set(c["outlet_id"] for c in checkins if c.get("outlet_id")))

    # Ghost visits: check-ins on days with no corresponding orders
    checkin_dates = set(c["checked_in_at"][:10] for c in checkins if c.get("checked_in_at"))
    order_dates = set(o["created_at"][:10] for o in orders if o.get("created_at"))
    ghost_days = checkin_dates - order_dates
    ghost_visit_rate = (len(ghost_days) / len(checkin_dates)) if checkin_dates else 0.0

    # Outlets target (from all assigned outlets — approximate from outlets table)
    outlets_res = sb.table("outlets").select("id").eq("tenant_id", tenant_id).execute()
    outlets_target = max(len(outlets_res.data or []), outlets_covered, 1)
    coverage_pct = min(outlets_covered / outlets_target, 1.0)

    # Simple reliability formula: penalise ghost visits, reward coverage
    overall = round(
        (1 - ghost_visit_rate) * 50 + coverage_pct * 50,
        1,
    )

    return {
        "salesman_id": salesman_id,
        "name": sal.get("name", "Unknown"),
        "ghost_visit_rate": round(ghost_visit_rate, 3),
        "collection_confirmation_rate": 0.0,  # TODO: derive from payment confirmations
        "outlets_covered_this_week": outlets_covered,
        "outlets_target_this_week": outlets_target,
        "coverage_pct": round(coverage_pct, 3),
        "overall_reliability_score": overall,
    }


async def log_checkin(tenant_id: str, salesman_id: str, outlet_id: str,
                      gps_lat: Optional[float] = None, gps_lon: Optional[float] = None) -> Dict:
    sb = get_supabase()
    checkin = {
        "id": str(uuid.uuid4()),
        "tenant_id": tenant_id,
        "salesman_id": salesman_id,
        "outlet_id": outlet_id,
        "gps_lat": gps_lat,
        "gps_lon": gps_lon,
        "verified": False,
    }
    result = sb.table("beat_checkins").insert(checkin).execute()
    return result.data[0] if result.data else checkin


async def get_checkin_logs(tenant_id: str, salesman_id: Optional[str] = None, days: int = 7) -> List[Dict]:
    sb = get_supabase()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    query = sb.table("beat_checkins").select("*, outlets(*)").eq("tenant_id", tenant_id).gte("checked_in_at", cutoff)
    if salesman_id:
        query = query.eq("salesman_id", salesman_id)
    result = query.execute()
    return result.data or []


async def list_outlets(tenant_id: str) -> List[Dict]:
    sb = get_supabase()
    result = sb.table("outlets").select("*").eq("tenant_id", tenant_id).execute()
    return result.data or []


# ── Trust Certificates ────────────────────────────────────────────────────────

async def create_trust_certificate(data: Dict) -> Dict:
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    result = sb.table("trust_certificates").insert(data).execute()
    return result.data[0] if result.data else data


async def get_certificate(certificate_id: str) -> Optional[Dict]:
    sb = get_supabase()
    result = sb.table("trust_certificates").select("*").eq("id", certificate_id).execute()
    return result.data[0] if result.data else None


# ── Audit Trail ───────────────────────────────────────────────────────────────

async def create_audit_event(tenant_id: str, event_type: str, entity_id: str,
                             payload: Dict, actor_id: str = "system") -> Dict:
    sb = get_supabase()

    # Get previous hash for hash chain
    prev_result = sb.table("audit_events").select("event_hash").eq("tenant_id", tenant_id).order("created_at", desc=True).limit(1).execute()
    prev_hash = prev_result.data[0]["event_hash"] if prev_result.data else "GENESIS"

    event_hash = _generate_hash(payload, prev_hash)

    event = {
        "id": str(uuid.uuid4()),
        "tenant_id": tenant_id,
        "event_type": event_type,
        "entity_id": entity_id,
        "payload": payload,
        "actor_id": actor_id,
        "event_hash": event_hash,
        "prev_hash": prev_hash,
    }
    result = sb.table("audit_events").insert(event).execute()
    return result.data[0] if result.data else event


async def list_audit_events(tenant_id: str, limit: int = 50, entity_id: Optional[str] = None) -> Dict:
    sb = get_supabase()
    query = sb.table("audit_events").select("*").eq("tenant_id", tenant_id).order("created_at", desc=True)
    if entity_id:
        query = query.eq("entity_id", entity_id)
    result = query.limit(limit).execute()
    return {"events": result.data or [], "total": len(result.data or [])}


# ── Products ──────────────────────────────────────────────────────────────────

async def list_products(tenant_id: str) -> List[Dict]:
    sb = get_supabase()
    result = sb.table("products").select("*").eq("tenant_id", tenant_id).eq("is_active", True).execute()
    return result.data or []


async def search_product(tenant_id: str, name: str) -> List[Dict]:
    sb = get_supabase()
    result = sb.table("products").select("*").eq("tenant_id", tenant_id).ilike("name", f"%{name}%").execute()
    return result.data or []


# ── Analytics ──────────────────────────────────────────────────────────────────

async def get_scheme_leakage_report(tenant_id: str, period_days: int = 30) -> Dict:
    """
    Aggregate SCHEME_LEAKAGE risk alerts into a per-scheme leakage report.
    Groups by affected_entity_id (scheme ID) and sums rupee_impact.
    """
    sb = get_supabase()
    # Fetch all scheme leakage alerts within the period
    alerts_res = sb.table("risk_alerts") \
        .select("affected_entity_id, rupee_impact, description, created_at") \
        .eq("tenant_id", tenant_id) \
        .eq("alert_type", "SCHEME_LEAKAGE") \
        .execute()

    # Fetch all schemes for name lookup
    schemes_res = sb.table("schemes").select("id, scheme_name, brand, discount_percent, valid_from, valid_to, is_active").eq("tenant_id", tenant_id).execute()
    scheme_map = {s["id"]: s for s in (schemes_res.data or [])}

    # Aggregate by scheme ID
    aggregated: Dict[str, Dict] = {}
    total_leakage = 0.0

    for alert in (alerts_res.data or []):
        scheme_id = alert.get("affected_entity_id", "unknown")
        impact = float(alert.get("rupee_impact") or 0)
        total_leakage += impact
        if scheme_id not in aggregated:
            scheme = scheme_map.get(scheme_id, {})
            aggregated[scheme_id] = {
                "scheme_id": scheme_id,
                "scheme_name": scheme.get("scheme_name", f"Scheme {scheme_id[:8]}"),
                "brand": scheme.get("brand", "Unknown"),
                "discount_percent": scheme.get("discount_percent", 0),
                "is_active": scheme.get("is_active", False),
                "leakage_rupee": 0.0,
                "alert_count": 0,
            }
        aggregated[scheme_id]["leakage_rupee"] += impact
        aggregated[scheme_id]["alert_count"] += 1

    reports = sorted(aggregated.values(), key=lambda x: x["leakage_rupee"], reverse=True)

    return {
        "leakage_reports": reports,
        "total_leakage": total_leakage,
        "period_days": period_days,
        "scheme_count": len(reports),
    }


async def get_revenue_heatmap(tenant_id: str, period_days: int = 30) -> Dict:
    """
    Aggregate total revenue from orders grouped by channel/status.
    Returns a heatmap-style breakdown suitable for table visualization.
    """
    sb = get_supabase()
    from datetime import timezone
    cutoff = (datetime.now(timezone.utc) - timedelta(days=period_days)).isoformat()

    orders_res = sb.table("orders") \
        .select("channel, status, total_amount, created_at") \
        .eq("tenant_id", tenant_id) \
        .gte("created_at", cutoff) \
        .execute()

    # Aggregate by channel
    channel_agg: Dict[str, Dict] = {}
    for o in (orders_res.data or []):
        channel = o.get("channel") or "direct"
        amount = float(o.get("total_amount") or 0)
        if channel not in channel_agg:
            channel_agg[channel] = {"channel": channel, "revenue": 0.0, "order_count": 0, "status_breakdown": {}}
        channel_agg[channel]["revenue"] += amount
        channel_agg[channel]["order_count"] += 1
        status = o.get("status", "UNKNOWN")
        channel_agg[channel]["status_breakdown"][status] = channel_agg[channel]["status_breakdown"].get(status, 0) + 1

    total_revenue = sum(v["revenue"] for v in channel_agg.values())

    # Add percentage share to each channel
    for v in channel_agg.values():
        v["revenue_share_pct"] = round((v["revenue"] / total_revenue * 100) if total_revenue > 0 else 0, 1)

    heatmap = sorted(channel_agg.values(), key=lambda x: x["revenue"], reverse=True)

    return {
        "heatmap": heatmap,
        "total_revenue": total_revenue,
        "period_days": period_days,
        "order_count": sum(v["order_count"] for v in channel_agg.values()),
    }


async def get_trust_distribution(tenant_id: str) -> Dict:
    """
    Trust score distribution as both tier buckets and score histogram (0-100 in 20-point bands).
    """
    sb = get_supabase()
    trust_res = sb.table("trust_scores").select("tier, composite_score").eq("tenant_id", tenant_id).execute()

    tier_counts: Dict[str, int] = {"A": 0, "B": 0, "C": 0, "D": 0}
    score_buckets: Dict[str, int] = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}

    for ts in (trust_res.data or []):
        tier = ts.get("tier", "C")
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

        score = float(ts.get("composite_score") or 0)
        if score <= 20:
            score_buckets["0-20"] += 1
        elif score <= 40:
            score_buckets["21-40"] += 1
        elif score <= 60:
            score_buckets["41-60"] += 1
        elif score <= 80:
            score_buckets["61-80"] += 1
        else:
            score_buckets["81-100"] += 1

    histogram = [{"range": k, "count": v} for k, v in score_buckets.items()]

    return {
        "tier_distribution": tier_counts,
        "score_histogram": histogram,
        "total_retailers": sum(tier_counts.values()),
    }


# ── Task 04 — Beat, Expiry, Certificates ──────────────────────────────────────

async def get_coverage_gaps(tenant_id: str, days: int = 7) -> Dict:
    """Outlets not visited by any salesman in the past N days."""
    sb = get_supabase()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    outlets_res = sb.table("outlets").select("id, name, address, route, pincode, gps_lat, gps_lon").eq("tenant_id", tenant_id).execute()
    outlets = outlets_res.data or []

    checkins_res = sb.table("beat_checkins").select("outlet_id").eq("tenant_id", tenant_id).gte("checked_in_at", cutoff).execute()
    visited_ids = {c["outlet_id"] for c in (checkins_res.data or [])}

    all_checkins_res = sb.table("beat_checkins").select("outlet_id, checked_in_at").eq("tenant_id", tenant_id).order("checked_in_at", desc=True).execute()
    last_visit_map: Dict[str, str] = {}
    for c in (all_checkins_res.data or []):
        oid = c["outlet_id"]
        if oid not in last_visit_map:
            last_visit_map[oid] = c["checked_in_at"]

    gaps = []
    for outlet in outlets:
        oid = outlet["id"]
        if oid not in visited_ids:
            last_visit = last_visit_map.get(oid)
            if last_visit:
                lv_dt = datetime.fromisoformat(last_visit.replace("Z", "+00:00"))
                days_since = (datetime.now(timezone.utc) - lv_dt).days
            else:
                days_since = 999
            risk_level = "HIGH" if days_since > 14 else "MEDIUM" if days_since > 7 else "LOW"
            gaps.append({
                "outlet_id": oid,
                "outlet_name": outlet.get("name", "Unknown"),
                "route": outlet.get("route", ""),
                "pincode": outlet.get("pincode", ""),
                "gps_lat": outlet.get("gps_lat"),
                "gps_lon": outlet.get("gps_lon"),
                "days_since_last_visit": days_since,
                "risk_level": risk_level,
                "estimated_missed_revenue": days_since * 500.0,
            })

    gaps.sort(key=lambda x: x["days_since_last_visit"], reverse=True)
    return {"gaps": gaps, "total_missed_outlets": len(gaps), "period_days": days}


async def get_ghost_visit_report(tenant_id: str, salesman_id: Optional[str] = None) -> Dict:
    """Beat checkins where verified=False, grouped by salesman."""
    sb = get_supabase()
    query = sb.table("beat_checkins").select("salesman_id, id").eq("tenant_id", tenant_id).eq("verified", False)
    if salesman_id:
        query = query.eq("salesman_id", salesman_id)
    ghost_res = query.execute()

    all_checkins = sb.table("beat_checkins").select("salesman_id").eq("tenant_id", tenant_id).execute()
    total_by_sm: Dict[str, int] = {}
    for c in (all_checkins.data or []):
        sid = c["salesman_id"]
        total_by_sm[sid] = total_by_sm.get(sid, 0) + 1

    sm_res = sb.table("salesmen").select("id, name").eq("tenant_id", tenant_id).execute()
    sm_map = {s["id"]: s["name"] for s in (sm_res.data or [])}

    ghost_by_sm: Dict[str, Dict] = {}
    for c in (ghost_res.data or []):
        sid = c["salesman_id"]
        if sid not in ghost_by_sm:
            ghost_by_sm[sid] = {
                "salesman_id": sid,
                "salesman_name": sm_map.get(sid, f"SM-{sid[:8]}"),
                "ghost_count": 0,
                "total_checkins": total_by_sm.get(sid, 0),
            }
        ghost_by_sm[sid]["ghost_count"] += 1

    reports = list(ghost_by_sm.values())
    for r in reports:
        total = r["total_checkins"]
        r["ghost_rate_pct"] = round((r["ghost_count"] / total * 100) if total > 0 else 0, 1)
        r["estimated_missed_revenue"] = r["ghost_count"] * 3500.0
        r["severity"] = "HIGH" if r["ghost_rate_pct"] > 30 else "MEDIUM" if r["ghost_rate_pct"] > 15 else "LOW"

    reports.sort(key=lambda x: x["ghost_rate_pct"], reverse=True)
    return {
        "ghost_visits": reports,
        "estimated_missed_revenue": sum(r["estimated_missed_revenue"] for r in reports),
    }


async def get_expiry_batches(tenant_id: str, days_threshold: int = 365) -> List[Dict]:
    """Fetch batches expiring within threshold days."""
    sb = get_supabase()
    cutoff = (date.today() + timedelta(days=days_threshold)).isoformat()
    result = sb.table("batches").select("*").eq("tenant_id", tenant_id).lte("expiry_date", cutoff).order("expiry_date").execute()
    return result.data or []


async def register_batch(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    result = sb.table("batches").insert(data).execute()
    return result.data[0] if result.data else data


async def register_certificate(tenant_id: str, data: Dict) -> Dict:
    sb = get_supabase()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    result = sb.table("certificates").insert(data).execute()
    return result.data[0] if result.data else data


async def get_certificate(certificate_code: str) -> Optional[Dict]:
    sb = get_supabase()
    result = sb.table("certificates").select("*").eq("certificate_code", certificate_code).execute()
    return result.data[0] if result.data else None


async def get_certificate_history(retailer_id: str) -> List[Dict]:
    sb = get_supabase()
    result = (
        sb.table("certificates")
        .select("certificate_code, trust_score, tier, issued_at, valid_until, qr_verification_url")
        .eq("retailer_id", retailer_id)
        .order("issued_at", desc=True)
        .execute()
    )
    return result.data or []

