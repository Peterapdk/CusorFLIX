#!/bin/bash
# Enhanced Automation System for Memory Bank Sync
# Container-compatible automation without crontab dependency

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
LOGS_DIR="$SCRIPT_DIR/../logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOGS_DIR/automation.log"
}

setup_git_hooks() {
    echo "Setting up enhanced Git hooks..."

    # Create pre-commit hook for validation
    cat > ".git/hooks/pre-commit" << 'EOF'
#!/bin/bash
# Pre-commit hook for memory bank validation

SCRIPT_DIR="docs/scripts"
if [ -f "$SCRIPT_DIR/validation/sync-validator.md" ]; then
    echo "Running memory bank validation..."
    if bash "$SCRIPT_DIR/validation/sync-validator.md" > /dev/null 2>&1; then
        echo "✅ Memory bank validation passed"
    else
        echo "❌ Memory bank validation failed"
        echo "Run 'bash docs/scripts/sync-engine.md' to synchronize"
        # Don't block commit, just warn
    fi
fi
EOF

    # Create post-commit hook for sync
    cat > ".git/hooks/post-commit-sync" << 'EOF'
#!/bin/bash
# Post-commit hook for memory bank sync

SCRIPT_DIR="docs/scripts"
if [ -f "$SCRIPT_DIR/sync-engine.md" ]; then
    echo "Synchronizing memory bank..."
    if bash "$SCRIPT_DIR/sync-engine.md" > /dev/null 2>&1; then
        echo "✅ Memory bank synchronized"
    else
        echo "❌ Memory bank sync failed"
    fi
fi
EOF

    # Make hooks executable
    chmod +x ".git/hooks/pre-commit"
    chmod +x ".git/hooks/post-commit-sync"

    # Integrate with existing post-commit hook
    if [ -f ".git/hooks/post-commit" ]; then
        # Backup original
        cp ".git/hooks/post-commit" ".git/hooks/post-commit.backup"
        # Append our sync hook
        echo "" >> ".git/hooks/post-commit"
        echo "# Memory Bank Sync" >> ".git/hooks/post-commit"
        cat ".git/hooks/post-commit-sync" >> ".git/hooks/post-commit"
    else
        cp ".git/hooks/post-commit-sync" ".git/hooks/post-commit"
        chmod +x ".git/hooks/post-commit"
    fi

    echo "✅ Enhanced Git hooks configured"
    log "Git hooks setup completed"
}

