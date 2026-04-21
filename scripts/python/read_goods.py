import os
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client
import ollama

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")

def main():
    parser = argparse.ArgumentParser(description="Search for goods in Supabase using vector similarity")
    parser.add_argument("--query", required=True, help="Search query text")
    parser.add_argument("--limit", type=int, default=5, help="Number of results to return (default: 5)")
    parser.add_argument("--threshold", type=float, default=0.2, help="Similarity threshold (0 to 1, default: 0.2)")
    
    args = parser.parse_args()

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Optional Authentication
    email = os.getenv("SUPABASE_USER_EMAIL")
    password = os.getenv("SUPABASE_USER_PASSWORD")
    if email and password:
        print(f"Logging in as {email}...")
        supabase.auth.sign_in_with_password({"email": email, "password": password})
        print("Logged in successfully.")

    print(f"Searching for: '{args.query}'...")
    try:
        # Generate embedding for the search query
        # Nomic Embed models require specific prefixes for better performance:
        # 'search_query: ' for queries and 'search_document: ' for documents.
        prompt = f"search_query: {args.query}"
        response = ollama.embeddings(model=OLLAMA_MODEL, prompt=prompt)
        query_embedding = response["embedding"]

        # Call the RPC function we created in Supabase
        rpc_params = {
            "query_embedding": query_embedding,
            "match_threshold": args.threshold,
            "match_count": args.limit
        }

        result = supabase.rpc("match_goods", rpc_params).execute()

        if not result.data:
            print("No matching goods found.")
            return

        print(f"\nFound {len(result.data)} matching goods:")
        print("-" * 50)
        for item in result.data:
            print(f"Title: {item['title']}")
            print(f"Cost: ${item['cost']}")
            print(f"Quantity: {item['quantity']}")
            print(f"Similarity: {item['similarity']:.4f}")
            print(f"Description: {item['description']}")
            print("-" * 50)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
