#!/usr/bin/env bash
# Poort-scoped kill-dev script — vervangt globale `pkill -f` zodat je
# meerdere projecten tegelijk lokaal kunt draaien zonder ze elkaar te laten doden.
#
# Gebruik:
#   bash scripts/kill-dev.sh
#
# Vereisten:
#   - .env.development in project-root (gitignored) met:
#     VITE_PORT=...   (Vite/SvelteKit dev server)
#     POCKETBASE_PORT=...   (PocketBase)
#     PORT=...   (alleen als er een aparte backend is, anders weglaten)

set -euo pipefail

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env.development"
if [ ! -f "$ENV_FILE" ]; then
  echo "✔ Geen .env.development — niets te killen"
  exit 0
fi

set -a
source "$ENV_FILE"
set +a

VITE_PORT="${VITE_PORT:-5173}"
POCKETBASE_PORT="${POCKETBASE_PORT:-8090}"
PORT="${PORT:-}"

PORTS_TO_KILL=("$VITE_PORT" "$POCKETBASE_PORT")
if [ -n "$PORT" ]; then
  PORTS_TO_KILL+=("$PORT")
fi

for p in "${PORTS_TO_KILL[@]}"; do
  PIDS=$(lsof -ti :"$p" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "✔ Kill $PIDS op poort $p"
    kill $PIDS 2>/dev/null || true
  fi
done