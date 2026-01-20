const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const damagePctEl = document.getElementById('damage-percent');
const alertEl = document.getElementById('blast-zone-alert');

canvas.width = 800;
canvas.height = 600;

// Config
const GRAVITY = 0.35;
const FRICTION = 0.985;
const STAGE_X = 200;
const STAGE_Y = 400;
const STAGE_WIDTH = 400;
const STAGE_HEIGHT = 20;

// Character State
let target = {
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    width: 32,
    height: 48,
    damage: 0,
    weight: 100,
    onGround: false,
    isKO: false
};

function resetTarget() {
    target.x = 400;
    target.y = 300;
    target.vx = 0;
    target.vy = 0;
    target.damage = 0;
    target.isKO = false;
    alertEl.classList.add('hidden');
    updateUI();
}

function updateUI() {
    damagePctEl.innerText = Math.floor(target.damage);
    // Shake effect based on damage
    const shake = Math.min(10, target.damage / 20);
    damagePctEl.style.transform = `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)`;

    // Color change
    const red = Math.min(255, target.damage * 2);
    damagePctEl.style.color = `rgb(255, ${255 - red}, ${255 - red})`;
}

function calculateKnockback(attackPower) {
    // Simplified Smash Formula
    // Knockback = (((damage/10 + damage*attackPower/20) * 200/(weight+100) * 1.4) + 18) * attackPower
    const damage = target.damage;
    const base = 5;
    const scaling = (damage / 10 + (damage * attackPower) / 20) * (200 / (target.weight + 100)) + base;
    return scaling * attackPower * 0.5;
}

function handleAttack(mx, my) {
    if (target.isKO) return;

    // Check if clicked on target
    const dx = mx - target.x;
    const dy = my - target.y;

    if (mx >= target.x - target.width / 2 && mx <= target.x + target.width / 2 &&
        my >= target.y - target.height && my <= target.y) {

        // Impact!
        const attackPower = 10 + Math.random() * 5;
        const kb = calculateKnockback(attackPower);

        // Launch angle (away from click)
        const angle = Math.atan2(target.y - target.height / 2 - my, target.x - mx);

        target.vx = Math.cos(angle) * kb;
        target.vy = Math.sin(angle) * kb - 5; // Slight upward pop

        target.damage += attackPower;
        updateUI();

        // Effects
        spawnSparks(mx, my);
    }
}

// Spark Particles
let particles = [];
function spawnSparks(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 20,
            color: '#fff'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function update() {
    if (target.isKO) return;

    // Gravity
    target.vy += GRAVITY;

    // Friction (Air resistance)
    target.vx *= FRICTION;
    target.vy *= FRICTION;

    // Movement
    target.x += target.vx;
    target.y += target.vy;

    // Floor Collision (Simple)
    if (target.y >= STAGE_Y && target.y - target.vy <= STAGE_Y &&
        target.x >= STAGE_X && target.x <= STAGE_X + STAGE_WIDTH) {
        target.y = STAGE_Y;
        target.vy = 0;
        target.vx *= 0.8; // Ground friction
        target.onGround = true;
    } else {
        target.onGround = false;
    }

    // Blast Zones
    if (target.x < -100 || target.x > canvas.width + 100 ||
        target.y < -100 || target.y > canvas.height + 100) {
        target.isKO = true;
        alertEl.classList.remove('hidden');
        setTimeout(resetTarget, 1500);
    }

    updateParticles();
    updateUI();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Stage
    ctx.fillStyle = '#475569';
    ctx.fillRect(STAGE_X, STAGE_Y, STAGE_WIDTH, STAGE_HEIGHT);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(STAGE_X, STAGE_Y, STAGE_WIDTH, STAGE_HEIGHT);

    // Draw Target
    ctx.fillStyle = target.isKO ? '#ef4444' : '#60a5fa';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(target.x - target.width / 2, target.y - target.height, target.width, target.height, 4);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(target.x + 2, target.y - 35, 6, 6);
    ctx.fillRect(target.x - 8, target.y - 35, 6, 6);

    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
}

// Input
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    handleAttack(e.clientX - rect.left, e.clientY - rect.top);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') resetTarget();
});

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
