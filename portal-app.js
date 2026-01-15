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
}

document.addEventListener('DOMContentLoaded', renderPortal);
