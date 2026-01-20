const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const squadCountEl = document.getElementById('squad-count');
const totalCountEl = document.getElementById('total-count');

canvas.width = 800;
canvas.height = 600;

// States
const IDLE = 0;
const FOLLOWING = 1;
const THROWN = 2;

// Leader
let leader = {
    x: 400,
    y: 300,
    speed: 4,
    whistleRadius: 0,
    isWhistling: false
};

// Swarm
let units = [];
const UNIT_COUNT = 50;

for (let i = 0; i < UNIT_COUNT; i++) {
    units.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        state: IDLE,
        color: i % 3 === 0 ? '#ff4d4d' : (i % 3 === 1 ? '#f5c542' : '#4d9eff'),
        size: 4 + Math.random() * 2,
        targetPos: { x: 0, y: 0 },
        throwTimer: 0
    });
}

function update() {
    // Leader Movement
    if (keys['w']) leader.y -= leader.speed;
    if (keys['s']) leader.y += leader.speed;
    if (keys['a']) leader.x -= leader.speed;
    if (keys['d']) leader.x += leader.speed;

    leader.x = Math.max(0, Math.min(canvas.width, leader.x));
    leader.y = Math.max(0, Math.min(canvas.height, leader.y));

    // Whistle
    if (leader.isWhistling) {
        leader.whistleRadius = Math.min(100, leader.whistleRadius + 5);
    } else {
        leader.whistleRadius = 0;
    }

    // Units Logic
    let squadCount = 0;
    units.forEach(u => {
        if (u.state === FOLLOWING) squadCount++;

        // 1. Whistle Detection
        if (leader.isWhistling) {
            const d = Math.hypot(u.x - leader.x, u.y - leader.y);
            if (d < leader.whistleRadius) {
                u.state = FOLLOWING;
            }
        }

        // 2. State-based Movement
        if (u.state === FOLLOWING) {
            // Steering behaviors
            // Separation
            units.forEach(other => {
                if (u === other) return;
                const d = Math.hypot(u.x - other.x, u.y - other.y);
                if (d < 15) {
                    u.vx += (u.x - other.x) * 0.1;
                    u.vy += (u.y - other.y) * 0.1;
                }
            });

            // Arriving at leader (with random offset for natural group)
            const targetX = leader.x + (u.targetPos.ox || 0);
            const targetY = leader.y + (u.targetPos.oy || 0);
            const dx = targetX - u.x;
            const dy = targetY - u.y;
            u.vx += dx * 0.05;
            u.vy += dy * 0.05;

            // Damping
            u.vx *= 0.8;
            u.vy *= 0.8;

            // Randomly update offset
            if (Math.random() < 0.01) {
                u.targetPos.ox = (Math.random() - 0.5) * 60;
                u.targetPos.oy = (Math.random() - 0.5) * 60;
            }
        } else if (u.state === THROWN) {
            u.throwTimer--;
            if (u.throwTimer <= 0) {
                u.state = IDLE;
                u.vx = 0;
                u.vy = 0;
            }
        } else {
            // IDLE (minor drift)
            u.vx *= 0.95;
            u.vy *= 0.95;
        }

        u.x += u.vx;
        u.y += u.vy;
    });

    squadCountEl.innerText = squadCount;
    totalCountEl.innerText = UNIT_COUNT;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Whistle Effect
    if (leader.isWhistling) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(leader.x, leader.y, leader.whistleRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
    }

    // Draw Units
    units.forEach(u => {
        ctx.fillStyle = u.color;
        ctx.beginPath();
        ctx.arc(u.x, u.y, u.size, 0, Math.PI * 2);
        ctx.fill();

        // Simple eyes/top
        if (u.state === FOLLOWING) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(u.x, u.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Leader
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(leader.x, leader.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Input
let keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

window.addEventListener('mousedown', e => {
    if (e.button === 2) {
        leader.isWhistling = true;
    } else if (e.button === 0) {
        // Find a following unit to throw
        const unit = units.find(u => u.state === FOLLOWING);
        if (unit) {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            const dx = mx - unit.x;
            const dy = my - unit.y;
            const angle = Math.atan2(dy, dx);
            const power = 15;

            unit.state = THROWN;
            unit.vx = Math.cos(angle) * power;
            unit.vy = Math.sin(angle) * power;
            unit.throwTimer = 40;
        }
    }
});

window.addEventListener('mouseup', e => {
    if (e.button === 2) leader.isWhistling = false;
});

window.addEventListener('contextmenu', e => e.preventDefault());

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
