function Bird(x, y) {
    this.x = x;
    this.y = y;

    // dimensions of bird.png
    this.width = birdSize.width;
    this.height = birdSize.height;

    this.vel = 0;
    this.acc = 0;
    this.angle = 0;
    this.dead = false;
    this.onFloor = false;

    this.show = function() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        this.image = new Image();
        this.image.src = "img/bird.png";
        ctx.drawImage(this.image, this.width / -2, this.height / -2);
        ctx.restore();
    }

    this.update = function() {
        this.acc = Math.max(this.acc, flapAcceleration * 1.25);
        this.vel += (this.acc + gravity) * frameRate;
        this.y += this.vel * frameRate * 100;
        this.acc = Math.min(0, this.acc + decay);

        if (this.vel > 0 && radiansToDegrees(this.angle) < 90) {
            this.angle += degreesToRadians(1);
        }

        this.onFloor = this.hitFloor();
        this.hitCeil();
    }

    this.die = function() {
        this.dead = true;
        document.body.onkeydown = null;
        canvas.removeEventListener('click', fly);
    }

    this.hitFloor = function() {
        var floor = canvas.height - this.height - floorHeight;
        if (this.y >= floor) {
            this.y = floor;
            this.vel = 0;
            this.angle = 0;
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
