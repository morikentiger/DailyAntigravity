#!/bin/bash

# trigger_mission.sh
# Antigravity Autonomous Mission Trigger
# This script reads the next task from 'やりたいリスト.md' and commands the AI.

# Set the project directory
PROJECT_DIR="/Users/moritak129/DailyAntigravity"
cd "$PROJECT_DIR"

# Set up the Python environment
export PATH="/Users/moritak129/.pyenv/shims:$PATH"

# Run the master mission script directly
# We don't redirect output here so you can see any errors in the Shortcut result
python3 "$PROJECT_DIR/automation/rpa_engine/scenarios/master_auto_mission.py"

echo "Mission Triggered Successfully"
