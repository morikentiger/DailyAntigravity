// Day 2 Dashboard - Mini Games Collection
const dailyFolders = [
    {
        id: 'Day2-1',
        dir: '1_SnowballBattle',
        logFile: './1_SnowballBattle/Log.md',
        date: '2026-01-16',
        topic: '雪玉バトル',
        post: '雪玉バトル、開幕。⛄️❄️\n雪原のフィールドで、雪玉を転がして大きく育て、敵にぶつけて吹っ飛ばす。\n\n👇 観測ログ・ダッシュボード\nhttps://morikentiger.github.io/DailyAntigravity/Day2__20260116/index.html?log=Day2-1',
        ok_to_post: true,
        launch: 'game.html',
        media: {
            video: 'media/snowball_battle_demo.webp',
            screenshot: 'media/preview.png'
        }
    }
];

// Helper to resolve paths from the Day parent folder
function resolvePath(itemDir, fileName) {
    if (!fileName) return null;
    return `./${itemDir}/${fileName}`;
}

let currentDate = new Date(2026, 0, 16); // Day 2
let viewMode = 'week';

const container = document.getElementById('viz-container');
const detailView = document.getElementById('detail-view');
const viewBtns = document.querySelectorAll('.view-btn');

function renderDashboard() {
    container.innerHTML = '';
    container.className = `content-grid view-${viewMode}`;

    if (viewMode === 'month' || viewMode === 'week') {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        days.forEach(day => {
            const header = document.createElement('div');
            header.className = 'grid-header';
            header.innerText = day;
            container.appendChild(header);
        });
    }

    const startDate = getStartDate(currentDate, viewMode);
    const dayCount = getDayCount(viewMode);

    for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const matches = dailyFolders.filter(f => f.date === dateStr);

        const cell = document.createElement('div');
        cell.className = `calendar-cell ${matches.length > 0 ? 'has-data' : 'empty'}`;

        const dayName = date.toLocaleDateString('ja-JP', { weekday: 'short' });
        const dayNumber = date.getDate();

        cell.innerHTML = `
            <div class="cell-header">
                <div class="date-label">${dayNumber} <span class="day-name">${dayName}</span></div>
            </div>
            <div class="cell-body">
                ${matches.length > 0 ? `
                    <div class="log-list">
                        ${matches.map(m => `
                            <div class="log-entry" onclick="event.stopPropagation(); showDetailById('${m.id}')">
                                <div class="log-main">
                                    <span class="log-time">${m.id.replace('Day2-', '')}</span>
                                    <span class="log-title" title="${m.topic}">${m.topic}</span>
                                </div>
                                <div class="log-badges">
                                    ${m.media.video ? '🎬' : ''}
                                    ${m.media.screenshot ? '🖼️' : ''}
                                </div>
                                <div class="log-actions" onclick="event.stopPropagation()">
                                    <label class="switch">
                                        <input type="checkbox" ${m.ok_to_post ? 'checked' : ''} onchange="togglePost('${m.id}', this.checked)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="day-topic empty">No Log</div>'}
            </div>
        `;
        container.appendChild(cell);
    }
}

function showDetailById(id) {
    const item = dailyFolders.find(f => f.id === id);
    if (item) showDetail(item);
}

function getStartDate(date, mode) {
    const d = new Date(date);
    if (mode === 'month') {
        const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const dayOfWeek = firstDayOfMonth.getDay();
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() - dayOfWeek);
        return firstDayOfMonth;
    } else if (mode === 'week') {
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d;
    }
    return d;
}

function getDayCount(mode) {
    if (mode === 'month') return 35;
    if (mode === 'week') return 7;
    if (mode === '3day') return 3;
    return 1;
}

function showDetail(item) {
    detailView.style.display = 'block';
    document.getElementById('detail-title').innerText = `${item.id}: ${item.topic}`;
    document.getElementById('detail-date').innerText = item.date;
    document.getElementById('detail-post').innerText = item.post;

    const mediaContainer = document.querySelector('.preview-media');
    mediaContainer.innerHTML = '';

    const videos = Array.isArray(item.media.video) ? item.media.video : [item.media.video];

    videos.forEach(v => {
        const videoDiv = document.createElement('div');
        videoDiv.className = 'media-item video-container';
        const videoPath = resolvePath(item.dir, v);

        if (videoPath) {
            if (videoPath.endsWith('.gif') || videoPath.endsWith('.webp')) {
                videoDiv.innerHTML = `<img src="${videoPath}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">`;
            } else {
                videoDiv.innerHTML = `<video controls src="${videoPath}" style="width:100%; border-radius:8px;"></video>`;
            }
            addTrigger(videoDiv);
            mediaContainer.appendChild(videoDiv);
        }
    });

    if (videos.filter(v => v).length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'media-item video-container';
        placeholder.innerHTML = `<div class="placeholder-text"><span class="icon">🎬</span> No Video recorded</div>`;
        mediaContainer.appendChild(placeholder);
    }

    const screens = Array.isArray(item.media.screenshot) ? item.media.screenshot : [item.media.screenshot];
    screens.forEach(s => {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'media-item image-container';
        const screenPath = resolvePath(item.dir, s);

        if (screenPath) {
            imgDiv.innerHTML = `<img src="${screenPath}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            addTrigger(imgDiv);
            mediaContainer.appendChild(imgDiv);
        }
    });

    if (screens.filter(s => s).length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'media-item image-container';
        placeholder.innerHTML = `<div class="placeholder-text"><span class="icon">🖼️</span> No Screenshot recorded</div>`;
        mediaContainer.appendChild(placeholder);
    }

    function addTrigger(el) {
        el.style.cursor = 'zoom-in';
        el.onclick = () => {
            const content = el.innerHTML;
            if (!content.includes('placeholder-text')) {
                openLightbox(content);
            }
        };
    }

    detailView.scrollIntoView({ behavior: 'smooth' });

    const url = new URL(window.location);
    url.searchParams.set('log', item.id);
    window.history.pushState({}, '', url);
}

function shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('.share-btn-floating');
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerText = originalText; }, 2000);
    });
}

const lightbox = document.getElementById('lightbox');
const lightboxContent = document.querySelector('.lightbox-content');

function openLightbox(content) {
    lightboxContent.innerHTML = content;
    lightbox.classList.add('active');

    const video = lightboxContent.querySelector('video');
    if (video) video.play();
}

lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.classList.contains('close-lightbox')) {
        lightbox.classList.remove('active');
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxContent.innerHTML = '';
            }
        }, 300);
    }
};

async function togglePost(dayId, status) {
    const item = dailyFolders.find(f => f.id === dayId);
    if (!item) return;

    console.log(`Setting OK_TO_POST for ${dayId} to: ${status}`);

    try {
        const response = await fetch('http://localhost:3000/api/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filePath: `Day2__20260116/${item.dir}/Log.md`,
                status: status
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log('File updated successfully');
            item.ok_to_post = status;
        } else {
            console.error('Failed to update file:', result.error);
            alert('Error updating file. Is the sync server running?');
        }
    } catch (err) {
        console.error('Sync error:', err);
        alert('Could not connect to sync server. Please run `node sync-server.js`');
    }
}

viewBtns.forEach(btn => {
    btn.onclick = () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        viewMode = btn.dataset.mode;
        renderDashboard();
    };
});

renderDashboard();

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const logId = params.get('log');
    if (logId) {
        showDetailById(logId);
    }
};
