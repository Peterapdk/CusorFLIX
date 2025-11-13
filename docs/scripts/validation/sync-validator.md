#!/bin/bash
# Sync Validation System
# Validates memory bank synchronization integrity

validate_sync_integrity() {
    local cursorkleosr_dir="$1"
    local memory_bank_dir="$2"
    local log_file="$3"

    echo "Starting sync validation..." | tee -a "$log_file"

    # Test 1: Source data accessibility
    if ! validate_source_access "$cursorkleosr_dir"; then
        echo "❌ Source data validation failed" | tee -a "$log_file"
        return 1
    fi

    # Test 2: Target directory structure
    if ! validate_target_structure "$memory_bank_dir"; then
        echo "❌ Target structure validation failed" | tee -a "$log_file"
        return 1
    fi

    # Test 3: Data transformation accuracy
    if ! validate_transformation_accuracy "$cursorkleosr_dir" "$memory_bank_dir"; then
        echo "❌ Transformation accuracy validation failed" | tee -a "$log_file"
        return 1
    fi

    # Test 4: Content consistency
    if ! validate_content_consistency "$memory_bank_dir"; then
        echo "❌ Content consistency validation failed" | tee -a "$log_file"
        return 1
    fi

    # Test 5: Sync metadata integrity
    if ! validate_sync_metadata "$memory_bank_dir"; then
        echo "❌ Sync metadata validation failed" | tee -a "$log_file"
        return 1
    fi

    echo "✅ All sync validations passed" | tee -a "$log_file"
    return 0
}

validate_source_access() {
    local source_dir="$1"

    echo "  Validating source data access..." | tee -a "$log_file"

    # Check directory exists
    if [ ! -d "$source_dir" ]; then
        echo "    ❌ Source directory does not exist: $source_dir" | tee -a "$log_file"
        return 1
    fi

    # Check workflow_state.md exists
    if [ ! -f "$source_dir/workflow_state.md" ]; then
        echo "    ❌ workflow_state.md not found" | tee -a "$log_file"
        return 1
    fi

    # Check file is readable
    if [ ! -r "$source_dir/workflow_state.md" ]; then
        echo "    ❌ workflow_state.md is not readable" | tee -a "$log_file"
        return 1
    fi

    # Check file has content
    if [ ! -s "$source_dir/workflow_state.md" ]; then
        echo "    ❌ workflow_state.md is empty" | tee -a "$log_file"
        return 1
    fi

    echo "    ✅ Source data access validated" | tee -a "$log_file"
    return 0
}

validate_target_structure() {
    local target_dir="$1"

    echo "  Validating target directory structure..." | tee -a "$log_file"

    # Check directory exists
    if [ ! -d "$target_dir" ]; then
        echo "    ❌ Target directory does not exist: $target_dir" | tee -a "$log_file"
        return 1
    fi

    # Check required files exist
    local required_files=("active-context.md" "progress.md" "decision-log.md" "product-context.md")
    for file in "${required_files[@]}"; do
        if [ ! -f "$target_dir/$file" ]; then
            echo "    ❌ Required file missing: $file" | tee -a "$log_file"
            return 1
        fi
    done

    # Check files are writable
    for file in "${required_files[@]}"; do
        if [ ! -w "$target_dir/$file" ]; then
            echo "    ❌ File not writable: $file" | tee -a "$log_file"
            return 1
        fi
    done

    echo "    ✅ Target directory structure validated" | tee -a "$log_file"
    return 0
}

validate_transformation_accuracy() {
    local source_dir="$1"
    local target_dir="$2"

    echo "  Validating transformation accuracy..." | tee -a "$log_file"

    # Extract key metrics from source
    local source_metrics=$(extract_metrics_from_source "$source_dir/workflow_state.md")
    local target_metrics=$(extract_metrics_from_target "$target_dir")

    # Compare key metrics
    if [ "$source_metrics" != "$target_metrics" ]; then
        echo "    ❌ Metrics mismatch:" | tee -a "$log_file"
        echo "        Source: $source_metrics" | tee -a "$log_file"
        echo "        Target: $target_metrics" | tee -a "$log_file"
        return 1
    fi

    echo "    ✅ Transformation accuracy validated" | tee -a "$log_file"
    return 0
}

validate_content_consistency() {
    local target_dir="$1"

    echo "  Validating content consistency..." | tee -a "$log_file"

    # Check all files have sync markers
    local files=("active-context.md" "progress.md" "decision-log.md" "product-context.md")
    for file in "${files[@]}"; do
        if ! grep -q "Last synchronized:" "$target_dir/$file"; then
            echo "    ❌ Missing sync marker in $file" | tee -a "$log_file"
            return 1
        fi
    done

    # Check files are not empty
    for file in "${files[@]}"; do
        if [ ! -s "$target_dir/$file" ]; then
            echo "    ❌ File is empty: $file" | tee -a "$log_file"
            return 1
        fi
    done

    # Check files have reasonable content length
    for file in "${files[@]}"; do
        local lines=$(wc -l < "$target_dir/$file")
        if [ "$lines" -lt 5 ]; then
            echo "    ❌ File too short: $file ($lines lines)" | tee -a "$log_file"
            return 1
        fi
    done

    echo "    ✅ Content consistency validated" | tee -a "$log_file"
    return 0
}

validate_sync_metadata() {
    local target_dir="$1"

    echo "  Validating sync metadata..." | tee -a "$log_file"

    local metadata_file="$target_dir/.sync-metadata.json"

    # Check metadata file exists
    if [ ! -f "$metadata_file" ]; then
        echo "    ❌ Sync metadata file missing" | tee -a "$log_file"
        return 1
    fi

    # Validate JSON structure
    if ! jq empty "$metadata_file" 2>/dev/null; then
        echo "    ❌ Invalid JSON in sync metadata" | tee -a "$log_file"
        return 1
    fi

    # Check required fields
    local last_sync=$(jq -r '.last_sync' "$metadata_file")
    local source_version=$(jq -r '.source_version' "$metadata_file")

    if [ -z "$last_sync" ] || [ "$last_sync" = "null" ]; then
        echo "    ❌ Missing last_sync in metadata" | tee -a "$log_file"
        return 1
    fi

    if [ "$source_version" = "null" ]; then
        echo "    ❌ Missing source_version in metadata" | tee -a "$log_file"
        return 1
    fi

    echo "    ✅ Sync metadata validated" | tee -a "$log_file"
    return 0
}

# Utility functions
extract_metrics_from_source() {
    local file="$1"
    # Extract key metrics (simplified)
    grep -o "Tasks: [0-9]*/[0-9]*" "$file" | head -1
}

extract_metrics_from_target() {
    local dir="$1"
    # Extract metrics from target files (simplified)
    grep -r "Tasks:" "$dir" | head -1 | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# Main validation function
main() {
    local cursorkleosr_dir="${1:-../cursorkleosr}"
    local memory_bank_dir="${2:-../memory-bank}"
    local log_file="${3:-logs/validation-$(date +%Y%m%d).log}"

    echo "Memory Bank Sync Validation" > "$log_file"
    echo "Started: $(date)" >> "$log_file"
    echo "Source: $cursorkleosr_dir" >> "$log_file"
    echo "Target: $memory_bank_dir" >> "$log_file"
    echo "" >> "$log_file"

    if validate_sync_integrity "$cursorkleosr_dir" "$memory_bank_dir" "$log_file"; then
        echo "" >> "$log_file"
        echo "Validation completed successfully at $(date)" >> "$log_file"
        exit 0
    else
        echo "" >> "$log_file"
        echo "Validation failed at $(date)" >> "$log_file"
        exit 1
    fi
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi