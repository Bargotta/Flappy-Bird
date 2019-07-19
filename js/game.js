/**************************************************
 * Globals
 **************************************************/
var canvas;
var ctx;
var interval;
var frame = 0;
var score = 0;
var bird;
var obstacles = [];

// Parameters
var frameRate = 1/120;
var hitboxCorrection = -4;
var floorHeight = 60;
var obstacleSpawn = 750; // Location where obstacles are created
var obstacleSpacing = 350; // horizontal spacing between obstacle pairs
var maxOpeningGap = 200; // max distance between an obstacle pair
var birdSize = { width: 51, height: 36 };
var gravity = 9.81;
var jumpAcceleration = -24;
var decay = 0.75;

var SPACE_BAR_KEY_CODE = 32;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    setup();
    interval = setInterval(game, frameRate * 1000);
};

function setup() {
    bird = new Bird((canvas.width - birdSize.width) / 2, (canvas.height - birdSize.height) / 2);

    document.body.onkeydown = function(e){
        if (e.keyCode == SPACE_BAR_KEY_CODE) {
            bird.acc = jumpAcceleration;
            if (bird.vel > 0) bird.vel = 0;
        }
    }
}

function game() {
    clearScreen()

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

    // detect collision
    for (var i = 0; i < obstacles.length; i++) {    
        if (! bird.dead && collisionWith(obstacles[i])) {
            bird.die();
            
            var paragraph = document.getElementById("p");
            var text = document.createTextNode(score);
            var br = document.createElement("BR");
            paragraph.appendChild(text);
            paragraph.appendChild(br)
        }
    }

    // Game Over...
    if (bird.dead && bird.onFloor) {
        clearInterval(interval);
    }

    // update
    updateScore();
    for (var i = 0; i < obstacles.length; i++) {
        if (! bird.dead) obstacles[i].update();
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
    var state = bird.dead ? 0 : (frame % 120);
    ctx.drawImage(this.image, -state, 0);

    var x = (canvas.width - 120) / 2;
    var y = canvas.height - 10;
    drawText("Press spacebar to fly", x, y, 17, 5)
}

function drawText(text, x, y, fontSize, lineWidth) {
    ctx.font = fontSize + 'px Sans-serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

function reset() {
    clearInterval(interval);
    document.getElementById('reset').blur();
    
    frame = 0;
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
            score += 0.5; // avoid double counting since obstacles come in pairs
        }
    }

    drawText(score, canvas.width / 2, 90, 70, 8);
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
    this.dead = false;
    this.onFloor = false;

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
        
        this.onFloor = this.hitFloor();
        this.hitCeil();
    }

    this.die = function() {
        this.dead = true;
        document.body.onkeydown = null;
    }

    this.hitFloor = function() {
        var floor = canvas.height - this.height - floorHeight;
        if (this.y >= floor) {
            this.y = floor;
            this.vel = 0;
            return true;
        }
        return false;
    }

    this.hitCeil = function() {
        if (this.y <= 0) {
            this.y = 0;
            this.vel = 0;
            return true;
        }
        return false;
    }
}

function Obstacle(x, y, height, isTopObstacle) {
    this.x = x;
    this.y = y;
    this.width;
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
        this.width = this.image.width;
    }

    this.update = function() {
        this.x -= 1;
    }
}
