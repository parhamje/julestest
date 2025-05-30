const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// Game variables
let score = 0;
const gravity = 0.5;
const jumpForce = 10;
const playerSpeed = 5;

// Player object
const player = {
    x: 50,
    y: canvas.height - platforms[0].height - player.height,
    width: 30,
    height: 50,
    dx: 0,
    dy: 0,
    onGround: false
};

// Platforms array
const platforms = [
    { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }, // Ground platform
    { x: 200, y: canvas.height - 100, width: 150, height: 20 },
    { x: 400, y: canvas.height - 180, width: 100, height: 20 }
];

// Coins array
const coins = [
    { x: 250, y: canvas.height - 130, width: 20, height: 20, collected: false },
    { x: 450, y: canvas.height - 210, width: 20, height: 20, collected: false }
];

// Keyboard input handling
const keys = {
    left: false,
    right: false,
    up: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

// Draw player
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Update player position
function updatePlayer() {
    // Horizontal movement
    if (keys.left) {
        player.dx = -playerSpeed;
    } else if (keys.right) {
        player.dx = playerSpeed;
    } else {
        player.dx = 0;
    }

    // Vertical movement (jumping)
    if (keys.up && player.onGround) {
        player.dy = -jumpForce;
        player.onGround = false;
    }

    // Apply gravity
    player.dy += gravity;

    // Update position
    player.x += player.dx;
    player.y += player.dy;

    // Boundary checks for canvas edges (left and right) are handled in checkPlatformCollisions
}

// Draw platforms
function drawPlatforms() {
    ctx.fillStyle = 'gray';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Platform collision detection
function checkPlatformCollisions() {
    player.onGround = false; // Assume player is not on ground until a collision is detected
    platforms.forEach(platform => {
        // Check for collision
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height > platform.y) {

            // Check if player is landing on top of the platform
            if (player.dy >= 0 && (player.y + player.height - player.dy) <= platform.y) {
                 player.y = platform.y - player.height;
                 player.dy = 0;
                 player.onGround = true;
            }
        }
    });

    // Boundary checks for canvas edges (left and right)
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// Add to gameLoop
// Draw coins
function drawCoins() {
    ctx.fillStyle = 'gold';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Coin collision detection
function checkCoinCollisions() {
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {

            coin.collected = true;
            score += 10;
            updateScoreDisplay();
        }
    });
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = 'Score: ' + score;
}

function update() {
    updatePlayer();
    checkPlatformCollisions();
    checkCoinCollisions(); // Add this line
    // other update functions will go here
}

function render() {
    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.clearRect(0, 0, canvas.width, canvas.height); // This line is now replaced by the background fill

    drawPlayer();
    drawPlatforms();
    drawCoins();
    // other draw functions will go here
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    // Re-initialize platform positions based on new canvas dimensions if necessary
    platforms[0].y = canvas.height - 20;
    platforms[0].width = canvas.width;
    player.y = canvas.height - platforms[0].height - player.height; // Adjust player y to be on the ground platform
    updateScoreDisplay(); // Initialize score display
}

// Initialize game
resizeCanvas();
window.addEventListener('resize', resizeCanvas); // Adjust canvas on window resize

// Start the game loop
gameLoop();
