#!/bin/bash
# ========================================================================================
# Memory Bank Monitor Control Script
# ========================================================================================
# Service control interface for the background memory bank monitoring daemon.
#
# USAGE:
#   bash docs/scripts/monitoring/monitor-control.md {start|stop|status|restart}
#
# COMMANDS:
#   start   - Start the background monitoring service
#   stop    - Stop the background monitoring service
#   status  - Show current service status and process information
#   restart - Restart the monitoring service (stop then start)
#
# FUNCTIONALITY:
#   - Manages background-monitor.md daemon process
#   - Tracks process ID in monitor.pid file
#   - Provides service lifecycle management
#   - Handles graceful shutdown and cleanup
#
# DEPENDENCIES:
#   - background-monitor.md (the actual monitoring script)
#   - Standard Unix utilities: nohup, kill, ps, sleep
#   - Bash shell with job control
#
# ERROR HANDLING:
#   - Prevents multiple instances from running
#   - Validates process existence before operations
#   - Cleans up stale PID files automatically
#   - Provides clear error messages for all failure modes
#
# INTEGRATION POINTS:
#   - Called by: automation-status.md, manual user commands
#   - Controls: background-monitor.md daemon process
#   - Reads/Writes: monitor.pid (process tracking), monitor.log (output capture)
#
# GENERATED FILES:
#   - monitor.pid: Contains the process ID of running monitor (auto-created/removed)
#   - monitor.log: Captures all monitor output (auto-created, manual cleanup)
#
# EXIT CODES:
#   - 0: Success
#   - 1: Error (already running, not running, invalid command, etc.)
#
# PROCESS MANAGEMENT:
#   - Uses nohup for detached execution
#   - Redirects stdout/stderr to log file
#   - Background execution with &
#   - PID tracking for service management
#
# MAINTENANCE:
#   - Monitor log files don't auto-rotate (manual cleanup recommended)
#   - Check status regularly to ensure service health
#   - Restart service after system reboots
# ========================================================================================

# Configuration variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # Absolute path to monitoring directory
MONITOR_SCRIPT="$SCRIPT_DIR/background-monitor.md"        # Path to monitor daemon script
PID_FILE="$SCRIPT_DIR/monitor.pid"                        # PID tracking file
LOG_FILE="$SCRIPT_DIR/monitor.log"                        # Monitor output log

# ========================================================================================
# COMMAND PROCESSING
# ========================================================================================

