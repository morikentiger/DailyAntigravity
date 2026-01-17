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

def set_clipboard_robustly(log_msg, text):
    """Sets clipboard using native AppKit. The most robust way on macOS."""
    log_to_file(f"Attempting native AppKit clipboard set: {text[:30]}...")

    try:
        from AppKit import NSPasteboard, NSStringPboardType
        pb = NSPasteboard.generalPasteboard()
        pb.declareTypes_owner_([NSStringPboardType], None)
        pb.setString_forType_(text, NSStringPboardType)
        time.sleep(1.0)

        # Verify
        current = pb.stringForType_(NSStringPboardType)
        if current == text:
            log_to_file("NATIVE AppKit clipboard verification SUCCESS.")
            return True
        else:
            log_to_file(f"Native verification FAILED. Current: {current[:30]}...")
    except Exception as e:
        log_to_file(f"Native AppKit failed: {e}")

    return False

def send_complex_text(rpa, text):
    """Types text directly using AppleScript keystroke (Bypasses clipboard)."""
    log_to_file(f"Typing text directly: {text[:30]}...")

    # We use a trick: Japanese text is hard to 'keystroke' individually.
    # But since CLI/Shortcut clipboard is failing, let's try to keystroke the whole string.
    # System Events 'keystroke' can handle some unicode if the target app supports it.

    # Escape quotes for AppleScript
    safe_text = text.replace('"', '\\"')
    script = f'''
    tell application "System Events"
        set the text_to_type to "{safe_text}"
        repeat with i from 1 to count characters of the text_to_type
            keystroke (character i of the text_to_type)
            delay 0.01
        end repeat
        delay 0.5
        keystroke return
    end tell
    '''
    try:
        rpa.run_applescript(script)
        log_to_file("Keystrokes sent.")
    except Exception as e:
        log_to_file(f"Typing failed: {e}")

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
