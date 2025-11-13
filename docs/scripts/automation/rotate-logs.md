#!/bin/bash
# Rotate sync logs

LOGS_DIR="$SCRIPT_DIR/logs"
MAX_AGE=30  # days

echo "Rotating logs older than $MAX_AGE days..."

find "$LOGS_DIR" -name "*.log" -mtime +$MAX_AGE -delete
find "$LOGS_DIR" -name "*.tmp" -mtime +1 -delete

echo "✅ Log rotation completed"
