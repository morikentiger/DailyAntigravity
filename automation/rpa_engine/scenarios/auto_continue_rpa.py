#!/usr/bin/env python3
"""
auto_continue_rpa.py - 自律開発ループ監視スクリプト

機能:
1. checkpoint.md の「WAITING」状態を監視し、自動で続行コマンドを送信
2. 予定時刻になったら自動でWAITINGに変更してタスクを開始
"""
import sys
import os
import time
import re
import subprocess
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import AntigravityRPA

CHECKPOINT_FILE = "/Users/moritak129/DailyAntigravity/automation/checkpoint.md"
LOG_FILE = "/Users/moritak129/DailyAntigravity/automation/auto_continue_log.txt"
CHECK_INTERVAL = 10  # seconds between checks
MAX_WAITING_TIME = 300  # 5 minutes max wait before giving up

def log(message):
    """Logs to file and console."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")
    except:
        pass

def read_checkpoint():
    """Reads the full checkpoint content and extracts info."""
    result = {
        "status": "IDLE",
        "scheduled_time": None,
        "scheduled_content": None,
        "content": ""
    }

    if not os.path.exists(CHECKPOINT_FILE):
        return result

    try:
        with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        result["content"] = content

        # Extract status
        match = re.search(r'\*\*状態\*\*:\s*(\w+)', content)
        if match:
            result["status"] = match.group(1).strip()

        # Extract scheduled time: - **予定時刻**: 2026-01-18 00:01
        time_match = re.search(r'\*\*予定時刻\*\*:\s*([\d\-]+ [\d:]+)', content)
        if time_match:
            try:
                result["scheduled_time"] = datetime.strptime(time_match.group(1).strip(), "%Y-%m-%d %H:%M")
            except:
                pass

        # Extract scheduled content: - **内容**: Day 5「ボム兵カウントするゲー」の開発開始
        content_match = re.search(r'\*\*内容\*\*:\s*(.+)', content)
        if content_match:
            result["scheduled_content"] = content_match.group(1).strip()

    except Exception as e:
        log(f"Error reading checkpoint: {e}")

    return result

def update_checkpoint_status(new_status):
    """Updates the status in checkpoint.md."""
    try:
        with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace status
        new_content = re.sub(
            r'(\*\*状態\*\*:\s*)\w+',
            f'\\1{new_status}',
            content
        )

        with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
            f.write(new_content)

        log(f"Checkpoint status updated to: {new_status}")
        return True
    except Exception as e:
        log(f"Error updating checkpoint: {e}")
        return False

def send_command_to_antigravity(rpa, text):
    """Sends a custom command to Antigravity."""
    log(f"Sending command: {text[:50]}...")

    # Set clipboard
    rpa.run_applescript(f'set the clipboard to ""')
    time.sleep(0.3)

    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(text.encode('utf-8'))
    time.sleep(1.0)

    # Focus and paste
    if rpa.activate_by_window_title("Antigravity"):
        time.sleep(0.5)
        rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9)
        time.sleep(0.5)

        script = '''
        tell application "System Events"
            set frontmost of process "Antigravity" to true
            delay 0.3
            keystroke "v" using {command down}
            delay 0.5
            keystroke return
        end tell
        '''
        rpa.run_applescript(script)
        log("Command sent!")
        return True
    else:
        log("Failed to find Antigravity window.")
        return False

def check_scheduled_trigger(checkpoint):
    """Check if scheduled time has arrived and trigger if needed."""
    if checkpoint["status"] != "COMPLETE":
        return False  # Only trigger from COMPLETE status

    if not checkpoint["scheduled_time"]:
        return False

    now = datetime.now()
    scheduled = checkpoint["scheduled_time"]

    # Check if scheduled time has passed (within last 10 minutes)
    time_diff = (now - scheduled).total_seconds()

    if 0 <= time_diff <= 600:  # Within 10 minutes after scheduled time
        log(f"⏰ Scheduled time reached! ({scheduled})")
        return True

    return False

def main():
    log("=== Auto-Continue RPA Started ===")
    log(f"Monitoring: {CHECKPOINT_FILE}")
    log(f"Check interval: {CHECK_INTERVAL}s")

    rpa = AntigravityRPA()
    waiting_start_time = None
    triggered_schedule = None  # Track which schedule we've triggered

    while True:
        checkpoint = read_checkpoint()
        status = checkpoint["status"]

        # Check for scheduled trigger
        if check_scheduled_trigger(checkpoint):
            scheduled_time = checkpoint["scheduled_time"]

            # Avoid re-triggering the same schedule
            if triggered_schedule != scheduled_time:
                triggered_schedule = scheduled_time

                # Build the command from scheduled content
                content = checkpoint["scheduled_content"] or "次のタスクを開始してください"
                command = f"本日は「{content}」です。開発を開始してください。"

                log(f"🚀 Triggering scheduled task: {content}")

                # Update status to WAITING
                update_checkpoint_status("WAITING")
                time.sleep(2)

                # Send the command directly
                if send_command_to_antigravity(rpa, command):
                    log("✅ Scheduled task triggered successfully!")
                    time.sleep(30)
                    continue

        if status == "WAITING":
            if waiting_start_time is None:
                waiting_start_time = time.time()
                log("Detected WAITING status. Will send continue command shortly...")
                time.sleep(5)  # Wait a bit before sending

            elapsed = time.time() - waiting_start_time
            if elapsed > MAX_WAITING_TIME:
                log("Max waiting time exceeded. Returning to monitoring.")
                waiting_start_time = None
                continue

            # Send continue command
            continue_text = "続けてください。承認します。お任せで進めてください。"
            if send_command_to_antigravity(rpa, continue_text):
                waiting_start_time = None
                time.sleep(30)  # Wait before checking again

        elif status == "COMPLETE":
            if waiting_start_time is not None:
                log("Mission COMPLETE detected. Returning to idle monitoring.")
            waiting_start_time = None

        elif status == "RUNNING":
            waiting_start_time = None
            log("Status: RUNNING - AI is working...")

        else:  # IDLE or unknown
            waiting_start_time = None
            log(f"Status: {status}")

        time.sleep(CHECK_INTERVAL)

    log("=== Auto-Continue RPA Stopped ===")

if __name__ == "__main__":
    main()