case "$1" in
    # ====================================================================================
    # START COMMAND - Launch the background monitoring service
    # ====================================================================================
    start)
        echo "Checking if monitor is already running..."

        # Check if PID file exists and process is actually running
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "❌ Monitor is already running (PID: $(cat "$PID_FILE"))"
            echo "   Use 'restart' to restart or 'stop' then 'start' for fresh launch"
            exit 1
        fi

        echo "Starting background monitor..."
        echo "  - Script: $MONITOR_SCRIPT"
        echo "  - Log file: $LOG_FILE"
        echo "  - PID file: $PID_FILE"

        # Clean up any stale PID file
        [ -f "$PID_FILE" ] && rm -f "$PID_FILE"

        # Launch monitor in background with nohup
        # Redirect all output to log file for debugging
        nohup bash "$MONITOR_SCRIPT" > "$LOG_FILE" 2>&1 &
        MONITOR_PID=$!  # Capture the background process ID

        # Save PID to file for tracking
        echo $MONITOR_PID > "$PID_FILE"

        # Verify the process started successfully
        sleep 1  # Brief pause to let process initialize
        if kill -0 $MONITOR_PID 2>/dev/null; then
            echo "✅ Monitor started successfully (PID: $MONITOR_PID)"
            echo "   Monitor will check for workflow changes every 5 minutes"
            echo "   Validation runs every 30 minutes"
            echo "   View logs: tail -f $LOG_FILE"
        else
            echo "❌ Failed to start monitor - check $LOG_FILE for errors"
            rm -f "$PID_FILE"  # Clean up PID file on failure
            exit 1
        fi
        ;;

    # ====================================================================================
    # STOP COMMAND - Gracefully stop the monitoring service
    # ====================================================================================
    stop)
        echo "Checking monitor status..."

        # Check if monitor is actually running
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            MONITOR_PID=$(cat "$PID_FILE")
            echo "Stopping monitor (PID: $MONITOR_PID)..."

            # Send termination signal
            kill $MONITOR_PID

            # Wait for graceful shutdown (up to 10 seconds)
            for i in {1..10}; do
                if ! kill -0 $MONITOR_PID 2>/dev/null; then
                    break
                fi
                sleep 1
            done

            # Force kill if still running
            if kill -0 $MONITOR_PID 2>/dev/null; then
                echo "Monitor didn't respond to SIGTERM, force killing..."
                kill -9 $MONITOR_PID 2>/dev/null
                sleep 1
            fi

            # Verify process is stopped
            if ! kill -0 $MONITOR_PID 2>/dev/null; then
                echo "✅ Monitor stopped successfully"
                rm -f "$PID_FILE"  # Clean up PID file
            else
                echo "❌ Failed to stop monitor process"
                exit 1
            fi
        else
            echo "ℹ️  Monitor is not running"
            [ -f "$PID_FILE" ] && rm -f "$PID_FILE"  # Clean up stale PID file
        fi
        ;;

    # ====================================================================================
    # STATUS COMMAND - Show current service status and process information
    # ====================================================================================
    status)
        echo "Memory Bank Monitor Status"
        echo "=========================="

        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            MONITOR_PID=$(cat "$PID_FILE")
            echo "✅ Status: RUNNING"
            echo "   Process ID: $MONITOR_PID"
            echo "   PID file: $PID_FILE"
            echo "   Log file: $LOG_FILE"
            echo ""
            echo "Process Details:"
            ps -p $MONITOR_PID -o pid,ppid,cmd 2>/dev/null || echo "   (Process details unavailable)"
            echo ""
            echo "Recent Log Activity:"
            if [ -f "$LOG_FILE" ]; then
                tail -5 "$LOG_FILE" 2>/dev/null | sed 's/^/   /' || echo "   No recent logs"
            else
                echo "   No log file found"
            fi
        else
            echo "❌ Status: STOPPED"
            echo "   No monitor process running"
            [ -f "$PID_FILE" ] && echo "   Stale PID file found (cleaning up...)" && rm -f "$PID_FILE"

            if [ -f "$LOG_FILE" ]; then
                echo "   Log file exists: $LOG_FILE"
                echo "   Last log entry:"
                tail -1 "$LOG_FILE" 2>/dev/null | sed 's/^/     /' || echo "     No logs available"
            fi
        fi
        echo ""
        echo "Control Commands:"
        echo "  Start:  $0 start"
        echo "  Stop:   $0 stop"
        echo "  Status: $0 status"
        echo "  Restart: $0 restart"
        ;;

    # ====================================================================================
    # RESTART COMMAND - Stop and restart the monitoring service
    # ====================================================================================
    restart)
        echo "Restarting memory bank monitor..."
        echo ""

        # Stop the current instance
        echo "Stopping current monitor..."
        $0 stop
        echo ""

        # Brief pause to ensure clean shutdown
        sleep 2

        # Start new instance
        echo "Starting new monitor instance..."
        $0 start
        ;;

    # ====================================================================================
    # INVALID COMMAND - Show usage information
    # ====================================================================================
    *)
        echo "Memory Bank Monitor Control"
        echo "==========================="
        echo ""
        echo "USAGE: $0 {start|stop|status|restart}"
        echo ""
        echo "COMMANDS:"
        echo "  start   - Start the background monitoring service"
        echo "  stop    - Stop the background monitoring service"
        echo "  status  - Show current service status and process info"
        echo "  restart - Restart the monitoring service"
        echo ""
        echo "EXAMPLES:"
        echo "  $0 start    # Start monitoring"
        echo "  $0 status   # Check if running"
        echo "  $0 stop     # Stop monitoring"
        echo "  $0 restart  # Restart service"
        echo ""
        echo "FILES:"
        echo "  PID file: $PID_FILE"
        echo "  Log file: $LOG_FILE"
        echo "  Monitor:  $MONITOR_SCRIPT"
        echo ""
        exit 1
        ;;
esac

# ========================================================================================
# LOGGING AND AUDIT
# ========================================================================================

# Log the control action for audit purposes
echo "$(date): Monitor control - Command: ${1:-none}, Result: $?" >> "$SCRIPT_DIR/../logs/monitor-control.log"

# Exit with appropriate code
exit 0