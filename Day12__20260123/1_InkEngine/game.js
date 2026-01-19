const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const alphaPctDisplay = document.getElementById('alphaPct');
const betaPctDisplay = document.getElementById('betaPct');

canvas.width = 800;
canvas.height = 600;

// Offscreen canvas for hit detection and coverage (stores just team indices)
const inkCanvas = document.createElement('canvas');
inkCanvas.width = canvas.width;
inkCanvas.height = canvas.height;
const inkCtx = inkCanvas.getContext('2d', { willReadFrequently: true });

// Constants
const TEAMS = [
    { id: 1, name: 'Alpha', color: '#ff6000' },
    { id: 2, name: 'Beta', color: '#0080ff' }
];

// State
let currentPlayer = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 4,
    teamIndex: 0,
    isPainting: false
};

let keys = {};
let mouse = { x: 0, y: 0 };

// Initialize ink layer (grey background)
inkCtx.fillStyle = '#333333';
inkCtx.fillRect(0, 0, inkCanvas.width, inkCanvas.height);

function paintInk(x, y, teamIndex) {
    const team = TEAMS[teamIndex];
    const radius = 25 + Math.random() * 10;

    // Draw on ink canvas
    inkCtx.fillStyle = team.color;

    // Splat effect (multiple small circles)
    for (let i = 0; i < 5; i++) {
        const ox = (Math.random() - 0.5) * 20;
        const oy = (Math.random() - 0.5) * 20;
        const r = radius * (0.6 + Math.random() * 0.4);

        inkCtx.beginPath();
        inkCtx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        inkCtx.fill();
    }
}

// Offscreen canvas for sampling (downscaled for performance)
const sampleCanvas = document.createElement('canvas');
sampleCanvas.width = 100;
sampleCanvas.height = 75;
const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

function calculateCoverage() {
    // Draw the full ink canvas to the small sample canvas
    sampleCtx.drawImage(inkCanvas, 0, 0, sampleCanvas.width, sampleCanvas.height);

    const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    let alphaCount = 0;
    let betaCount = 0;
    const totalPixels = sampleCanvas.width * sampleCanvas.height;

    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        // Tolerance check for colors
        if (r > 200 && g > 50 && b < 50) alphaCount++;
        else if (r < 50 && g > 100 && b > 200) betaCount++;
    }

    alphaPctDisplay.innerText = ((alphaCount / totalPixels) * 100).toFixed(1);
    betaPctDisplay.innerText = ((betaCount / totalPixels) * 100).toFixed(1);
}

// Every 1 second update percentage
setInterval(calculateCoverage, 1000);

function update() {
    // Movement
    if (keys['w'] || keys['ArrowUp']) currentPlayer.y -= currentPlayer.speed;
    if (keys['s'] || keys['ArrowDown']) currentPlayer.y += currentPlayer.speed;
    if (keys['a'] || keys['ArrowLeft']) currentPlayer.x -= currentPlayer.speed;
    if (keys['d'] || keys['ArrowRight']) currentPlayer.x += currentPlayer.speed;

    // Bounds
    currentPlayer.x = Math.max(0, Math.min(canvas.width, currentPlayer.x));
    currentPlayer.y = Math.max(0, Math.min(canvas.height, currentPlayer.y));

    // Painting
    if (currentPlayer.isPainting) {
        paintInk(currentPlayer.x, currentPlayer.y, currentPlayer.teamIndex);
    }
}

function draw() {
    // 1. Draw Ground/Ink layer from offscreen
    ctx.drawImage(inkCanvas, 0, 0);

    // 2. Draw Crosshair/Aim to mouse
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(currentPlayer.x, currentPlayer.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // 3. Draw Player
    ctx.fillStyle = TEAMS[currentPlayer.teamIndex].color;
    ctx.beginPath();
    ctx.arc(currentPlayer.x, currentPlayer.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Listeners
window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === 'Space') {
        currentPlayer.teamIndex = (currentPlayer.teamIndex + 1) % TEAMS.length;
    }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => currentPlayer.isPainting = true);
window.addEventListener('mouseup', () => currentPlayer.isPainting = false);

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
