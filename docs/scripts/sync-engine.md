#!/bin/bash
# Memory Bank Sync Engine
# Core synchronization logic for dual memory system

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CURSORKLEOSR_DIR="$PROJECT_ROOT/docs/cursorkleosr"
MEMORY_BANK_DIR="$PROJECT_ROOT/docs/memory-bank"
LOGS_DIR="$SCRIPT_DIR/logs"

# Load configuration
CONFIG_FILE="$SCRIPT_DIR/sync-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "sync": {
    "enabled": true,
    "frequency": "on_demand",
    "auto_commit": false,
    "validation": "strict"
  },
  "logging": {
    "level": "info",
    "file": "sync-engine.log",
    "max_size": "10MB",
    "retention": "30d"
  },
  "transformers": {
    "workflow_to_progress": true,
    "workflow_to_context": true,
    "decisions_to_log": true,
    "metrics_to_product": true
  },
  "validation": {
    "data_integrity": true,
    "consistency_checks": true,
    "conflict_resolution": "latest_wins"
  }
}
EOF
fi

# Load utilities
source "$SCRIPT_DIR/utilities.sh"

# Main sync function
sync_memory_bank() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    log "INFO" "Starting memory bank synchronization at $timestamp"

    # Validate source data
    if ! validate_cursorkleosr_data; then
        log "ERROR" "Source data validation failed"
        return 1
    fi

    # Extract data sections
    extract_workflow_data

    # Transform and sync
    transform_workflow_to_progress
    transform_workflow_to_context
    transform_decisions_to_log
    transform_metrics_to_product

    # Validate results
    if ! validate_sync_results; then
        log "ERROR" "Sync validation failed"
        return 1
    fi

    # Update sync metadata
    update_sync_metadata

    log "INFO" "Memory bank synchronization completed successfully"
    return 0
}

# Validation functions
validate_cursorkleosr_data() {
    log "DEBUG" "Validating cursorkleosr data integrity"

    # Check if workflow_state.md exists
    if [ ! -f "$CURSORKLEOSR_DIR/workflow_state.md" ]; then
        log "ERROR" "workflow_state.md not found"
        return 1
    fi

    # Validate required sections
    local required_sections=("STATE" "PLAN" "ITEMS" "METRICS" "LOG")
    for section in "${required_sections[@]}"; do
        if ! grep -q "<!-- DYNAMIC:${section}:START -->" "$CURSORKLEOSR_DIR/workflow_state.md"; then
            log "ERROR" "Required section $section not found"
            return 1
        fi
    done

    log "DEBUG" "Source data validation passed"
    return 0
}

validate_sync_results() {
    log "DEBUG" "Validating sync results"

    # Check if all target files exist
    local target_files=("active-context.md" "progress.md" "decision-log.md" "product-context.md")
    for file in "${target_files[@]}"; do
        if [ ! -f "$MEMORY_BANK_DIR/$file" ]; then
            log "ERROR" "Target file $file not created"
            return 1
        fi
    done

    # Validate file content
    for file in "${target_files[@]}"; do
        if [ ! -s "$MEMORY_BANK_DIR/$file" ]; then
            log "ERROR" "Target file $file is empty"
            return 1
        fi
    done

    log "DEBUG" "Sync results validation passed"
    return 0
}

# Data extraction functions
extract_workflow_data() {
    log "DEBUG" "Extracting workflow data sections"

    # Extract each section to temporary files
    extract_section "STATE" > "$LOGS_DIR/state.tmp"
    extract_section "PLAN" > "$LOGS_DIR/plan.tmp"
    extract_section "ITEMS" > "$LOGS_DIR/items.tmp"
    extract_section "METRICS" > "$LOGS_DIR/metrics.tmp"
    extract_section "LOG" > "$LOGS_DIR/log.tmp"

    log "DEBUG" "Workflow data extraction completed"
}

extract_section() {
    local section="$1"
    local start_marker="<!-- DYNAMIC:${section}:START -->"
    local end_marker="<!-- DYNAMIC:${section}:END -->"

    sed -n "/$start_marker/,/$end_marker/p" "$CURSORKLEOSR_DIR/workflow_state.md" | \
    sed '1d;$d'  # Remove markers
}

# Transformation functions
transform_workflow_to_progress() {
    log "DEBUG" "Transforming workflow data to progress format"

    local plan_content=$(cat "$LOGS_DIR/plan.tmp")
    local items_content=$(cat "$LOGS_DIR/items.tmp")
    local metrics_content=$(cat "$LOGS_DIR/metrics.tmp")

    # Generate progress content
    cat > "$MEMORY_BANK_DIR/progress.md" << EOF
# Project Progress

## Current Status
$(extract_status_from_metrics "$metrics_content")

## Completed Milestones
$(extract_completed_tasks "$plan_content")

## Work Items Summary
$(extract_work_items_summary "$items_content")

## Next Priorities
$(extract_pending_tasks "$plan_content")

---
*Last synchronized: $(date '+%Y-%m-%d %H:%M:%S')*
*Source: cursorkleosr/workflow_state.md*
EOF

    log "DEBUG" "Progress transformation completed"
}

