#!/usr/bin/env bash
# Deploy agile-health-monitor naar de Hostinger VPS (Docker + Traefik).
#
# Gebruik:
#   ./scripts/deploy-vps.sh                 # volledige deploy (sync + build + up)
#   ./scripts/deploy-vps.sh --only-sync     # alleen code syncen, geen build/up
#   ./scripts/deploy-vps.sh --help          # toon deze help
#
# Bij een UPDATE volstaat:  ./scripts/deploy-vps.sh
#   - rsync: code naar VPS
#   - .env check
#   - volume-init: alleen als het volume leeg is (bij een update blijft data behouden)
#   - docker compose up -d --build
#   - health-check
#
# Vereisten:
#   - SSH-key naar VPS (root@194.31.150.80) — id_ed25519 of default key.
#   - .env op de VPS aanwezig (zie .env.example).
#   - Lokaal werkende pb_data (pb_setup/pb_data) als init-data voor een LEEG volume.

set -euo pipefail

VPS_HOST="${VPS_HOST:-root@194.31.150.80}"
VPS_DIR="${VPS_DIR:-/docker/agile-health-monitor}"
COMPOSE="docker compose -f compose.production.yml"

# Volume naam: compose `name: agile-health-monitor` → "agile-health-monitor_pb_data"
PB_VOLUME="agile-health-monitor_pb_data"

show_help() {
  sed -n '2,20p' "$0"
  exit 0
}

[ "${1:-}" = "--help" ] && show_help

echo "── Deploy agile-health-monitor → ${VPS_HOST}:${VPS_DIR} ──"

# 1. Code synchroniseren (exclude build output, data, secrets)
echo ""
echo "[1/5] Code syncen (rsync)..."
rsync_args=(
  -az --delete
  --exclude "node_modules"
  --exclude ".git"
  --exclude ".env"
  --exclude ".svelte-kit"
  --exclude "build"
  --exclude "pb_setup/pb_data"
  --exclude "pb_setup/pocketbase"
  --exclude "pb_data"
  --exclude "*.log"
  --exclude ".DS_Store"
  --exclude "*.tsbuildinfo"
)
ssh "${VPS_HOST}" "mkdir -p ${VPS_DIR}"
rsync "${rsync_args[@]}" -e ssh ./ "${VPS_HOST}:${VPS_DIR}/"
echo "      OK"

[ "${1:-}" = "--only-sync" ] && { echo ""; echo "✓ Alleen sync — build/up overgeslagen."; exit 0; }

# 2. .env controleren
echo ""
echo "[2/5] .env op VPS controleren..."
if ! ssh "${VPS_HOST}" "test -f ${VPS_DIR}/.env"; then
  echo "      ⚠️ .env ontbreekt op VPS — maak deze aan:"
  echo "      ssh ${VPS_HOST} && cd ${VPS_DIR} && cp .env.example .env && nano .env"
  exit 1
fi
echo "      OK"

# 3. PB-data volume initialiseren (alleen als volume leeg is — bij update blijft data behouden)
echo ""
echo "[3/5] PocketBase volume init..."
HAS_PB_DATA="$(ssh "${VPS_HOST}" "docker run --rm -v ${PB_VOLUME}:/v alpine ls /v 2>/dev/null | grep -c data.db || true")"
if [ "${HAS_PB_DATA}" = "0" ]; then
  if [ ! -f pb_setup/pb_data/data.db ]; then
    echo "      ⚠️ pb_setup/pb_data/data.db ontbreekt lokaal — skip init"
    echo "      PB volume wordt leeg aangemaakt; vul later handmatig of via PB admin"
  else
    echo "      Volume leeg — vullen met lokale pb_data..."
    PB_BACKUP="/tmp/agile-health-monitor-pb-data-$(date +%Y%m%d%H%M%S)"
    mkdir -p "${PB_BACKUP}"
    sqlite3 pb_setup/pb_data/data.db ".backup '${PB_BACKUP}/data.db'"
    sqlite3 pb_setup/pb_data/auxiliary.db ".backup '${PB_BACKUP}/auxiliary.db'" 2>/dev/null || true
    cp pb_setup/pb_data/types.d.ts "${PB_BACKUP}/types.d.ts" 2>/dev/null || true
    tar czf "${PB_BACKUP}.tar.gz" -C "${PB_BACKUP}" .
    scp "${PB_BACKUP}.tar.gz" "${VPS_HOST}:/tmp/pb-init.tar.gz"
    ssh "${VPS_HOST}" "
      docker volume create ${PB_VOLUME} >/dev/null 2>&1
      docker run --rm -v ${PB_VOLUME}:/v -v /tmp/pb-init.tar.gz:/init/init.tar.gz alpine sh -c 'cd /v && tar xzf /init/init.tar.gz && chown -R 1001:1001 /v'
      rm -f /tmp/pb-init.tar.gz
    "
    rm -rf "${PB_BACKUP}" "${PB_BACKUP}.tar.gz"
    echo "      Volume ${PB_VOLUME} gevuld + eigenaar uid 1001"
  fi
else
  echo "      Volume bevat al data — overslaan (update: data blijft behouden)"
fi

# 4. Image(s) bouwen + containers starten
echo ""
echo "[4/5] Docker build + up..."
ssh "${VPS_HOST}" "cd ${VPS_DIR} && ${COMPOSE} up -d --build"
echo "      OK"

# 5. Health + URL
echo ""
echo "[5/5] Verificatie..."
ssh "${VPS_HOST}" "cd ${VPS_DIR} && ${COMPOSE} ps"
sleep 5
HEALTH="$(ssh "${VPS_HOST}" "docker inspect agile-health-monitor-app --format '{{.State.Health.Status}}' 2>/dev/null || echo unknown")"
echo "      app health: ${HEALTH}"
DOMAIN_VAL="$(ssh "${VPS_HOST}" "grep '^DOMAIN=' ${VPS_DIR}/.env | cut -d= -f2 || echo unknown")"
echo "      URL: https://${DOMAIN_VAL}/"

echo ""
echo "✓ Deploy klaar."
echo "  Seed (eenmalig, maakt collections aan):  ssh ${VPS_HOST} 'cd ${VPS_DIR} && docker compose -f compose.production.yml --profile seed run --rm setup'"
