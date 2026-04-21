import os
from dotenv import load_dotenv
from supabase import create_client, Client
import ollama

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")

email = os.getenv("SUPABASE_USER_EMAIL")
password = os.getenv("SUPABASE_USER_PASSWORD")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

if email and password:
    supabase.auth.sign_in_with_password({"email": email, "password": password})

query = "dress"
print(f"Generating embedding for '{query}'...")
response = ollama.embeddings(model=OLLAMA_MODEL, prompt=query)
query_embedding = response["embedding"]

print("Fetching record from DB...")
# Get the first record's embedding
result = supabase.table("goods").select("title, embed").limit(1).execute()
if not result.data:
    print("No data in table.")
    exit()

record = result.data[0]
title = record["title"]
# embed is returned as a string or list? In supabase-py it's usually a string "[...]" or list.
# Let's check.
import json
try:
    if isinstance(record["embed"], str):
        db_embedding = json.loads(record["embed"])
    else:
        db_embedding = record["embed"]
except:
    db_embedding = record["embed"]

print(f"Comparing '{query}' with '{title}'...")

# Calculate cosine similarity manually
import math
def cosine_similarity(v1, v2):
    dot_product = sum(a*b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a*a for a in v1))
    magnitude2 = math.sqrt(sum(a*a for a in v2))
    return dot_product / (magnitude1 * magnitude2)

sim = cosine_similarity(query_embedding, db_embedding)
print(f"Manual Cosine Similarity: {sim}")

# Try calling RPC with 0 threshold
print("Calling RPC with threshold 0...")
rpc_params = {
    "query_embedding": query_embedding,
    "match_threshold": 0.0,
    "match_count": 5
}
try:
    rpc_result = supabase.rpc("match_goods", rpc_params).execute()
    print(f"RPC Result Data: {rpc_result.data}")
except Exception as e:
    print(f"RPC Error: {e}")
