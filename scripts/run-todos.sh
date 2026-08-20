#!/usr/bin/env bash

# Runs dark-factory.sh on each todo folder in sorted order.
# After each run, checks FEATURE_PROGRESS.md for full completion.
# If complete, moves the folder to todos/done/ and continues to the next.

set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
TODOS_DIR="${TODOS_DIR:-$(cd "$SCRIPTS_DIR/../../todos" && pwd)}"
DONE_DIR="$TODOS_DIR/done"
MAX_RETRIES="${TODOS_MAX_RETRIES:-3}"

mkdir -p "$DONE_DIR"

mapfile -t TODOS < <(find "$TODOS_DIR" -maxdepth 1 -mindepth 1 -type d ! -name "done" | sort)

if [ ${#TODOS[@]} -eq 0 ]; then
  echo "No todo folders found in $TODOS_DIR"
  exit 0
fi

echo "Found ${#TODOS[@]} todo(s) to process:"
for todo in "${TODOS[@]}"; do
  echo "  - $(basename "$todo")"
done

all_tasks_done() {
  local progress_file="$1"
  local total checked
  total=$(grep -cE '^\- \[[ xX]\]' "$progress_file" || true)
  checked=$(grep -cE '^\- \[[xX]\]' "$progress_file" || true)
  [ "$total" -gt 0 ] && [ "$checked" -eq "$total" ]
}

for FEATURE_DIR in "${TODOS[@]}"; do
  FEATURE_NAME=$(basename "$FEATURE_DIR")
  SPEC_FILE="$FEATURE_DIR/FEATURE_SPEC.md"
  PROGRESS_FILE="$FEATURE_DIR/FEATURE_PROGRESS.md"

  echo
  echo "════════════════════════════════════════"
  echo "Processing: $FEATURE_NAME"
  echo "════════════════════════════════════════"

  if [ ! -f "$SPEC_FILE" ] || [ ! -f "$PROGRESS_FILE" ]; then
    echo "WARNING: Missing FEATURE_SPEC.md or FEATURE_PROGRESS.md — skipping $FEATURE_NAME"
    continue
  fi

  if all_tasks_done "$PROGRESS_FILE"; then
    echo "Already complete — moving to done/ without re-running."
    mv "$FEATURE_DIR" "$DONE_DIR/$FEATURE_NAME"
    echo "Moved $FEATURE_NAME → done/"
    continue
  fi

  ATTEMPT=1
  while true; do
    if [ "$ATTEMPT" -gt "$MAX_RETRIES" ]; then
      echo "ERROR: $FEATURE_NAME did not complete after $MAX_RETRIES attempt(s)." >&2
      exit 2
    fi

    echo "Attempt $ATTEMPT / $MAX_RETRIES"

    set +e
    bash "$SCRIPTS_DIR/dark-factory.sh" "$FEATURE_DIR"
    FACTORY_EXIT=$?
    set -e

    if [ "$FACTORY_EXIT" -eq 3 ]; then
      echo "Agent reported BLOCKED on attempt $ATTEMPT. Stopping." >&2
      exit 3
    fi

    TOTAL=$(grep -cE '^\- \[[ xX]\]' "$PROGRESS_FILE" || true)
    CHECKED=$(grep -cE '^\- \[[xX]\]' "$PROGRESS_FILE" || true)
    echo "Progress: $CHECKED / $TOTAL tasks checked"

    if all_tasks_done "$PROGRESS_FILE"; then
      echo "All tasks complete for $FEATURE_NAME"
      break
    fi

    echo "Not fully checked — retrying in 10s..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
  done

  mv "$FEATURE_DIR" "$DONE_DIR/$FEATURE_NAME"
  echo "Moved $FEATURE_NAME → done/"
done

echo
echo "All todos processed."
