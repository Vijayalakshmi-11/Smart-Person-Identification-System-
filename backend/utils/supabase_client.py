import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = None

try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("🟩 Supabase connected!")
    else:
        print("⚠️ Supabase URL/KEY missing")
except Exception as e:
    print("❌ Supabase init failed:", e)
