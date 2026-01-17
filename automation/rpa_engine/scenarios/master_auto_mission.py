#!/usr/bin/env python3
"""
master_auto_mission.py - 自律開発ミッション起動スクリプト

やりたいリスト.md から次のタスクを読み取り、
Antigravity に自律開発命令を送信する。
"""
import sys
import os
import time
import subprocess

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core import AntigravityRPA
from lib.task_parser import get_next_task

LOG_FILE = "/Users/moritak129/DailyAntigravity/automation/mission_log.txt"
CHECKPOINT_FILE = "/Users/moritak129/DailyAntigravity/automation/checkpoint.md"

def log_to_file(message):
    """Logs to a local file for debugging."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {message}\n")
    except:
        pass
    print(f"[{timestamp}] {message}")

def initialize_checkpoint(task_name):
    """Initializes the checkpoint file for this mission."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    content = f"""# Checkpoint - 自律開発ステータス

## 現在のミッション
- **タスク名**: {task_name}
- **開始時刻**: {timestamp}

## ステータス
- **状態**: RUNNING

## 進捗チェックリスト
(AIが自動で記入)

## 次のアクション
(AIが自動で記入)

## 最終更新
{timestamp}
"""
    try:
        with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
            f.write(content)
        log_to_file(f"Checkpoint initialized for: {task_name}")
    except Exception as e:
        log_to_file(f"Failed to initialize checkpoint: {e}")

def send_command_to_antigravity(rpa, text):
    """Sends the command via clipboard."""
    log_to_file(f"Preparing command: {text[:50]}...")

    # Clear clipboard
    rpa.run_applescript('set the clipboard to ""')
    time.sleep(0.5)

    # Set new content
    try:
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        process.communicate(text.encode('utf-8'))
        log_to_file("pbcopy executed.")
    except Exception as e:
        log_to_file(f"pbcopy error: {e}")

    time.sleep(1.5)

    # Paste
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
    log_to_file("Command sent!")

def main():
    rpa = AntigravityRPA()
    list_file = "/Users/moritak129/DailyAntigravity/やりたいリスト.md"

    log_to_file("=== AUTONOMOUS MISSION START ===")

    # 1. Read next task
    task_name = get_next_task(list_file)
    if not task_name:
        log_to_file("No task found. Aborting.")
        return

    log_to_file(f"Target: {task_name}")

    # 2. Initialize checkpoint
    initialize_checkpoint(task_name)

    # 3. Build autonomous command
    # This command instructs the AI to work independently
    command = f"""本日は「{task_name}」を作ります。

【自律開発モード】
- 自分で計画を立てて、checkpoint.md に進捗を書き出しながら進めてください
- 承認や確認は不要です。お任せで最後まで完走してください
- 実装 → 検証 → ポータル更新 → Git同期 まで一気にお願いします
- 途中で止まる場合は checkpoint.md の状態を WAITING に変更してください
- 完了したら COMPLETE に変更してください

開発を開始してください。"""

    log_to_file(f"Command length: {len(command)} chars")

    # 4. Focus and send
    if rpa.activate_by_window_title("Antigravity"):
        log_to_file("Focused Antigravity window.")
        time.sleep(1.0)

        if rpa.click_window_area("Antigravity", ratio_x=0.9, ratio_y=0.9):
            log_to_file("Clicked chat area.")
            time.sleep(1.5)

            send_command_to_antigravity(rpa, command)
            log_to_file("=== MISSION DISPATCHED ===")
        else:
            log_to_file("Failed to click window.")
    else:
        log_to_file("Failed to find Antigravity window.")

if __name__ == "__main__":
    main()
