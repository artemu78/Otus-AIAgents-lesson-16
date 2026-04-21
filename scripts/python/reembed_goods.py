import os
from dotenv import load_dotenv
from supabase import create_client, Client
import ollama

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")

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
            supabase.table("goods").update({"embed": embedding}).eq("id", good_id).execute()
            print(f"Successfully updated embedding for '{title}'")
        except Exception as e:
            print(f"Error updating '{title}': {e}")

    print("\nAll done!")

if __name__ == "__main__":
    main()
