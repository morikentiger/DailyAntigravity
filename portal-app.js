const days = [
    {
        id: 'Day 0',
        title: 'Engine Initialization',
        date: '2026.01.15',
        path: 'Day0_20260115/index.html',
        activities: 6,
        theme: '#0088ff'
    },
    {
        id: 'Day 1',
        title: 'Space Invaders',
        date: '2026.01.16',
        path: 'Day1__20260116/index.html',
        activities: 1,
        theme: '#00ffaa'
    }
];

function renderPortal() {
    const grid = document.getElementById('portal-grid');
    grid.innerHTML = days.map(day => `
        <a href="${day.path}" class="day-card" style="--accent: ${day.theme}">
            <div class="day-label">${day.id}</div>
            <div class="day-title">${day.title}</div>
            <div class="day-date">${day.date}</div>
            <div class="day-stats">
                <div class="stat">📑 ${day.activities} Activities</div>
                <div class="stat">🚀 Live Dashboard</div>
            </div>
        </a>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderPortal);
