#!/bin/bash
set -e

PB_DIR="pb_setup"
PB_VERSION="0.23.0"

OS="darwin"
ARCH="arm64"
if [ "$(uname -m)" = "x86_64" ]; then
  ARCH="amd64"
fi

PB_FILE="pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_FILE}"

echo "Downloading PocketBase v${PB_VERSION} for ${OS}/${ARCH}..."
mkdir -p "$PB_DIR"

if [ ! -f "$PB_DIR/pocketbase" ]; then
  curl -L -o "/tmp/${PB_FILE}" "$PB_URL"
  unzip -o "/tmp/${PB_FILE}" -d "$PB_DIR"
  chmod +x "$PB_DIR/pocketbase"
  rm "/tmp/${PB_FILE}"
  echo "PocketBase downloaded to $PB_DIR/pocketbase"
else
  echo "PocketBase binary already exists at $PB_DIR/pocketbase"
fi

echo ""
echo "Starting PocketBase on http://127.0.0.1:8090"
echo "Admin UI: http://127.0.0.1:8090/_/"
echo ""

"$PB_DIR/pocketbase" serve --http=127.0.0.1:8090
