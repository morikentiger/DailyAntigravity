// Simulate folder discovery
const dailyFolders = [
    {
        id: 'Day0-1',
        dir: 'Day0-1_20260115_Setup',
        date: '2026-01-15',
        topic: 'Engine Setup & Dashboard',
        post: 'DailyAG 運用開始。自動投稿パイプラインとダッシュボードの構築が完了。',
        ok_to_post: true,
        media: { video: 'media/dashboard_overview.gif', screenshot: 'media/01_week.png' }
    }
];

let currentDate = new Date(2026, 0, 15); // Current simulation date
let viewMode = 'week';

const container = document.getElementById('viz-container');
const detailView = document.getElementById('detail-view');
const viewBtns = document.querySelectorAll('.view-btn');

function renderDashboard() {
    container.innerHTML = '';
    container.className = `content-grid view-${viewMode}`;

    // Add Day Headers for Month/Week view
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

        // Use local time for date string to avoid timezone offset shifts (ISO is UTC)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Fix: Don't show future dates in 'empty' cells if it confuses the user,
        // OR clearly mark "Future" cells. For now, let's keep them but ensure the date is correct.
        const dayData = dailyFolders.find(f => f.date === dateStr);

        const cell = document.createElement('div');
        cell.className = `calendar-cell ${dayData ? 'has-data' : 'empty'}`;
        if (dayData) cell.onclick = () => showDetail(dayData);

        const dayName = date.toLocaleDateString('ja-JP', { weekday: 'short' });
        const dayNumber = date.getDate();

        cell.innerHTML = `
            <div class="cell-header">
                <div>
                    <div class="date-label">${dayNumber} <span class="day-name">${dayName}</span></div>
                </div>
                ${dayData ? `
                <div class="post-toggle-container" onclick="event.stopPropagation()">
                    <label class="switch">
                        <input type="checkbox" ${dayData.ok_to_post ? 'checked' : ''} onchange="togglePost('${dayData.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>` : ''}
            </div>
            <div class="cell-body">
                ${dayData ? `
                    <div class="day-topic">${dayData.topic}</div>
                    <span class="status-badge">ACTIVE</span>
                ` : '<div class="day-topic empty">No Log</div>'}
            </div>
        `;
        container.appendChild(cell);
    }
}

function getStartDate(date, mode) {
    const d = new Date(date);
    if (mode === 'month') {
        const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() - dayOfWeek); // Go back to Sunday
        return firstDayOfMonth;
    } else if (mode === 'week') {
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d;
    }
    return d;
}

function getDayCount(mode) {
    if (mode === 'month') return 35; // 5 weeks
    if (mode === 'week') return 7;
    if (mode === '3day') return 3;
    return 1;
}

function showDetail(item) {
    detailView.style.display = 'block';
    document.getElementById('detail-title').innerText = `Day ${item.id.replace('Day', '')}: ${item.topic}`;
    document.getElementById('detail-date').innerText = item.date;
    document.getElementById('detail-post').innerText = item.post;

    const mediaContainer = document.querySelector('.preview-media');
    mediaContainer.innerHTML = ''; // Clear previous

    // Video (or Animation) Display
    const videoDiv = document.createElement('div');
    videoDiv.className = 'media-item video-container';
    if (item.media.video) {
        if (item.media.video.endsWith('.gif')) {
            videoDiv.innerHTML = `<img src="${item.media.video}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">`;
        } else {
            videoDiv.innerHTML = `<video controls src="${item.media.video}" style="width:100%; border-radius:8px;"></video>`;
        }
    } else {
        videoDiv.innerHTML = `<div class="placeholder-text"><span class="icon">🎬</span> No Video recorded</div>`;
    }
    mediaContainer.appendChild(videoDiv);

    // Screenshot Display
    const imgDiv = document.createElement('div');
    imgDiv.className = 'media-item image-container';
    if (item.media.screenshot) {
        imgDiv.innerHTML = `<img src="${item.media.screenshot}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
    } else {
        imgDiv.innerHTML = `<div class="placeholder-text"><span class="icon">🖼️</span> No Screenshot recorded</div>`;
    }
    // Helper to add lightbox trigger
    const addTrigger = (el) => {
        el.style.cursor = 'zoom-in';
        el.onclick = () => {
            const content = el.innerHTML;
            if (!content.includes('placeholder-text')) {
                openLightbox(content);
            }
        };
    };

    addTrigger(videoDiv);
    addTrigger(imgDiv);

    mediaContainer.appendChild(videoDiv);
    mediaContainer.appendChild(imgDiv);

    detailView.scrollIntoView({ behavior: 'smooth' });
}

const lightbox = document.getElementById('lightbox');
const lightboxContent = document.querySelector('.lightbox-content');

function openLightbox(content) {
    lightboxContent.innerHTML = content;
    lightbox.classList.add('active');

    const video = lightboxContent.querySelector('video');
    if (video) video.play();
}

// Only close if clicking the overlay background or close button
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

function togglePost(day, status) {
    console.log(`Setting OK_TO_POST for Day ${day} to: ${status}`);
    // In real use, this would trigger a file update or an API call
}

viewBtns.forEach(btn => {
    btn.onclick = () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        viewMode = btn.dataset.mode;
        renderDashboard();
    };
});

// Initial Render
renderDashboard();