setup_background_monitor() {
    echo "Setting up background monitoring service..."

    # Create monitoring service script
    cat > "docs/scripts/monitoring/background-monitor.md" << 'EOF'
#!/bin/bash
# Background Memory Bank Monitor

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
LOGS_DIR="$SCRIPT_DIR/../logs"

while true; do
    # Check if workflow_state.md has been modified in the last hour
    if [ -f "$PROJECT_ROOT/docs/cursorkleosr/workflow_state.md" ]; then
        # Get file modification time
        if [[ "$OSTYPE" == "darwin"* ]]; then
            mod_time=$(stat -f %m "$PROJECT_ROOT/docs/cursorkleosr/workflow_state.md")
        else
            mod_time=$(stat -c %Y "$PROJECT_ROOT/docs/cursorkleosr/workflow_state.md")
        fi
        current_time=$(date +%s)
        time_diff=$((current_time - mod_time))

        # If modified within last hour and no recent sync, run sync
        if [ $time_diff -lt 3600 ]; then
            last_sync_file="$PROJECT_ROOT/docs/memory-bank/.sync-metadata.json"
            if [ -f "$last_sync_file" ]; then
                last_sync=$(jq -r '.last_sync' "$last_sync_file" 2>/dev/null || echo "2000-01-01T00:00:00Z")
                last_sync_epoch=$(date -d "$last_sync" +%s 2>/dev/null || echo 0)
                sync_age=$((current_time - last_sync_epoch))

                if [ $sync_age -gt 1800 ]; then  # 30 minutes
                    echo "$(date): Running automated sync (workflow changed $time_diff seconds ago)"
                    bash "$SCRIPT_DIR/../sync-engine.md" >> "$LOGS_DIR/background-sync.log" 2>&1
                fi
            else
                echo "$(date): Running initial automated sync"
                bash "$SCRIPT_DIR/../sync-engine.md" >> "$LOGS_DIR/background-sync.log" 2>&1
            fi
        fi
    fi

    # Run validation every 30 minutes
    if [ $(( $(date +%s) % 1800 )) -eq 0 ]; then
        bash "$SCRIPT_DIR/../validation/sync-validator.md" >> "$LOGS_DIR/background-validation.log" 2>&1
    fi

    sleep 300  # Check every 5 minutes
done
EOF

    chmod +x "docs/scripts/monitoring/background-monitor.md"

    # Create service control script
    cat > "docs/scripts/monitoring/monitor-control.md" << 'EOF'
#!/bin/bash
# Memory Bank Monitor Control

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/background-monitor.md"
PID_FILE="$SCRIPT_DIR/monitor.pid"
LOG_FILE="$SCRIPT_DIR/monitor.log"

case "$1" in
    start)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "Monitor is already running (PID: $(cat "$PID_FILE"))"
            exit 1
        fi

        echo "Starting background monitor..."
        nohup bash "$MONITOR_SCRIPT" > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        echo "Monitor started (PID: $(cat "$PID_FILE"))"
        ;;

    stop)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "Stopping monitor (PID: $(cat "$PID_FILE"))..."
            kill $(cat "$PID_FILE")
            rm -f "$PID_FILE"
            echo "Monitor stopped"
        else
            echo "Monitor is not running"
        fi
        ;;

    status)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "Monitor is running (PID: $(cat "$PID_FILE"))"
            ps -p $(cat "$PID_FILE") -o pid,ppid,cmd
        else
            echo "Monitor is not running"
            [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
        fi
        ;;

    restart)
        $0 stop
        sleep 2
        $0 start
        ;;

    *)
        echo "Usage: $0 {start|stop|status|restart}"
        exit 1
        ;;
esac
EOF

    chmod +x "docs/scripts/monitoring/monitor-control.md"

    echo "✅ Background monitoring service configured"
    log "Background monitor setup completed"
}

setup_workflow_watcher() {
    echo "Setting up workflow file watcher..."

    # Create file watcher script
    cat > "docs/scripts/automation/workflow-watcher.md" << 'EOF'
#!/bin/bash
# Workflow File Watcher

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
WATCH_FILE="$PROJECT_ROOT/docs/cursorkleosr/workflow_state.md"
SYNC_SCRIPT="$SCRIPT_DIR/../sync-engine.md"
LOGS_DIR="$SCRIPT_DIR/../logs"

if [ ! -f "$WATCH_FILE" ]; then
    echo "Workflow file not found: $WATCH_FILE"
    exit 1
fi

# Get initial file stats
if [[ "$OSTYPE" == "darwin"* ]]; then
    initial_mtime=$(stat -f %m "$WATCH_FILE")
else
    initial_mtime=$(stat -c %Y "$WATCH_FILE")
fi

echo "Watching workflow file for changes..."
echo "Press Ctrl+C to stop"

while true; do
    # Check file modification time
    if [[ "$OSTYPE" == "darwin"* ]]; then
        current_mtime=$(stat -f %m "$WATCH_FILE")
    else
        current_mtime=$(stat -c %Y "$WATCH_FILE")
    fi

    if [ "$current_mtime" != "$initial_mtime" ]; then
        echo "$(date): Workflow file changed, running sync..."
        if bash "$SYNC_SCRIPT" >> "$LOGS_DIR/watcher-sync.log" 2>&1; then
            echo "✅ Sync completed successfully"
        else
            echo "❌ Sync failed"
        fi
        initial_mtime=$current_mtime
    fi

    sleep 10  # Check every 10 seconds
done
EOF

    chmod +x "docs/scripts/automation/workflow-watcher.md"

    echo "✅ Workflow file watcher configured"
    log "Workflow watcher setup completed"
}

