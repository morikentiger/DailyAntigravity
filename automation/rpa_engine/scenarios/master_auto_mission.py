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

def send_complex_text(rpa, text):
    """Sets clipboard and pastes using a single robust AppleScript."""
    log_to_file(f"Executing robust paste: {text[:30]}...")

    # Escape for AppleScript
    safe_text = text.replace('"', '\\"')

    # Combined AppleScript: Set clipboard -> Focus -> Paste -> Enter
    script = f'''
    set the clipboard to "{safe_text}"
    tell application "System Events"
        tell process "Antigravity"
            set frontmost to true
            delay 0.5
            keystroke "v" using {{command down}}
            delay 0.5
            keystroke return
        end tell
    end tell
    '''
    try:
        rpa.run_applescript(script)
        log_to_file("Command dispatched via Combined AppleScript.")
    except Exception as e:
        log_to_file(f"Combined script failed: {e}")

def main():
    rpa = AntigravityRPA()
    list_file = "/Users/moritak129/DailyAntigravity/やりたいリスト.md"

    log_to_file("--- MISSION START (Direct Typing Mode) ---")

    # 1. Read next task
    task_name = get_next_task(list_file)
    if not task_name:
        log_to_file("No task found. Aborting.")
        return

    target_text = f"本日は「{task_name}」を作ります。開発を開始してください。"
    log_to_file(f"Target: {task_name}")

    # 2. Focus Window
    # Use a more specific title if possible
    if rpa.activate_by_window_title("Antigravity"):
        log_to_file("Focused Antigravity window.")
        time.sleep(1.0)

        # 3. Click Chat Area
        if rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9):
            log_to_file("Clicked chat area. Starting typing...")
            time.sleep(1.0)

            # 4. Type and Send
            send_complex_text(rpa, target_text)
            log_to_file("--- MISSION COMPLETE ---")
        else:
            log_to_file("Failed to click window.")
    else:
        log_to_file("Failed to find Antigravity window.")

if __name__ == "__main__":
    main()
