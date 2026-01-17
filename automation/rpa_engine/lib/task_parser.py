import sys
import os
import re

def get_next_task(list_file_path):
    """
    Reads 'やりたいリスト.md' and returns the first uncompleted task.
    Looks for the pattern: - [ ] Task Name
    """
    if not os.path.exists(list_file_path):
        return None

    with open(list_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the first incomplete task [- [ ] Task Name]
    # We focus on the Roadmap section primarily
    match = re.search(r'- \[ \]\s*(.*)', content)
    if match:
        task_name = match.group(1).strip()
        return task_name
    return None

def main():
    # Target file
    list_file = "/Users/moritak129/DailyAntigravity/やりたいリスト.md"

    next_task = get_next_task(list_file)
    if next_task:
        # Format the message for Antigravity
        message = f"本日は「{next_task}」を作ります。開発を開始してください。"
        print(message)
    else:
        print("No pending tasks found in the list.")

if __name__ == "__main__":
    main()