setup_auto_sync_on_edit() {
    echo "Setting up auto-sync triggers..."

    # Create VS Code task for auto-sync
    mkdir -p "$PROJECT_ROOT/.vscode"
    cat > "$PROJECT_ROOT/.vscode/tasks.json" << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Sync Memory Bank",
            "type": "shell",
            "command": "bash",
            "args": ["docs/scripts/sync-engine.md"],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "silent",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": []
        }
    ]
}
EOF

    # Create VS Code extension recommendation for file watchers
    cat > "$PROJECT_ROOT/.vscode/extensions.json" << 'EOF'
{
    "recommendations": [
        "ms-vscode.vscode-json",
        "gruntfuggly.todo-tree",
        "christian-kohler.path-intellisense"
    ]
}
EOF

    echo "✅ Auto-sync triggers configured"
    log "Auto-sync triggers setup completed"
}

create_automation_status() {
    echo "Creating automation status dashboard..."

    cat > "$SCRIPT_DIR/automation/automation-status.md" << 'EOF'
#!/bin/bash
# Automation Status Dashboard

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "=========================================="
echo "  Memory Bank Automation Status"
echo "=========================================="
echo "Time: $(date)"
echo ""

# Check Git hooks
echo "🔗 GIT HOOKS"
echo "------------"
if [ -x "$PROJECT_ROOT/.git/hooks/pre-commit" ]; then
    echo "✅ Pre-commit validation hook active"
else
    echo "❌ Pre-commit validation hook missing"
fi

if grep -q "Memory Bank Sync" "$PROJECT_ROOT/.git/hooks/post-commit" 2>/dev/null; then
    echo "✅ Post-commit sync hook active"
else
    echo "❌ Post-commit sync hook missing"
fi
echo ""

# Check background monitor
echo "🔄 BACKGROUND MONITOR"
echo "---------------------"
PID_FILE="$SCRIPT_DIR/../monitoring/monitor.pid"
if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "✅ Background monitor running (PID: $(cat "$PID_FILE"))"
else
    echo "❌ Background monitor not running"
    [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
fi
echo ""

# Check workflow watcher
echo "👀 WORKFLOW WATCHER"
echo "--------------------"
if pgrep -f "workflow-watcher.md" > /dev/null; then
    echo "✅ Workflow watcher active"
else
    echo "❌ Workflow watcher not running"
fi
echo ""

# Check VS Code integration
echo "💻 VS CODE INTEGRATION"
echo "----------------------"
if [ -f "$PROJECT_ROOT/.vscode/tasks.json" ]; then
    echo "✅ VS Code sync task configured"
else
    echo "❌ VS Code sync task missing"
fi
echo ""

echo "=========================================="
echo "Quick Commands:"
echo "  Start monitor: bash docs/scripts/monitoring/monitor-control.md start"
echo "  Stop monitor:  bash docs/scripts/monitoring/monitor-control.md stop"
echo "  Watch workflow: bash docs/scripts/automation/workflow-watcher.md"
echo "  Manual sync:    bash docs/scripts/sync-engine.md"
echo "=========================================="
EOF

    chmod +x "docs/scripts/automation/automation-status.md"

    echo "✅ Automation status dashboard created"
    log "Automation status dashboard created"
}

main() {
    echo "Enhanced Memory Bank Automation Setup"
    echo "======================================"

    setup_git_hooks
    echo ""

    setup_background_monitor
    echo ""

    setup_workflow_watcher
    echo ""

    setup_auto_sync_on_edit
    echo ""

    create_automation_status
    echo ""

    echo "🎉 Enhanced automation setup completed!"
    echo ""
    echo "Available automation features:"
    echo "  • Git pre-commit validation"
    echo "  • Git post-commit synchronization"
    echo "  • Background monitoring service"
    echo "  • Workflow file watcher"
    echo "  • VS Code integration"
    echo "  • Automation status dashboard"
    echo ""
    echo "Quick start commands:"
    echo "  Check status: bash docs/scripts/automation/automation-status.md"
    echo "  Start monitor: bash docs/scripts/monitoring/monitor-control.md start"
    echo "  Watch workflow: bash docs/scripts/automation/workflow-watcher.md &"
    echo ""
    echo "All automation is now configured and ready to use!"
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi