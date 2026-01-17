// Antigravity Mission Control - Monitor App
// This file reads local files to display status

// Since we're running from file://, we need to use a simple approach
// The page auto-refreshes every 5 seconds via meta tag

// Configuration
const CONFIG = {
    checkpointPath: 'checkpoint.md',
    logPath: 'auto_continue_log.txt',
    taskListPath: '../やりたいリスト.md'
};

// Parse checkpoint.md content
function parseCheckpoint(content) {
    const result = {
        status: 'IDLE',
        taskName: '--',
        startTime: '--',
        checklist: [],
        nextAction: {
            time: '--',
            content: '--',
            trigger: '--'
        }
    };

    // Extract status
    const statusMatch = content.match(/\*\*状態\*\*:\s*(\w+)/);
    if (statusMatch) {
        result.status = statusMatch[1];
    }

    // Extract task name
    const taskMatch = content.match(/\*\*タスク名\*\*:\s*(.+)/);
    if (taskMatch) {
        result.taskName = taskMatch[1].trim();
    }

    // Extract start time
    const timeMatch = content.match(/\*\*開始時刻\*\*:\s*(.+)/);
    if (timeMatch) {
        result.startTime = timeMatch[1].trim();
    }

    // Extract next action details
    const nextTimeMatch = content.match(/\*\*予定時刻\*\*:\s*(.+)/);
    if (nextTimeMatch) {
        result.nextAction.time = nextTimeMatch[1].trim();
    }

    const nextContentMatch = content.match(/\*\*内容\*\*:\s*(.+)/);
    if (nextContentMatch) {
        result.nextAction.content = nextContentMatch[1].trim();
    }

    const nextTriggerMatch = content.match(/\*\*トリガー\*\*:\s*(.+)/);
    if (nextTriggerMatch) {
        result.nextAction.trigger = nextTriggerMatch[1].trim();
    }

    // Extract checklist items
    const checklistRegex = /- \[([ x\/])\] (.+)/g;
    let match;
    while ((match = checklistRegex.exec(content)) !== null) {
        result.checklist.push({
            status: match[1] === 'x' ? 'completed' : match[1] === '/' ? 'in-progress' : 'pending',
            text: match[2].trim()
        });
    }

    return result;
}

// Calculate countdown
function getCountdown(targetTimeStr) {
    try {
        const target = new Date(targetTimeStr.replace(' ', 'T'));
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) return '⏰ 予定時刻です！';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `⏳ あと ${days}日 ${hours % 24}時間`;
        }
        return `⏳ あと ${hours}時間 ${minutes}分`;
    } catch (e) {
        return '';
    }
}

// Parse log file content
function parseLog(content) {
    const lines = content.trim().split('\n').slice(-10).reverse();
    return lines.map(line => {
        const timeMatch = line.match(/\[([\d-]+ [\d:]+)\]/);
        const time = timeMatch ? timeMatch[1] : '';
        const message = line.replace(/\[[\d-]+ [\d:]+\]/, '').trim();

        let type = 'info';
        if (message.includes('COMPLETE') || message.includes('sent!')) type = 'success';
        if (message.includes('WAITING') || message.includes('shortly')) type = 'warning';

        return { time, message, type };
    });
}

// Parse task list to get next task
function parseTaskList(content) {
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.match(/- \[ \]/) && !line.includes('やったこと')) {
            return line.replace(/- \[ \]/, '').trim();
        }
    }
    return '全タスク完了！ 🎉';
}

// Update the UI
function updateUI(checkpoint, logs, nextTask) {
    // Status
    const statusEl = document.getElementById('current-status');
    const indicatorEl = document.getElementById('status-indicator');

    statusEl.textContent = checkpoint.status;
    indicatorEl.className = 'status-indicator ' + checkpoint.status.toLowerCase();

    // Apply color to status text
    const statusColors = {
        'RUNNING': '#4a9eff',
        'WAITING': '#f59e0b',
        'COMPLETE': '#22c55e',
        'IDLE': '#8888aa'
    };
    statusEl.style.color = statusColors[checkpoint.status] || '#ffffff';

    // Mission
    document.getElementById('current-mission').textContent = checkpoint.taskName;
    document.getElementById('mission-start').textContent = `開始: ${checkpoint.startTime}`;

    // Next task
    document.getElementById('next-task').textContent = nextTask;

    // Next action schedule
    document.getElementById('next-action-time').textContent = checkpoint.nextAction.time;
    document.getElementById('next-action-content').textContent = checkpoint.nextAction.content;
    document.getElementById('next-action-trigger').textContent = `トリガー: ${checkpoint.nextAction.trigger}`;
    document.getElementById('countdown').textContent = getCountdown(checkpoint.nextAction.time);

    // Daemon status (check if recent log entries exist)
    const daemonEl = document.getElementById('daemon-status');
    const lastActionEl = document.getElementById('last-action');

    if (logs.length > 0) {
        daemonEl.textContent = '🟢 稼働中';
        daemonEl.className = 'daemon-status active';
        lastActionEl.textContent = `最終アクション: ${logs[0].time}`;
    } else {
        daemonEl.textContent = '🔴 停止中';
        daemonEl.className = 'daemon-status inactive';
        lastActionEl.textContent = '最終アクション: --';
    }

    // Checklist
    const checklistEl = document.getElementById('checklist');
    checklistEl.innerHTML = checkpoint.checklist.map(item => `
        <div class="checklist-item ${item.status}">
            <span>${item.status === 'completed' ? '✅' : item.status === 'in-progress' ? '🔄' : '⬜'}</span>
            <span>${item.text}</span>
        </div>
    `).join('');

    // Logs
    const logEl = document.getElementById('log-entries');
    logEl.innerHTML = logs.map(log => `
        <div class="log-entry ${log.type}">
            <span class="log-time">${log.time}</span>
            <span>${log.message}</span>
        </div>
    `).join('');

    // Last update
    document.getElementById('last-update').textContent =
        `最終更新: ${new Date().toLocaleString('ja-JP')}`;
}

// For file:// protocol, we'll use embedded data
// This gets updated by a helper script or manually
async function loadData() {
    try {
        // Try to fetch local files (works with local server)
        const [checkpointResp, logResp, taskResp] = await Promise.all([
            fetch(CONFIG.checkpointPath).catch(() => null),
            fetch(CONFIG.logPath).catch(() => null),
            fetch(CONFIG.taskListPath).catch(() => null)
        ]);

        const checkpointText = checkpointResp ? await checkpointResp.text() : '';
        const logText = logResp ? await logResp.text() : '';
        const taskText = taskResp ? await taskResp.text() : '';

        const checkpoint = parseCheckpoint(checkpointText);
        const logs = parseLog(logText);
        const nextTask = parseTaskList(taskText);

        updateUI(checkpoint, logs, nextTask);
    } catch (e) {
        console.log('Running in file:// mode, using fallback display');
        // Show a message for file:// mode
        document.getElementById('current-status').textContent = 'ローカルサーバーが必要';
        document.getElementById('current-status').style.color = '#f59e0b';
        document.getElementById('current-status').style.fontSize = '1.5rem';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadData);
