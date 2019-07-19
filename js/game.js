/**************************************************
 * Globals
 **************************************************/
var canvas;
var ctx;
var frameRate = 1/120;
var interval;

var obstacleSpacing = 250; // spacing between obstacle pairs
var obstacleWidth = 85;
var maxGap = 200;
var floorHeight = 60;
var hitboxCorrection = -4;
var birdSize = { width: 51, height: 36 };

var SPACE_BAR_KEY_CODE = 32;
var gravity = 9.81;
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
    bird = new Bird((canvas.width - birdSize.width) / 2, (canvas.height - birdSize.height) / 2);
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

    // remove obstacle pair if it's off screen
    if (obstacles[0].x < -obstacleWidth && obstacles[1].x < -obstacleWidth) {
        obstacles = obstacles.slice(2);
    }

    // create new obstacles after a certain amount of frames
    if (frame % obstacleSpacing == 0) {
        createObstaclePair(4 * obstacleSpacing);
    }

    // show
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].show();
    }
    bird.show();

    // detect collision
    for (var i = 0; i < obstacles.length; i++) {    
        if (collisionWith(obstacles[i])) {
            clearInterval(interval);
            
            var paragraph = document.getElementById("p");
            var text = document.createTextNode(score);
            var br = document.createElement("BR");
            paragraph.appendChild(text);
            paragraph.appendChild(br)
        }
    }

    // update
    updateScore();
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
    }
    bird.update();

    frame++;
}

/**************************************************
 * Helper Functions
 **************************************************/
function clearScreen() {
    ctx.fillStyle="#87cefa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.image = new Image();
    this.image.src = "sprites/floor.png";
    var state = (frame % 120);
    ctx.drawImage(this.image, -state, 0);
}

function reset() {
    clearInterval(interval);
    document.getElementById('reset').blur();
    
    frame = 1;
    score = 0;
    obstacles = [];

    setup();
    interval = setInterval(game, frameRate * 1000);
}

function updateScore() {
    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];
        if (! obstacle.completed && completed(obstacle)) {
            obstacle.completed = true;
            score += 0.5; // obstacles come in pairs
        }
    }

    ctx.font = 'bold 60px serif';
    ctx.fillStyle = "white";
    ctx.fillText(score, canvas.width / 2, 90);
}

function completed(obstacle) {
    return bird.x > obstacle.x + obstacleWidth;
}

function createObstaclePair(x) {
    var maxTopObstacleHeight = canvas.height - (2 * bird.height + floorHeight);
    var topObstacleHeight = Math.round(Math.random() * maxTopObstacleHeight);
    var topObstacle = new Obstacle(x, 0, obstacleWidth, topObstacleHeight, true);

    var obstacleOpening = (2 * bird.height) + Math.round(Math.random() * maxGap);
    var bottomObstacleHeight = canvas.height - (topObstacleHeight + obstacleOpening + floorHeight);
    var bottomObstacle = new Obstacle(x, topObstacleHeight + obstacleOpening, obstacleWidth, bottomObstacleHeight, false);

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

/**************************************************
 * Components
 **************************************************/
function Bird(x, y) {
    this.x = x;
    this.y = y;

    // dimensions of bird.png
    this.width = birdSize.width;
    this.height = birdSize.height;

    this.vel = 0;
    this.acc = 0;

    this.show = function() {
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
        var floor = canvas.height - this.height - floorHeight;
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

function Obstacle(x, y, width, height, isTopObstacle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.completed = false;
    this.image = new Image();

    this.show = function() {
        if (isTopObstacle) {
            this.image.src = "sprites/pipe_flipped.png";
            ctx.drawImage(
                this.image,
                0, this.image.height - this.height,
                this.image.width, this.height,
                this.x, this.y,
                this.image.width, this.height
            );
        } else {
            this.image.src = "sprites/pipe.png"
            ctx.drawImage(
                this.image,
                0, 0,
                this.image.width, this.height,
                this.x, this.y,
                this.image.width, this.height
            );
        }
    }

    this.update = function() {
        this.x -= 1;
    }
}
