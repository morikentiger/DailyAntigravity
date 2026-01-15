const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game State
const state = {
    player: {
        x: canvas.width / 2 - 25,
        y: canvas.height - 50,
        w: 50,
        h: 30,
        speed: 7,
        color: '#0088ff'
    },
    bullets: [],
    invaders: [],
    keys: {},
    invaderDir: 1,
    invaderStepDown: false,
    invaderSpeed: 1
};

// Initialize Invaders
function initInvaders() {
    const rows = 5;
    const cols = 10;
    const padding = 60;
    const offsetX = 100;
    const offsetY = 50;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            state.invaders.push({
                x: offsetX + c * padding,
                y: offsetY + r * padding,
                w: 40,
                h: 30,
                color: r === 0 ? '#ff0055' : (r < 3 ? '#ffcc00' : '#00ffaa'),
                alive: true
            });
        }
    }
}

// Input Handling
window.onkeydown = (e) => state.keys[e.code] = true;
window.onkeyup = (e) => state.keys[e.code] = false;

function shoot() {
    state.bullets.push({
        x: state.player.x + state.player.w / 2 - 2,
        y: state.player.y,
        w: 4,
        h: 15,
        speed: 10,
        color: '#fff'
    });
}

// Update Loop
function update() {
    // Player Move
    if (state.keys['ArrowLeft'] && state.player.x > 0) state.player.x -= state.player.speed;
    if (state.keys['ArrowRight'] && state.player.x + state.player.w < canvas.width) state.player.x += state.player.speed;

    if (state.keys['Space'] && !state.lastSpace) {
        shoot();
    }
    state.lastSpace = state.keys['Space'];

    // Bullets Move
    state.bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < -20) state.bullets.splice(i, 1);
    });

    // Invaders Move
    let edgeReached = false;
    state.invaders.forEach(inv => {
        if (!inv.alive) return;
        inv.x += state.invaderDir * state.invaderSpeed;
        if (inv.x + inv.w > canvas.width || inv.x < 0) edgeReached = true;
    });

    if (edgeReached) {
        state.invaderDir *= -1;
        state.invaders.forEach(inv => {
            inv.y += 20;
            inv.x += state.invaderDir * state.invaderSpeed; // Offset to prevent double edge trigger
        });
    }
}

// Draw Loop
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow Effect
    ctx.shadowBlur = 15;

    // Player
    ctx.fillStyle = state.player.color;
    ctx.shadowColor = state.player.color;
    ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);

    // Bullets
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    state.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // Invaders
    state.invaders.forEach(inv => {
        if (!inv.alive) return;
        ctx.fillStyle = inv.color;
        ctx.shadowColor = inv.color;
        ctx.fillRect(inv.x, inv.y, inv.w, inv.h);
    });

    ctx.shadowBlur = 0;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initInvaders();
loop();
