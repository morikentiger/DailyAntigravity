/**
 * Neon Breakout - Daily Antigravity Day 3
 * A premium breakout game with particle effects and smooth physics.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const statusText = document.getElementById('status-text');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Canvas scaling
const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Game State
let score = 0;
let lives = 3;
let isStarted = false;
let isGameOver = false;
let particles = [];

// Game Settings
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 8;
const BRICK_COLS = 7;
const BRICK_PADDING = 10;
const BRICK_TOP_OFFSET = 100;
const BRICK_LEFT_OFFSET = 30;
const COLORS = ['#00f2ff', '#ff00ff', '#ffff00', '#00ff00', '#ff4d00'];

// Paddle
const paddle = {
    x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: GAME_HEIGHT - 60,
    w: PADDLE_WIDTH,
    h: PADDLE_HEIGHT,
    speed: 8,
    dx: 0
};

// Ball
const ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 80,
    radius: BALL_RADIUS,
    speed: 6,
    dx: 4,
    dy: -4,
    trail: []
};

// Bricks
let bricks = [];
function initBricks() {
    bricks = [];
    const brickW = (GAME_WIDTH - BRICK_LEFT_OFFSET * 2 - BRICK_PADDING * (BRICK_COLS - 1)) / BRICK_COLS;
    const brickH = 25;

    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            bricks.push({
                x: c * (brickW + BRICK_PADDING) + BRICK_LEFT_OFFSET,
                y: r * (brickH + BRICK_PADDING) + BRICK_TOP_OFFSET,
                w: brickW,
                h: brickH,
                status: 1, // Endurance
                color: COLORS[r % COLORS.length]
            });
        }
    }
}

// Input Handling
let mouseX = GAME_WIDTH / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    mouseX = e.clientX - rect.left - paddle.w / 2;
});

// Touch handling
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left - paddle.w / 2;
}, { passive: false });

// Particles
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.02;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Game Logic
function update() {
    if (!isStarted || isGameOver) return;

    // Move Paddle with smoothing
    const targetX = Math.max(0, Math.min(GAME_WIDTH - paddle.w, mouseX));
    paddle.x += (targetX - paddle.x) * 0.2;

    // Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) ball.trail.shift();

    // Wall Collision
    if (ball.x + ball.radius > GAME_WIDTH || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Paddle Collision
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {

        // Bounce off paddle with angle based on hit location
        const hitPt = ball.x - (paddle.x + paddle.w / 2);
        ball.dx = (hitPt / (paddle.w / 2)) * ball.speed;
        ball.dy = -Math.abs(ball.speed) * (1 - Math.abs(hitPt / (paddle.w / 2)) * 0.3); // Prevent too flat horizontal

        ball.y = paddle.y - ball.radius; // Reset position to prevent sticking
        createExplosion(ball.x, ball.y, '#00f2ff');
    }

    // Brick Collision
    bricks.forEach(b => {
        if (b.status > 0) {
            if (ball.x > b.x && ball.x < b.x + b.w &&
                ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.h) {

                ball.dy *= -1;
                b.status = 0;
                score += 10;
                scoreEl.innerText = `SCORE: ${score.toString().padStart(4, '0')}`;
                createExplosion(b.x + b.w / 2, b.y + b.h / 2, b.color);

                // Ball speed up slightly
                ball.speed += 0.05;
            }
        }
    });

    // Floor Collision (Lose Life)
    if (ball.y + ball.radius > GAME_HEIGHT) {
        lives--;
        livesEl.innerText = `LIVES: ${lives}`;
        if (lives <= 0) {
            endGame(false);
        } else {
            resetBall();
        }
    }

    // Win Check
    if (bricks.every(b => b.status === 0)) {
        endGame(true);
    }

    // Update Particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update());
}

function resetBall() {
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    ball.dx = 4;
    ball.dy = -4;
    ball.trail = [];
    isStarted = false;
    startScreen.classList.remove('hidden');
    startBtn.innerText = "READY?";
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Bricks
    bricks.forEach(b => {
        if (b.status > 0) {
            ctx.fillStyle = b.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);

            // Highlight
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.shadowBlur = 0;
        }
    });

    // Draw Paddle
    ctx.fillStyle = '#00f2ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.shadowBlur = 0;

    // Draw Ball Trail
    ball.trail.forEach((t, i) => {
        ctx.globalAlpha = i / ball.trail.length * 0.5;
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * (i / ball.trail.length), 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Ball
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Particles
    particles.forEach(p => p.draw());
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function startGame() {
    score = 0;
    lives = 3;
    isStarted = true;
    isGameOver = false;
    scoreEl.innerText = `SCORE: 0000`;
    livesEl.innerText = `LIVES: 3`;
    initBricks();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function endGame(win) {
    isGameOver = true;
    gameOverScreen.classList.remove('hidden');
    statusText.innerText = win ? 'VICTORY' : 'GAME OVER';
    statusText.style.color = win ? '#00ff00' : '#ff0000';
    finalScoreEl.innerText = `SCORE: ${score}`;
}

startBtn.addEventListener('click', () => {
    if (!isStarted) {
        isStarted = true;
        startScreen.classList.add('hidden');
    } else {
        startGame();
    }
});
restartBtn.addEventListener('click', startGame);

// Initialize
initBricks();
loop();
