# -- WARNING: This schema is for context only and is not meant to be run.
# -- Table order and constraints may not be valid for execution.

# CREATE TABLE public.goods (
#   id uuid NOT NULL DEFAULT gen_random_uuid(),
#   title text NOT NULL,
#   description text,
#   embed USER-DEFINED,
#   quantity integer DEFAULT 0,
#   cost numeric,
#   created_at timestamp with time zone DEFAULT now(),
#   created_by uuid DEFAULT auth.uid(),
#   CONSTRAINT goods_pkey PRIMARY KEY (id),
#   CONSTRAINT goods_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
# );
# CREATE TABLE public.users (
#   id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
#   created_at timestamp with time zone NOT NULL DEFAULT now(),
#   name character varying,
#   dob timestamp without time zone,
#   created_by uuid DEFAULT auth.uid(),
#   CONSTRAINT users_pkey PRIMARY KEY (id)
# );

import os
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client
import ollama
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")

def main():
    parser = argparse.ArgumentParser(description="Search for goods in Supabase using vector similarity")
    parser.add_argument("--query", required=True, help="Search query text")
    parser.add_argument("--limit", type=int, default=5, help="Number of results to return (default: 5)")
    parser.add_argument("--threshold", type=float, default=0.2, help="Similarity threshold (0 to 1, higher is more similar, default: 0.2)")
    
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
