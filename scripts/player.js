var Player = function (size, color) {
	this.size = size;
	this.color = color;
	this.trail = [];
	this.boost = 0;

	this.position = new Vector(0, 0);

	this.draw = function (context) {
		//Draw player trail
		context.beginPath();
		context.strokeStyle = this.color;
		context.lineWidth = 2;

		for (var i = 0; i < this.trail.length; i++) {
			context.lineTo(this.trail[i].x, this.trail[i].y);
		}

		context.stroke();
		context.closePath();

		//Draw player
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
		context.closePath();
	};

	this.update = function (position, gameVelocity) {
		this.trail.push(position);
		if (this.trail.length > 30) {
			this.trail.shift();
		}
		this.position = position;


		//console.log(this.position);
		for (var i = 0; i < this.trail.length; i++) {
			this.trail[i].add(gameVelocity);
		}


	};
};