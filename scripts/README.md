# Code Quality Scripts

This directory contains scripts to help maintain code quality and identify areas for improvement.

## Available Scripts

### `find-console-logs.sh`
Scans the codebase for `console.log`, `console.error`, and other console statements that should be replaced with NestJS Logger.

**Usage:**
```bash
chmod +x scripts/find-console-logs.sh
./scripts/find-console-logs.sh
```

**Purpose:**
- Identifies files using console statements
- Counts occurrences by type
- Helps prioritize migration to proper logging

### Future Scripts (TODO)
- `check-missing-validators.sh` - Find DTOs without validation decorators
- `check-uncommented-guards.sh` - Find controllers with commented auth guards
- `audit-env-variables.sh` - Verify all required env vars are documented

## Best Practices

1. **Run before commits** - Check for console.log usage
2. **Regular audits** - Run monthly to catch regressions
3. **CI Integration** - Add to pre-commit hooks or CI pipeline

## Example Output

```
🔍 Scanning for console.log/console.error usage...

📁 Files with console statements:
  - apps/api/src/entities/user/user.service.ts (12 occurrences)
  - apps/api/src/main.ts (5 occurrences)

📊 Summary by type:
  console.log:   45
  console.error: 8

💡 Recommended fix: Replace with NestJS Logger
```
