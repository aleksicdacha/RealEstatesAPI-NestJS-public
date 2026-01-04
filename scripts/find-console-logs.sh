#!/bin/bash

# Script to find and report console.log usage in the codebase
# This helps identify areas that need to be migrated to NestJS Logger

echo "🔍 Scanning for console.log/console.error usage..."
echo ""

# Find all TypeScript files with console usage
echo "📁 Files with console statements:"
grep -r "console\." apps/api/src --include="*.ts" -l | while read -r file; do
  count=$(grep "console\." "$file" | wc -l)
  echo "  - $file ($count occurrences)"
done

echo ""
echo "📊 Summary by type:"
echo "  console.log:   $(grep -r "console\.log" apps/api/src --include="*.ts" | wc -l)"
echo "  console.error: $(grep -r "console\.error" apps/api/src --include="*.ts" | wc -l)"
echo "  console.warn:  $(grep -r "console\.warn" apps/api/src --include="*.ts" | wc -l)"
echo "  console.debug: $(grep -r "console\.debug" apps/api/src --include="*.ts" | wc -l)"

echo ""
echo "💡 Recommended fix: Replace with NestJS Logger"
echo "   Example: this.logger.log('message') or this.logger.error('error', stackTrace)"
echo ""
echo "🎯 Priority files to fix:"
grep -r "console\." apps/api/src --include="*.ts" -l | grep -E "(service|controller)" | head -5
