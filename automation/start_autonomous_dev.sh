#!/bin/bash

# start_autonomous_dev.sh
# 自律開発ループを開始するスクリプト
# 1. ミッションを起動
# 2. 自動継続モニターをバックグラウンドで起動

PROJECT_DIR="/Users/moritak129/DailyAntigravity"
cd "$PROJECT_DIR"

export PATH="/Users/moritak129/.pyenv/shims:$PATH"

echo "=== Starting Autonomous Development Loop ==="

# 1. Launch mission
echo "Step 1: Launching mission..."
python3 "$PROJECT_DIR/automation/rpa_engine/scenarios/master_auto_mission.py"

# 2. Start auto-continue monitor in background
echo "Step 2: Starting auto-continue monitor..."
nohup python3 "$PROJECT_DIR/automation/rpa_engine/scenarios/auto_continue_rpa.py" > /dev/null 2>&1 &
echo "Monitor PID: $!"

echo "=== Autonomous Development Loop Started ==="
echo "The AI will now work autonomously."
echo "Monitor logs: $PROJECT_DIR/automation/auto_continue_log.txt"
