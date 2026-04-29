import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

dresses = [
    {
        "title": "Midnight Velvet Gown",
        "description": "Luxurious floor-length velvet dress with elegant draping",
        "cost": 489,
        "category": "evening"
    },
    {
        "title": "Silk Noir Slip",
        "description": "Minimalist silk slip dress with cowl neckline",
        "cost": 325,
        "category": "evening"
    },
    {
        "title": "Celestial Sequin",
        "description": "Hand-beaded sequin dress with starry constellation pattern",
        "cost": 695,
        "category": "evening"
    },
    {
        "title": "Emerald Satin",
        "description": "Emerald green satin midi with asymmetric hem",
        "cost": 445,
        "category": "evening"
    },
    {
        "title": "Champagne Dreams",
        "description": "Flowing champagne tulle with delicate embroidery",
        "cost": 550,
        "category": "evening"
    },
    {
        "title": "Linen Sunrise",
        "description": "Breezy linen dress perfect for summer days",
        "cost": 195,
        "category": "casual"
    },
    {
        "title": "Cotton Meadow",
        "description": "Soft cotton midi with vintage floral print",
        "cost": 165,
        "category": "casual"
    },
    {
        "title": "Denim Serenity",
        "description": "Structured denim shirtdress with brass buttons",
        "cost": 225,
        "category": "casual"
    },
    {
        "title": "Bohemian Breeze",
        "description": "Flowing maxi dress with ethnic embroidery",
        "cost": 275,
        "category": "casual"
    },
    {
        "title": "Classic Stripes",
        "description": "Nautical striped dress with nautical details",
        "cost": 145,
        "category": "casual"
    },
    {
        "title": "Azure Breeze Maxi",
        "description": "Lightweight sky blue cotton maxi with spaghetti straps",
        "cost": 185,
        "category": "summer"
    },
    {
        "title": "Lemon Zest Sundress",
        "description": "Bright yellow linen dress with button-down front",
        "cost": 155,
        "category": "summer"
    }
]

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_KEY not found in environment.")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Optional: Sign in if needed by RLS
    email = os.getenv("SUPABASE_USER_EMAIL")
    password = os.getenv("SUPABASE_USER_PASSWORD")
    user_id = None
    if email and password:
        print(f"Logging in as {email}...")
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        user_id = auth_response.user.id

    print(f"Seeding {len(dresses)} dresses into 'goods' table...")
    
    for dress in dresses:
        data = {
            "title": dress["title"],
            "description": dress["description"],
            "cost": dress["cost"],
            "quantity": 10
        }
        if user_id:
            data["created_by"] = user_id
            
        try:
            # Check if it already exists to avoid duplicates
            check = supabase.table("goods").select("id").eq("title", dress["title"]).execute()
            if check.data:
                print(f"Skipping '{dress['title']}' (already exists)")
                continue

            result = supabase.table("goods").insert(data).execute()
            print(f"Inserted: {dress['title']}")
        except Exception as e:
            print(f"Error inserting '{dress['title']}': {e}")

    print("Seeding complete.")

if __name__ == "__main__":
    main()
