import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import ollama

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")
MAX_RETRIES = int(os.getenv("REEMBED_MAX_RETRIES", "3"))
RETRY_BASE_SECONDS = float(os.getenv("REEMBED_RETRY_BASE_SECONDS", "1.5"))


def create_supabase() -> Client:
    """Create and optionally authenticate a Supabase client."""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Optional authentication for RLS-enabled projects
    email = os.getenv("SUPABASE_USER_EMAIL")
    password = os.getenv("SUPABASE_USER_PASSWORD")
    if email and password:
        supabase.auth.sign_in_with_password({"email": email, "password": password})

    return supabase


def should_retry(error: Exception) -> bool:
    """Return True when the error looks like a transient connectivity issue."""
    message = str(error).lower()
    transient_markers = [
        "server disconnected",
        "connection reset",
        "connection aborted",
        "connection refused",
        "timed out",
        "temporarily unavailable",
        "remoteprotocolerror",
    ]
    return any(marker in message for marker in transient_markers)

def main():
    # Initialize Supabase client
    supabase: Client = create_supabase()

    print("Fetching goods from Supabase...")
    # Fetch all goods that need re-embedding
    result = supabase.table("goods").select("id, title, description").execute()
    
    if not result.data:
        print("No goods found to update.")
        return

    print(f"Found {len(result.data)} goods. Updating embeddings...")

    for item in result.data:
        good_id = item["id"]
        title = item["title"]
        description = item.get("description", "")
        
        print(f"Processing: {title}...")
        
        # Nomic Embed V2 requires 'search_document: ' prefix
        text_to_embed = f"search_document: {title}: {description}"
        
        try:
            response = ollama.embeddings(model=OLLAMA_MODEL, prompt=text_to_embed)
            embedding = response["embedding"]
        except Exception as e:
            print(f"Error generating embedding for '{title}': {e}")
            continue

        updated = False
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                supabase.table("goods").update({"embed": embedding}).eq("id", good_id).execute()
                print(f"Successfully updated embedding for '{title}'")
                updated = True
                break
            except Exception as e:
                if attempt < MAX_RETRIES and should_retry(e):
                    wait_seconds = RETRY_BASE_SECONDS * (2 ** (attempt - 1))
                    print(
                        f"Update failed for '{title}' (attempt {attempt}/{MAX_RETRIES}): {e}. "
                        f"Retrying in {wait_seconds:.1f}s..."
                    )
                    time.sleep(wait_seconds)
                    # Re-create client to recover from stale/disconnected sessions.
                    supabase = create_supabase()
                    continue
                print(f"Error updating '{title}': {e}")
                break

        if not updated:
            print(f"Skipping '{title}' after repeated update failures.")

    print("\nAll done!")

if __name__ == "__main__":
    main()
