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

def set_clipboard_robustly(rpa, text):
    """Sets clipboard by writing to a file and using AppleScript to read it."""
    log_to_file(f"Attempting to set clipboard via file: {text[:30]}...")

    temp_file = "/Users/moritak129/DailyAntigravity/automation/tmp_cmd.txt"
    try:
        with open(temp_file, "w", encoding="utf-8") as f:
            f.write(text)

        # Method 3: AppleScript reading from file
        log_to_file("Trying Method 3 (AppleScript read file)...")
        # AppleScript to read file and set clipboard
        script = f'set the clipboard to (read POSIX file "{temp_file}" as «class utf8»)'
        subprocess.run(['osascript', '-e', script], check=True)
        time.sleep(1.0)

        # Verify
        # If pbpaste fails, we'll try a different verification or just assume success if no error
        try:
            current = subprocess.check_output(['pbpaste'], text=True, timeout=2).strip()
            if current == text:
                log_to_file("Clipboard verification SUCCESS (Method 3).")
                return True
            else:
                log_to_file(f"Method 3 verification failed. Current: {current[:30]}...")
        except:
             log_to_file("pbpaste still failing, but script didn't error. Proceeding...")
             return True # Assume OK if osascript didn't fail

    except Exception as e:
        log_to_file(f"Method 3 failed: {e}")

    return False

def send_complex_text(rpa, text):
    """Robustly sends text via clipboard and Cmd+V."""
    log_to_file("Starting send_complex_text")

    if not set_clipboard_robustly(rpa, text):
        log_to_file("Warning: Continuing despite clipboard verification failure.")

    # Paste
    rpa.run_applescript('tell application "System Events" to keystroke "v" using command down')
    time.sleep(1.5)

    # Confirm (Send)
    rpa.press_key("enter")
    log_to_file("Enter key pressed.")

def main():
    rpa = AntigravityRPA()
    list_file = "/Users/moritak129/DailyAntigravity/やりたいリスト.md"

    log_to_file("--- MISSION START ---")

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
        time.sleep(1.0) # Longer wait for focus

        # 3. Click Chat Area
        if rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9):
            log_to_file("Clicked chat area.")
            time.sleep(1.5)
            # 4. Paste and Send
            send_complex_text(rpa, target_text)
            log_to_file("--- MISSION COMPLETE ---")
        else:
            log_to_file("Failed to click window.")
    else:
        log_to_file("Failed to find Antigravity window.")

if __name__ == "__main__":
    main()
