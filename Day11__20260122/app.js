// Day 11 Dashboard - Terrain Engine

const dailyFolders = [
    {
        name: '1_TerrainEngine',
        title: '🌍 Terraforming Giant',
        description: '大地を上げ下げして世界を創る！',
        logPath: '1_TerrainEngine/Log.md',
        appPath: '1_TerrainEngine/index.html',
        mediaPath: '1_TerrainEngine/media/gameplay.mp4'
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
            <video controls autoplay loop muted style="max-width: 100%; border-radius: 12px;">
                <source src="${folder.mediaPath}" type="video/mp4">
            </video>
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
