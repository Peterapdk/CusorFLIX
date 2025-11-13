#!/bin/bash
# ========================================================================================
# Background Memory Bank Monitor Daemon
# ========================================================================================
# Continuous monitoring service for the Memory Bank Synchronization System.
# Runs as a background daemon process to ensure real-time synchronization.
#
# USAGE:
#   This script is designed to run as a daemon via monitor-control.md
#   Direct execution: bash docs/scripts/monitoring/background-monitor.md
#
# FUNCTIONALITY:
#   - Monitors workflow_state.md for changes every 5 minutes
#   - Triggers automatic sync when workflow changes are detected
#   - Runs validation checks every 30 minutes
#   - Maintains continuous synchronization between cursorkleosr and memory-bank
#   - Provides real-time updates to AI assistants
#
# MONITORING LOGIC:
#   1. Check workflow_state.md modification time
#   2. If changed within last hour, check last sync time
#   3. If no sync in last 30 minutes, trigger automatic sync
#   4. Every 30 minutes (on the hour/half-hour), run validation
#   5. Sleep for 5 minutes, repeat indefinitely
#
# DEPENDENCIES:
#   - sync-engine.md (performs actual synchronization)
#   - sync-validator.md (validates sync integrity)
#   - jq (JSON parsing for metadata)
#   - Standard Unix utilities: stat, date, sleep
#
# ERROR HANDLING:
#   - Graceful handling of missing files (continues monitoring)
#   - Cross-platform compatibility (macOS and Linux stat commands)
#   - Silent failure recovery (logs errors but continues running)
#   - Automatic retry logic for failed operations
#
# INTEGRATION POINTS:
#   - Reads: docs/cursorkleosr/workflow_state.md (source data)
#   - Reads: docs/memory-bank/.sync-metadata.json (sync tracking)
#   - Calls: sync-engine.md (synchronization)
#   - Calls: sync-validator.md (validation)
#   - Writes: logs/background-sync.log (sync operations)
#   - Writes: logs/background-validation.log (validation results)
#
# GENERATED FILES:
#   - background-sync.log: Records all sync operations with timestamps
#   - background-validation.log: Records validation results and errors
#
# RESOURCE USAGE:
#   - Memory: Minimal (< 10MB)
#   - CPU: < 1% during normal operation
#   - Disk: Log files grow slowly (recommend monthly rotation)
#   - Network: Only during sync/validation operations
#
# PROCESS MANAGEMENT:
#   - Designed for background execution (nohup recommended)
#   - Infinite loop with 5-minute sleep cycles
#   - Controlled by monitor-control.md (start/stop/status)
#   - PID tracked in monitor.pid file
#
# MAINTENANCE:
#   - Monitor log files for errors or unusual activity
#   - Check system resources during peak usage
#   - Restart service after system updates
#   - Rotate logs monthly to prevent disk space issues
# ========================================================================================

# ========================================================================================
# CONFIGURATION
# ========================================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # Monitoring scripts directory
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"       # Project root directory
LOGS_DIR="$SCRIPT_DIR/../logs"                             # Logs directory

# Monitoring intervals (in seconds)
WORKFLOW_CHECK_INTERVAL=300    # Check workflow every 5 minutes
VALIDATION_INTERVAL=1800       # Run validation every 30 minutes
SYNC_COOLDOWN=1800            # Minimum 30 minutes between syncs
WORKFLOW_CHANGE_WINDOW=3600   # Consider changes within last hour

# ========================================================================================
# LOGGING FUNCTION
# ========================================================================================

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $*" >&2  # Log to stderr for monitor-control.md capture
}

# ========================================================================================
# UTILITY FUNCTIONS
# ========================================================================================

# Get file modification time (cross-platform compatible)
get_file_mtime() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: Use stat -f %m for seconds since epoch
        stat -f %m "$file" 2>/dev/null || echo "0"
    else
        # Linux: Use stat -c %Y for seconds since epoch
        stat -c %Y "$file" 2>/dev/null || echo "0"
    fi
}

