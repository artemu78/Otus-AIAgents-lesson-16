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

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text-v2-moe")

def main():
    parser = argparse.ArgumentParser(description="Insert a new good into Supabase with Ollama embeddings")
    parser.add_argument("--title", required=True, help="Title of the good")
    parser.add_argument("--description", required=True, help="Description of the good")
    parser.add_argument("--quantity", type=int, default=1, help="Quantity (default: 1)")
    parser.add_argument("--cost", type=float, required=True, help="Cost of the good")
    
    args = parser.parse_args()

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Optional Authentication
    email = os.getenv("SUPABASE_USER_EMAIL")
    password = os.getenv("SUPABASE_USER_PASSWORD")
    user_id = None
    if email and password:
        print(f"Logging in as {email}...")
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        user_id = auth_response.user.id
        print(f"Logged in successfully. User ID: {user_id}")

    print(f"Generating embedding for: {args.title}...")
    try:
        # Generate embedding using local Ollama
        # Nomic Embed models require 'search_document: ' prefix for documents
        text_to_embed = f"search_document: {args.title}: {args.description}"
        response = ollama.embeddings(model=OLLAMA_MODEL, prompt=text_to_embed)
        embedding = response["embedding"]
        
        print("Embedding generated successfully.")

        # Prepare data for insertion
        data = {
            "title": args.title,
            "description": args.description,
            "quantity": args.quantity,
            "cost": args.cost,
            "embed": embedding
        }
        
        # Explicitly set created_by if logged in to satisfy RLS policy
        if user_id:
            data["created_by"] = user_id

        # Insert into Supabase
        result = supabase.table("goods").insert(data).execute()
        
        print("Successfully inserted good into Supabase!")
        print(result.data)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
