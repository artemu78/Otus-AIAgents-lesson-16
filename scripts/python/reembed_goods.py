import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import ollama
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")
MAX_UPDATE_RETRIES = int(os.getenv("SUPABASE_UPDATE_RETRIES", "3"))
RETRY_BACKOFF_SECONDS = float(os.getenv("SUPABASE_UPDATE_BACKOFF_SECONDS", "1.0"))


def update_embedding_with_retry(supabase_url: str, supabase_key: str, good_id: str, embedding: list[float]) -> None:
    last_error = None
    for attempt in range(1, MAX_UPDATE_RETRIES + 1):
        try:
            # Recreate the client on each attempt to avoid stale connections
            client = create_client(supabase_url, supabase_key)
            client.table("goods").update({"embed": embedding}).eq("id", good_id).execute()
            return
        except Exception as error:
            last_error = error
            error_message = str(error).lower()
            is_retryable = (
                "server disconnected" in error_message
                or "connection reset" in error_message
                or "timed out" in error_message
                or "remotedisconnected" in error_message
            )
            if not is_retryable or attempt == MAX_UPDATE_RETRIES:
                raise
            sleep_seconds = RETRY_BACKOFF_SECONDS * (2 ** (attempt - 1))  # exponential backoff
            print(
                f"Transient update error (attempt {attempt}/{MAX_UPDATE_RETRIES}) "
                f"for id={good_id}: {error}. Retrying in {sleep_seconds:.1f}s..."
            )
            time.sleep(sleep_seconds)

    # Defensive fallback: loop should always return or raise.
    if last_error is not None:
        raise last_error

def main():
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Optional Authentication (needed if RLS is enabled and you're not using service_role key)
    email = os.getenv("SUPABASE_USER_EMAIL")
    password = os.getenv("SUPABASE_USER_PASSWORD")
    if email and password:
        print(f"Logging in as {email}...")
        supabase.auth.sign_in_with_password({"email": email, "password": password})

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
            
            # Update the record with the new embedding
            update_embedding_with_retry(SUPABASE_URL, SUPABASE_KEY, good_id, embedding)
            print(f"Successfully updated embedding for '{title}'")
        except Exception as e:
            print(f"Error updating '{title}' (id={good_id}): {type(e).__name__}: {e}")

    print("\nAll done!")

if __name__ == "__main__":
    main()
