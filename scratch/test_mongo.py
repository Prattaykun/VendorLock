import asyncio
import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_mongo():
    load_dotenv()
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("MONGODB_URI not found in .env")
        return
        
    print(f"Testing connection to host: {uri.split('@')[-1].split('/')[0]}")
    
    clients = [
        ("Default", AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)),
        ("With Certifi", AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where()))
    ]
    
    for name, client in clients:
        print(f"\n--- Testing {name} ---")
        try:
            info = await asyncio.wait_for(client.server_info(), timeout=10.0)
            print(f"[SUCCESS] {name}: MongoDB version: {info.get('version')}")
            return
        except Exception as e:
            print(f"[FAILED] {name}: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_mongo())
