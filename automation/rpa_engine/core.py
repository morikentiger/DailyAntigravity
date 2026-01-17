import os
import time
import subprocess
import pyautogui
import cv2
import numpy as np
from PIL import Image

class AntigravityRPA:
    def __init__(self, debug=True):
        self.debug = debug
        # Default safety: mouse to top-left corner to abort
        pyautogui.FAILSAFE = True

    def log(self, message):
        if self.debug:
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] [RPA] {message}")

    def run_applescript(self, script):
        """Execute a raw AppleScript and return the result."""
        process = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
        if process.returncode != 0:
            self.log(f"AppleScript Error: {process.stderr}")
        return process.stdout.strip()

    def activate_app(self, app_name):
        self.log(f"Activating app/process: {app_name}")
        # More robust way to activate by process name using System Events
        script = f'''
        tell application "System Events"
            if exists process "{app_name}" then
                set frontmost of process "{app_name}" to true
            end if
        end tell
        '''
        return self.run_applescript(script)

    def activate_by_window_title(self, title_part):
        self.log(f"Searching for window with title containing: {title_part}")
        script = f'''
        tell application "System Events"
            set processList to every process whose background only is false
            repeat with p in processList
                set winList to every window of p
                repeat with w in winList
                    try
                        if title of w contains "{title_part}" then
                            set frontmost of p to true
                            return name of p
                        end if
                    end try
                end repeat
            end repeat
        end tell
        '''
        return self.run_applescript(script)

    def click_window_area(self, title_part, ratio_x=0.5, ratio_y=0.5):
        """Click at a relative position within a window. Default is center."""
        self.log(f"Clicking window '{title_part}' at ratio ({ratio_x}, {ratio_y})")
        script = f'''
        tell application "System Events"
            set processList to every process whose background only is false
            repeat with p in processList
                set winList to every window of p
                repeat with w in winList
                    try
                        if title of w contains "{title_part}" then
                            set pos to position of w
                            set sz to size of w
                            set targetX to (item 1 of pos) + (item 1 of sz) * {ratio_x}
                            set targetY to (item 2 of pos) + (item 2 of sz) * {ratio_y}
                            return (targetX as string) & "," & (targetY as string)
                        end if
                    end try
                end repeat
            end repeat
        end tell
        return ""
        '''
        result = self.run_applescript(script)
        if result and "," in result:
            try:
                parts = result.split(",")
                x, y = float(parts[0]), float(parts[1])
                self.click_at(int(x), int(y))
                return True
            except (ValueError, IndexError) as e:
                self.log(f"Coordinate parsing error: {e} (Result was: '{result}')")
        return False

    def click_at(self, x, y, duration=0.2):
        self.log(f"Clicking at ({x}, {y})")
        pyautogui.moveTo(x, y, duration=duration)
        pyautogui.click()

    def type_text(self, text, interval=0.05):
        self.log(f"Typing text: {text[:20]}...")
        pyautogui.write(text, interval=interval)

    def press_key(self, key):
        self.log(f"Pressing key: {key}")
        pyautogui.press(key)

    def find_image_on_screen(self, template_path, confidence=0.8):
        """Finds a template image on the current screen and returns center (x, y)."""
        self.log(f"Searching for image: {template_path}")
        try:
            # Using PyAutoGUI's built-in locate (which uses opencv/pilllow internally)
            location = pyautogui.locateCenterOnScreen(template_path, confidence=confidence)
            if location:
                self.log(f"Found image at: {location}")
                return location
            else:
                self.log("Image not found on screen.")
                return None
        except Exception as e:
            self.log(f"Search error: {e}")
            return None

    def wait_for_image(self, template_path, timeout=30, interval=1):
        """Wait until an image appears on screen."""
        self.log(f"Waiting for image: {template_path} (timeout: {timeout}s)")
        start_time = time.time()
        while time.time() - start_time < timeout:
            location = self.find_image_on_screen(template_path)
            if location:
                return location
            time.sleep(interval)
        self.log("Wait timeout reached.")
        return None

# Simple Test Logic
if __name__ == "__main__":
    rpa = AntigravityRPA()
    print("Antigravity RPA Core Initialized.")
