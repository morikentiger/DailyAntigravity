import sys
import os
import time

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import AntigravityRPA

def main():
    rpa = AntigravityRPA()

    rpa.log("--- Civilization Boot Sequence Started ---")

    # 1. Activate Chrome (or your preference)
    rpa.activate_app("Google Chrome")
    time.sleep(1)

    # 2. Open a new tab (Cmd + T)
    rpa.log("Opening new tab...")
    rpa.run_applescript('tell application "System Events" to keystroke "t" using command down')
    time.sleep(1)

    # 3. Type the local dashboard URL
    # Assuming the dashboard is running on port 3000 or similar
    # (The user has sync-server.js running, let's guess the URL or use a placeholder)
    dashboard_url = "http://localhost:3000"
    rpa.log(f"Navigating to {dashboard_url}")
    rpa.type_text(dashboard_url)
    rpa.press_key("enter")

    time.sleep(3)

    rpa.log("--- Boot Sequence Complete ---")
    rpa.log("Note: To make this more robust, we would use rpa.find_image_on_screen() to confirm the page loaded.")

if __name__ == "__main__":
    main()
