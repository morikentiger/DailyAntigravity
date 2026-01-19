const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const bestTimeDisplay = document.getElementById('bestTime');
const speedDisplay = document.getElementById('speedDisplay');
const overlay = document.getElementById('overlay');
const finalTimeDisplay = document.getElementById('final-time');
const restartBtn = document.getElementById('restartBtn');

canvas.width = 800;
canvas.height = 600;

// Game State
let player = {
    x: 100,
    y: 300,
    angle: 0,
    speed: 0,
    accel: 0.2,
    friction: 0.98,
    turnSpeed: 0.05,
    width: 20,
    height: 12
};

let keys = {};
let startTime = null;
let gameActive = true;
let bestTime = localStorage.getItem('windingRaceBestTime') || Infinity;

if (bestTime !== Infinity) {
    bestTimeDisplay.innerText = formatTime(parseFloat(bestTime));
}

// Path definition (Winding path points)
const pathPoints = [
    { x: 50, y: 300 },
    { x: 150, y: 300 },
    { x: 250, y: 150 },
    { x: 400, y: 150 },
    { x: 550, y: 450 },
    { x: 700, y: 450 },
    { x: 750, y: 300 }
];

const pathWidth = 60;

function formatTime(ms) {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const msecs = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${msecs.toString().padStart(2, '0')}`;
}

function drawPath() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = pathWidth + 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
        ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = pathWidth;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0ff';
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
        ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Start/Finish indicators
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(pathPoints[0].x, pathPoints[0].y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("FINISH", pathPoints[pathPoints.length - 1].x - 20, pathPoints[pathPoints.length - 1].y - 20);
}

function update() {
    if (!gameActive) return;

    if (keys['ArrowUp'] || keys['w']) {
        player.speed += player.accel;
        if (!startTime) startTime = Date.now();
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.speed -= player.accel * 0.5;
    }

    if (keys['ArrowLeft'] || keys['a']) {
        player.angle -= player.turnSpeed * (Math.min(player.speed, 5) / 5);
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.angle += player.turnSpeed * (Math.min(player.speed, 5) / 5);
    }

    player.speed *= player.friction;
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    // Boundary check
    checkCollision();

    // Goal check
    const distToFinish = Math.hypot(player.x - pathPoints[pathPoints.length - 1].x, player.y - pathPoints[pathPoints.length - 1].y);
    if (distToFinish < 20) {
        win();
    }

    // Update UI
    if (startTime) {
        timerDisplay.innerText = formatTime(Date.now() - startTime);
    }
    speedDisplay.innerText = Math.abs(Math.round(player.speed * 20));
}

function checkCollision() {
    // Basic collision: Check if player center is within pathWidth/2 of any path segment
    let onPath = false;
    for (let i = 0; i < pathPoints.length - 1; i++) {
        const d = distToSegment(player.x, player.y, pathPoints[i], pathPoints[i + 1]);
        if (d < pathWidth / 2) {
            onPath = true;
            break;
        }
    }

    if (!onPath) {
        player.speed *= 0.8; // Slow down drastically off path
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function distToSegment(px, py, p1, p2) {
    const l2 = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    if (l2 === 0) return Math.hypot(px - p1.x, py - p1.y);
    let t = ((px - p1.x) * (p2.x - p1.x) + (py - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (p1.x + t * (p2.x - p1.x)), py - (p1.y + t * (p2.y - p1.y)));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPath();

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

    // Headlights
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(player.width / 2, -player.height / 4);
    ctx.lineTo(player.width / 2 + 20, -player.height);
    ctx.lineTo(player.width / 2 + 20, player.height);
    ctx.lineTo(player.width / 2, player.height / 4);
    ctx.fill();

    ctx.restore();
}

function win() {
    gameActive = false;
    const finalTime = Date.now() - startTime;
    finalTimeDisplay.innerText = `TIME: ${formatTime(finalTime)}`;
    overlay.classList.remove('hidden');

    if (finalTime < bestTime) {
        bestTime = finalTime;
        localStorage.setItem('windingRaceBestTime', bestTime);
        bestTimeDisplay.innerText = formatTime(bestTime);
        document.getElementById('overlay-title').innerText = "NEW RECORD!";
    } else {
        document.getElementById('overlay-title').innerText = "GOAL!";
    }
}

function restart() {
    player = {
        x: 50,
        y: 300,
        angle: 0,
        speed: 0,
        accel: 0.2,
        friction: 0.98,
        turnSpeed: 0.05,
        width: 20,
        height: 12
    };
    startTime = null;
    gameActive = true;
    overlay.classList.add('hidden');
    timerDisplay.innerText = "00:00.00";
}

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);
restartBtn.addEventListener('click', restart);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
