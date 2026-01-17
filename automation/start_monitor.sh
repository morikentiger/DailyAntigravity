#!/bin/bash
# Mission Control Monitor - Start Script
# Starts a local server and opens the dashboard

cd /Users/moritak129/DailyAntigravity/automation

echo "🚀 Starting Mission Control..."
echo "📍 Dashboard: http://localhost:8765/monitor.html"
echo ""
echo "Press Ctrl+C to stop"

# Open browser
open "http://localhost:8765/monitor.html"

# Start simple HTTP server
python3 -m http.server 8765
