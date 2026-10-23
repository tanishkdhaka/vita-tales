#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKUP_ARCHIVE="${1:-}"

if [ -z "$BACKUP_ARCHIVE" ] || [ ! -f "$BACKUP_ARCHIVE" ]; then
    echo "Usage: $0 /path/to/biography_backup_YYYYMMDD_HHMMSS.tar.gz"
    exit 1
fi

echo "=== Restoring Biography Platform from: $BACKUP_ARCHIVE ==="
RESTORE_TEMP="$(mktemp -d)"
trap 'rm -rf "$RESTORE_TEMP"' EXIT

# Extract archive
tar -xzf "$BACKUP_ARCHIVE" -C "$RESTORE_TEMP"

# Find database file inside extracted archive
EXTRACTED_DB="$(find "$RESTORE_TEMP" -name "biography_temp_*.db" -type f | head -n 1)"
if [ -z "$EXTRACTED_DB" ]; then
    echo "Error: No database snapshot found inside backup archive."
    exit 1
fi

echo "Stopping application if running via systemd..."
systemctl stop biography.service 2>/dev/null || true

# Backup current database just in case
if [ -f "$APP_DIR/data/biography.db" ]; then
    cp "$APP_DIR/data/biography.db" "$APP_DIR/data/biography.db.pre_restore_bak"
fi

# Restore database
echo "Restoring database..."
mkdir -p "$APP_DIR/data"
cp "$EXTRACTED_DB" "$APP_DIR/data/biography.db"
rm -f "$APP_DIR/data/biography.db-wal" "$APP_DIR/data/biography.db-shm"

# Restore uploaded media
if [ -d "$RESTORE_TEMP/uploads" ]; then
    echo "Restoring uploaded media..."
    mkdir -p "$APP_DIR/public/uploads"
    cp -r "$RESTORE_TEMP/uploads/"* "$APP_DIR/public/uploads/"
fi

echo "Restarting application service..."
systemctl start biography.service 2>/dev/null || true

echo "=== Restore completed successfully ==="