transform_workflow_to_context() {
    log "DEBUG" "Transforming workflow data to active context"

    local state_content=$(cat "$LOGS_DIR/state.tmp")
    local plan_content=$(cat "$LOGS_DIR/plan.tmp")

    # Generate active context
    cat > "$MEMORY_BANK_DIR/active-context.md" << EOF
# Current Context

## Ongoing Tasks
$(extract_current_tasks "$state_content")

## Known Issues
$(extract_known_issues "$state_content")

## Next Steps
$(extract_next_steps "$plan_content")

## Current Session Notes
- Memory bank synchronized: $(date '+%Y-%m-%d %H:%M:%S')
- Source data validated and transformed
- Ready for AI assistant integration

---
*Last synchronized: $(date '+%Y-%m-%d %H:%M:%S')*
*Source: cursorkleosr/workflow_state.md*
*Auto-generated from cursorkleosr workflow tracking*
EOF

    log "DEBUG" "Context transformation completed"
}

transform_decisions_to_log() {
    log "DEBUG" "Transforming log data to decision format"

    local log_content=$(cat "$LOGS_DIR/log.tmp")

    # Generate decision log
    cat > "$MEMORY_BANK_DIR/decision-log.md" << EOF
# Decision Log

## Recent Implementation Decisions
$(transform_log_entries "$log_content")

## System Architecture Decisions
- Memory bank synchronization: Automated dual-system sync
- Data consistency: Validation and conflict resolution
- Performance optimization: Caching and incremental updates

---
*Last synchronized: $(date '+%Y-%m-%d %H:%M:%S')*
EOF

    log "DEBUG" "Decision log transformation completed"
}

transform_metrics_to_product() {
    log "DEBUG" "Transforming metrics to product context"

    local metrics_content=$(cat "$LOGS_DIR/metrics.tmp")

    # Generate product context
    cat > "$MEMORY_BANK_DIR/product-context.md" << EOF
# Product Context

## Project Overview
CinemaRebel is a modern movie and TV show discovery platform built with Next.js 15, featuring comprehensive media data integration and personalized user experiences.

## Current Capabilities
$(extract_capabilities_from_metrics "$metrics_content")

## Technical Architecture
- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Prisma ORM, PostgreSQL
- External APIs: TMDB API with caching and rate limiting
- Deployment: Optimized for Vercel with performance monitoring

## Quality Metrics
$(extract_quality_metrics "$metrics_content")

## Development Status
$(extract_development_status "$metrics_content")

---
*Last synchronized: $(date '+%Y-%m-%d %H:%M:%S')*
*Source: cursorkleosr/workflow_state.md*
*Metrics synchronized from cursorkleosr workflow tracking*
EOF

    log "DEBUG" "Product context transformation completed"
}

# Utility functions
extract_status_from_metrics() {
    local metrics="$1"
    echo "$metrics" | grep -E "(Tasks|Success|Quality)" | sed 's/##/#/' | head -5
}

extract_completed_tasks() {
    local plan="$1"
    echo "$plan" | grep "✅" | sed 's/- ✅/- /' | tail -10
}

extract_work_items_summary() {
    local items="$1"
    echo "$items" | tail -n +3 | head -10 | sed 's/|/: /g' | sed 's/^/- /'
}

extract_pending_tasks() {
    local plan="$1"
    echo "$plan" | grep -v "✅" | head -5
}

extract_current_tasks() {
    local state="$1"
    echo "$state" | grep "Item:" | grep -v "COMPLETED" | sed 's/Item: /- /' | head -5
}

extract_known_issues() {
    local state="$1"
    echo "- Memory bank synchronization in progress"
    echo "- System optimization implementation ongoing"
}

extract_next_steps() {
    local plan="$1"
    echo "$plan" | grep -E "(⏳|pending)" | sed 's/- ⏳/- /' | head -5
}

transform_log_entries() {
    local log="$1"
    echo "$log" | grep '"timestamp"' | head -10 | \
    sed 's/},/}\n/g' | \
    sed 's/{"timestamp":/- **/g' | \
    sed 's/"action":/"** - /g' | \
    sed 's/"phase":/Phase: /g' | \
    sed 's/"status":/Status: /g' | \
    sed 's/"details":/Details: /g' | \
    sed 's/}/\n/g'
}

extract_capabilities_from_metrics() {
    echo "- Movie and TV show discovery with advanced filters"
    echo "- User watchlist and custom list management"
    echo "- Responsive design for all devices"
    echo "- Comprehensive API documentation"
}

extract_quality_metrics() {
    local metrics="$1"
    echo "$metrics" | grep -E "(lint_errors|type_errors|test_failures|coverage)" | sed 's/##/#/'
}

extract_development_status() {
    local metrics="$1"
    echo "$metrics" | grep -E "(features_implemented|code_lines|tasks_completed)" | sed 's/##/#/'
}

update_sync_metadata() {
    log "DEBUG" "Updating sync metadata"

    # Create sync metadata file
    cat > "$MEMORY_BANK_DIR/.sync-metadata.json" << EOF
{
  "last_sync": "$(date '+%Y-%m-%dT%H:%M:%SZ')",
  "source_version": "$(git log -1 --format='%H' -- "$CURSORKLEOSR_DIR/workflow_state.md" 2>/dev/null || echo "untracked")",
  "sync_engine_version": "1.0.0",
  "validation_status": "passed",
  "transformed_files": [
    "active-context.md",
    "progress.md",
    "decision-log.md",
    "product-context.md"
  ]
}
EOF

    log "DEBUG" "Sync metadata updated"
}

# Main execution
main() {
    log "INFO" "Memory Bank Sync Engine starting"

    if sync_memory_bank; then
        log "INFO" "Synchronization completed successfully"
        exit 0
    else
        log "ERROR" "Synchronization failed"
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi