import requests

BASE_URL = "http://127.0.0.1:8001/api/v1/auth/register"
TENANT_ID = "default-tenant"
PASSWORD = "password123"

roles = [
    {"email": "distributor@vendorlock.ai", "role": "distributor", "full_name": "Mock Distributor"},
    {"email": "company@vendorlock.ai", "role": "company", "full_name": "Mock Company"},
    {"email": "salesman@vendorlock.ai", "role": "salesman", "full_name": "Mock Salesman"},
    {"email": "nbfc@vendorlock.ai", "role": "nbfc", "full_name": "Mock NBFC"},
    {"email": "horeca@vendorlock.ai", "role": "horeca", "full_name": "Mock HORECA"},
    {"email": "retailer@vendorlock.ai", "role": "retailer", "full_name": "Mock Retailer"}
]

def seed_users():
    for user in roles:
        payload = {
            "email": user["email"],
            "password": PASSWORD,
            "full_name": user["full_name"],
            "tenant_id": TENANT_ID,
            "role": user["role"]
        }
        try:
            res = requests.post(BASE_URL, json=payload)
            if res.status_code == 201:
                print(f"Created {user['email']}")
            elif res.status_code == 409:
                print(f"Already exists: {user['email']}")
            else:
                print(f"Failed {user['email']}: {res.status_code} {res.text}")
        except Exception as e:
            print(f"Error {user['email']}: {e}")

if __name__ == "__main__":
    seed_users()
