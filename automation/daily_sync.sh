#!/bin/bash

# ==========================================
# Antigravity Daily Sync
# Purpose: Robust git push for automated posts
# ==========================================

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[$TIMESTAMP] Sync Started in $PROJECT_DIR"

cd "$PROJECT_DIR"

# Check for changes
if [[ -z $(git status -s) ]]; then
    echo "[$TIMESTAMP] No changes to sync. skipping."
    exit 0
fi

# Sync logic
git add .
git commit -m "Auto-sync: Day $(date +%j) progress update"
if git push; then
    echo "[$TIMESTAMP] Sync Successful."
else
    echo "[$TIMESTAMP] Sync FAILED. Check network/credentials."
    exit 1
fi
