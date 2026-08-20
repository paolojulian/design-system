#!/usr/bin/env bash

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <feature-directory> [model]"
  echo
  echo "Example:"
  echo "  $0 todos/49-invoice-pdf"
  echo "  $0 todos/49-invoice-pdf claude-opus-4-8"
  exit 1
fi

FEATURE_DIR="$1"
MODEL="${2:-}"

SPEC_FILE="$FEATURE_DIR/FEATURE_SPEC.md"
PROGRESS_FILE="$FEATURE_DIR/FEATURE_PROGRESS.md"

if [ ! -f "$SPEC_FILE" ]; then
  echo "Missing: $SPEC_FILE"
  exit 1
fi

if [ ! -f "$PROGRESS_FILE" ]; then
  echo "Missing: $PROGRESS_FILE"
  exit 1
fi

LOG_DIR=".claude-factory/$(basename "$FEATURE_DIR")"
mkdir -p "$LOG_DIR"

echo "Starting Claude Factory"
echo "Feature: $FEATURE_DIR"

MAX_ITERATIONS="${DARK_FACTORY_MAX_ITER:-25}"

ITERATION=1

while true; do
  if [ "$ITERATION" -gt "$MAX_ITERATIONS" ]; then
    echo "ERROR: Reached maximum iterations ($MAX_ITERATIONS) without completing." >&2
    exit 2
  fi

  echo
  echo "========================================"
  echo "Iteration $ITERATION / $MAX_ITERATIONS"
  echo "========================================"

  OUTPUT_FILE="$LOG_DIR/run-$ITERATION.log"

  # Disable errexit so a non-zero claude exit doesn't abort the loop.
  CLAUDE_ARGS="--dangerously-skip-permissions"
  if [ -n "$MODEL" ]; then
    CLAUDE_ARGS="$CLAUDE_ARGS --model $MODEL"
  fi

  set +e
  claude $CLAUDE_ARGS "
Read $SPEC_FILE.

Read $PROGRESS_FILE.

SAFETY RULES — non-negotiable:
- Only interact with local environment (.env.local, docker-compose). Never touch .env.staging, .env.prod, or any production config.
- Never run database migrations against staging or production.
- Always work on a feature branch. Never commit directly to dev, staging, or main/prod branches.
- Never git push to dev, staging, or main/prod branches.
- Before starting, ensure the feature branch is based on the latest origin/main (git fetch origin && git rebase origin/main).

Goal:
Implement the entire feature according to the specification.

Workflow:
1. Review FEATURE_PROGRESS.md.
2. Find the next incomplete task.
3. Follow TDD.
4. Run relevant tests.
5. Save session if necessary in SESSION.md (Same folder)
6. Fix failures.
7. Update FEATURE_PROGRESS.md.
8. Commit progress locally on the feature branch.

Rules:
- Complete one task at a time.
- Fix TypeScript errors before moving forward.
- Fix failing tests before moving forward.
- Do not modify unrelated features.
- If blocked, explain the blocker clearly, then output exactly on its own line: BLOCKED

When all tasks are complete output exactly on its own line:

DONE
" | tee "$OUTPUT_FILE"
  set -e

  if grep -qx "DONE" "$OUTPUT_FILE"; then
    echo
    echo "✅ Feature completed after $ITERATION iteration(s)."
    exit 0
  fi

  if grep -qx "BLOCKED" "$OUTPUT_FILE"; then
    echo "Agent reported a blocker on iteration $ITERATION. Review: $OUTPUT_FILE" >&2
    exit 3
  fi

  sleep 15

  ITERATION=$((ITERATION + 1))
done
