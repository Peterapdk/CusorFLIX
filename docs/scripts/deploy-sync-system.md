#!/bin/bash
# Deploy Memory Bank Sync System

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "Deploying Memory Bank Sync System..."
echo "====================================="

# Check system requirements
echo "Checking system requirements..."
if ! bash "$SCRIPT_DIR/utilities.sh" && check_requirements; then
    echo "❌ System requirements not met. Please install missing dependencies."
    exit 1
fi
echo "✅ System requirements satisfied"
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/backups"
mkdir -p "$SCRIPT_DIR/test-data"
echo "✅ Directory structure created"
echo ""

# Validate configuration
echo "Validating configuration..."
if [ ! -f "$SCRIPT_DIR/sync-engine.md" ]; then
    echo "❌ Sync engine not found"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/validation/sync-validator.md" ]; then
    echo "❌ Validator not found"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/utilities.sh" ]; then
    echo "❌ Utilities not found"
    exit 1
fi
echo "✅ Configuration validated"
echo ""

# Set up permissions
echo "Setting up permissions..."
chmod +x "$SCRIPT_DIR/sync-engine.md"
chmod +x "$SCRIPT_DIR/validation/sync-validator.md"
chmod +x "$SCRIPT_DIR/automation/setup-automation.md"
chmod +x "$SCRIPT_DIR/monitoring/sync-dashboard.md"
chmod +x "$SCRIPT_DIR/test-sync-suite.md"
echo "✅ Permissions configured"
echo ""

# Run initial test
echo "Running initial test..."
if bash "$SCRIPT_DIR/test-sync-suite.md" > "$SCRIPT_DIR/logs/deploy-test.log" 2>&1; then
    echo "✅ Initial test passed"
else
    echo "❌ Initial test failed. Check logs/deploy-test.log"
    exit 1
fi
echo ""

# Create initial sync
echo "Creating initial synchronization..."
if bash "$SCRIPT_DIR/sync-engine.md" > "$SCRIPT_DIR/logs/initial-sync.log" 2>&1; then
    echo "✅ Initial sync completed"
else
    echo "❌ Initial sync failed. Check logs/initial-sync.log"
    exit 1
fi
echo ""

# Validate initial sync
echo "Validating initial sync..."
if bash "$SCRIPT_DIR/validation/sync-validator.md" > "$SCRIPT_DIR/logs/initial-validation.log" 2>&1; then
    echo "✅ Initial validation passed"
else
    echo "❌ Initial validation failed. Check logs/initial-validation.log"
    exit 1
fi
echo ""

# Setup automation (optional)
read -p "Set up automated synchronization? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting up automation..."
    if bash "$SCRIPT_DIR/automation/setup-automation.md" > "$SCRIPT_DIR/logs/automation-setup.log" 2>&1; then
        echo "✅ Automation setup completed"
    else
        echo "⚠️  Automation setup had issues. Check logs/automation-setup.log"
    fi
else
    echo "Skipping automation setup"
fi
echo ""

# Create deployment summary
cat > "$SCRIPT_DIR/logs/deployment-summary.md" << EOF
# Memory Bank Sync System Deployment Summary

**Deployment Date:** $(date)
**Status:** ✅ Successful

## Components Deployed
- ✅ Sync Engine (sync-engine.md)
- ✅ Validation System (validation/sync-validator.md)
- ✅ Utility Functions (utilities.sh)
- ✅ Test Suite (test-sync-suite.md)
- ✅ Monitoring Dashboard (monitoring/sync-dashboard.md)
- ✅ Automation Scripts (automation/setup-automation.md)

## Initial Results
- ✅ System requirements met
- ✅ Directory structure created
- ✅ Permissions configured
- ✅ Initial test passed
- ✅ Initial sync completed
- ✅ Initial validation passed

## Next Steps
1. Monitor system performance
2. Review sync logs regularly
3. Update automation settings as needed
4. Run manual syncs when needed

## Useful Commands
- Run sync: \`bash docs/scripts/sync-engine.md\`
- Validate: \`bash docs/scripts/validation/sync-validator.md\`
- Monitor: \`bash docs/scripts/monitoring/sync-dashboard.md\`
- Test: \`bash docs/scripts/test-sync-suite.md\`

---
*Deployment completed by automated script*
EOF

echo "🎉 Memory Bank Sync System deployment completed!"
echo ""
echo "Deployment summary saved to: $SCRIPT_DIR/logs/deployment-summary.md"
echo ""
echo "Useful commands:"
echo "  • Run sync: bash docs/scripts/sync-engine.md"
echo "  • Validate: bash docs/scripts/validation/sync-validator.md"
echo "  • Monitor: bash docs/scripts/monitoring/sync-dashboard.md"
echo "  • Test: bash docs/scripts/test-sync-suite.md"
echo ""
echo "Check logs directory for detailed execution logs"