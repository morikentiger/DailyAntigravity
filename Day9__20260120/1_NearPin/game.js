const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const powerBar = document.getElementById('power-bar');
const distDisplay = document.getElementById('distance');
const overlay = document.getElementById('overlay');
const resultTitle = document.getElementById('result-title');
const finalDistDisplay = document.getElementById('final-dist');
const retryBtn = document.getElementById('retryBtn');

canvas.width = 600;
canvas.height = 800;

// Game Config
const targetY = 150;
const startY = 700;
const ballRadius = 15;
const friction = 0.985;
const targetMarkerLeft = 0.7; // 70% of bar

// Game State
let ball = {
    x: canvas.width / 2,
    y: startY,
    vy: 0,
    isMoving: false,
    hasStopped: false
};

let charging = false;
let power = 0;
let powerSpeed = 1.5;

function drawTarget() {
    ctx.strokeStyle = '#d9e2ec';
    ctx.lineWidth = 1;

    // Outer rings
    for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, targetY, r * 40, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Bullseye
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, targetY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9fb3c8';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', canvas.width / 2, targetY - 120);
}

function drawBall() {
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.fillStyle = ball.isMoving ? '#102a43' : '#627d98';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function update() {
    if (charging) {
        power += powerSpeed;
        if (power > 100 || power < 0) powerSpeed *= -1;
        powerBar.style.width = Math.max(0, power) + '%';
    }

    if (ball.isMoving) {
        ball.y += ball.vy;
        ball.vy *= friction;

        if (Math.abs(ball.vy) < 0.1) {
            ball.vy = 0;
            ball.isMoving = false;
            ball.hasStopped = true;
            showResult();
        }

        // Boundary
        if (ball.y < 0) {
            ball.vy = 0;
            ball.isMoving = false;
            ball.hasStopped = true;
            showResult();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grass/lane effect
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTarget();
    drawBall();
}

function showResult() {
    const dist = Math.abs(ball.y - targetY) / 10;
    finalDistDisplay.innerText = `${dist.toFixed(2)} m from center`;

    if (dist < 1) {
        resultTitle.innerText = "PERFECT!!";
        resultTitle.style.color = "#2f855a";
    } else if (dist < 5) {
        resultTitle.innerText = "SO CLOSE!";
        resultTitle.style.color = "#38a169";
    } else {
        resultTitle.innerText = "TRY AGAIN";
        resultTitle.style.color = "#102a43";
    }

    overlay.classList.remove('hidden');
}

function launch() {
    if (ball.isMoving || ball.hasStopped) return;

    // Map power (0-100) to velocity
    // Assuming 70% power hits target at ~150y
    // Distance 550.
    // Manual tuning: power 70 -> vy ~ -20
    ball.vy = -(power / 100) * 30;
    ball.isMoving = true;
}

function reset() {
    ball = {
        x: canvas.width / 2,
        y: startY,
        vy: 0,
        isMoving: false,
        hasStopped: false
    };
    power = 0;
    powerBar.style.width = '0%';
    overlay.classList.add('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !ball.isMoving && !ball.hasStopped) {
        charging = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && charging) {
        charging = false;
        launch();
    }
});

retryBtn.addEventListener('click', reset);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
