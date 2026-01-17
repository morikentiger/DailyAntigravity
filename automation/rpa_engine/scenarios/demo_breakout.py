import sys
import os
import time
import subprocess

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import AntigravityRPA

def send_complex_text(rpa, text):
    """Robustly sends text (including Japanese) via clipboard and Cmd+V."""
    rpa.log(f"Sending text via clipboard: {text}")
    # Copy to clipboard using pbcopy (macOS native)
    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(text.encode('utf-8'))

    # Cmd + V
    rpa.run_applescript('tell application "System Events" to keystroke "v" using command down')
    time.sleep(0.5)
    # Enter
    rpa.press_key("enter")

def main():
    rpa = AntigravityRPA()
    target_text = "本日は自動でブロック崩しゲームを作ります"

    rpa.log("--- Antigravity RPA Mission Start ---")

    # 1. Activate and CLICK the window named "Antigravity"
    # Merely focusing isn't enough; we need to click to take the keyboard focus
    if rpa.activate_by_window_title("Antigravity"):
        rpa.log("Focused Antigravity window.")
        time.sleep(0.5)
        # Click at 90% width and 90% height to hit the chat input area
        if rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9):
            rpa.log("Clicked bottom-right of Antigravity to hit chat area.")
        else:
            rpa.log("Could not click window area.")
    else:
        rpa.log("Warning: Could not find window with 'Antigravity' in title.")

    time.sleep(1)

    # 2. Type and Enter
    send_complex_text(rpa, target_text)

    rpa.log("--- Mission Accomplished ---")

if __name__ == "__main__":
    main()
