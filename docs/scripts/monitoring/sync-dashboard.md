#!/bin/bash
# Memory Bank Sync Monitoring Dashboard

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
LOGS_DIR="$SCRIPT_DIR/logs"
MEMORY_BANK_DIR="$PROJECT_ROOT/memory-bank"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Dashboard functions
show_header() {
    echo "========================================"
    echo "  Memory Bank Sync Monitoring Dashboard"
    echo "========================================"
    echo "Time: $(date)"
    echo ""
}

show_sync_status() {
    echo "🔄 SYNC STATUS"
    echo "-------------"

    # Check if sync metadata exists
    local metadata_file="$MEMORY_BANK_DIR/.sync-metadata.json"
    if [ -f "$metadata_file" ]; then
        local last_sync=$(jq -r '.last_sync' "$metadata_file" 2>/dev/null)
        local status=$(jq -r '.validation_status' "$metadata_file" 2>/dev/null)

        if [ "$status" = "passed" ]; then
            echo -e "${GREEN}✅ Last Sync:${NC} $last_sync"
        else
            echo -e "${RED}❌ Last Sync:${NC} $last_sync (Status: $status)"
        fi
    else
        echo -e "${RED}❌ No sync metadata found${NC}"
    fi
    echo ""
}

show_file_status() {
    echo "📁 FILE STATUS"
    echo "-------------"

    local files=("active-context.md" "progress.md" "decision-log.md" "product-context.md")
    local all_good=true

    for file in "${files[@]}"; do
        if [ -f "$MEMORY_BANK_DIR/$file" ]; then
            local size=$(stat -f%z "$MEMORY_BANK_DIR/$file" 2>/dev/null || stat -c%s "$MEMORY_BANK_DIR/$file" 2>/dev/null)
            local modified=$(stat -f%Sm -t "%Y-%m-%d %H:%M" "$MEMORY_BANK_DIR/$file" 2>/dev/null || stat -c"%y" "$MEMORY_BANK_DIR/$file" 2>/dev/null | cut -d'.' -f1)

            if [ "$size" -gt 0 ]; then
                echo -e "${GREEN}✅ $file${NC} ($size bytes, $modified)"
            else
                echo -e "${RED}❌ $file${NC} (empty, $modified)"
                all_good=false
            fi
        else
            echo -e "${RED}❌ $file${NC} (missing)"
            all_good=false
        fi
    done

    if [ "$all_good" = true ]; then
        echo -e "${GREEN}✅ All files present and valid${NC}"
    else
        echo -e "${RED}❌ Some files have issues${NC}"
    fi
    echo ""
}

show_recent_activity() {
    echo "📊 RECENT ACTIVITY"
    echo "------------------"

    # Show recent log entries
    if [ -d "$LOGS_DIR" ]; then
        local recent_logs=$(find "$LOGS_DIR" -name "*.log" -mtime -1 | head -5)
        if [ -n "$recent_logs" ]; then
            echo "Recent log files:"
            echo "$recent_logs" | while read -r log; do
                local size=$(stat -f%z "$log" 2>/dev/null || stat -c%s "$log" 2>/dev/null)
                local modified=$(stat -f%Sm -t "%H:%M" "$log" 2>/dev/null || stat -c%s "$log" 2>/dev/null | cut -d'.' -f1)
                echo "  $(basename "$log") ($size bytes, $modified)"
            done
        else
            echo "No recent log activity"
        fi
    else
        echo "Logs directory not found"
    fi
    echo ""
}

show_performance_metrics() {
    echo "⚡ PERFORMANCE METRICS"
    echo "---------------------"

    # Calculate sync frequency
    if [ -f "$MEMORY_BANK_DIR/.sync-metadata.json" ]; then
        local last_sync=$(jq -r '.last_sync' "$MEMORY_BANK_DIR/.sync-metadata.json" 2>/dev/null)
        if [ -n "$last_sync" ]; then
            local last_sync_epoch=$(date -d "$last_sync" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$last_sync" +%s 2>/dev/null)
            local now_epoch=$(date +%s)
            local hours_since=$(( (now_epoch - last_sync_epoch) / 3600 ))

            if [ $hours_since -lt 24 ]; then
                echo -e "${GREEN}✅ Last sync: $hours_since hours ago${NC}"
            elif [ $hours_since -lt 48 ]; then
                echo -e "${YELLOW}⚠️  Last sync: $hours_since hours ago${NC}"
            else
                echo -e "${RED}❌ Last sync: $hours_since hours ago${NC}"
            fi
        fi
    fi

    # Show file sizes
    echo "File sizes:"
    local files=("active-context.md" "progress.md" "decision-log.md" "product-context.md")
    for file in "${files[@]}"; do
        if [ -f "$MEMORY_BANK_DIR/$file" ]; then
            local size=$(stat -f%z "$MEMORY_BANK_DIR/$file" 2>/dev/null || stat -c%s "$MEMORY_BANK_DIR/$file" 2>/dev/null)
            echo "  $file: $size bytes"
        fi
    done
    echo ""
}

show_recommendations() {
    echo "💡 RECOMMENDATIONS"
    echo "------------------"

    local issues_found=false

    # Check sync status
    if [ -f "$MEMORY_BANK_DIR/.sync-metadata.json" ]; then
        local last_sync=$(jq -r '.last_sync' "$MEMORY_BANK_DIR/.sync-metadata.json" 2>/dev/null)
        if [ -n "$last_sync" ]; then
            local last_sync_epoch=$(date -d "$last_sync" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$last_sync" +%s 2>/dev/null)
            local now_epoch=$(date +%s)
            local hours_since=$(( (now_epoch - last_sync_epoch) / 3600 ))

            if [ $hours_since -gt 48 ]; then
                echo -e "${RED}❌ Run manual sync - last sync too old${NC}"
                issues_found=true
            fi
        fi
    else
        echo -e "${RED}❌ Run initial sync - no sync metadata found${NC}"
        issues_found=true
    fi

    # Check file status
    local files=("active-context.md" "progress.md" "decision-log.md" "product-context.md")
    for file in "${files[@]}"; do
        if [ ! -f "$MEMORY_BANK_DIR/$file" ] || [ ! -s "$MEMORY_BANK_DIR/$file" ]; then
            echo -e "${RED}❌ Fix missing/empty file: $file${NC}"
            issues_found=true
        fi
    done

    if [ "$issues_found" = false ]; then
        echo -e "${GREEN}✅ All systems operational${NC}"
    fi
    echo ""
}

# Main dashboard function
main() {
    show_header
    show_sync_status
    show_file_status
    show_recent_activity
    show_performance_metrics
    show_recommendations

    echo "=========================================="
    echo "Dashboard completed at $(date)"
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi