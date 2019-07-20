/**************************************************
 * Globals
 **************************************************/
var canvas;
var ctx;
var interval;
var frame = 0;
var score = 0;
var bestScore = 0;
var bird;
var obstacles = [];
var gameOver = false;
var debug = false;
var pauseEnabled = true;
var paused = false;

// Parameters
var frameRate = 1/120;
var hitboxCorrection = -4;
var floorHeight = 60;
var obstacleSpawn = 750; // Location where obstacles are created
var obstacleSpacing = 370; // horizontal spacing between obstacle pairs
var maxOpeningGap = 200; // max distance between an obstacle pair
var gravity = 9.81;
var flapAcceleration = -24;
var flapAngle = -21;
var decay = 0.75;

var birdSize = { width: 51, height: 36 };
var scoreboard = { x: -150, y: -300, width: 150, height: 180 };
var levels = {
    0: { img: "floor.png", frameRate: 120, background: "#87cefa" },
    1: { img: "lava.png", frameRate: 20, background: "#ffe6b3" }
};
var restart = {
    x: scoreboard.x,
    y: scoreboard.y + (2 * scoreboard.height) + 60,
    width: scoreboard.width,
    height: 40
};
var SPACE_BAR_KEY_CODE = 32;
var P_KEY_CODE = 80;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    setup();
    interval = setInterval(game, frameRate * 1000);
};

function setup() {
    bird = new Bird((canvas.width - birdSize.width) / 2, (canvas.height - birdSize.height) / 2);

    document.body.onkeydown = function(e) {
        if (e.keyCode == SPACE_BAR_KEY_CODE) {
            fly(e);
        }

        if (pauseEnabled && e.keyCode == P_KEY_CODE) {
            if (paused) {
                interval = setInterval(game, frameRate * 1000);
                paused = false;
            } else {
                clearInterval(interval);
                paused = true;
            }
        }
    }
    canvas.addEventListener('click', fly);
}

function fly(e) {
    if (paused) return;

    bird.acc = flapAcceleration;
    if (bird.vel > 0) bird.vel = 0;
    bird.angle = degreesToRadians(flapAngle);
}

function game() {
    clearScreen();

    // create new obstacles after a certain amount of frames
    if (frame % obstacleSpacing == 0) {
        createObstaclePair(obstacleSpawn);
    }

    // remove obstacle pair if it's off screen
    if (obstacles[0].x < -obstacles[0].width && obstacles[1].x < -obstacles[1].width) {
        obstacles = obstacles.slice(2);
    }

    // show
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].show();
    }
    bird.show();
    var center = (canvas.width / 2) - (20 * score.toString().length);
    drawText(score, "white", center, 90, 70, 8);

    // detect collision
    for (var i = 0; i < obstacles.length; i++) {    
        if (collisionWith(obstacles[i])) {
            bird.die();
        }
    }

    // update
    updateScore();
    for (var i = 0; i < obstacles.length; i++) {
        if (! bird.dead) obstacles[i].update();
    }
    bird.update();

    // Better luck next time...
    if (bird.dead) initiateGameOver();
    if (gameOver) showRestartMenu();

    frame++;
}

/**************************************************
 * Helper Functions
 **************************************************/
function clearScreen() {
    setLevel(getLevel());

    var x = (canvas.width - 160) / 2;
    var y = canvas.height - 10;
    drawText("Click or press spacebar to fly", "white", x, y, 17, 5)
    drawText("Aaron Bargotta", "white", 10, y, 13, 4)
}

function getLevel() {
    return Math.floor(score / 20);
}

function setLevel(level) {
    switch (level) {
        case 0:
            setLevelZero();
            break
        case 1:
            setLevelOne();
            break;
        default:
            setLevelZero();
    }
}

function setLevelZero() {
    ctx.fillStyle = levels[0].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.floor = new Image();
    this.floor.src = "img/levels/" + levels[0].img;
    var state = bird.dead ? 0 : (frame % levels[0].frameRate);
    ctx.drawImage(this.floor, -state, canvas.height - floor.height);
}

function setLevelOne() {
    ctx.fillStyle = levels[1].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.floor = new Image();
    this.floor.src = "img/levels/" + levels[1].img;
    var state = bird.dead ? 0 : (frame % levels[1].frameRate);
    ctx.drawImage(this.floor, -state, canvas.height - floor.height);

    if (bird.onFloor) {
        initiateGameOver();
    }
}

