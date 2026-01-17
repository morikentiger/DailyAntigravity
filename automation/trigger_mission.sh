#!/bin/bash

# trigger_mission.sh
# Antigravity Autonomous Mission Trigger
# This script reads the next task from 'やりたいリスト.md' and commands the AI.

# Set the project directory
PROJECT_DIR="/Users/moritak129/DailyAntigravity"
cd "$PROJECT_DIR"

# Set up the Python environment (using pyenv as configured on this Mac)
export PATH="/Users/moritak129/.pyenv/shims:$PATH"

# Run the master mission script
python3 "$PROJECT_DIR/automation/rpa_engine/scenarios/master_auto_mission.py"

echo "Mission Triggered Successfully"
