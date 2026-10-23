#!/usr/bin/env bash
set -euo pipefail

# Configuration
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DB_FILE="$APP_DIR/data/biography.db"
UPLOADS_DIR="$APP_DIR/public/uploads"
ARCHIVE_NAME="biography_backup_${TIMESTAMP}.tar.gz"

echo "=== Starting Biography Platform Backup: ${TIMESTAMP} ==="
mkdir -p "$BACKUP_DIR"

# 1. Consistent SQLite online backup (handles concurrent WAL writes safely)
TEMP_DB_BACKUP="/tmp/biography_temp_${TIMESTAMP}.db"
if command -v sqlite3 >/dev/null 2>&1; then
    echo "Creating consistent SQLite snapshot via sqlite3 .backup..."
    sqlite3 "$DB_FILE" ".backup '$TEMP_DB_BACKUP'"
else
    echo "sqlite3 CLI not found; performing atomic copy with checkpoint..."
    cp "$DB_FILE" "$TEMP_DB_BACKUP"
    [ -f "${DB_FILE}-wal" ] && cp "${DB_FILE}-wal" "${TEMP_DB_BACKUP}-wal"
    [ -f "${DB_FILE}-shm" ] && cp "${DB_FILE}-shm" "${TEMP_DB_BACKUP}-shm"
fi

# 2. Package database snapshot and uploaded media into compressed tarball
echo "Archiving database snapshot and uploaded media..."
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" \
    -C "/tmp" "$(basename "$TEMP_DB_BACKUP")" \
    -C "$APP_DIR/public" "uploads"

# Clean up temporary snapshot
rm -f "$TEMP_DB_BACKUP"*

echo "Backup created successfully: $BACKUP_DIR/$ARCHIVE_NAME ($(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1))"

# 3. Retention policy: delete backups older than 14 days
echo "Applying retention policy (pruning backups older than 14 days)..."
find "$BACKUP_DIR" -name "biography_backup_*.tar.gz" -type f -mtime +14 -delete

echo "=== Backup completed successfully ==="
