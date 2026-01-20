// Day 13 Dashboard - Smash Physics

const dailyFolders = [
    {
        name: '1_SmashPhysics',
        title: '💥 Smash Physics Engine',
        description: 'ダメージ蓄積による吹っ飛ばし物理！',
        logPath: '1_SmashPhysics/Log.md',
        appPath: '1_SmashPhysics/index.html',
        mediaPath: '1_SmashPhysics/media/gameplay.webp'
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
