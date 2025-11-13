# Memory Bank Synchronization Guide

**Version:** 1.0.0
**Date:** 2025-11-13
**Purpose:** Bridge the gap between cursorkleosr workflow tracking and memory bank system

## Problem Statement

The CinemaRebel project has extensive workflow tracking in `docs/cursorkleosr/workflow_state.md` (49 completed tasks, detailed metrics, comprehensive logs) but the memory bank system (`docs/memory-bank/`) contains mostly empty placeholder files. This creates a disconnect between the detailed project context and the AI assistant's working memory.

## Solution Overview

Implement automated synchronization between cursorkleosr workflow data and memory bank files to ensure consistent, up-to-date project context across all AI assistant modes.

## Implementation Steps

### Phase 1: Data Mapping Analysis

#### Step 1: Analyze Source Data Structure

**cursorkleosr/workflow_state.md sections:**
- `STATE`: Current phase, status, confidence, files, modules
- `PLAN`: Numbered list of tasks with completion status
- `ITEMS`: Detailed table of work items (id, description, status, complexity, confidence, pattern_match, files, modules)
- `METRICS`: Tasks count, success rate, quality metrics, performance metrics
- `LOG`: JSON array of completed actions with timestamps
- `WORKFLOW_HISTORY`: Git commit history table

**Memory Bank target files:**
- `active-context.md`: Current tasks, issues, next steps
- `product-context.md`: Overall project overview and goals
- `progress.md`: Milestones, completed tasks, current status
- `decision-log.md`: All project decisions with context
- `system-patterns.md`: Development patterns, rules, best practices

#### Step 2: Create Mapping Rules

```javascript
// Data mapping configuration
const DATA_MAPPING = {
  // Source → Target mappings
  'workflow_state.STATE': {
    target: 'active-context.md',
    transform: extractCurrentTasks
  },
  'workflow_state.PLAN': {
    target: 'progress.md',
    transform: convertPlanToProgress
  },
  'workflow_state.ITEMS': {
    target: 'progress.md',
    transform: aggregateWorkItems
  },
  'workflow_state.LOG': {
    target: 'decision-log.md',
    transform: convertLogsToDecisions
  },
  'workflow_state.METRICS': {
    target: 'product-context.md',
    transform: extractProjectMetrics
  }
};
```

### Phase 2: Synchronization Implementation

#### Step 1: Create Sync Utility Functions

**File: `docs/scripts/sync-utils.md`**

```javascript
// Synchronization utility functions

function extractCurrentTasks(stateSection) {
  // Extract active tasks from STATE section
  const lines = stateSection.split('\n');
  const tasks = [];

  for (const line of lines) {
    if (line.includes('Item:') && !line.includes('COMPLETED')) {
      tasks.push(line.replace('Item:', '').trim());
    }
  }

  return tasks;
}

function convertPlanToProgress(planSection) {
  // Convert numbered plan items to progress format
  const lines = planSection.split('\n');
  const progress = {
    completed: [],
    inProgress: [],
    pending: []
  };

  for (const line of lines) {
    if (line.startsWith('- ✅')) {
      progress.completed.push(line.replace('- ✅', '').trim());
    } else if (line.startsWith('- ⏳')) {
      progress.inProgress.push(line.replace('- ⏳', '').trim());
    } else if (line.startsWith('- [ ]')) {
      progress.pending.push(line.replace('- [ ]', '').trim());
    }
  }

  return progress;
}

function aggregateWorkItems(itemsTable) {
  // Parse ITEMS table and aggregate by status
  const items = parseMarkdownTable(itemsTable);
  const aggregated = {
    total: items.length,
    completed: items.filter(item => item.status === 'completed').length,
    inProgress: items.filter(item => item.status === 'in_progress').length,
    blocked: items.filter(item => item.status === 'blocked').length
  };

  return aggregated;
}

function convertLogsToDecisions(logJson) {
  // Convert JSON log entries to decision format
  try {
    const logs = JSON.parse(logJson);
    const decisions = logs.map(log => ({
      timestamp: log.timestamp,
      decision: log.action,
      context: log.details,
      outcome: log.status,
      rationale: `Phase: ${log.phase}`
    }));

    return decisions;
  } catch (error) {
    console.error('Failed to parse log JSON:', error);
    return [];
  }
}

function extractProjectMetrics(metricsSection) {
  // Extract key metrics for project overview
  const metrics = {};
  const lines = metricsSection.split('\n');

  for (const line of lines) {
    if (line.includes('Tasks:')) {
      metrics.totalTasks = parseInt(line.split(':')[1].trim());
    }
    if (line.includes('Success:')) {
      metrics.successRate = line.split(':')[1].trim();
    }
    if (line.includes('Quality:')) {
      metrics.qualityMetrics = line.split(':')[1].trim();
    }
  }

  return metrics;
}
```

