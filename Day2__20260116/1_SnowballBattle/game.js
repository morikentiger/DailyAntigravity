// ===== 雪玉バトル - Snowball Battle =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const playerLivesEl = document.getElementById('player-lives');
const cpuLivesEl = document.getElementById('cpu-lives');
const timerEl = document.getElementById('timer');
const sizeFill = document.getElementById('size-fill');
const resultText = document.getElementById('result-text');
const resultDetail = document.getElementById('result-detail');

// Game State
let gameRunning = false;
let gameTime = 60;
let gameTimer = null;

// Canvas setup
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Input
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'Space' && gameRunning) {
        player.launchSnowball();
    }
});

// Particles
const particles = [];

class Particle {
    constructor(x, y, color, velocity, size, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push(new Particle(
            x, y, color,
            { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed - 3 },
            Math.random() * 4 + 2,
            Math.random() * 30 + 20
        ));
    }
}

// Snowballs
const snowballs = [];

class Snowball {
    constructor(x, y, size, vx, vy, owner) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravity
        this.vx *= 0.99; // friction

        // Bounce off ground
        if (this.y + this.size > canvas.height - 50) {
            this.y = canvas.height - 50 - this.size;
            this.vy *= -0.5;
            this.vx *= 0.8;
            if (Math.abs(this.vy) < 1) {
                this.active = false;
                spawnParticles(this.x, this.y, 10, '#fff');
            }
        }

        // Walls
        if (this.x < this.size || this.x > canvas.width - this.size) {
            this.vx *= -0.7;
            this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
        }
    }

    draw() {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x, canvas.height - 45, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snowball
        const gradient = ctx.createRadialGradient(
            this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#e8f4fc');
        gradient.addColorStop(1, '#b8d4e8');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Character class
class Character {
    constructor(x, y, color, isPlayer) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.color = color;
        this.isPlayer = isPlayer;
        this.lives = 3;
        this.vx = 0;
        this.vy = 0;
        this.speed = 4;
        this.snowballSize = 10;
        this.isRolling = false;
        this.knockback = { x: 0, y: 0 };
        this.invincible = 0;
        this.direction = isPlayer ? 1 : -1;
    }

    update() {
        // Knockback decay
        this.knockback.x *= 0.9;
        this.knockback.y *= 0.9;

        // Apply knockback
        this.x += this.knockback.x;
        this.y += this.knockback.y;

        // Gravity
        this.vy += 0.5;
        this.y += this.vy;

        // Ground
        if (this.y + this.height > canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            this.vy = 0;
        }

        // Walls
        this.x = Math.max(20, Math.min(this.x, canvas.width - 20 - this.width));

        // Invincibility
        if (this.invincible > 0) this.invincible--;

        // Rolling snowball grows
        if (this.isRolling) {
            this.snowballSize = Math.min(50, this.snowballSize + 0.3);
        }
    }

    draw() {
        // Flicker when invincible
        if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) return;

        const cx = this.x + this.width / 2;
        const cy = this.y;

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 45, 20, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#ffeedd';
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 18, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx - 6, cy + 12, 3, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Hat
        ctx.fillStyle = this.isPlayer ? '#e74c3c' : '#3498db';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 10, cy - 18, 20, 20);
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 10, Math.PI, 0);
        ctx.fill();

        // Rolling snowball indicator
        if (this.isRolling) {
            const sbX = cx + this.direction * 30;
            const sbY = canvas.height - 50 - this.snowballSize;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath();
            ctx.arc(sbX, sbY, this.snowballSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(100,150,200,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    launchSnowball() {
        if (this.snowballSize > 10) {
            const sbX = this.x + this.width / 2 + this.direction * 30;
            const sbY = canvas.height - 50 - this.snowballSize;
            snowballs.push(new Snowball(
                sbX, sbY, this.snowballSize,
                this.direction * (8 + this.snowballSize * 0.1),
                -5 - this.snowballSize * 0.1,
                this
            ));
        }
        this.snowballSize = 10;
        this.isRolling = false;
    }

    hit(snowball) {
        if (this.invincible > 0) return;

        const knockbackForce = snowball.size * 0.5;
        this.knockback.x = snowball.vx > 0 ? knockbackForce : -knockbackForce;
        this.knockback.y = -knockbackForce * 0.5;

        this.lives--;
        this.invincible = 90; // 1.5 seconds
        spawnParticles(this.x + this.width / 2, this.y + this.height / 2, 20, '#fff');

        updateLivesDisplay();
    }
}

// Player
const player = new Character(100, 300, '#27ae60', true);

// CPU
const cpu = new Character(canvas.width - 150, 300, '#9b59b6', false);
cpu.direction = -1;

// CPU AI
let cpuActionTimer = 0;
let cpuState = 'idle';

function updateCPU() {
    cpuActionTimer--;

    if (cpuActionTimer <= 0) {
        // Decide action
        const rand = Math.random();
        if (rand < 0.3 && !cpu.isRolling) {
            cpuState = 'roll';
            cpu.isRolling = true;
            cpuActionTimer = Math.random() * 60 + 40;
        } else if (rand < 0.6 && cpu.isRolling) {
            cpuState = 'launch';
            cpu.launchSnowball();
            cpuActionTimer = 30;
        } else {
            cpuState = 'move';
            cpuActionTimer = Math.random() * 30 + 20;
        }
    }

    // Move towards/away from player
    if (cpuState === 'move' || cpuState === 'roll') {
        const dx = player.x - cpu.x;
        if (cpu.isRolling) {
            // Move towards player when rolling
            cpu.x += Math.sign(dx) * cpu.speed * 0.5;
            cpu.direction = Math.sign(dx);
        } else {
            // Keep distance
            if (Math.abs(dx) < 200) {
                cpu.x -= Math.sign(dx) * cpu.speed * 0.5;
            } else if (Math.abs(dx) > 400) {
                cpu.x += Math.sign(dx) * cpu.speed * 0.5;
            }
        }
    }

    // Dodge incoming snowballs
    for (const sb of snowballs) {
        if (sb.owner === player && sb.active) {
            const willHit = Math.abs(sb.x - cpu.x) < 100 && sb.y < cpu.y + cpu.height;
            if (willHit && Math.random() < 0.03) {
                cpu.x += (sb.vx > 0 ? -1 : 1) * 50;
            }
        }
    }
}

// Update lives display
function updateLivesDisplay() {
    playerLivesEl.textContent = '❤️'.repeat(Math.max(0, player.lives));
    cpuLivesEl.textContent = '❤️'.repeat(Math.max(0, cpu.lives));
}

// Draw snow ground
function drawGround() {
    // Snow ground
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Snow texture
    ctx.fillStyle = 'rgba(200, 220, 240, 0.5)';
    for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.arc(x + Math.sin(x * 0.1) * 10, canvas.height - 50 + 5, 15, Math.PI, 0);
        ctx.fill();
    }

    // Snow drifts
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath();
        ctx.arc(x + 40, canvas.height - 50, 25, Math.PI, 0);
        ctx.fill();
    }
}

