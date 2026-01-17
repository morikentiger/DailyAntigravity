const days = [
    {
        id: 'Day 0',
        title: 'Engine Initialization',
        date: '2026.01.15',
        path: 'Day0__20260115/index.html',
        appPath: null,
        activities: 6,
        theme: '#0088ff'
    },
    {
        id: 'Day 1',
        title: 'Space Invaders',
        date: '2026.01.16',
        path: 'Day1__20260116/index.html',
        appPath: 'Day1__20260116/1_BaseGame/game.html',
        activities: 1,
        theme: '#00ffaa'
    },
    {
        id: 'Day 2',
        title: 'Snowball Battle',
        date: '2026.01.16',
        path: 'Day2__20260116/index.html',
        appPath: 'Day2__20260116/1_SnowballBattle/game.html',
        activities: 1,
        theme: '#ffffff'
    },
    {
        id: 'Day 3',
        title: 'Neon Breakout',
        date: '2026.01.17',
        path: 'Day3__20260117/index.html',
        appPath: 'Day3__20260117/1_Breakout/game.html',
        activities: 1,
        theme: '#ff00ff'
    }
];

function renderPortal() {
    const grid = document.getElementById('portal-grid');
    grid.innerHTML = days.map(day => `
        <div class="day-card" style="--accent: ${day.theme}">
            <div class="day-label">${day.id}</div>
            <div class="day-title">${day.title}</div>
            <div class="day-date">${day.date}</div>
            <div class="day-stats">
                <div class="stat">📑 ${day.activities} Activities</div>
            </div>
            <div class="card-actions">
                <a href="${day.path}" class="btn-action secondary">📊 Dashboard</a>
                ${day.appPath ? `<a href="${day.appPath}" class="btn-action primary">🚀 Launch App</a>` : ''}
            </div>
        </div>
    `).join('');

    // Update the sync-status in the footer
    const statusEl = document.querySelector('.sync-status');
    if (statusEl) {
        statusEl.innerText = `All Systems Operational • Updated: ${new Date().toLocaleString('ja-JP')}`;
    }
}

document.addEventListener('DOMContentLoaded', renderPortal);
