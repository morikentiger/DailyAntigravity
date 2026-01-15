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
    invaderSpeed: 1,
    score: 0,
    gameOver: false,
    particles: [],
    shake: { intensity: 0, duration: 0 }
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

// Helper: Rect Collision
function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.w ||
        r2.x + r2.w < r1.x ||
        r2.y > r1.y + r1.h ||
        r2.y + r2.h < r1.y);
}

// Helper: Spawn Particles
function spawnParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color
        });
    }
}

// Update Loop
function update() {
    if (state.gameOver) return;

    // Player Move
    if (state.keys['ArrowLeft'] && state.player.x > 0) state.player.x -= state.player.speed;
    if (state.keys['ArrowRight'] && state.player.x + state.player.w < canvas.width) state.player.x += state.player.speed;

    if (state.keys['Space'] && !state.lastSpace) {
        shoot();
    }
    state.lastSpace = state.keys['Space'];

    // Bullets Move & Collision
    state.bullets.forEach((b, bi) => {
        b.y -= b.speed;
        if (b.y < -20) {
            state.bullets.splice(bi, 1);
            return;
        }

        // Check Invader Collision
        state.invaders.forEach((inv, ii) => {
            if (inv.alive && rectIntersect(b, inv)) {
                inv.alive = false;
                state.bullets.splice(bi, 1);
                state.score += 10;
                state.invaderSpeed += 0.05;
                state.shake.intensity = 10;
                state.shake.duration = 10;
                spawnParticles(inv.x + inv.w / 2, inv.y + inv.h / 2, inv.color);
            }
        });
    });

    // Particles
    state.particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) state.particles.splice(i, 1);
    });

    // Screen Shake
    if (state.shake.duration > 0) {
        state.shake.duration--;
    } else {
        state.shake.intensity = 0;
    }

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
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.shake.duration > 0) {
        const sx = (Math.random() - 0.5) * state.shake.intensity;
        const sy = (Math.random() - 0.5) * state.shake.intensity;
        ctx.setTransform(1, 0, 0, 1, sx, sy);
    }

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
        ctx.shadowBlur = 15;
        ctx.shadowColor = inv.color;

        // Pseudo-Pixel Invader
        const px = inv.w / 5;
        const py = inv.h / 4;
        // Simple 5x4 pattern
        const pattern = [
            [0, 1, 1, 1, 0],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1]
        ];
        pattern.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) ctx.fillRect(inv.x + j * px, inv.y + i * py, px - 1, py - 1);
            });
        });
    });

    // Particles
    state.particles.forEach(p => {
        ctx.fillStyle = `rgba(${parseInt(p.color.slice(1, 3), 16)}, ${parseInt(p.color.slice(3, 5), 16)}, ${parseInt(p.color.slice(5, 7), 16)}, ${p.life})`;
        ctx.shadowBlur = 5;
        ctx.fillRect(p.x, p.y, 3, 3);
    });

    // Score & Status
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffaa';
    ctx.fillStyle = '#00ffaa';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillText(`SCORE: ${state.score}`, 20, 40);

    if (state.invaders.filter(i => i.alive).length === 0) {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.font = 'bold 40px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION COMPLETE', canvas.width / 2, canvas.height / 2);
    }

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initInvaders();
loop();
