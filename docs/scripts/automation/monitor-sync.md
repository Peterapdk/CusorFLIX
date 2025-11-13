#!/bin/bash
# Monitor memory bank synchronization status

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"
VALIDATION_LOG="$LOGS_DIR/validation-$(date +%Y%m%d).log"

# Run validation
if bash "$SCRIPT_DIR/validation/sync-validator.md" > "$VALIDATION_LOG" 2>&1; then
    echo "✅ Sync validation passed at $(date)"
else
    echo "❌ Sync validation failed at $(date)"
    echo "Check log: $VALIDATION_LOG"

    # Send alert (could integrate with notification system)
    # send_alert "Memory bank sync validation failed"
fi
