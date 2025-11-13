#!/bin/bash
# ========================================================================================
# Memory Bank Automation Status Dashboard
# ========================================================================================
# Displays real-time status of all automation components for the Memory Bank Sync System.
#
# USAGE:
#   bash docs/scripts/automation/automation-status.md
#
# OUTPUT:
#   - Git hooks status (pre-commit validation, post-commit sync)
#   - Background monitor status (running/stopped with PID)
#   - Workflow watcher status (active/inactive)
#   - VS Code integration status (task configuration)
#   - Quick command reference for manual control
#
# DEPENDENCIES:
#   - Bash shell with standard utilities (grep, pgrep, kill)
#   - Access to project .git/hooks directory
#   - Access to monitoring PID files
#
# ERROR HANDLING:
#   - Gracefully handles missing files/directories
#   - Cleans up stale PID files automatically
#   - Non-blocking checks (continues if components unavailable)
#
# INTEGRATION POINTS:
#   - Reads from: .git/hooks/, monitoring/monitor.pid, .vscode/tasks.json
#   - Called by: Manual execution, monitoring scripts, CI/CD pipelines
#
# GENERATED FILES:
#   - None (read-only status display)
#
# EXIT CODES:
#   - 0: Success (status displayed)
#   - Non-zero: System error (rare, usually file access issues)
#
# MAINTENANCE:
#   - Run regularly to monitor automation health
#   - Check for stale PID files and clean manually if needed
#   - Update quick commands section when new scripts added
# ========================================================================================

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # Absolute path to script directory
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"       # Project root directory

# Display header with timestamp
echo "=========================================="
echo "  Memory Bank Automation Status"
echo "=========================================="
echo "Time: $(date)"  # Current system time in readable format
echo ""

# ========================================================================================
# GIT HOOKS STATUS CHECK
# ========================================================================================
# Checks if Git hooks are properly installed and configured for automation
echo "🔗 GIT HOOKS"
echo "------------"

# Check pre-commit hook (validates sync before commits)
if [ -x "$PROJECT_ROOT/.git/hooks/pre-commit" ]; then
    echo "✅ Pre-commit validation hook active"
    echo "   - Validates memory bank sync integrity before commits"
    echo "   - Prevents commits if sync validation fails"
else
    echo "❌ Pre-commit validation hook missing"
    echo "   - Run: bash docs/scripts/automation/enhanced-automation.md"
fi

# Check post-commit hook (triggers sync after commits)
if grep -q "Memory Bank Sync" "$PROJECT_ROOT/.git/hooks/post-commit" 2>/dev/null; then
    echo "✅ Post-commit sync hook active"
    echo "   - Automatically syncs memory bank after successful commits"
    echo "   - Ensures AI context stays current with code changes"
else
    echo "❌ Post-commit sync hook missing"
    echo "   - Run: bash docs/scripts/automation/enhanced-automation.md"
fi
echo ""

# ========================================================================================
# BACKGROUND MONITOR STATUS CHECK
# ========================================================================================
# Checks if the background monitoring service is running
echo "🔄 BACKGROUND MONITOR"
echo "---------------------"

PID_FILE="$SCRIPT_DIR/../monitoring/monitor.pid"  # PID file location
if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "✅ Background monitor running (PID: $(cat "$PID_FILE"))"
    echo "   - Monitors workflow changes every 5 minutes"
    echo "   - Triggers sync when changes detected"
    echo "   - Runs validation checks every 30 minutes"
else
    echo "❌ Background monitor not running"
    echo "   - Start with: bash docs/scripts/monitoring/monitor-control.md start"
    # Clean up stale PID file if it exists
    [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
fi
echo ""

# ========================================================================================
# WORKFLOW WATCHER STATUS CHECK
# ========================================================================================
# Checks if the real-time workflow file watcher is active
echo "👀 WORKFLOW WATCHER"
echo "--------------------"

if pgrep -f "workflow-watcher.md" > /dev/null; then
    echo "✅ Workflow watcher active"
    echo "   - Monitors workflow_state.md for changes every 10 seconds"
    echo "   - Triggers immediate sync on file modifications"
    echo "   - Provides real-time synchronization"
else
    echo "❌ Workflow watcher not running"
    echo "   - Start with: bash docs/scripts/automation/workflow-watcher.md &"
fi
echo ""

# ========================================================================================
# VS CODE INTEGRATION STATUS CHECK
# ========================================================================================
# Checks if VS Code tasks are configured for easy sync access
echo "💻 VS CODE INTEGRATION"
echo "----------------------"

if [ -f "$PROJECT_ROOT/.vscode/tasks.json" ]; then
    echo "✅ VS Code sync task configured"
    echo "   - Ctrl+Shift+P → 'Tasks: Run Task' → 'Sync Memory Bank'"
    echo "   - One-click sync from VS Code interface"
    echo "   - Integrated with editor workflow"
else
    echo "❌ VS Code sync task missing"
    echo "   - Run: bash docs/scripts/automation/enhanced-automation.md"
fi
echo ""

# ========================================================================================
# QUICK COMMANDS REFERENCE
# ========================================================================================
# Provides easy access to common automation control commands
echo "=========================================="
echo "Quick Commands:"
echo "  Start monitor:    bash docs/scripts/monitoring/monitor-control.md start"
echo "  Stop monitor:     bash docs/scripts/monitoring/monitor-control.md stop"
echo "  Monitor status:   bash docs/scripts/monitoring/monitor-control.md status"
echo "  Watch workflow:   bash docs/scripts/automation/workflow-watcher.md &"
echo "  Manual sync:      bash docs/scripts/sync-engine.md"
echo "  System status:    bash docs/scripts/monitoring/sync-dashboard.md"
echo "  Run validation:   bash docs/scripts/validation/sync-validator.md"
echo "=========================================="

# ========================================================================================
# LOGGING AND AUDIT
# ========================================================================================
# Log the status check for monitoring and debugging
echo "$(date): Automation status checked - $([ -f "$PID_FILE" ] && echo "Monitor PID: $(cat "$PID_FILE")" || echo "Monitor not running")" >> "$SCRIPT_DIR/../logs/automation-status.log"

# Exit successfully
exit 0