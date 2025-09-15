#!/bin/sh
set -eu
set -o pipefail

echo "[cypress-cr006] Waiting for services..."
FE_URL="${FRONTEND_URL:-http://frontend:3000}"
API_BASE="${API_BASE_URL:-http://api:8000}"
API_HEALTH="$API_BASE/healthz"

MAX_TRIES=120 # ~4 minutes total
TRY=0
until curl -sSf "$FE_URL" >/dev/null; do
  TRY=$((TRY+1))
  if [ "$TRY" -ge "$MAX_TRIES" ]; then
    echo "[cypress-cr006] Frontend not ready after $MAX_TRIES tries; aborting" >&2
    exit 1
  fi
  sleep 2
done

TRY=0
until curl -sSf "$API_HEALTH" >/dev/null; do
  TRY=$((TRY+1))
  if [ "$TRY" -ge "$MAX_TRIES" ]; then
    echo "[cypress-cr006] API not ready after $MAX_TRIES tries; aborting" >&2
    exit 1
  fi
  sleep 2
done

EMAIL="${TEST_USER_EMAIL:-richard.mmacharia@gmail.com}"
PASSWORD="${TEST_USER_PASSWORD:-jaggerthee}"

echo "[cypress-cr006] Seeding user: $EMAIL (idempotent)"
curl -s -X POST "$API_BASE/auth/create-account" \
  -H 'Content-Type: application/json' \
  -d '{"email":"'"$EMAIL"'","password":"'"$PASSWORD"'","user_type":"user"}' \
  >/dev/null 2>&1 || true

echo "[cypress-cr006] Obtaining token..."
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username='"$EMAIL"'&password='"$PASSWORD" \
  | sed -E 's/.*\"access_token\":\"([^\"]+)\".*/\1/')
[ -n "$TOKEN" ] || { echo "Login failed"; exit 1; }

echo "[cypress-cr006] Seeding baseline entities..."
curl -s -X POST "$API_BASE/api/v1/assets-v2/" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Seed Property","asset_type":"real_estate","current_value":5000000,"acquisition_cost":3000000,"acquisition_date":"2024-01-01T00:00:00Z"}' >/dev/null 2>&1 || true

curl -s -X POST "$API_BASE/api/v1/income-v2/" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"source_name":"Seed Salary","monthly_amount":100000,"frequency":"monthly","source_type":"salary"}' >/dev/null 2>&1 || true

curl -s -X POST "$API_BASE/api/v1/expenses-v2/" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"description":"Seed Rent","amount":30000,"expense_type":"housing","frequency":"monthly","is_recurring":true}' >/dev/null 2>&1 || true

curl -s -X POST "$API_BASE/api/v1/expenses-v2/" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"description":"Seed Utilities","amount":8000,"expense_type":"utilities","frequency":"monthly","is_recurring":true}' >/dev/null 2>&1 || true

curl -s -X POST "$API_BASE/api/v1/budget-v2/categories?category_name=Groceries&allocated_amount=20000" \
  -H "Authorization: Bearer $TOKEN" >/dev/null 2>&1 || true

echo "[cypress-cr006] Running Cypress..."
cypress run --browser chrome --headless \
  --config baseUrl="$FE_URL",defaultCommandTimeout=20000,retries=1 \
  --spec 'cypress/e2e-cr006/**/*.cy.js'