// Draw background
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height - 50);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(0.5, '#b0e0e6');
    skyGradient.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height - 50);

    // Mountains
    ctx.fillStyle = 'rgba(200, 210, 230, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(100, canvas.height - 200);
    ctx.lineTo(200, canvas.height - 100);
    ctx.lineTo(350, canvas.height - 250);
    ctx.lineTo(500, canvas.height - 80);
    ctx.lineTo(650, canvas.height - 180);
    ctx.lineTo(800, canvas.height - 120);
    ctx.lineTo(canvas.width, canvas.height - 200);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.closePath();
    ctx.fill();

    // Snow on mountains
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(90, canvas.height - 190);
    ctx.lineTo(100, canvas.height - 200);
    ctx.lineTo(110, canvas.height - 185);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(340, canvas.height - 240);
    ctx.lineTo(350, canvas.height - 250);
    ctx.lineTo(360, canvas.height - 235);
    ctx.closePath();
    ctx.fill();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground();
    drawGround();

    // Player input
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
        player.direction = -1;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
        player.direction = 1;
    }
    if (keys['Space']) {
        player.isRolling = true;
    }

    // Update CPU
    updateCPU();

    // Update characters
    player.update();
    cpu.update();

    // Update snowballs
    for (let i = snowballs.length - 1; i >= 0; i--) {
        const sb = snowballs[i];
        sb.update();

        // Collision with player
        if (sb.owner !== player && sb.active) {
            const dx = sb.x - (player.x + player.width / 2);
            const dy = sb.y - (player.y + player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < sb.size + 30) {
                player.hit(sb);
                sb.active = false;
                spawnParticles(sb.x, sb.y, 15, '#fff');
            }
        }

        // Collision with CPU
        if (sb.owner !== cpu && sb.active) {
            const dx = sb.x - (cpu.x + cpu.width / 2);
            const dy = sb.y - (cpu.y + cpu.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < sb.size + 30) {
                cpu.hit(sb);
                sb.active = false;
                spawnParticles(sb.x, sb.y, 15, '#fff');
            }
        }

        // Remove inactive
        if (!sb.active) {
            snowballs.splice(i, 1);
        } else {
            sb.draw();
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Draw characters
    player.draw();
    cpu.draw();

    // Update snowball size indicator
    sizeFill.style.width = ((player.snowballSize - 10) / 40 * 100) + '%';

    // Check win/lose
    if (player.lives <= 0) {
        endGame(false);
        return;
    }
    if (cpu.lives <= 0) {
        endGame(true);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Timer
function startTimer() {
    gameTime = 60;
    timerEl.textContent = gameTime;
    gameTimer = setInterval(() => {
        gameTime--;
        timerEl.textContent = gameTime;
        if (gameTime <= 0) {
            // Time up - compare lives
            if (player.lives > cpu.lives) {
                endGame(true);
            } else if (cpu.lives > player.lives) {
                endGame(false);
            } else {
                endGame(null); // draw
            }
        }
    }, 1000);
}

// Start game
function startGame() {
    // Reset
    player.x = 100;
    player.y = 300;
    player.lives = 3;
    player.snowballSize = 10;
    player.isRolling = false;
    player.invincible = 0;
    player.knockback = { x: 0, y: 0 };

    cpu.x = canvas.width - 150;
    cpu.y = 300;
    cpu.lives = 3;
    cpu.snowballSize = 10;
    cpu.isRolling = false;
    cpu.invincible = 0;
    cpu.knockback = { x: 0, y: 0 };

    snowballs.length = 0;
    particles.length = 0;

    updateLivesDisplay();
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');

    gameRunning = true;
    startTimer();
    gameLoop();
}

// End game
function endGame(playerWon) {
    gameRunning = false;
    clearInterval(gameTimer);

    if (playerWon === true) {
        resultText.textContent = '🎉 勝利！ 🎉';
        resultDetail.textContent = `残りライフ: ${player.lives} | 残り時間: ${gameTime}秒`;
    } else if (playerWon === false) {
        resultText.textContent = '💀 敗北... 💀';
        resultDetail.textContent = 'CPUにやられた...';
    } else {
        resultText.textContent = '🤝 引き分け 🤝';
        resultDetail.textContent = '両者同点！';
    }

    resultScreen.classList.remove('hidden');
}

// Event listeners
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

// Initial draw
drawBackground();
drawGround();
