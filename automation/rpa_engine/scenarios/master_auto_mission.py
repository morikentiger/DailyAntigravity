#!/usr/bin/env python3
import sys
import os
import time
import subprocess

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import AntigravityRPA
from lib.task_parser import get_next_task

def send_complex_text(rpa, text):
    """Robustly sends text (including Japanese) via clipboard and Cmd+V."""
    rpa.log(f"Sending text via clipboard: {text}")
    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(text.encode('utf-8'))

    # Cmd + V
    rpa.run_applescript('tell application "System Events" to keystroke "v" using command down')
    time.sleep(0.5)
    # Enter
    rpa.press_key("enter")

def main():
    rpa = AntigravityRPA()
    list_file = "/Users/moritak129/DailyAntigravity/やりたいリスト.md"

    rpa.log("--- Autonomous Mission: Task Fetching ---")

    # 1. Read next task from the list
    task_name = get_next_task(list_file)

    if not task_name:
        rpa.log("No pending tasks found. Mission aborted.")
        return

    target_text = f"本日は「{task_name}」を作ります。開発を開始してください。"
    rpa.log(f"Next Target: {task_name}")

    # 2. Activate Antigravity Window
    if rpa.activate_by_window_title("Antigravity"):
        rpa.log("Focused Antigravity window.")
        time.sleep(0.5)
        # Click at the chat input area
        if rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9):
            rpa.log("Clicked chat area. Ready to type.")
            time.sleep(1)
            # 3. Send the command!
            send_complex_text(rpa, target_text)
            rpa.log("--- Mission Accomplished: Command Dispatched ---")
        else:
            rpa.log("Failed to click chat area.")
    else:
        rpa.log("Failed to find Antigravity window.")

if __name__ == "__main__":
    main()
