#!/bin/bash
# Utility functions for memory bank sync operations

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="$SCRIPT_DIR/logs/sync-engine.log"

    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$log_file")"

    # Log to file
    echo "[$timestamp] [$level] $message" >> "$log_file"

    # Also log to console for important messages
    case "$level" in
        "ERROR")
            echo "❌ $message" >&2
            ;;
        "WARN")
            echo "⚠️  $message" >&2
            ;;
        "INFO")
            echo "ℹ️  $message"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get file modification time
get_file_mod_time() {
    local file="$1"

    if command_exists stat; then
        # macOS/BSD stat
        stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || echo "unknown"
    else
        # GNU stat (Linux)
        stat -c "%y" "$file" 2>/dev/null | cut -d'.' -f1 || echo "unknown"
    fi
}

# Function to calculate time difference in hours
hours_since() {
    local timestamp="$1"
    local now=$(date +%s)
    local then=$(date -d "$timestamp" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$timestamp" +%s 2>/dev/null || echo 0)

    if [ "$then" = "0" ]; then
        echo "unknown"
    else
        echo $(( (now - then) / 3600 ))
    fi
}

# Function to validate JSON
validate_json() {
    local file="$1"

    if command_exists jq; then
        jq empty "$file" 2>/dev/null
        return $?
    else
        # Fallback: try to parse with python
        python3 -m json.tool "$file" >/dev/null 2>&1
        return $?
    fi
}

# Function to create backup
create_backup() {
    local file="$1"
    local backup_dir="$SCRIPT_DIR/backups"
    local timestamp=$(date '+%Y%m%d_%H%M%S')

    mkdir -p "$backup_dir"

    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/$(basename "$file").$timestamp.bak"
        log "INFO" "Backup created: $backup_dir/$(basename "$file").$timestamp.bak"
    fi
}

# Function to send notification (placeholder for future integration)
send_notification() {
    local title="$1"
    local message="$2"

    # Placeholder for notification system integration
    # Could integrate with Slack, email, etc.
    log "INFO" "Notification: $title - $message"
}

# Function to check system requirements
check_requirements() {
    local missing_deps=()

    # Check for required commands
    local required_commands=("jq" "git" "date")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            missing_deps+=("$cmd")
        fi
    done

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "ERROR" "Missing required dependencies: ${missing_deps[*]}"
        return 1
    fi

    log "INFO" "System requirements check passed"
    return 0
}

# Function to get git commit info
get_git_info() {
    local file="$1"

    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        local commit_hash=$(git log -1 --format="%H" -- "$file" 2>/dev/null || echo "unknown")
        local last_modified=$(git log -1 --format="%ai" -- "$file" 2>/dev/null || echo "unknown")

        echo "{\"commit\": \"$commit_hash\", \"modified\": \"$last_modified\"}"
    else
        echo "{\"commit\": \"untracked\", \"modified\": \"unknown\"}"
    fi
}

# Function to format file size
format_file_size() {
    local size="$1"

    if [ "$size" -gt 1048576 ]; then
        echo "$(( size / 1048576 ))MB"
    elif [ "$size" -gt 1024 ]; then
        echo "$(( size / 1024 ))KB"
    else
        echo "${size}B"
    fi
}

# Function to sanitize filename
sanitize_filename() {
    local filename="$1"
    # Remove or replace problematic characters
    echo "$filename" | sed 's/[^a-zA-Z0-9._-]/_/g'
}

# Function to create temporary file
create_temp_file() {
    local prefix="${1:-tmp}"
    local temp_file

    if command_exists mktemp; then
        temp_file=$(mktemp -t "${prefix}_XXXXXX")
    else
        # Fallback for systems without mktemp
        temp_file="/tmp/${prefix}_$$_$RANDOM"
    fi

    echo "$temp_file"
}

# Function to cleanup temporary files
cleanup_temp_files() {
    local pattern="$1"

    if [ -n "$pattern" ]; then
        find /tmp -name "$pattern" -type f -mtime +1 -delete 2>/dev/null || true
    fi
}

# Export functions for use in other scripts
export -f log
export -f command_exists
export -f get_file_mod_time
export -f hours_since
export -f validate_json
export -f create_backup
export -f send_notification
export -f check_requirements
export -f get_git_info
export -f format_file_size
export -f sanitize_filename
export -f create_temp_file
export -f cleanup_temp_files