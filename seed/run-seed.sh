#!/bin/sh
set -eu

echo "⏳ Waiting for API..."
/app/wait-for-it.sh api:8000 -t 60 -- true

if [ "${RESET_ON_START:-0}" = "1" ]; then
  echo "🧹 Resetting user data..."
  node seed/reset-user-data.cjs --email "$SEED_EMAIL" --password "$SEED_PASSWORD"
fi

echo "🌱 Seeding bundle from: ${SEED_DIR:-seed/richard}"
node seed/seed-from-json.cjs --email "$SEED_EMAIL" --password "$SEED_PASSWORD" --dir "${SEED_DIR:-seed/richard}"

if [ "${SEED_JOURNAL:-0}" = "1" ]; then
  echo "📒 Seeding journal entries from: ${SEED_JOURNAL_FILE:-seed/journal.sample.json}"
  node seed/seed-journal.cjs --email "$SEED_EMAIL" --password "$SEED_PASSWORD" --file "${SEED_JOURNAL_FILE:-seed/journal.sample.json}"
fi

echo "✅ Seed complete"

