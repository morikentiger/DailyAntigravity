// Day 4 Dashboard - App.js
const dailyFolders = [
    {
        name: "1_PizzaEater",
        date: "2026-01-18",
        title: "Pizza Eater 🍕",
        description: "ピザを端からかじって全部食べるゲーム",
        logPath: "1_PizzaEater/Log.md",
        mediaPath: null,
        postContent: "🍕 Day 4: Pizza Eater 完成！ピザを端から食べていくゲームを作りました。"
    }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});

function renderDashboard() {
    const container = document.getElementById('viz-container');

    container.innerHTML = `
        <div class="dashboard-header">
            <h1>🍕 Day 4: Pizza Eater</h1>
            <p>2026年1月18日 - 自律開発モードで作成</p>
        </div>
        <div class="project-grid">
            ${dailyFolders.map(folder => `
                <div class="project-card" onclick="showDetail('${folder.name}')">
                    <div class="project-icon">🍕</div>
                    <div class="project-title">${folder.title}</div>
                    <div class="project-desc">${folder.description}</div>
                    <a href="${folder.name}/game.html" class="play-btn">▶ PLAY</a>
                </div>
            `).join('')}
        </div>
    `;
}

function showDetail(folderName) {
    const folder = dailyFolders.find(f => f.name === folderName);
    if (!folder) return;

    const detail = document.getElementById('detail-view');
    detail.innerHTML = `
        <div class="detail-header">
            <h2>${folder.title}</h2>
            <button onclick="closeDetail()">✕</button>
        </div>
        <div class="detail-content">
            <p>${folder.description}</p>
            <div class="detail-actions">
                <a href="${folder.name}/game.html" class="btn primary">🎮 ゲームをプレイ</a>
            </div>
        </div>
    `;
    detail.classList.add('active');
}

function closeDetail() {
    document.getElementById('detail-view').classList.remove('active');
}
