function Obstacle(x, y, height, isTopObstacle) {
    this.x = x;
    this.y = y;
    this.width;
    this.height = height;
    this.completed = false;
    this.image = new Image();

    this.show = function() {
        if (isTopObstacle) {
            this.image.src = "img/pipe_flipped.png";
            ctx.drawImage(
                this.image,
                0, this.image.height - this.height,
                this.image.width, this.height,
                this.x, this.y,
                this.image.width, this.height
            );
        } else {
            this.image.src = "img/pipe.png"
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