function initiateGameOver() {
    bird.die();

    // Game Over...
    if (bird.dead && bird.onFloor) {
        clearInterval(interval);
        bestScore = Math.max(bestScore, score);
        gameOver = true;
    }
}

function showRestartMenu() {
    // show scoreboard
    var x = (canvas.width + scoreboard.x) / 2;
    var y = (canvas.height + scoreboard.y) / 2;
    drawBorder(x, y, scoreboard.width, scoreboard.height, 3);
    ctx.fillStyle = '#dfc269';
    ctx.fillRect(x, y, scoreboard.width, scoreboard.height);

    // add scores to scoreboard
    var xOffset = x + (scoreboard.width / 2);
    drawText("Score", "#df8b03", xOffset - 30, y + 35, 25, 5);
    drawText("Best", "#df8b03", xOffset - 23, y + 125, 25, 5);
    drawText(score, "white", xOffset - (6 * score.toString().length), y + 70, 25, 5);
    drawText(bestScore, "white", xOffset - (6 * bestScore.toString().length), y + 160, 25, 5);

    // show restart button
    var x = (canvas.width + restart.x) / 2;
    var y = (canvas.height + restart.y) / 2;
    drawBorder(x, y, restart.width, restart.height, 3);
    ctx.fillStyle = '#dfc269';
    ctx.fillRect(x, y, restart.width, restart.height);
    drawText("Restart", "#d5bb6b", x + 37, y + 29, 25, 5);

    canvas.addEventListener('click', restartGame);
}

function restartGame(e) {
    var x = (canvas.width + restart.x) / 2;
    var y = (canvas.height + restart.y) / 2;
    var rect = { x: x, y: y, width: restart.width, height: restart.height };

    var mousePos = getMousePos(e);
    if (isInside(mousePos, rect)) {
        reset();
    }
}

function reset() {
    clearInterval(interval);
    canvas.removeEventListener('click', restartGame);

    frame = 0;
    score = 0;
    gameOver = false;
    obstacles = [];

    setup();
    interval = setInterval(game, frameRate * 1000);
}

function updateScore() {
    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];
        if (! obstacle.completed && completed(obstacle)) {
            obstacle.completed = true;
            score += 0.5; // avoid double counting since obstacles come in pairs
        }
    }
}

function completed(obstacle) {
    return bird.x > obstacle.x + obstacle.width;
}

function createObstaclePair(x) {
    var maxTopObstacleHeight = canvas.height - (2 * bird.height + floorHeight);
    var topObstacleHeight = Math.round(Math.random() * maxTopObstacleHeight);
    var topObstacle = new Obstacle(x, 0, topObstacleHeight, true);

    var obstacleOpening = (2 * bird.height) + Math.round(Math.random() * maxOpeningGap);
    var bottomObstacleHeight = canvas.height - (topObstacleHeight + obstacleOpening + floorHeight);
    var bottomObstacle = new Obstacle(x, topObstacleHeight + obstacleOpening, bottomObstacleHeight, false);

    obstacles.push(topObstacle);
    obstacles.push(bottomObstacle);
}

function collisionWith(obstacle) {
    var bLeft = bird.x;
    var bRight = bird.x + bird.width + hitboxCorrection;
    var bTop = bird.y;
    var bBottom = bird.y + bird.height;

    var obLeft = obstacle.x;
    var obRight = obstacle.x + obstacle.width;
    var obTop = obstacle.y;
    var obBottom = obstacle.y + obstacle.height;

    if (debug) {
        ctx.fillStyle = 'red';
        ctx.fillRect(bLeft, bTop, bRight - bLeft, bBottom - bTop);

        ctx.fillStyle = 'red';
        ctx.fillRect(obLeft, obTop, obRight - obLeft, obBottom - obTop);
    }

    var collision = true;
    if (bBottom < obTop || bTop > obBottom || bRight < obLeft || bLeft > obRight) {
        collision = false;
    }
    return collision;
}

function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function isInside(pos, rect){
    return pos.x > rect.x 
        && pos.x < rect.x + rect.width 
        && pos.y < rect.y + rect.height 
        && pos.y > rect.y;
}

function drawText(text, color, x, y, fontSize, lineWidth) {
    ctx.font = fontSize + 'px Sans-serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function drawBorder(xPos, yPos, width, height, thickness = 1) {
  ctx.fillStyle = '#000';
  ctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
}

function degreesToRadians(degree) {
    return degree * Math.PI / 180;
}

function radiansToDegrees(radian) {
    return radian * 180 / Math.PI;
}

function pause() {

}