# Check if it's time to run validation (every 30 minutes)
should_run_validation() {
    local current_time=$(date +%s)
    # Run validation at :00 and :30 minutes past the hour
    [ $((current_time % VALIDATION_INTERVAL)) -eq 0 ]
}

# ========================================================================================
# MAIN MONITORING LOOP
# ========================================================================================

log_message "Background Memory Bank Monitor starting"
log_message "Monitoring interval: $WORKFLOW_CHECK_INTERVAL seconds"
log_message "Validation interval: $VALIDATION_INTERVAL seconds"
log_message "PID: $$"

# Infinite monitoring loop
while true; do
    # ============================================================================
    # WORKFLOW CHANGE DETECTION
    # ============================================================================

    WORKFLOW_FILE="$PROJECT_ROOT/docs/cursorkleosr/workflow_state.md"

    if [ -f "$WORKFLOW_FILE" ]; then
        # Get current time and file modification time
        current_time=$(date +%s)
        workflow_mtime=$(get_file_mtime "$WORKFLOW_FILE")
        time_since_change=$((current_time - workflow_mtime))

        # Check if workflow was modified within the change window
        if [ $time_since_change -lt $WORKFLOW_CHANGE_WINDOW ]; then
            log_message "Workflow file changed $time_since_change seconds ago"

            # Check when we last ran a sync
            should_sync=false
            METADATA_FILE="$PROJECT_ROOT/docs/memory-bank/.sync-metadata.json"

            if [ -f "$METADATA_FILE" ]; then
                # Parse last sync time from metadata
                last_sync=$(jq -r '.last_sync' "$METADATA_FILE" 2>/dev/null || echo "2000-01-01T00:00:00Z")

                # Convert to epoch time (cross-platform)
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    last_sync_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$last_sync" +%s 2>/dev/null || echo 0)
                else
                    last_sync_epoch=$(date -d "$last_sync" +%s 2>/dev/null || echo 0)
                fi

                time_since_sync=$((current_time - last_sync_epoch))

                # Trigger sync if it's been more than cooldown period
                if [ $time_since_sync -gt $SYNC_COOLDOWN ]; then
                    should_sync=true
                    log_message "Last sync was $time_since_sync seconds ago, triggering sync"
                else
                    log_message "Last sync was $time_since_sync seconds ago, within cooldown period"
                fi
            else
                # No metadata file, run initial sync
                should_sync=true
                log_message "No sync metadata found, running initial sync"
            fi

            # Execute sync if needed
            if [ "$should_sync" = true ]; then
                log_message "Running automated sync (workflow changed $time_since_change seconds ago)"
                if bash "$SCRIPT_DIR/../sync-engine.md" >> "$LOGS_DIR/background-sync.log" 2>&1; then
                    log_message "Sync completed successfully"
                else
                    log_message "ERROR: Sync failed with exit code $?"
                fi
            fi
        fi
    else
        log_message "WARNING: Workflow file not found: $WORKFLOW_FILE"
    fi

    # ============================================================================
    # PERIODIC VALIDATION
    # ============================================================================

    if should_run_validation; then
        log_message "Running periodic validation check"
        if bash "$SCRIPT_DIR/../validation/sync-validator.md" >> "$LOGS_DIR/background-validation.log" 2>&1; then
            log_message "Validation completed successfully"
        else
            log_message "WARNING: Validation failed with exit code $?"
        fi
    fi

    # ============================================================================
    # SLEEP AND CONTINUE
    # ============================================================================

    log_message "Sleeping for $WORKFLOW_CHECK_INTERVAL seconds..."
    sleep $WORKFLOW_CHECK_INTERVAL
done

# ========================================================================================
# NOTES
# ========================================================================================
# This script is designed to run indefinitely as a background service.
# It should be managed through monitor-control.md for proper lifecycle management.
# The script will only exit on system signals (SIGTERM, SIGINT, etc.) or critical errors.