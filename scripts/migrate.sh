#!/usr/bin/env bash
# Run all pending SQL migrations against the target database.
#
# Usage:
#   ./scripts/migrate.sh
#
# Required env var:
#   POSTGRES_HOST — full connection string, e.g.
#     postgresql://user:pass@host:5432/dbname
#
# Migrations are applied in filename order from db/migrations/.
# Each file is idempotent (uses IF NOT EXISTS / IF EXISTS guards) so
# re-running is safe.

set -euo pipefail

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../db/migrations" && pwd)"

if [[ -z "${POSTGRES_HOST:-}" ]]; then
  echo "Error: POSTGRES_HOST is not set." >&2
  exit 1
fi

echo "Running migrations from $MIGRATIONS_DIR"

for migration in "$MIGRATIONS_DIR"/*.sql; do
  echo "  Applying $(basename "$migration") ..."
  psql "$POSTGRES_HOST" -f "$migration"
done

echo "All migrations applied."