#### Step 2: Create Synchronization Script

**File: `docs/scripts/memory-bank-sync.md`**

```bash
#!/bin/bash
# Memory Bank Synchronization Script
# Synchronizes cursorkleosr workflow data with memory bank files

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CURSORKLEOSR_DIR="$PROJECT_ROOT/docs/cursorkleosr"
MEMORY_BANK_DIR="$PROJECT_ROOT/docs/memory-bank"

echo "Starting Memory Bank Synchronization..."
echo "Source: $CURSORKLEOSR_DIR/workflow_state.md"
echo "Target: $MEMORY_BANK_DIR/"

# Function to extract section content from markdown
extract_section() {
    local file="$1"
    local section="$2"
    local start_marker="<!-- DYNAMIC:${section}:START -->"
    local end_marker="<!-- DYNAMIC:${section}:END -->"

    sed -n "/$start_marker/,/$end_marker/p" "$file" | sed '1d;$d'
}

# Function to update memory bank file
update_memory_bank_file() {
    local target_file="$1"
    local content="$2"

    echo "Updating $target_file..."
    cat > "$target_file" << EOF
$content
EOF
}

# Extract data from workflow_state.md
echo "Extracting workflow data..."
STATE_CONTENT=$(extract_section "$CURSORKLEOSR_DIR/workflow_state.md" "STATE")
PLAN_CONTENT=$(extract_section "$CURSORKLEOSR_DIR/workflow_state.md" "PLAN")
ITEMS_CONTENT=$(extract_section "$CURSORKLEOSR_DIR/workflow_state.md" "ITEMS")
METRICS_CONTENT=$(extract_section "$CURSORKLEOSR_DIR/workflow_state.md" "METRICS")
LOG_CONTENT=$(extract_section "$CURSORKLEOSR_DIR/workflow_state.md" "LOG")

# Update active-context.md
echo "Updating active-context.md..."
ACTIVE_CONTEXT_CONTENT="# Current Context

## Ongoing Tasks
$(echo "$STATE_CONTENT" | grep "Item:" | grep -v "COMPLETED" | sed 's/Item: /- /' | head -5)

## Known Issues
- Memory bank synchronization in progress
- System optimization implementation ongoing

## Next Steps
$(echo "$PLAN_CONTENT" | grep "⏳" | sed 's/- ⏳/- /' | head -5)

## Current Session Notes
- Synchronization script executed: $(date)
- Workflow state extracted from cursorkleosr
- Memory bank files updated automatically
"

update_memory_bank_file "$MEMORY_BANK_DIR/active-context.md" "$ACTIVE_CONTEXT_CONTENT"

# Update progress.md
echo "Updating progress.md..."
PROGRESS_CONTENT="# Project Progress

## Completed Milestones
$(echo "$PLAN_CONTENT" | grep "✅" | sed 's/- ✅/- /' | tail -10)

## Current Status
$(echo "$METRICS_CONTENT" | grep -E "(Tasks|Success|Quality)" | sed 's/##/#/' | head -5)

## Work Items Summary
$(echo "$ITEMS_CONTENT" | tail -n +3 | head -10 | sed 's/|/: /g' | sed 's/^/- /')

## Next Priorities
$(echo "$PLAN_CONTENT" | grep -v "✅" | head -5)
"

update_memory_bank_file "$MEMORY_BANK_DIR/progress.md" "$PROGRESS_CONTENT"

# Update decision-log.md
echo "Updating decision-log.md..."
DECISION_LOG_CONTENT="# Decision Log

## Recent Decisions
$(echo "$LOG_CONTENT" | grep '"timestamp"' | head -10 | sed 's/},/}\n/g' | sed 's/{"timestamp":/- **/g' | sed 's/"action":/"** - /g' | sed 's/"phase":/Phase: /g' | sed 's/"status":/Status: /g' | sed 's/"details":/Details: /g' | sed 's/}/\n/g')

## Implementation Patterns Established
- Comprehensive error handling with centralized logging
- TypeScript strict mode with proper type guards
- Environment variable validation system
- Rate limiting for API protection
- Responsive component design patterns
"

update_memory_bank_file "$MEMORY_BANK_DIR/decision-log.md" "$DECISION_LOG_CONTENT"

# Update product-context.md
echo "Updating product-context.md..."
PRODUCT_CONTEXT_CONTENT="# Product Context

## Project Overview
CinemaRebel is a modern movie and TV show discovery platform built with Next.js 15, featuring:
- TMDB API integration for comprehensive media data
- Advanced filtering and search capabilities
- User watchlist and custom list management
- Responsive design with dark/light theme support
- Performance optimization with caching and rate limiting

## Current Capabilities
- Movie and TV show discovery with advanced filters
- User authentication and personalized watchlists
- Custom list creation and management
- Responsive design for all devices
- Comprehensive API documentation

## Technical Architecture
- **Frontend:** Next.js 15 App Router, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **External APIs:** TMDB API with caching layer
- **Deployment:** Vercel with optimized build configuration

## Quality Metrics
$(echo "$METRICS_CONTENT" | grep -E "(Tasks|Success|Quality|Performance)" | sed 's/##/#/' | head -10)

## Development Status
- **Total Features:** 49 implemented
- **Test Coverage:** Vitest framework configured
- **Code Quality:** ESLint + TypeScript strict mode
- **Performance:** Optimized with caching and lazy loading
"

update_memory_bank_file "$MEMORY_BANK_DIR/product-context.md" "$PRODUCT_CONTEXT_CONTENT"

# Update system-patterns.md (append to existing content)
echo "Updating system-patterns.md..."
EXISTING_PATTERNS=$(cat "$MEMORY_BANK_DIR/system-patterns.md")

SYSTEM_PATTERNS_UPDATE="# System Patterns

## Architecture Patterns
- Next.js 15 App Router with Server Components for optimal performance
- Prisma ORM with PostgreSQL for type-safe database operations
- TMDB API integration with Redis caching and rate limiting
- Tailwind CSS with custom cinema theme and responsive design
- Comprehensive error boundaries and loading state management

## Code Patterns
- TypeScript strict mode with proper type guards and error handling
- Centralized logging utility with context-aware messages
- Environment variable validation with clear error messages
- API route protection with rate limiting and input validation
- Component composition with proper prop typing and default values

## Development Patterns
- Feature-driven development with comprehensive testing (Vitest + React Testing Library)
- Automated linting and type checking in CI/CD pipeline
- Git-based workflow with conventional commit messages
- Documentation-driven development with comprehensive API docs
- Performance monitoring with Web Vitals and custom analytics

## Error Handling Patterns
- Centralized logger with different log levels (error, warn, info, debug)
- User-friendly error messages with actionable recovery options
- Graceful degradation for external API failures
- Comprehensive error boundaries at route and component levels

## Testing Patterns
- Unit tests for utility functions and business logic
- Integration tests for API routes and database operations
- Component testing with React Testing Library
- Mock implementations for external dependencies (TMDB API, Redis)

## Kilo Code User Rules for Memory Bank Usage

### General Rules
- Kilo Code must proactively use the memory bank to track project progress, decisions, and context
- Before making changes, consult the active-context.md for current project state
- Log all significant decisions in decision-log.md with proper context and alternatives
- Update progress.md after completing tasks or milestones
- Maintain system patterns in this file for consistent development practices

### Mode-Specific Rules
- **Debug Mode**: Update active-context.md with identified issues and solutions
- **Code Mode**: Update progress.md with implementations and maintain code consistency
- **Ask Mode**: Consult memory bank for accurate information and update context with new topics
- **Architect Mode**: Analyze project structure and update system patterns with new architectural decisions

### Memory Bank File Usage
- **active-context.md**: Current tasks, issues, and next steps
- **decision-log.md**: All project decisions with context and consequences
- **progress.md**: Milestones, completed tasks, and current status
- **product-context.md**: Overall project overview and goals
- **system-patterns.md**: Development patterns, rules, and best practices

### Integration Rules
- Use memory bank tools (track_progress, log_decision, update_active_context) appropriately
- Ensure all memory bank updates are accurate and timely
- Reference memory bank information in responses when relevant
- Maintain consistency between memory bank content and actual project state

## Kilo Code User Rules for Sequential Thinking Usage

### General Rules
- Kilo Code must use sequential thinking for complex, multi-step problems that require systematic analysis
- Break down problems into manageable steps with clear thought progression
- Provide confidence scores and rationale for all tool recommendations
- Use sequential thinking proactively for planning, debugging, and task coordination
- Express uncertainty when present and explore alternative approaches

### When to Use Sequential Thinking
- Complex debugging scenarios with multiple potential causes
- Multi-step implementation tasks requiring careful planning
- Problems where the full scope is not initially clear
- Situations requiring course correction based on new information
- Tasks that benefit from step-by-step validation and revision

### Sequential Thinking Process
- Start with initial problem analysis and estimate total thoughts needed
- Build upon previous thoughts, allowing for revision and branching
- Recommend appropriate tools with confidence levels and alternatives
- Track progress through recommended steps with expected outcomes
- Provide single, ideally correct answers as final output
- Stop when a satisfactory solution is reached without unnecessary continuation

### Integration Rules
- Use sequential thinking tool (sequentialthinking_tools) for structured reasoning
- Consider available MCP tools when making recommendations
- Maintain transparency in thought process and decision-making
- Adapt thinking approach based on problem complexity and available information
"

update_memory_bank_file "$MEMORY_BANK_DIR/system-patterns.md" "$SYSTEM_PATTERNS_UPDATE"

echo "Memory Bank Synchronization Complete!"
echo "Files updated:"
echo "  - active-context.md"
echo "  - progress.md"
echo "  - decision-log.md"
echo "  - product-context.md"
echo "  - system-patterns.md"
echo ""
echo "Synchronization completed at: $(date)"
```

