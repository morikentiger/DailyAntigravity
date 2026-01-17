/**
 * Pokey Rapid-Tap Blowaway Game - Day 6
 */

const CONFIG = {
    gameDuration: 30,
    initialSegments: 5,
    maxSegments: 8,
    comboTimeout: 1000, // ms
    tapFeedbackDuration: 300, // ms
};

let state = {
    isPlaying: false,
    score: 0,
    timeLeft: CONFIG.gameDuration,
    combo: 0,
    lastTapTime: 0,
    segments: [],
    gameTimer: null,
};

// UI Elements
const el = {
    score: document.getElementById('score'),
    timer: document.getElementById('timer'),
    combo: document.getElementById('combo'),
    gameArea: document.getElementById('game-area'),
    stack: document.getElementById('pokey-stack'),
    startScreen: document.getElementById('start-screen'),
    resultScreen: document.getElementById('result-screen'),
    startBtn: document.getElementById('startBtn'),
    retryBtn: document.getElementById('retryBtn'),
    finalScore: document.getElementById('final-score'),
    rank: document.getElementById('rank'),
};

function init() {
    el.startBtn.addEventListener('click', startGame);
    el.retryBtn.addEventListener('click', startGame);
    el.gameArea.addEventListener('mousedown', handleTap);
    el.gameArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTap(e.touches[0]);
    });
}

function startGame() {
    state.isPlaying = true;
    state.score = 0;
    state.timeLeft = CONFIG.gameDuration;
    state.combo = 0;
    state.lastTapTime = Date.now();
    state.segments = [];

    el.startScreen.classList.add('hidden');
    el.resultScreen.classList.add('hidden');
    updateUI();

    // Reset stack
    el.stack.innerHTML = '';
    for (let i = 0; i < CONFIG.initialSegments; i++) {
        addSegment(i === CONFIG.initialSegments - 1); // Top one is head
    }

    // Start Timer
    state.gameTimer = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft <= 0) {
            endGame();
        }
        updateUI();
    }, 1000);
}

function addSegment(isHead = false) {
    const segment = document.createElement('div');
    segment.className = `pokey-segment ${isHead ? 'pokey-head' : ''}`;

    // Add Spikes
    for (let i = 1; i <= 4; i++) {
        const spike = document.createElement('div');
        spike.className = `spike spike-${i}`;
        segment.appendChild(spike);
    }

    // Add Eyes
    const eyeL = document.createElement('div');
    eyeL.className = 'eye eye-l';
    const eyeR = document.createElement('div');
    eyeR.className = 'eye eye-r';
    segment.appendChild(eyeL);
    segment.appendChild(eyeR);

    if (isHead) {
        const mouth = document.createElement('div');
        mouth.className = 'mouth';
        segment.appendChild(mouth);
    }

    el.stack.appendChild(segment);
    state.segments.push(segment);
}

function handleTap(e) {
    if (!state.isPlaying) return;

    // Tap position for effect
    createTapEffect(e.clientX, e.clientY);

    // Logic: Blow away the bottom segment
    const bottomSegment = state.segments.shift();
    if (bottomSegment) {
        blowAway(bottomSegment);

        // Always maintain the stack height (add new segment to the top, under the head)
        // Wait, the stack is flex-direction: column-reverse.
        // bottomSegment is the first child in the DOM.
        // We need to keep a head at the top.

        // Simplified: The stack always has a head.
        // When we hit the bottom, we remove it, and a new one is added to the stack.
        // Let's re-stack.

        // Update Score & Combo
        const now = Date.now();
        if (now - state.lastTapTime < CONFIG.comboTimeout) {
            state.combo++;
        } else {
            state.combo = 1;
        }
        state.lastTapTime = now;
        state.score += 1 + Math.floor(state.combo / 10);

        // Add new segment to keep the height
        // Replace head? No, let's just add a regular segment.
        // The current head is at state.segments[state.segments.length - 1].
        // We insert a new segment at the beginning of the el.stack.

        const newSeg = createSegmentData(false);
        el.stack.insertBefore(newSeg, el.stack.firstChild);
        state.segments.push(newSeg); // This is not quite right with shift()...

        // Correct logic:
        // 1. Remove bottomSegment from DOM (via blowAway)
        // 2. Add new segment at the bottom (which becomes the first child)
        // This makes the whole stack look like it dropped one level.

        updateUI();

        // Shake the stack
        el.stack.classList.add('shake');
        setTimeout(() => el.stack.classList.remove('shake'), 100);
    }
}

