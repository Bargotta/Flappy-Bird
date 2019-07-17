/**************************************************
 * Globals
 **************************************************/
var canvas;
var ctx;
var frameRate = 1/120;
var interval;

var obstacleSpacing = 250; // spacing between obstacle pairs
var obstacleWidth = 20;
var gravity = 9.81;
var squareSize = 30;
var maxGap = 200;

var SPACE_BAR = 32;
var jumpAcceleration = -23;
var decay = 0.75;

var frame = 1;
var obstacles = [];
var square;
var score = 0;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);

    setup();
    interval = setInterval(game, frameRate * 1000);
};

function setup() {
    square = new Square(20, (canvas.height - squareSize) / 2, squareSize);
    createObstaclePair(2 * obstacleSpacing);
    createObstaclePair(3 * obstacleSpacing);

    document.body.onkeydown = function(e){
        if (e.keyCode == SPACE_BAR) {
            square.acc = jumpAcceleration;
        }
    }
}

function game() {
    clearScreen()

    square.show();
    square.update();

    if (frame % obstacleSpacing == 0) {
        createObstaclePair(3 * obstacleSpacing);
        score++;
    }

    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].show();
        obstacles[i].update();
    }
    
    // remove obstacle pair if it's off screen
    if (obstacles[0].x < -obstacleWidth && obstacles[1].x < -obstacleWidth) {
        obstacles = obstacles.slice(2);
    }

    detectCollision();

    updateScore();
    frame++;
}

/**************************************************
 * Helper Functions
 **************************************************/
function clearScreen() {
    ctx.fillStyle="#f1f1f1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function reset() {
    clearInterval(interval);
    frame = 1;
    score = 0;
    obstacles = [];

    setup();
    interval = setInterval(game, frameRate * 1000);
}

function getScore() {
    return Math.max(score - 1, 0);
}

function updateScore() {
    ctx.font = '30px serif';
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + getScore(), canvas.width - 160, 50);
}

function createObstaclePair(x) {
    var topObstacleHeight = Math.round(Math.random() * (canvas.height - (2 * squareSize)));
    var topObstacle = new Obstacle(x, 0, obstacleWidth, topObstacleHeight);

    var obstacleOpening = 2 * squareSize + Math.round(Math.random() * maxGap);
    var bottomObstacleHeight = canvas.height - (topObstacleHeight + obstacleOpening);
    var bottomObstacle = new Obstacle(x, topObstacleHeight + obstacleOpening, obstacleWidth, bottomObstacleHeight);

    obstacles.push(topObstacle);
    obstacles.push(bottomObstacle);
}

function collisionWith(obstacle) {
    var sqLeft = square.x;
    var sqRight = square.x + square.size;
    var sqTop = square.y;
    var sqBottom = square.y + square.size;

    var obLeft = obstacle.x;
    var obRight = obstacle.x + obstacle.width;
    var obTop = obstacle.y;
    var obBottom = obstacle.y + obstacle.height;

    var collision = true;
    if (sqBottom < obTop || sqTop > obBottom || sqRight < obLeft || sqLeft > obRight) {
        collision = false;
    }
    return collision;
}

function detectCollision() {
    var collision = false;
    if (collisionWith(obstacles[0]) || collisionWith(obstacles[1])) {
        clearInterval(interval);
        
        var paragraph = document.getElementById("p");
        var text = document.createTextNode(getScore());
        var br = document.createElement("BR");
        paragraph.appendChild(text);
        paragraph.appendChild(br)
    }
}

/**************************************************
 * Components
 **************************************************/
function Square(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.vel = 0;
    this.acc = 0;

    this.show = function() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    this.update = function() {
        this.acc = Math.max(this.acc, jumpAcceleration * 1.25);
        this.vel += (this.acc + gravity) * frameRate;
        this.y += this.vel * frameRate * 100;
        this.acc = Math.min(0, this.acc + decay);
        this.hitFloor();
    }

    this.hitFloor = function() {
        if (this.y >= canvas.height - this.size) {
            this.y = canvas.height - this.size;
            this.vel = 0;
        }
    }
}

function Obstacle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.show = function() {    
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function() {
        this.x -= 1;
    }
}
