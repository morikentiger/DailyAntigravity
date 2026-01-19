const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 480;

// Config
const TILE_SIZE = 32;
const GRAVITY = 0.6;
const FRICTION = 0.85;
const JUMP_FORCE = -12;
const MOVE_SPEED = 0.5;
const MAX_SPEED = 5;

// Tile Types
const EMPTY = 0;
const GROUND = 1;
const BRICK = 2;
const QUESTION = 3;

// Map Data (Simple Level)
const mapData = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const worldWidth = mapData[0].length * TILE_SIZE;
const worldHeight = mapData.length * TILE_SIZE;

// Entities
let player = {
    x: 100,
    y: 350,
    width: 24,
    height: 32,
    vx: 0,
    vy: 0,
    isJumping: false,
    onGround: false,
    direction: 1 // 1: right, -1: left
};

let camera = {
    x: 0,
    y: 0,
    lerp: 0.1
};

let keys = {};

// Physics Logic
function updatePlayer() {
    // Horizontal Movement
    if (keys['ArrowRight'] || keys['d']) {
        player.vx += MOVE_SPEED;
        player.direction = 1;
    } else if (keys['ArrowLeft'] || keys['a']) {
        player.vx -= MOVE_SPEED;
        player.direction = -1;
    } else {
        player.vx *= FRICTION;
    }

    // Limit speed
    player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx));

    // Vertical Movement (Gravity)
    player.vy += GRAVITY;

    // Jump
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.isJumping = true;
    }

    // Apply Velocity and Collision
    // X Collision
    player.x += player.vx;
    handleCollisionX();

    // Y Collision
    player.y += player.vy;
    handleCollisionY();

    // Camera follow
    let targetCamX = player.x - canvas.width / 2 + player.width / 2;
    targetCamX = Math.max(0, Math.min(worldWidth - canvas.width, targetCamX));
    camera.x += (targetCamX - camera.x) * camera.lerp;
}

function handleCollisionX() {
    let left = Math.floor(player.x / TILE_SIZE);
    let right = Math.floor((player.x + player.width) / TILE_SIZE);
    let top = Math.floor(player.y / TILE_SIZE);
    let bottom = Math.floor((player.y + player.height - 1) / TILE_SIZE);

    if (player.vx > 0) {
        for (let row = top; row <= bottom; row++) {
            if (isSolid(mapData[row][right])) {
                player.x = right * TILE_SIZE - player.width;
                player.vx = 0;
            }
        }
    } else if (player.vx < 0) {
        for (let row = top; row <= bottom; row++) {
            if (isSolid(mapData[row][left])) {
                player.x = (left + 1) * TILE_SIZE;
                player.vx = 0;
            }
        }
    }
}

function handleCollisionY() {
    let left = Math.floor(player.x / TILE_SIZE);
    let right = Math.floor((player.x + player.width - 1) / TILE_SIZE);
    let top = Math.floor(player.y / TILE_SIZE);
    let bottom = Math.floor((player.y + player.height) / TILE_SIZE);

    player.onGround = false;

    if (player.vy > 0) {
        for (let col = left; col <= right; col++) {
            if (isSolid(mapData[bottom][col])) {
                player.y = bottom * TILE_SIZE - player.height;
                player.vy = 0;
                player.onGround = true;
                player.isJumping = false;
                break;
            }
        }
    } else if (player.vy < 0) {
        for (let col = left; col <= right; col++) {
            if (isSolid(mapData[top][col])) {
                player.y = (top + 1) * TILE_SIZE;
                player.vy = 0;
                break;
            }
        }
    }
}

function isSolid(tile) {
    return tile === GROUND || tile === BRICK || tile === QUESTION;
}

// Rendering Logic
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, 0);

    // Draw Map
    for (let row = 0; row < mapData.length; row++) {
        for (let col = 0; col < mapData[row].length; col++) {
            let tile = mapData[row][col];
            if (tile !== EMPTY) {
                drawTile(tile, col * TILE_SIZE, row * TILE_SIZE);
            }
        }
    }

    // Draw Player
    ctx.fillStyle = '#ff4d4d'; // Mario Red
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Simple face/hat indicator
    ctx.fillStyle = '#000';
    if (player.direction === 1) {
        ctx.fillRect(player.x + 16, player.y + 6, 4, 4);
    } else {
        ctx.fillRect(player.x + 4, player.y + 6, 4, 4);
    }

    ctx.restore();
}

function drawTile(type, x, y) {
    switch (type) {
        case GROUND:
            ctx.fillStyle = '#8a4b08'; // Brown
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#4b2504';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
        case BRICK:
            ctx.fillStyle = '#d82800'; // Dark Red
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
        case QUESTION:
            ctx.fillStyle = '#f8d800'; // Yellow
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#fff';
            ctx.fillText('?', x + 10, y + 22);
            break;
    }
}

// Input
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Game Loop
function loop() {
    updatePlayer();
    draw();
    requestAnimationFrame(loop);
}

loop();