// Re-writing handleTap for cleaner logic
function handleTapClean(e) {
    if (!state.isPlaying) return;

    createTapEffect(e.clientX, e.clientY);

    // Get the first segment (the bottom one)
    const segmentsInDOM = el.stack.querySelectorAll('.pokey-segment');
    if (segmentsInDOM.length === 0) return;

    const bottomSeg = segmentsInDOM[0];
    const isHead = bottomSeg.classList.contains('pokey-head');

    blowAway(bottomSeg);

    // Update Stats
    const now = Date.now();
    if (now - state.lastTapTime < CONFIG.comboTimeout) {
        state.combo++;
    } else {
        state.combo = 1;
    }
    state.lastTapTime = now;
    state.score++;

    // Add a replacement segment (if we hit a head, the next one becomes head? No, let's keep one head at the top)
    // To make it look like the stack drops:
    // we don't need to add at the bottom. We add at the TOP of the stack.

    // Check if we just blew away the head (shouldn't happen if we always blow bottom)
    // In our flex-column-reverse, first child is bottom.
    // Last child is top.

    addSegmentToTop();

    updateUI();

    el.stack.classList.add('shake');
    setTimeout(() => el.stack.classList.remove('shake'), 100);
}

// Override handleTap
el.gameArea.removeEventListener('mousedown', handleTap);
el.gameArea.addEventListener('mousedown', (e) => handleTapClean(e));

function addSegmentToTop() {
    // The last child in el.stack IS the head.
    // We want to insert a NEW segment BEFORE the head.
    const head = el.stack.querySelector('.pokey-head');
    const segment = createSegmentElement(false);
    el.stack.insertBefore(segment, head);
}

function createSegmentElement(isHead = false) {
    const segment = document.createElement('div');
    segment.className = `pokey-segment ${isHead ? 'pokey-head' : ''}`;
    for (let i = 1; i <= 4; i++) {
        const spike = document.createElement('div');
        spike.className = `spike spike-${i}`;
        segment.appendChild(spike);
    }
    const eyeL = document.createElement('div');
    eyeL.className = 'eye eye-l';
    const eyeR = document.createElement('div');
    eyeR.className = 'eye eye-r';
    segment.appendChild(eyeL);
    segment.appendChild(eyeR);
    if (isHead) {
        const mouth = document.createElement('div');
        mouth.className = 'mouth';
        segment.appendChild(mouth);
    }
    return segment;
}

function blowAway(element) {
    const rect = element.getBoundingClientRect();
    const clone = element.cloneNode(true);

    clone.style.position = 'fixed';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.margin = '0';

    // Random direction
    const isLeft = Math.random() > 0.5;
    clone.classList.add('blowaway');
    if (isLeft) clone.classList.add('blowaway-left');

    document.body.appendChild(clone);
    element.remove();

    setTimeout(() => clone.remove(), 600);
}

function createTapEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'tap-effect';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 300);
}

function updateUI() {
    el.score.textContent = state.score;
    el.timer.textContent = state.timeLeft;
    el.combo.textContent = state.combo;

    if (state.timeLeft <= 10) {
        el.timer.style.color = '#e74c3c';
    } else {
        el.timer.style.color = 'white';
    }
}

function endGame() {
    state.isPlaying = false;
    clearInterval(state.gameTimer);

    el.finalScore.textContent = state.score;
    el.rank.textContent = `RANK: ${getRank(state.score)}`;
    el.resultScreen.classList.remove('hidden');
}

function getRank(score) {
    if (score > 120) return 'S+ (POKEY SLAYER)';
    if (score > 100) return 'S';
    if (score > 80) return 'A';
    if (score > 60) return 'B';
    if (score > 40) return 'C';
    return 'D';
}

init();
