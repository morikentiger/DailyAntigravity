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
    },
    {
        id: 'Day 4',
        title: 'Pizza Eater',
        date: '2026.01.18',
        path: 'Day4__20260118/index.html',
        appPath: 'Day4__20260118/1_PizzaEater/game.html',
        activities: 1,
        theme: '#ff6b35'
    },
    {
        id: 'Day 5',
        title: 'Bomb Counter',
        date: '2026.01.18',
        path: 'Day5__20260118/index.html',
        appPath: 'Day5__20260118/1_BombCounter/game.html',
        activities: 1,
        theme: '#ff8800'
    },
    {
        id: 'Day 6',
        title: 'Pokey Blowaway',
        date: '2026.01.18',
        path: 'Day6__20260118/index.html',
        appPath: 'Day6__20260118/1_PokeyBlowaway/game.html',
        activities: 1,
        theme: '#f4d03f'
    },
    {
        id: 'Day 7',
        title: 'Slippery Race',
        date: '2026.01.19',
        path: 'Day7__20260119/index.html',
        appPath: 'Day7__20260119/1_SlipperyRace/game.html',
        activities: 1,
        theme: '#bae6fd'
    },
    {
        id: 'Day 8',
        title: 'Winding Path Race',
        date: '2026.01.19',
        path: 'Day8__20260119/index.html',
        appPath: 'Day8__20260119/1_WindingRace/index.html',
        activities: 1,
        theme: '#00ffff'
    },
    {
        id: 'Day 9',
        title: 'Near-Pin Precision',
        date: '2026.01.20',
        path: 'Day9__20260120/index.html',
        appPath: 'Day9__20260120/1_NearPin/index.html',
        activities: 1,
        theme: '#102a43'
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
