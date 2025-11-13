#!/bin/bash
# Setup Automated Memory Bank Synchronization

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "Setting up automated memory bank synchronization..."

# Create cron job for daily sync
setup_cron_job() {
    local sync_script="$SCRIPT_DIR/../sync-engine.md"
    local cron_entry="0 6 * * * cd $PROJECT_ROOT && bash $sync_script"

    echo "Setting up daily cron job..."
    echo "Cron entry: $cron_entry"

    # Check if cron entry already exists
    if crontab -l | grep -q "sync-engine.md"; then
        echo "Cron job already exists. Skipping..."
    else
        # Add to crontab
        (crontab -l ; echo "$cron_entry") | crontab -
        echo "✅ Cron job added for daily sync at 6 AM"
    fi
}

# Setup git hooks for sync on commit
setup_git_hooks() {
    local git_hooks_dir="$PROJECT_ROOT/.git/hooks"
    local post_commit_hook="$git_hooks_dir/post-commit"
    local sync_script="$SCRIPT_DIR/../sync-engine.md"

    echo "Setting up git hooks..."

    # Create post-commit hook
    cat > "$post_commit_hook" << EOF
#!/bin/bash
# Post-commit hook for memory bank sync

echo "Running memory bank synchronization..."
cd "$PROJECT_ROOT"
if bash "$sync_script"; then
    echo "✅ Memory bank synchronized"
else
    echo "❌ Memory bank sync failed"
fi
EOF

    # Make executable
    chmod +x "$post_commit_hook"
    echo "✅ Git post-commit hook created"
}

# Setup validation monitoring
setup_monitoring() {
    local monitor_script="$SCRIPT_DIR/monitor-sync.md"
    local cron_entry="*/30 * * * * cd $PROJECT_ROOT && bash $monitor_script"

    echo "Setting up monitoring..."

    # Create monitoring script
    cat > "$monitor_script" << EOF
#!/bin/bash
# Monitor memory bank synchronization status

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="\$SCRIPT_DIR/logs"
VALIDATION_LOG="\$LOGS_DIR/validation-\$(date +%Y%m%d).log"

# Run validation
if bash "\$SCRIPT_DIR/validation/sync-validator.md" > "\$VALIDATION_LOG" 2>&1; then
    echo "✅ Sync validation passed at \$(date)"
else
    echo "❌ Sync validation failed at \$(date)"
    echo "Check log: \$VALIDATION_LOG"

    # Send alert (could integrate with notification system)
    # send_alert "Memory bank sync validation failed"
fi
EOF

    chmod +x "$monitor_script"

    # Add to cron for every 30 minutes
    if ! crontab -l | grep -q "monitor-sync.md"; then
        (crontab -l ; echo "$cron_entry") | crontab -
        echo "✅ Monitoring cron job added (every 30 minutes)"
    fi
}

# Setup logging
setup_logging() {
    local logs_dir="$SCRIPT_DIR/logs"

    echo "Setting up logging..."

    mkdir -p "$logs_dir"

    # Create log rotation script
    cat > "$SCRIPT_DIR/rotate-logs.md" << EOF
#!/bin/bash
# Rotate sync logs

LOGS_DIR="\$SCRIPT_DIR/logs"
MAX_AGE=30  # days

echo "Rotating logs older than \$MAX_AGE days..."

find "\$LOGS_DIR" -name "*.log" -mtime +\$MAX_AGE -delete
find "\$LOGS_DIR" -name "*.tmp" -mtime +1 -delete

echo "✅ Log rotation completed"
EOF

    chmod +x "$SCRIPT_DIR/rotate-logs.md"

    # Add weekly log rotation
    local cron_entry="0 2 * * 0 cd $PROJECT_ROOT && bash $SCRIPT_DIR/rotate-logs.md"
    if ! crontab -l | grep -q "rotate-logs.md"; then
        (crontab -l ; echo "$cron_entry") | crontab -
        echo "✅ Weekly log rotation scheduled"
    fi
}

# Main setup function
main() {
    echo "Memory Bank Automation Setup"
    echo "============================"

    setup_cron_job
    echo ""

    setup_git_hooks
    echo ""

    setup_monitoring
    echo ""

    setup_logging
    echo ""

    echo "🎉 Automation setup completed!"
    echo ""
    echo "Active automations:"
    echo "  • Daily sync at 6 AM"
    echo "  • Post-commit sync"
    echo "  • 30-minute validation monitoring"
    echo "  • Weekly log rotation"
    echo ""
    echo "Check crontab with: crontab -l"
    echo "Check git hooks in: .git/hooks/"
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi