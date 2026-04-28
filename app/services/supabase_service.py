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
    query = sb.table("orders").select("*").eq("tenant_id", tenant_id).order("created_at", desc=True)
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
