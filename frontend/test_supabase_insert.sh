#!/bin/bash

# Configuration
PROJECT_URL="https://fvpjxiynohehrlokrrvh.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cGp4aXlub2hlaHJsb2tycnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTAxMTcsImV4cCI6MjA5MjI2NjExN30.khKYox7j459YdZwpN_UkLY3LGOxylVs38TqDch-MZLA"

# 1. Get JWT token
echo "Logging in..."
RESPONSE=$(curl -s -X POST "${PROJECT_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aaa@aaa.aaa",
    "password": "aaa"
  }')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token:"
  echo $RESPONSE
  exit 1
fi

echo "Successfully logged in."

# 2. Create user record
echo "Creating user record..."
curl -i -X POST "${PROJECT_URL}/rest/v1/users" \
  -H "apikey: ${API_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "name": "John Doe",
    "dob": "1988-12-31 23:59:58"
  }'

echo -e "\nDone."