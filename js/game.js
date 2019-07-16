// TODO: Delete obstacle once it goes off screen
var canvas;
var ctx;

window.onload = function() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	document.body.appendChild(canvas);

	setup();
	setInterval(game, 1000 / 120);
};

var sqSize = 30;
var obstacleSpacing = 250;
var obstacleWidth = 20;
var obstacleOpening = 2 * sqSize + Math.round(Math.random() * 150);

var frame = 0;
var obstacles = [];

function setup() {
	createObstaclePair(2 * obstacleSpacing);
	createObstaclePair(3 * obstacleSpacing);
}

function game() {
	clearScreen()

	ctx.fillStyle = 'red';
	ctx.fillRect(20, (canvas.height - sqSize) / 2, sqSize, sqSize);

	if (frame % obstacleSpacing == 0) {
		createObstaclePair(3 * obstacleSpacing);
	}

	for (var i = 0; i < obstacles.length; i++) {
		obstacles[i].show();
		obstacles[i].update();
	}

	frame++;
}

function createObstaclePair(x) {
	var topObstacleHeight = Math.round(Math.random() * (canvas.height - (2 * sqSize)));
	var topObstacle = new Obstacle(x, 0, obstacleWidth, topObstacleHeight);

	var bottomObstacleHeight = canvas.height - (topObstacleHeight + obstacleOpening);
	var bottomObstacle = new Obstacle(x, topObstacleHeight + obstacleOpening, obstacleWidth, bottomObstacleHeight);

	obstacles.push(topObstacle);
	obstacles.push(bottomObstacle);
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

function clearScreen() {
	ctx.fillStyle="#f1f1f1";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
