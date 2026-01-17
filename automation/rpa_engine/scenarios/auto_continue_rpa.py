#!/usr/bin/env python3
"""
auto_continue_rpa.py - 自律開発ループ監視スクリプト

checkpoint.md の状態を監視し、AIが「WAITING」状態になったら
自動的に「続けて、お任せで」と入力して開発を継続させる。
"""
import sys
import os
import time
import re
import subprocess

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

def read_checkpoint_status():
    """Reads the status from checkpoint.md."""
    if not os.path.exists(CHECKPOINT_FILE):
        return "IDLE"

    try:
        with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        # Look for status line: - **状態**: WAITING
        match = re.search(r'\*\*状態\*\*:\s*(\w+)', content)
        if match:
            return match.group(1).strip()
    except Exception as e:
        log(f"Error reading checkpoint: {e}")

    return "IDLE"

def send_continue_command(rpa):
    """Sends a continue command to Antigravity."""
    log("Sending continue command...")

    # Set clipboard
    continue_text = "続けてください。承認します。お任せで進めてください。"
    rpa.run_applescript(f'set the clipboard to ""')
    time.sleep(0.3)

    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(continue_text.encode('utf-8'))
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
        log("Continue command sent!")
        return True
    else:
        log("Failed to find Antigravity window.")
        return False

def main():
    log("=== Auto-Continue RPA Started ===")
    log(f"Monitoring: {CHECKPOINT_FILE}")
    log(f"Check interval: {CHECK_INTERVAL}s")

    rpa = AntigravityRPA()
    waiting_start_time = None

    while True:
        status = read_checkpoint_status()

        if status == "WAITING":
            if waiting_start_time is None:
                waiting_start_time = time.time()
                log("Detected WAITING status. Will send continue command shortly...")
                time.sleep(5)  # Wait a bit before sending

            elapsed = time.time() - waiting_start_time
            if elapsed > MAX_WAITING_TIME:
                log("Max waiting time exceeded. Stopping auto-continue.")
                break

            # Send continue command
            if send_continue_command(rpa):
                waiting_start_time = None
                time.sleep(30)  # Wait before checking again

        elif status == "COMPLETE":
            log("Mission COMPLETE detected. Stopping monitor.")
            break

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
