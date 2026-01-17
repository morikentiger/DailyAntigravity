#!/usr/bin/env python3
import sys
import os
import time
import subprocess

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import AntigravityRPA
from lib.task_parser import get_next_task

def log_to_file(message):
    """Logs to a local file for debugging Shortcut execution."""
    log_path = "/Users/moritak129/DailyAntigravity/automation/mission_log.txt"
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")

def send_command_to_antigravity(rpa, text):
    """Sends the command via clipboard with extra safety."""
    log_to_file(f"Preparing to send command: {text[:30]}...")

    # 1. Clear clipboard first to ensure we don't paste old stuff
    rpa.run_applescript('set the clipboard to ""')
    time.sleep(0.5)

    # 2. Set new content using pbcopy (proven most compatible in terminal)
    try:
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        process.communicate(text.encode('utf-8'))
        log_to_file("pbcopy executed.")
    except Exception as e:
        log_to_file(f"pbcopy error: {e}")

    # 3. Wait for OS to sync clipboard
    time.sleep(1.5)

    # 4. Paste using Cmd+V
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
    log_to_file("Paste command and Enter sent.")

def main():
    rpa = AntigravityRPA()
    list_file = "/Users/moritak129/DailyAntigravity/やりたいリスト.md"

    log_to_file("--- MISSION START (Standard Simple Mode) ---")

    # 1. Read next task
    task_name = get_next_task(list_file)
    if not task_name:
        log_to_file("No task found. Aborting.")
        return

    target_text = f"本日は「{task_name}」を作ります。開発を開始してください。"
    log_to_file(f"Target: {task_name}")

    # 2. Focus Window
    if rpa.activate_by_window_title("Antigravity"):
        log_to_file("Focused Antigravity window.")
        time.sleep(1.0)

        # 3. Click Chat Area
        if rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9):
            log_to_file("Clicked chat area.")
            time.sleep(1.5) # Wait for click to settle

            # 4. Final Delivery
            send_command_to_antigravity(rpa, target_text)
            log_to_file("--- MISSION COMPLETE ---")
        else:
            log_to_file("Failed to click window.")
    else:
        log_to_file("Failed to find Antigravity window.")

if __name__ == "__main__":
    main()