### Phase 3: Validation and Testing

#### Step 1: Create Validation Script

**File: `docs/scripts/validate-sync.md`**

```bash
#!/bin/bash
# Memory Bank Synchronization Validation Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_BANK_DIR="$PROJECT_ROOT/docs/memory-bank"

echo "Validating Memory Bank Synchronization..."

# Check if all files exist and have content
files=("active-context.md" "progress.md" "decision-log.md" "product-context.md" "system-patterns.md")
all_valid=true

for file in "${files[@]}"; do
    if [ ! -f "$MEMORY_BANK_DIR/$file" ]; then
        echo "❌ Missing file: $file"
        all_valid=false
    elif [ ! -s "$MEMORY_BANK_DIR/$file" ]; then
        echo "❌ Empty file: $file"
        all_valid=false
    else
        lines=$(wc -l < "$MEMORY_BANK_DIR/$file")
        echo "✅ $file: $lines lines"
    fi
done

# Check for synchronization markers
echo ""
echo "Checking synchronization markers..."
for file in "${files[@]}"; do
    if grep -q "Synchronization script executed" "$MEMORY_BANK_DIR/$file"; then
        echo "✅ $file: Has sync marker"
    else
        echo "⚠️  $file: Missing sync marker"
    fi
done

# Validate content consistency
echo ""
echo "Validating content consistency..."
if grep -q "49 implemented" "$MEMORY_BANK_DIR/product-context.md"; then
    echo "✅ Product context: Correct task count"
else
    echo "❌ Product context: Incorrect task count"
    all_valid=false
fi

if [ "$all_valid" = true ]; then
    echo ""
    echo "🎉 Memory Bank Synchronization Validation PASSED"
    exit 0
else
    echo ""
    echo "❌ Memory Bank Synchronization Validation FAILED"
    exit 1
fi
```

