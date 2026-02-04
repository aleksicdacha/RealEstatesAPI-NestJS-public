#!/bin/bash
# Move all .sh scripts from root to scripts/ folder and update references

set -e

echo "🔄 MOVING .SH SCRIPTS TO scripts/ FOLDER"
echo "=========================================="
echo ""

# Scripts to move (from git HEAD)
SCRIPTS=(
    "ssh-harden.sh"
    "test-client-transaction-filter.sh"
    "test-public-endpoint.sh"
    "validate-deployment.sh"
    "verify-data.sh"
    "verify-enum-casing.sh"
    "verify-system.sh"
)

# Step 1: Move scripts using git mv
echo "📦 Moving scripts to scripts/ folder..."
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        git mv "$script" "scripts/$script"
        echo "  ✓ Moved $script"
    else
        echo "  ⚠️  $script not found in working directory"
    fi
done

echo ""
echo "🔍 Searching for references to update..."
echo ""

# Step 2: Find and update references in all files
# Search patterns for each script
declare -A script_patterns=(
    ["ssh-harden.sh"]="./ssh-harden.sh|ssh-harden.sh"
    ["test-client-transaction-filter.sh"]="./test-client-transaction-filter.sh|test-client-transaction-filter.sh"
    ["test-public-endpoint.sh"]="./test-public-endpoint.sh|test-public-endpoint.sh"
    ["validate-deployment.sh"]="./validate-deployment.sh|validate-deployment.sh"
    ["verify-data.sh"]="./verify-data.sh|verify-data.sh"
    ["verify-enum-casing.sh"]="./verify-enum-casing.sh|verify-enum-casing.sh"
    ["verify-system.sh"]="./verify-system.sh|verify-system.sh"
)

# Files to check for references (exclude .git, node_modules, dist, etc.)
FILES_TO_CHECK=$(find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/.next/*" \
    -not -path "*/build/*" \
    -not -path "*/uploads/*" \
    \( -name "*.md" -o -name "*.sh" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.ts" -o -name "*.js" \) 2>/dev/null)

# Update references
for script in "${SCRIPTS[@]}"; do
    pattern="${script_patterns[$script]}"
    replacement="scripts/$script"

    echo "Checking references to: $script"

    # Search and replace in each file
    while IFS= read -r file; do
        if grep -E "$pattern" "$file" > /dev/null 2>&1; then
            echo "  📝 Updating: $file"
            # Use sed to replace references
            sed -i "s|\./$script|scripts/$script|g" "$file"
            sed -i "s|\^$script|scripts/$script|g" "$file"
            sed -i "s| $script | scripts/$script |g" "$file"
        fi
    done <<< "$FILES_TO_CHECK"
done

echo ""
echo "✅ MOVE COMPLETE"
echo "================"
echo ""
echo "📊 Summary:"
echo "  • Moved ${#SCRIPTS[@]} scripts to scripts/ folder"
echo "  • Updated all file references"
echo ""
echo "📁 New locations:"
for script in "${SCRIPTS[@]}"; do
    echo "  scripts/$script"
done
echo ""
echo "🎯 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test scripts from new location"
echo "  3. Commit: git commit -m 'chore: move .sh scripts to scripts/ folder'"
echo ""
