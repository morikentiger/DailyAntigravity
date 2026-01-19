const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Config
const GRID_SIZE = 25;
const TILE_WIDTH = 40;
const TILE_HEIGHT = 20;
const OFFSET_X = canvas.width / 2;
const OFFSET_Y = 100;

// Terrain Data
let heightMap = [];
for (let y = 0; y < GRID_SIZE; y++) {
    heightMap[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        heightMap[y][x] = 0;
    }
}

// Entities
let giant = {
    gx: Math.floor(GRID_SIZE / 2),
    gy: Math.floor(GRID_SIZE / 2),
    x: 0,
    y: 0,
    width: 30,
    height: 60,
    color: '#f5c542'
};

function isoToScreen(gx, gy, gh) {
    const x = (gx - gy) * (TILE_WIDTH / 2) + OFFSET_X;
    const y = (gx + gy) * (TILE_HEIGHT / 2) + OFFSET_Y - gh;
    return { x, y };
}

function screenToIso(sx, sy) {
    // Inverse transformation (rough approximation for interaction)
    const dx = sx - OFFSET_X;
    const dy = sy - OFFSET_Y;

    // Simplistic iteration for precision (finding nearest cell)
    let bestDist = Infinity;
    let bestCell = { gx: 0, gy: 0 };

    for (let gy = 0; gy < GRID_SIZE; gy++) {
        for (let gx = 0; gx < GRID_SIZE; gx++) {
            const pos = isoToScreen(gx, gy, heightMap[gy][gx]);
            const d = Math.hypot(pos.x - sx, pos.y - sy);
            if (d < bestDist) {
                bestDist = d;
                bestCell = { gx, gy };
            }
        }
    }
    return bestCell;
}

function update() {
    // Handle input (Giant movement)
    // For simplicity, we'll use immediate snapping or minor lerp
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    for (let gy = 0; gy < GRID_SIZE; gy++) {
        for (let gx = 0; gx < GRID_SIZE; gx++) {
            drawTile(gx, gy);
        }
    }

    // Draw Giant
    const gh = heightMap[giant.gy][giant.gx];
    const pos = isoToScreen(giant.gx, giant.gy, gh);

    ctx.fillStyle = giant.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillRect(pos.x - giant.width / 2, pos.y - giant.height, giant.width, giant.height);
    ctx.shadowBlur = 0;
}

function drawTile(gx, gy) {
    const h = heightMap[gy][gx];
    const p1 = isoToScreen(gx, gy, h);
    const p2 = isoToScreen(gx + 1, gy, h);
    const p3 = isoToScreen(gx + 1, gy + 1, h);
    const p4 = isoToScreen(gx, gy + 1, h);

    // Color based on height
    let color = '#5baa5b'; // Grass
    if (h > 40) color = '#fff'; // Snow
    else if (h > 10) color = '#8a8a8a'; // Rock
    else if (h < -5) color = '#4a90e2'; // Water

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.stroke();
}

// Interaction
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const cell = screenToIso(sx, sy);
    const amount = e.button === 0 ? 5 : -5;

    // Radius effect
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const ty = cell.gy + dy;
            const tx = cell.gx + dx;
            if (tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE) {
                heightMap[ty][tx] += amount;
            }
        }
    }
});

// WASD for Giant
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') giant.gy = Math.max(0, giant.gy - 1);
    if (key === 's') giant.gy = Math.min(GRID_SIZE - 1, giant.gy + 1);
    if (key === 'a') giant.gx = Math.max(0, giant.gx - 1);
    if (key === 'd') giant.gx = Math.min(GRID_SIZE - 1, giant.gx + 1);
});

// Prevent context menu to allow right-click lowering
canvas.addEventListener('contextmenu', e => e.preventDefault());

function loop() {
    draw();
    requestAnimationFrame(loop);
}

loop();