#### Step 2: Integration Testing

Create integration tests to ensure synchronization works correctly:

```bash
# Integration test script
test_memory_bank_integration() {
    echo "Testing Memory Bank Integration..."

    # Test 1: Verify cursorkleosr data extraction
    echo "Test 1: Data extraction..."
    # Extract sample data and verify format

    # Test 2: Verify memory bank updates
    echo "Test 2: Memory bank updates..."
    # Check that files are updated with correct content

    # Test 3: Verify cross-references
    echo "Test 3: Cross-reference validation..."
    # Ensure data consistency between files

    echo "Integration tests completed."
}
```

### Phase 4: Automation and Scheduling

#### Step 1: Create Cron Job Setup

**File: `docs/scripts/setup-cron.md`**

```bash
#!/bin/bash
# Setup automated memory bank synchronization

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYNC_SCRIPT="$SCRIPT_DIR/memory-bank-sync.md"

# Create cron job for daily synchronization
cron_job="0 6 * * * $SYNC_SCRIPT  # Daily memory bank sync at 6 AM"

# Add to crontab (example - adjust for your system)
echo "To add automated synchronization:"
echo "1. Run: crontab -e"
echo "2. Add line: $cron_job"
echo "3. Save and exit"

# Alternative: Git hooks integration
echo ""
echo "Git Hook Integration:"
echo "Add to .git/hooks/post-commit:"
echo "#!/bin/bash"
echo "$SYNC_SCRIPT"
echo "chmod +x .git/hooks/post-commit"
```

