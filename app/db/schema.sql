-- VendorLock PostgreSQL Schema (MVP)
-- Run via Supabase SQL editor or alembic migration

-- ── Tenants (Distributors) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    gstin TEXT UNIQUE,
    territory TEXT,
    plan TEXT DEFAULT 'starter',  -- starter | growth | enterprise
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'viewer',   -- distributor | salesman | retailer | admin | viewer
    telegram_chat_id BIGINT UNIQUE,
    mobile TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Retailers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gstin TEXT,
    mobile TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    telegram_chat_id BIGINT UNIQUE,
    credit_limit NUMERIC(12,2) DEFAULT 10000,
    outstanding NUMERIC(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Salesmen ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salesmen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    mobile TEXT,
    route TEXT,
    telegram_chat_id BIGINT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products / SKU Master ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sku_code TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    unit TEXT DEFAULT 'piece',
    mrp NUMERIC(10,2),
    distributor_price NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(tenant_id, sku_code)
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES retailers(id),
    salesman_id UUID REFERENCES salesmen(id),
    status TEXT DEFAULT 'PENDING_CONFIRMATION',
    payment_type TEXT DEFAULT 'credit',
    channel TEXT DEFAULT 'dashboard',
    raw_message TEXT,
    total_amount NUMERIC(12,2),
    notes TEXT,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2),
    total_price NUMERIC(12,2)
);

-- ── Trust Scores ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE UNIQUE,
    composite_score NUMERIC(5,2) DEFAULT 50,
    tier TEXT DEFAULT 'C',
    trend TEXT DEFAULT 'STABLE',
    consistency_index NUMERIC(4,3) DEFAULT 0.5,
    sub_scores JSONB DEFAULT '{}',
    flags JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    tier TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Schemes ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    sku_id UUID REFERENCES products(id),
    min_quantity INTEGER,
    discount_percent NUMERIC(5,2),
    valid_from DATE,
    valid_to DATE,
    source TEXT DEFAULT 'manual',
    pdf_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Batch / Expiry ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    batch_number TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    invoice_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Beat / Checkins ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES retailers(id),
    name TEXT,
    address TEXT,
    route TEXT,
    pincode TEXT
);

CREATE TABLE IF NOT EXISTS beat_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    salesman_id UUID REFERENCES salesmen(id),
    outlet_id UUID REFERENCES outlets(id),
    gps_lat NUMERIC(10,7),
    gps_lon NUMERIC(10,7),
    verified BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Returns ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES retailers(id),
    order_id UUID REFERENCES orders(id),
    batch_number TEXT,
    quantity INTEGER,
    reason TEXT,
    classification TEXT,        -- GENUINE | WITHIN_WINDOW | EXPIRED_WINDOW | SUSPICIOUS
    status TEXT DEFAULT 'PENDING',
    credit_note_amount NUMERIC(12,2),
    hold_reason TEXT,
    evidence_urls JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Alerts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'INFO',
    title TEXT,
    description TEXT,
    affected_entity_id TEXT,
    affected_entity_type TEXT,
    rupee_impact NUMERIC(12,2),
    recommended_action TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Trust Certificates ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trust_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID REFERENCES retailers(id),
    trust_score NUMERIC(5,2),
    tier TEXT,
    months_of_history INTEGER,
    payment_discipline_pct NUMERIC(5,2),
    return_rate_vs_peer NUMERIC(6,4),
    consistency_index NUMERIC(4,3),
    pdf_url TEXT,
    qr_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ
);

-- ── Audit Trail (SHA-256 hash chain) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    event_type TEXT NOT NULL,
    entity_id TEXT,
    payload JSONB,
    actor_id TEXT,
    event_hash TEXT NOT NULL,    -- SHA-256(prev_hash + payload)
    prev_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trust_scores_retailer ON trust_scores(retailer_id);
CREATE INDEX IF NOT EXISTS idx_batch_expiry ON batch_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON risk_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_events(tenant_id);
