const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const trailCanvas = document.getElementById('trailCanvas');
const tctx = trailCanvas.getContext('2d');
const speedValEl = document.getElementById('speed-val');
const boostFillEl = document.getElementById('boost-fill');

canvas.width = trailCanvas.width = 800;
canvas.height = trailCanvas.height = 600;

// Car State
let car = {
    x: 400,
    y: 300,
    angle: -Math.PI / 2,
    speed: 0,
    maxSpeed: 8,
    accel: 0.2,
    decel: 0.05,
    friction: 0.96,
    steerSpeed: 0.05,

    isDrifting: false,
    driftAngle: 0,
    boostCharge: 0,
    boostActive: 0,

    width: 30,
    length: 50
};

let particles = [];
let keys = {};

function update() {
    // 1. Acceleration / Brake
    if (keys['w']) car.speed += car.accel;
    else if (keys['s']) car.speed -= car.accel;
    else car.speed *= 0.98; // Natural coasting

    // Speed limits
    let currentMax = car.maxSpeed;
    if (car.boostActive > 0) {
        currentMax *= 1.8;
        car.boostActive--;
    }
    car.speed = Math.max(-car.maxSpeed / 2, Math.min(currentMax, car.speed));

    // 2. Steering & Drifting
    const moveFactor = Math.abs(car.speed) / car.maxSpeed;
    let turn = 0;
    if (keys['a']) turn = -1;
    if (keys['d']) turn = 1;

    if (keys['shift'] && Math.abs(car.speed) > 2) {
        // Drift Mode
        if (!car.isDrifting) {
            car.isDrifting = true;
            car.driftAngle = turn * 0.5;
        }
        car.angle += turn * car.steerSpeed * 1.5;
        // Charge boost
        if (turn !== 0) car.boostCharge = Math.min(100, car.boostCharge + 0.8);

        // Effects
        spawnSkidMarks();
        spawnSparks();
    } else {
        // Normal Mode
        if (car.isDrifting) {
            // Apply boost on release
            if (car.boostCharge > 30) car.boostActive = car.boostCharge * 1.5;
            car.boostCharge = 0;
            car.isDrifting = false;
        }
        car.angle += turn * car.steerSpeed * moveFactor;
    }

    // 3. Movement Physics (Directional)
    const forwardX = Math.cos(car.angle);
    const forwardY = Math.sin(car.angle);

    // Apply speed along the angle
    car.x += car.speed * forwardX;
    car.y += car.speed * forwardY;

    // Wrap around screen
    if (car.x < 0) car.x = canvas.width;
    if (car.x > canvas.width) car.x = 0;
    if (car.y < 0) car.y = canvas.height;
    if (car.y > canvas.height) car.y = 0;

    updateParticles();
    updateUI();
}

function updateUI() {
    speedValEl.innerText = Math.round(Math.abs(car.speed) * 20);
    boostFillEl.style.width = `${car.boostCharge}%`;
    boostFillEl.style.background = car.boostCharge > 70 ? '#ff6600' : '#ffcc00';
}

function spawnSkidMarks() {
    tctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    tctx.lineWidth = 4;
    tctx.beginPath();
    tctx.moveTo(car.x, car.y);
    const backX = car.x - Math.cos(car.angle) * 10;
    const backY = car.y - Math.sin(car.angle) * 10;
    tctx.lineTo(backX, backY);
    tctx.stroke();
}

function spawnSparks() {
    const sparkColor = car.boostCharge > 70 ? '#ff4400' : '#ffff00';
    for (let i = 0; i < 2; i++) {
        particles.push({
            x: car.x - Math.cos(car.angle) * 20,
            y: car.y - Math.sin(car.angle) * 20,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 15,
            color: sparkColor
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // Boost Glow
    if (car.boostActive > 0) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
    }

    // Body
    ctx.fillStyle = car.boostActive > 0 ? '#00ffff' : '#ef4444';
    ctx.fillRect(-car.length / 2, -car.width / 2, car.length, car.width);

    // Windshield
    ctx.fillStyle = '#333';
    ctx.fillRect(5, -car.width / 2 + 5, 10, car.width - 10);

    // Spoiler
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-car.length / 2, -car.width / 2 - 2, 5, car.width + 4);

    ctx.restore();

    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 15;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1.0;
}

// Input
window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'r' || e.key === 'R') tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