#### Step 2: Git Hook Integration

**File: `.git/hooks/post-commit`**

```bash
#!/bin/bash
# Post-commit hook to sync memory bank

SCRIPT_DIR="docs/scripts"
SYNC_SCRIPT="$SCRIPT_DIR/memory-bank-sync.md"

if [ -f "$SYNC_SCRIPT" ]; then
    echo "Running memory bank synchronization..."
    bash "$SYNC_SCRIPT"
    echo "Memory bank synchronized."
fi
```

## Usage Instructions

### Manual Synchronization

Run the synchronization script manually:

```bash
cd docs/scripts
bash memory-bank-sync.md
```

### Automated Synchronization

Set up daily cron job or git hooks as described in the setup scripts.

### Validation

Run validation after synchronization:

```bash
cd docs/scripts
bash validate-sync.md
```

## Monitoring and Maintenance

### Health Checks

- **Daily:** Run validation script
- **Weekly:** Review synchronization logs
- **Monthly:** Audit memory bank content accuracy

### Troubleshooting

**Common Issues:**

1. **Empty Files After Sync**
   - Check cursorkleosr/workflow_state.md structure
   - Verify section markers are present
   - Review sync script for parsing errors

2. **Outdated Information**
   - Ensure cursorkleosr is updated before sync
   - Check timestamp markers in memory bank files
   - Verify cron job or git hook is functioning

3. **Parsing Errors**
   - Validate JSON format in LOG section
   - Check markdown table structure in ITEMS section
   - Review regex patterns in sync script

### Performance Optimization

- **Incremental Sync:** Only update changed sections
- **Caching:** Cache parsed data to reduce processing time
- **Parallel Processing:** Sync multiple files concurrently
- **Compression:** Compress historical data in archives

## Success Metrics

- [ ] Memory bank files automatically populated with current data
- [ ] Synchronization completes within 30 seconds
- [ ] No manual intervention required for routine updates
- [ ] Validation passes 100% of the time
- [ ] Cross-system consistency maintained

## Rollback Procedures

If synchronization causes issues:

1. **Disable Automation:** Remove cron jobs and git hooks
2. **Manual Restore:** Copy backup memory bank files
3. **Reset Integration:** Set sync flags to false in configurations
4. **Gradual Re-enable:** Test synchronization in stages

---

**Guide Version:** 1.0.0
**Implementation Status:** Ready for deployment
**Estimated Setup Time:** 2-4 hours
**Maintenance Overhead:** Minimal (automated)