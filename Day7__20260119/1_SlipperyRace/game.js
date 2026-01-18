/**
 * Slippery Floor Racing Game - Day 7
 */

const CONFIG = {
    totalLaps: 3,
    accel: 0.15,
    maxSpeed: 8,
    friction: 0.985, // Extremely low friction for "ice" feel
    steering: 0.04,
    canvasSize: { w: 800, h: 600 },
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.player = {
            x: 400, y: 500,
            vx: 0, vy: 0,
            angle: -Math.PI / 2,
            targetAngle: -Math.PI / 2,
            width: 30, height: 20,
            color: '#38bdf8'
        };

        this.gameState = 'START'; // START, RACING, FINISHED
        this.startTime = 0;
        this.currentTime = 0;
        this.laps = 0;
        this.bestLap = Infinity;
        this.lapStartTime = 0;
        this.checkpointReached = false; // Midnight checkpoint

        this.keys = {};
        this.setupListeners();

        this.track = this.generateTrackPoints();

        requestAnimationFrame((t) => this.loop(t));
    }

    setupCanvas() {
        this.canvas.width = CONFIG.canvasSize.w;
        this.canvas.height = CONFIG.canvasSize.h;
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        document.getElementById('startBtn').addEventListener('click', () => this.startRace());
        document.getElementById('retryBtn').addEventListener('click', () => this.startRace());
    }

    startRace() {
        this.gameState = 'RACING';
        this.startTime = Date.now();
        this.lapStartTime = this.startTime;
        this.laps = 1;
        this.player.x = 400;
        this.player.y = 520;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.angle = 0;
        this.checkpointReached = false;

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.add('hidden');
    }

    generateTrackPoints() {
        // Simple oval track
        return {
            inner: { cx: 400, cy: 300, rx: 250, ry: 180 },
            outer: { cx: 400, cy: 300, rx: 350, ry: 260 }
        };
    }

    update(dt) {
        if (this.gameState !== 'RACING') return;

        // Steering
        if (this.keys['a'] || this.keys['arrowleft']) this.player.angle -= CONFIG.steering * 2;
        if (this.keys['d'] || this.keys['arrowright']) this.player.angle += CONFIG.steering * 2;

        // Acceleration
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.vx += Math.cos(this.player.angle) * CONFIG.accel;
            this.player.vy += Math.sin(this.player.angle) * CONFIG.accel;
        }

        // Apply Physics
        this.player.vx *= CONFIG.friction;
        this.player.vy *= CONFIG.friction;

        // Limit speed
        const speed = Math.sqrt(this.player.vx ** 2 + this.player.vy ** 2);
        if (speed > CONFIG.maxSpeed) {
            this.player.vx = (this.player.vx / speed) * CONFIG.maxSpeed;
            this.player.vy = (this.player.vy / speed) * CONFIG.maxSpeed;
        }

        this.player.x += this.player.vx;
        this.player.y += this.player.vy;

        // Collision & Lap Logic
        this.checkCollisions();
        this.checkLap();

        // Update UI
        this.currentTime = Date.now() - this.startTime;
        this.updateUI();
    }

    checkCollisions() {
        const dx = this.player.x - 400;
        const dy = this.player.y - 300;

        // Inner boundary
        const innerVal = (dx ** 2) / (250 ** 2) + (dy ** 2) / (180 ** 2);
        if (innerVal < 1) this.bounceBack(innerVal, true);

        // Outer boundary
        const outerVal = (dx ** 2) / (350 ** 2) + (dy ** 2) / (260 ** 2);
        if (outerVal > 1) this.bounceBack(outerVal, false);
    }

    bounceBack(val, isInner) {
        // Simple bounce (reverse velocity with penalty)
        this.player.vx *= -0.5;
        this.player.vy *= -0.5;
        // Pushing back outside/inside a bit
        const dx = this.player.x - 400;
        const dy = this.player.y - 300;
        const angle = Math.atan2(dy, dx);
        const push = isInner ? 5 : -5;
        this.player.x += Math.cos(angle) * push;
        this.player.y += Math.sin(angle) * push;
    }

    checkLap() {
        // Start line is at x=400, y > 300 (bottom)
        // Mid-checkpoint is at x=400, y < 300 (top)
        if (this.player.y < 300 && !this.checkpointReached) {
            this.checkpointReached = true;
        }

        if (this.player.y > 450 && this.player.x > 380 && this.player.x < 420 && this.checkpointReached) {
            const lapTime = Date.now() - this.lapStartTime;
            if (lapTime < this.bestLap) this.bestLap = lapTime;

            this.laps++;
            this.lapStartTime = Date.now();
            this.checkpointReached = false;

            if (this.laps > CONFIG.totalLaps) {
                this.endRace();
            }
        }
    }

    updateUI() {
        document.getElementById('current-time').textContent = this.formatTime(this.currentTime);
        document.getElementById('lap-counter').textContent = `${Math.min(this.laps, CONFIG.totalLaps)} / ${CONFIG.totalLaps}`;
        if (this.bestLap !== Infinity) {
            document.getElementById('best-lap').textContent = this.formatTime(this.bestLap);
        }
    }

    formatTime(ms) {
        const totalSec = ms / 1000;
        const min = Math.floor(totalSec / 60);
        const sec = Math.floor(totalSec % 60);
        const cents = Math.floor((ms % 1000) / 10);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${cents.toString().padStart(2, '0')}`;
    }

    endRace() {
        this.gameState = 'FINISHED';
        document.getElementById('result-screen').classList.remove('hidden');
        document.getElementById('final-total').textContent = this.formatTime(this.currentTime);
        document.getElementById('final-best').textContent = this.formatTime(this.bestLap);

        let rank = 'C';
        if (this.currentTime < 20000) rank = 'S';
        else if (this.currentTime < 25000) rank = 'A';
        else if (this.currentTime < 30000) rank = 'B';
        document.getElementById('rank-badge').textContent = `RANK: ${rank}`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Track
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(400, 300, 350, 260, 0, 0, Math.PI * 2); // Outer
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.ellipse(400, 300, 250, 180, 0, 0, Math.PI * 2); // Inner
        this.ctx.stroke();

        // Draw Finish Line
        this.ctx.strokeStyle = '#f8fafc';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(350, 480);
        this.ctx.lineTo(450, 480);
        this.ctx.stroke();

        // Draw Player
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.angle);

        // Character Shadow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.player.color;

        // Character Body (Sleek Car-like shape)
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.roundRect(-15, -10, 30, 20, 5);
        this.ctx.fill();

        // "Windshield"
        this.ctx.fillStyle = '#bae6fd';
        this.ctx.fillRect(5, -6, 6, 12);

        this.ctx.restore();
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// Initial game instance
const game = new Game();
