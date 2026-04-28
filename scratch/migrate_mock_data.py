import os
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing Supabase URL or Key in .env")
    exit(1)

supabase: Client = create_client(url, key)

print("Connected to Supabase. Migrating mock data...")

# 1. Create Tenant
tenant_id = "11111111-1111-1111-1111-111111111111"
try:
    supabase.table("tenants").insert({
        "id": tenant_id,
        "name": "VendorLock Demo Distributor",
        "gstin": "27AADCV1234D1Z9",
        "territory": "Mumbai",
        "plan": "enterprise"
    }).execute()
    print("Tenant created.")
except Exception as e:
    print(f"Tenant might exist or error: {e}")

# 2. Create User
user_id = "22222222-2222-2222-2222-222222222222"
try:
    supabase.table("users").insert({
        "id": user_id,
        "tenant_id": tenant_id,
        "email": "admin@vendorlock.com",
        "full_name": "Admin Distributor",
        "role": "distributor",
        "mobile": "+919876543210"
    }).execute()
    print("User created.")
except Exception as e:
    print(f"User might exist or error: {e}")

# 3. Create Retailers (from mock data)
retailers_data = [
    {"name": "Rao Mart", "mobile": "+919000000001", "credit_limit": 90000, "outstanding": 18000},
    {"name": "Sharma General Store", "mobile": "+919000000002", "credit_limit": 70000, "outstanding": 38400},
    {"name": "Patel Stores", "mobile": "+919000000003", "credit_limit": 62000, "outstanding": 52000},
]

retailer_ids = []
for r in retailers_data:
    r_id = str(uuid.uuid4())
    retailer_ids.append(r_id)
    try:
        supabase.table("retailers").insert({
            "id": r_id,
            "tenant_id": tenant_id,
            "name": r["name"],
            "mobile": r["mobile"],
            "credit_limit": r["credit_limit"],
            "outstanding": r["outstanding"]
        }).execute()
        print(f"Retailer {r['name']} created.")
    except Exception as e:
        print(f"Error creating retailer {r['name']}: {e}")

# 4. Create Trust Scores
trust_scores = [88, 61, 55]
for idx, r_id in enumerate(retailer_ids):
    try:
        supabase.table("trust_scores").insert({
            "tenant_id": tenant_id,
            "retailer_id": r_id,
            "composite_score": trust_scores[idx],
            "tier": "A" if trust_scores[idx] >= 80 else "B" if trust_scores[idx] >= 60 else "C"
        }).execute()
    except Exception as e:
        print(f"Error creating trust score: {e}")

# 5. Create Orders
for idx, r_id in enumerate(retailer_ids):
    try:
        supabase.table("orders").insert({
            "tenant_id": tenant_id,
            "retailer_id": r_id,
            "status": "CONFIRMED" if idx == 0 else "PENDING_CONFIRMATION",
            "total_amount": 10000 + (idx * 5000),
        }).execute()
    except Exception as e:
        print(f"Error creating order: {e}")

print("Migration completed.")
