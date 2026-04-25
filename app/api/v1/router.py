"""
API v1 — Master router: aggregates all sub-routers.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    orders,
    trust_score,
    risk_alerts,
    beat_plan,
    schemes,
    returns,
    expiry,
    certificate,
    telegram_webhook,
    distributor,
    retailer,
    salesman,
    agent,
    ondc,
    analytics,
    pdf_parser,
)

api_router = APIRouter()

# ── Authentication ────────────────────────────────────────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# ── Core Trade Endpoints (MVP) ────────────────────────────────────────────────
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(trust_score.router, prefix="/trust-score", tags=["Trust Score"])
api_router.include_router(risk_alerts.router, prefix="/risk-alerts", tags=["Risk Alerts"])
api_router.include_router(beat_plan.router, prefix="/beat-plan", tags=["Beat Plan"])
api_router.include_router(schemes.router, prefix="/schemes", tags=["Schemes"])
api_router.include_router(returns.router, prefix="/returns", tags=["Returns"])
api_router.include_router(expiry.router, prefix="/expiry", tags=["Expiry"])
api_router.include_router(certificate.router, prefix="/certificate", tags=["Trust Certificate"])

# ── Stakeholder Endpoints ─────────────────────────────────────────────────────
api_router.include_router(distributor.router, prefix="/distributor", tags=["Distributor"])
api_router.include_router(retailer.router, prefix="/retailer", tags=["Retailer"])
api_router.include_router(salesman.router, prefix="/salesman", tags=["Salesman"])
api_router.include_router(agent.router, prefix="/agent", tags=["AI Agent Pipeline"])

# ── Channel Webhooks ──────────────────────────────────────────────────────────
api_router.include_router(
    telegram_webhook.router, prefix="/webhook/telegram", tags=["Telegram Webhook"]
)

# ── Integrations ──────────────────────────────────────────────────────────────
api_router.include_router(ondc.router, prefix="/ondc", tags=["ONDC"])

# ── Intelligence / Analytics ──────────────────────────────────────────────────
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(pdf_parser.router, prefix="/pdf", tags=["PDF Parser"])
