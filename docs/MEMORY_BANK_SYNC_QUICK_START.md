# Memory Bank Sync Quick Start Guide

## Prerequisites

- Bash shell environment
- Git repository with cursorkleosr workflow tracking
- Required commands: `jq`, `git`, `date`
- Write permissions to `docs/memory-bank/` directory

## Quick Setup (5 minutes)

1. **Navigate to scripts directory:**
   ```bash
   cd docs/scripts
   ```

2. **Deploy the sync system:**
   ```bash
   bash deploy-sync-system.md
   ```

3. **Run initial synchronization:**
   ```bash
   bash sync-engine.md
   ```

4. **Verify the sync worked:**
   ```bash
   bash validation/sync-validator.md
   ```

## Daily Usage

### Manual Sync
```bash
cd docs/scripts
bash sync-engine.md
```

### Check Status
```bash
bash monitoring/sync-dashboard.md
```

### Run Tests
```bash
bash test-sync-suite.md
```

## Automation Setup

### Option 1: Cron Job (Daily at 6 AM)
```bash
# Add to crontab
crontab -e
# Add: 0 6 * * * cd /path/to/project && bash docs/scripts/sync-engine.md
```

### Option 2: Git Hook (After commits)
```bash
# The deployment script sets this up automatically
# Check: cat .git/hooks/post-commit
```

### Option 3: Manual trigger
```bash
# Run whenever needed
bash docs/scripts/sync-engine.md
```

## Troubleshooting

### Sync fails with "Source data validation failed"
- Check that `docs/cursorkleosr/workflow_state.md` exists
- Verify required sections are present (STATE, PLAN, ITEMS, METRICS, LOG)
- Ensure file is readable

### Target files are empty
- Check write permissions on `docs/memory-bank/` directory
- Verify the sync engine completed without errors
- Check logs in `docs/scripts/logs/`

### Validation fails
- Run: `bash monitoring/sync-dashboard.md` for detailed status
- Check recent log files in `docs/scripts/logs/`
- Verify source data integrity

### Performance issues
- Check system resources (disk space, memory)
- Review log files for bottlenecks
- Consider adjusting sync frequency

## File Structure

```
docs/scripts/
├── sync-engine.md              # Main sync engine
├── validation/
│   └── sync-validator.md       # Validation system
├── automation/
│   └── setup-automation.md     # Automation setup
├── monitoring/
│   └── sync-dashboard.md       # Status dashboard
├── test-sync-suite.md          # Test suite
├── utilities.sh                # Utility functions
├── deploy-sync-system.md       # Deployment script
└── logs/                       # Execution logs
```

## Configuration

Edit `docs/scripts/sync-config.json` to customize:

```json
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
  }
}
```

## Support

- **Logs:** Check `docs/scripts/logs/` for detailed execution logs
- **Status:** Run `bash monitoring/sync-dashboard.md` for system status
- **Tests:** Run `bash test-sync-suite.md` to verify system health
- **Validation:** Run `bash validation/sync-validator.md` for detailed validation

## Advanced Usage

### Custom Transformers
Edit the transformation functions in `sync-engine.md` to customize data mapping.

### Additional Validation Rules
Extend `validation/sync-validator.md` with custom validation logic.

### Integration with CI/CD
Add sync commands to your CI/CD pipeline for automated updates.

---

**Quick Start completed in 5 minutes**
**Full deployment time: 15-30 minutes**
**Maintenance: Minimal (automated)**