import pyautogui
import time
import os
from PIL import Image

def capture_anchor(name, size=50):
    print(f"5秒後にマウス位置の周囲 {size}x{size} をキャプチャします...")
    print("キャプチャしたいボタンやアイコンの上にマウスを置いてください。")

    for i in range(5, 0, -1):
        print(f"{i}...")
        time.sleep(1)

    x, y = pyautogui.position()
    print(f"Capturing at ({x}, {y})...")

    # Calculate box
    left = x - size // 2
    top = y - size // 2

    # Ensure directory exists
    save_dir = "automation/rpa_engine/assets"
    os.makedirs(save_dir, exist_ok=True)

    # Capture
    screenshot = pyautogui.screenshot(region=(left, top, size, size))
    save_path = os.path.join(save_dir, f"{name}.png")
    screenshot.save(save_path)

    print(f"Anchor saved: {save_path}")
    print(f"You can now use: rpa.find_image_on_screen('{save_path}')")

if __name__ == "__main__":
    import sys
    anchor_name = sys.argv[1] if len(sys.argv) > 1 else "target"
    capture_anchor(anchor_name)
