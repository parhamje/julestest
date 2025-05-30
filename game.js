// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Paddle variables
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleSpeed = 7;

// Ball variables
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 2; // Initial X speed
let ballSpeedY = -2; // Initial Y speed

// Brick variables
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Game state variables
let score = 0;
let lives = 3;

// Bricks array
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Score display element
const scoreDisplay = document.getElementById('score');
// Initial score and lives display will be handled by the first call to draw()

// --- Paddle Functionality ---
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// --- Ball Functionality ---
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// --- Brick Wall Functionality ---
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                brick.x = brickX; // Store calculated position
                brick.y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    score++;
                    // Score display updated in draw() or when life lost
                    if (score == brickRowCount * brickColumnCount) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// --- Game State & UI Update Functions ---
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// --- Main Game Logic ---
function update() {
    // Paddle Movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    // Ball Movement and Collision
    let nextBallX = ballX + ballSpeedX;
    let nextBallY = ballY + ballSpeedY;

    // Wall Collisions (Top, Left, Right)
    if (nextBallX > canvas.width - ballRadius || nextBallX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (nextBallY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    }
    // Paddle Collision
    else if (nextBallY + ballRadius > canvas.height - paddleHeight && // Is the ball at a Y level to hit the paddle?
             ballY < canvas.height - paddleHeight && // Ensure ball is above paddle before this frame
             nextBallX > paddleX && nextBallX < paddleX + paddleWidth) { // Is the ball horizontally aligned with the paddle?
        ballSpeedY = -ballSpeedY;
        // Optional: Adjust ball's angle based on where it hits the paddle
        let deltaX = ballX - (paddleX + paddleWidth / 2);
        ballSpeedX = deltaX * 0.15; // Adjust multiplier for sensitivity (e.g., 0.1 to 0.3)
                                    // Ensure ballSpeedX doesn't become too small or too large
        if (ballSpeedX > 4) ballSpeedX = 4;
        if (ballSpeedX < -4) ballSpeedX = -4;
        if (ballSpeedX === 0) ballSpeedX = 0.5; // prevent purely vertical bounce if hit in center
    }
    // Bottom Wall Collision (Game Over/Life Loss)
    else if (nextBallY > canvas.height - ballRadius) { // Ball hit bottom
        lives--;
        if (!lives) {
            alert("GAME OVER");
            document.location.reload();
            return; // Stop update if game over
        } else {
            ballX = canvas.width / 2;
            ballY = canvas.height - 30;
            ballSpeedX = 2 * (Math.random() > 0.5 ? 1 : -1); // Randomize initial X direction
            ballSpeedY = -2;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Brick Collision
    collisionDetection();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBricks();
    drawBall();
    drawPaddle();
    drawLives();

    // Update HTML score display
    scoreDisplay.textContent = 'Score: ' + score;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
scoreDisplay.textContent = 'Score: ' + score; // Initial score display
// The first call to draw() in gameLoop() will also set initial lives.
gameLoop();
