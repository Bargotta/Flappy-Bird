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
var maxGap = 200;
var hitboxCorrection = -4;

var SPACE_BAR_KEY_CODE = 32;
var jumpAcceleration = -24;
var decay = 0.75;

var frame = 1;
var score = 0;
var bird;
var obstacles = [];

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);

    setup();
    interval = setInterval(game, frameRate * 1000);
};

function setup() {
    bird = new Bird((canvas.width - 51) / 2, (canvas.height - 36) / 2);
    createObstaclePair(3 * obstacleSpacing);
    createObstaclePair(4 * obstacleSpacing);

    document.body.onkeydown = function(e){
        if (e.keyCode == SPACE_BAR_KEY_CODE) {
            bird.acc = jumpAcceleration;
            if (bird.vel > 0) bird.vel = 0;
        }
    }
}

function game() {
    clearScreen()

    bird.show();
    bird.update();

    if (frame % obstacleSpacing == 0) {
        createObstaclePair(4 * obstacleSpacing);
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
    var topObstacleHeight = Math.round(Math.random() * (canvas.height - (2 * bird.height)));
    var topObstacle = new Obstacle(x, 0, obstacleWidth, topObstacleHeight);

    var obstacleOpening = (2 * bird.height) + Math.round(Math.random() * maxGap);
    var bottomObstacleHeight = canvas.height - (topObstacleHeight + obstacleOpening);
    var bottomObstacle = new Obstacle(x, topObstacleHeight + obstacleOpening, obstacleWidth, bottomObstacleHeight);

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

    var collision = true;
    if (bBottom < obTop || bTop > obBottom || bRight < obLeft || bLeft > obRight) {
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
function Bird(x, y) {
    this.x = x;
    this.y = y;

    // dimensions of bird.png
    this.height = 36;
    this.width = 51;

    this.vel = 0;
    this.acc = 0;

    this.show = function() {
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        this.image = new Image();
        this.image.src = "sprites/bird.png";
        ctx.drawImage(this.image, this.x, this.y);
    }

    this.update = function() {
        this.acc = Math.max(this.acc, jumpAcceleration * 1.25);
        this.vel += (this.acc + gravity) * frameRate;
        this.y += this.vel * frameRate * 100;
        this.acc = Math.min(0, this.acc + decay);
        this.hitFloor();
        this.hitCeil();
    }

    this.hitFloor = function() {
        var floor = canvas.height - this.height;
        if (this.y >= floor) {
            this.y = floor;
            this.vel = 0;
        }
    }

    this.hitCeil = function() {
        if (this.y <= 0) {
            this.y = 0;
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
