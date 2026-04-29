#!/bin/bash
set -e

echo "======================================"
echo " Welcome to the Online Shop Deployer! "
echo "======================================"

# 1. Supabase Authentication
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "You need a Personal Access Token from https://supabase.com/dashboard/account/tokens"
    read -s -p "Enter your Supabase Access Token: " SUPABASE_ACCESS_TOKEN
    echo ""
fi
export SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN

# 2. Project Details
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    read -p "Enter your Supabase Project Reference (e.g., abcdefghijklmno): " SUPABASE_PROJECT_REF
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    read -s -p "Enter your Supabase Database Password: " SUPABASE_DB_PASSWORD
    echo ""
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    read -p "Enter your Supabase Anon Key (from Project Settings > API): " VITE_SUPABASE_ANON_KEY
fi

# 3. Linking and Deployment
echo "Linking to Supabase project $SUPABASE_PROJECT_REF..."
export SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD
supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"

echo "Applying database schema to remote project..."
supabase db push

# 4. Seeding Cloud Data
if [ -f "supabase/seed.sql" ]; then
    echo "Seeding remote database with initial data..."
    # Note: Using db query to execute the seed file against the linked remote project
    supabase db query -f supabase/seed.sql --linked
else
    echo "No seed.sql found, skipping data population."
fi

# 5. Frontend Configuration
echo "Writing frontend environment variables..."
cat << ENV_EOF > frontend/.env
VITE_SUPABASE_URL=https://${SUPABASE_PROJECT_REF}.supabase.co
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV_EOF

echo "======================================"
echo " Deployment Complete!                 "
echo " Starting the frontend server...      "
echo "======================================"

# Start frontend
cd frontend
npm run dev -- --host
