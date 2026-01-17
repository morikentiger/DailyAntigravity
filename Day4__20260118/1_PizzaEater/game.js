// Pizza Eater - Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'start'; // start, playing, gameover
let score = 0;
let timeLeft = 60;
let timerInterval = null;

// Pizza configuration
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const pizzaRadius = 220;
const crustWidth = 25;
const slices = 8;
const sliceAngle = (Math.PI * 2) / slices;

// Each slice has segments that can be eaten (from edge to center)
const segmentsPerSlice = 5;
let pizzaState = []; // 2D array: [slice][segment] = eaten or not

// Toppings
const toppings = [];

// Initialize pizza state
function initPizza() {
    pizzaState = [];
    for (let i = 0; i < slices; i++) {
        pizzaState[i] = [];
        for (let j = 0; j < segmentsPerSlice; j++) {
            pizzaState[i][j] = false; // not eaten
        }
    }

    // Generate toppings
    toppings.length = 0;
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (pizzaRadius - crustWidth - 30) + 30;
        toppings.push({
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            type: Math.random() > 0.5 ? 'pepperoni' : 'olive',
            eaten: false
        });
    }
}

// Draw pizza
function drawPizza() {
    // Clear
    ctx.fillStyle = '#2d1810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each slice
    for (let i = 0; i < slices; i++) {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;

        // Draw segments from outside to inside
        for (let j = 0; j < segmentsPerSlice; j++) {
            if (pizzaState[i][j]) continue; // Skip eaten segments

            const outerRadius = pizzaRadius - (j * (pizzaRadius - 30) / segmentsPerSlice);
            const innerRadius = pizzaRadius - ((j + 1) * (pizzaRadius - 30) / segmentsPerSlice);

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(startAngle) * innerRadius,
                centerY + Math.sin(startAngle) * innerRadius
            );
            ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            ctx.lineTo(
                centerX + Math.cos(endAngle) * innerRadius,
                centerY + Math.sin(endAngle) * innerRadius
            );
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            // Color based on layer
            if (j === 0) {
                // Crust
                ctx.fillStyle = '#d4a853';
            } else {
                // Cheese with sauce showing through
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, innerRadius,
                    centerX, centerY, outerRadius
                );
                gradient.addColorStop(0, '#ffd93d');
                gradient.addColorStop(1, '#ffcc00');
                ctx.fillStyle = gradient;
            }
            ctx.fill();

            // Slice divider lines
            ctx.strokeStyle = '#c41e3a';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Draw toppings
    toppings.forEach(topping => {
        // Check if this topping is on an eaten segment
        const angle = Math.atan2(topping.y - centerY, topping.x - centerX);
        const dist = Math.sqrt((topping.x - centerX) ** 2 + (topping.y - centerY) ** 2);

        let sliceIdx = Math.floor(((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / sliceAngle);
        let segmentIdx = Math.floor((pizzaRadius - dist) / (pizzaRadius / segmentsPerSlice));
        segmentIdx = Math.max(0, Math.min(segmentsPerSlice - 1, segmentIdx));

        if (pizzaState[sliceIdx] && pizzaState[sliceIdx][segmentIdx]) {
            topping.eaten = true;
        }

        if (topping.eaten) return;

        ctx.beginPath();
        if (topping.type === 'pepperoni') {
            ctx.arc(topping.x, topping.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#8b0000';
            ctx.fill();
            ctx.fillStyle = '#a52a2a';
            ctx.beginPath();
            ctx.arc(topping.x, topping.y, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.arc(topping.x, topping.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#2d2d2d';
            ctx.fill();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(topping.x, topping.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw center (plate showing through when eaten)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f5dc';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Handle click/tap to eat
function handleEat(e) {
    if (gameState !== 'playing') return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    // Calculate which slice and segment was clicked
    const angle = Math.atan2(y - centerY, x - centerX);
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    if (dist > pizzaRadius || dist < 25) return; // Outside pizza or center

    // Find slice
    let sliceIdx = Math.floor(((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / sliceAngle);

    // Find outermost uneaten segment in this slice
    let segmentToEat = -1;
    for (let j = 0; j < segmentsPerSlice; j++) {
        if (!pizzaState[sliceIdx][j]) {
            segmentToEat = j;
            break;
        }
    }

    if (segmentToEat === -1) return; // Slice fully eaten

    // Check if clicked on correct segment (must eat from outside in)
    const segmentRadius = pizzaRadius - (segmentToEat * (pizzaRadius - 30) / segmentsPerSlice);
    const nextRadius = pizzaRadius - ((segmentToEat + 1) * (pizzaRadius - 30) / segmentsPerSlice);

    if (dist <= segmentRadius && dist >= nextRadius - 20) {
        // Eat this segment!
        pizzaState[sliceIdx][segmentToEat] = true;

        // Score based on segment (inner segments worth more)
        const points = (segmentToEat + 1) * 10;
        score += points;
        document.getElementById('score').textContent = score;

        // Show floating score
        showFloatingScore(x, y, points);

        // Bite animation
        canvas.classList.add('bite-effect');
        setTimeout(() => canvas.classList.remove('bite-effect'), 100);

        // Check if pizza is fully eaten
        checkWin();
    }
}

function showFloatingScore(x, y, points) {
    const floater = document.createElement('div');
    floater.className = 'float-score';
    floater.textContent = `+${points}`;
    floater.style.left = `${x}px`;
    floater.style.top = `${y}px`;
    document.querySelector('.game-container').appendChild(floater);
    setTimeout(() => floater.remove(), 800);
}

function checkWin() {
    let allEaten = true;
    for (let i = 0; i < slices; i++) {
        for (let j = 0; j < segmentsPerSlice; j++) {
            if (!pizzaState[i][j]) {
                allEaten = false;
                break;
            }
        }
    }

    if (allEaten) {
        // Bonus for finishing early
        const timeBonus = timeLeft * 5;
        score += timeBonus;
        endGame(true);
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    timeLeft = 60;
    document.getElementById('score').textContent = '0';
    document.getElementById('timer').textContent = '60';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');

    initPizza();

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);

    gameLoop();
}

function endGame(won) {
    gameState = 'gameover';
    clearInterval(timerInterval);

    document.getElementById('final-score').textContent = score;
    document.getElementById('result-message').textContent = won
        ? `🎉 完食！タイムボーナス +${timeLeft * 5}点！`
        : '😋 時間切れ！もっと早く食べよう！';
    document.getElementById('gameover-screen').classList.remove('hidden');
}

function gameLoop() {
    if (gameState !== 'playing') return;

    drawPizza();
    requestAnimationFrame(gameLoop);
}

// Event listeners
canvas.addEventListener('click', handleEat);
canvas.addEventListener('touchstart', handleEat);
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Initial draw
initPizza();
drawPizza();
