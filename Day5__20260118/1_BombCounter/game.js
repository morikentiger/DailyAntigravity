// Bomb Counter Game - Day 5
// ボム兵をカウントせよ！

const CONFIG = {
    gameDuration: 30,           // seconds
    bombLifetime: 2000,         // ms - how long bomb stays visible
    spawnInterval: 400,         // ms - how often new bombs spawn
    maxBombs: 8,                // maximum bombs on screen
    bombSize: 60,               // px
    comboTimeout: 1000          // ms - combo resets after this
};

let state = {
    score: 0,
    timeLeft: CONFIG.gameDuration,
    isPlaying: false,
    bombs: [],
    combo: 0,
    lastClickTime: 0,
    spawnTimer: null,
    gameTimer: null
};

const elements = {
    gameArea: document.getElementById('game-area'),
    score: document.getElementById('score'),
    timer: document.getElementById('timer'),
    startScreen: document.getElementById('start-screen'),
    resultScreen: document.getElementById('result-screen'),
    startBtn: document.getElementById('startBtn'),
    retryBtn: document.getElementById('retryBtn'),
    finalScore: document.getElementById('final-score'),
    rank: document.getElementById('rank')
};

// Initialize
function init() {
    elements.startBtn.addEventListener('click', startGame);
    elements.retryBtn.addEventListener('click', startGame);
}

// Start game
function startGame() {
    // Reset state
    state.score = 0;
    state.timeLeft = CONFIG.gameDuration;
    state.isPlaying = true;
    state.bombs = [];
    state.combo = 0;

    // Clear game area
    elements.gameArea.innerHTML = '';

    // Update UI
    updateScore();
    updateTimer();
    elements.startScreen.classList.add('hidden');
    elements.resultScreen.classList.add('hidden');
    document.querySelector('.game-header').classList.remove('timer-warning');

    // Start spawning bombs
    state.spawnTimer = setInterval(spawnBomb, CONFIG.spawnInterval);

    // Start game timer
    state.gameTimer = setInterval(() => {
        state.timeLeft--;
        updateTimer();

        // Warning when time is low
        if (state.timeLeft <= 10) {
            document.querySelector('.game-header').classList.add('timer-warning');
        }

        if (state.timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Spawn first bomb immediately
    spawnBomb();
}

// Spawn a bomb
function spawnBomb() {
    if (!state.isPlaying) return;
    if (state.bombs.length >= CONFIG.maxBombs) return;

    const bomb = createBombElement();
    const position = getRandomPosition();

    bomb.style.left = position.x + 'px';
    bomb.style.top = position.y + 'px';

    const bombData = {
        id: Date.now() + Math.random(),
        element: bomb,
        x: position.x,
        y: position.y
    };

    bomb.addEventListener('click', (e) => {
        e.stopPropagation();
        countBomb(bombData);
    });

    elements.gameArea.appendChild(bomb);
    state.bombs.push(bombData);

    // Remove bomb after lifetime
    setTimeout(() => {
        removeBomb(bombData, false);
    }, CONFIG.bombLifetime);
}

// Create bomb DOM element
function createBombElement() {
    const bomb = document.createElement('div');
    bomb.className = 'bomb';
    bomb.innerHTML = `
        <div class="bomb-body">
            <div class="bomb-fuse"></div>
            <div class="bomb-spark"></div>
            <div class="bomb-eyes">
                <div class="bomb-eye"></div>
                <div class="bomb-eye"></div>
            </div>
        </div>
        <div class="bomb-feet">
            <div class="bomb-foot"></div>
            <div class="bomb-foot"></div>
        </div>
    `;
    return bomb;
}

// Get random position within game area
function getRandomPosition() {
    const area = elements.gameArea.getBoundingClientRect();
    const padding = CONFIG.bombSize;

    return {
        x: padding + Math.random() * (area.width - padding * 2 - CONFIG.bombSize),
        y: padding + Math.random() * (area.height - padding * 2 - CONFIG.bombSize)
    };
}

// Count (click) a bomb
function countBomb(bombData) {
    if (!state.isPlaying) return;

    // Update combo
    const now = Date.now();
    if (now - state.lastClickTime < CONFIG.comboTimeout) {
        state.combo++;
    } else {
        state.combo = 1;
    }
    state.lastClickTime = now;

    // Calculate points (combo bonus)
    const points = Math.min(state.combo, 5);
    state.score += points;

    // Show count popup
    showCountPopup(bombData.x + CONFIG.bombSize / 2, bombData.y, points);

    // Remove bomb with explosion
    removeBomb(bombData, true);

    // Update score display
    updateScore();
}

// Remove bomb from game
function removeBomb(bombData, explode = false) {
    const index = state.bombs.findIndex(b => b.id === bombData.id);
    if (index === -1) return;

    const bomb = bombData.element;

    if (explode) {
        // Create explosion effect
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.innerHTML = '<div class="explosion-ring"></div>';
        explosion.style.left = (bombData.x + CONFIG.bombSize / 2 - 50) + 'px';
        explosion.style.top = (bombData.y + CONFIG.bombSize / 2 - 50) + 'px';
        elements.gameArea.appendChild(explosion);

        setTimeout(() => explosion.remove(), 400);
    }

    // Remove bomb element
    bomb.remove();
    state.bombs.splice(index, 1);
}

// Show count popup
function showCountPopup(x, y, points) {
    const popup = document.createElement('div');
    popup.className = 'count-popup';
    popup.textContent = points > 1 ? `+${points} 🔥` : '+1';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    elements.gameArea.appendChild(popup);

    setTimeout(() => popup.remove(), 500);
}

// Update score display
function updateScore() {
    elements.score.textContent = state.score;
}

// Update timer display
function updateTimer() {
    elements.timer.textContent = state.timeLeft;
}

// End game
function endGame() {
    state.isPlaying = false;

    // Clear timers
    clearInterval(state.spawnTimer);
    clearInterval(state.gameTimer);

    // Clear remaining bombs
    state.bombs.forEach(b => b.element.remove());
    state.bombs = [];

    // Show result
    elements.finalScore.textContent = state.score;
    elements.rank.textContent = getRank(state.score);
    elements.resultScreen.classList.remove('hidden');
}

// Get rank based on score
function getRank(score) {
    if (score >= 100) return '🏆 LEGENDARY BOMBER!';
    if (score >= 80) return '💎 MASTER COUNTER';
    if (score >= 60) return '🔥 BOMB EXPERT';
    if (score >= 40) return '⭐ SKILLED';
    if (score >= 20) return '👍 NICE TRY';
    return '💪 KEEP PRACTICING';
}

// Start
init();
