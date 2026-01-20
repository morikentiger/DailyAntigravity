// Day 15 Dashboard - Mario Kart Drift

const dailyFolders = [
    {
        name: '1_MarioKart',
        title: '🏎️ Drift Physics Engine',
        description: 'マリオカート風のドリフト＆ターボエンジン！',
        logPath: '1_MarioKart/Log.md',
        appPath: '1_MarioKart/index.html',
        mediaPath: '1_MarioKart/media/gameplay.webp'
    }
];

// Render dashboard
function renderDashboard() {
    const container = document.getElementById('viz-container');

    container.innerHTML = dailyFolders.map((folder, i) => `
        <div class="calendar-day" onclick="showDetail(${i})">
            <div class="day-number">${i + 1}</div>
            <div class="day-title">${folder.title}</div>
            <div class="day-desc">${folder.description}</div>
        </div>
    `).join('');
}

// Show detail view
function showDetail(index) {
    const folder = dailyFolders[index];
    const detailView = document.getElementById('detail-view');

    detailView.innerHTML = `
        <button class="close-btn" onclick="closeDetail()">×</button>
        <h2>${folder.title}</h2>
        <p>${folder.description}</p>

        <div class="media-container">
            <img src="${folder.mediaPath}" style="max-width: 100%; border-radius: 12px;" />
        </div>

        <div class="action-buttons">
            <a href="${folder.appPath}" class="btn primary">🎮 Play Game</a>
            <a href="${folder.logPath}" class="btn secondary">📝 View Log</a>
        </div>
    `;

    detailView.classList.add('active');
}

function closeDetail() {
    document.getElementById('detail-view').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', renderDashboard);
