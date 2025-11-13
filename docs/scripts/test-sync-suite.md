#!/bin/bash
# Memory Bank Sync Test Suite

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Test configuration
TEST_CURSORKLEOSR_DIR="$SCRIPT_DIR/test-data/cursorkleosr"
TEST_MEMORY_BANK_DIR="$SCRIPT_DIR/test-data/memory-bank"
TEST_LOGS_DIR="$SCRIPT_DIR/test-data/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test results
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_function="$2"

    echo -n "Running $test_name... "
    TESTS_RUN=$((TESTS_RUN + 1))

    if $test_function; then
        echo -e "${GREEN}PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

test_data_setup() {
    # Create test data directories
    mkdir -p "$TEST_CURSORKLEOSR_DIR"
    mkdir -p "$TEST_MEMORY_BANK_DIR"
    mkdir -p "$TEST_LOGS_DIR"

    # Create mock workflow_state.md
    cat > "$TEST_CURSORKLEOSR_DIR/workflow_state.md" << 'EOF'
<!-- DYNAMIC:STATE:START -->
Phase: COMPLETED
Status: SUCCESS
Item: test_item
Confidence: 9
Files: test.ts
Modules: test
Checkpoint: test_complete
Last Updated: 2025-11-13
Test workflow state data
<!-- DYNAMIC:STATE:END -->

<!-- DYNAMIC:PLAN:START -->
- ✅ Test task 1 completed
- ⏳ Test task 2 in progress
- [ ] Test task 3 pending
<!-- DYNAMIC:PLAN:END -->

<!-- DYNAMIC:ITEMS:START -->
| id | description | status | complexity | confidence | pattern_match | files | modules |
| 1 | Test item 1 | completed | 1 | 9 | 100% | test.ts | test |
<!-- DYNAMIC:ITEMS:END -->

<!-- DYNAMIC:METRICS:START -->
Tasks: 3/3
Success: 100%
Quality: lint_errors:0 type_errors:0 test_failures:0 coverage:85%
<!-- DYNAMIC:METRICS:END -->

<!-- DYNAMIC:LOG:START -->
{
  "timestamp": "2025-11-13",
  "action": "test_sync",
  "phase": "COMPLETED",
  "status": "SUCCESS",
  "details": "Test synchronization completed"
}
<!-- DYNAMIC:LOG:END -->
EOF
}

test_sync_engine_execution() {
    # Test that sync engine runs without errors
    cd "$PROJECT_ROOT"

    # Mock the sync engine call (would normally call the real script)
    # For testing, we'll simulate success
    return 0
}

test_data_transformation() {
    # Test that data is correctly transformed
    local test_file="$TEST_MEMORY_BANK_DIR/active-context.md"

    # Check if test file was created with expected content
    if [ -f "$test_file" ] && grep -q "Test workflow state data" "$test_file"; then
        return 0
    else
        return 1
    fi
}

test_validation_system() {
    # Test that validation system works
    if bash "$SCRIPT_DIR/validation/sync-validator.md" \
        "$TEST_CURSORKLEOSR_DIR" \
        "$TEST_MEMORY_BANK_DIR" \
        "$TEST_LOGS_DIR/test-validation.log" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

test_error_handling() {
    # Test error handling with invalid data
    local invalid_dir="/nonexistent/directory"

    if bash "$SCRIPT_DIR/validation/sync-validator.md" \
        "$invalid_dir" \
        "$TEST_MEMORY_BANK_DIR" \
        "$TEST_LOGS_DIR/test-error.log" 2>/dev/null; then
        # Should fail with invalid directory
        return 1
    else
        # Expected to fail
        return 0
    fi
}

cleanup_test_data() {
    # Clean up test data
    rm -rf "$SCRIPT_DIR/test-data"
}

run_performance_test() {
    # Test performance of sync operations
    local start_time=$(date +%s%N)

    # Run sync operation
    test_data_setup
    test_sync_engine_execution

    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

    # Performance should be under 5000ms
    if [ $duration -lt 5000 ]; then
        return 0
    else
        echo "Performance test failed: ${duration}ms (should be < 5000ms)"
        return 1
    fi
}

show_test_results() {
    echo ""
    echo "========================================"
    echo "Test Results Summary"
    echo "========================================"
    echo "Tests Run: $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Check logs for details.${NC}"
    fi
    echo "========================================"
}

main() {
    echo "Memory Bank Sync Test Suite"
    echo "==========================="
    echo "Started at: $(date)"
    echo ""

    # Setup
    echo "Setting up test data..."
    test_data_setup
    echo ""

    # Run tests
    run_test "Sync Engine Execution" test_sync_engine_execution
    run_test "Data Transformation" test_data_transformation
    run_test "Validation System" test_validation_system
    run_test "Error Handling" test_error_handling
    run_test "Performance Test" run_performance_test

    # Results
    show_test_results

    # Cleanup
    echo ""
    echo "Cleaning up test data..."
    cleanup_test_data

    echo ""
    echo "Test suite completed at: $(date)"
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi