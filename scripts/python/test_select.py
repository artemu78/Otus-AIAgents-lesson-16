import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

email = os.getenv("SUPABASE_USER_EMAIL")
password = os.getenv("SUPABASE_USER_PASSWORD")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

if email and password:
    print(f"Logging in as {email}...")
    supabase.auth.sign_in_with_password({"email": email, "password": password})
    print("Logged in successfully.")

print("Fetching all goods...")
try:
    result = supabase.table("goods").select("title, cost").execute()
    print(f"Data: {result.data}")
    if hasattr(result, 'error') and result.error:
        print(f"Error: {result.error}")
except Exception as e:
    print(f"Exception: {e}")
