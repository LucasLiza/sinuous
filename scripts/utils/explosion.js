var Explosion = function (color, position, velocity, spread) {
	"use strict";
	this.spread = spread || Math.PI / 32;
	this.velocity = velocity;
	this.position = position;
	this.color = color;
};

Explosion.prototype.emit = function (amount) {
	var pts = [];
	for (var i = 0; i < amount; i++) {
		// Use an angle randomized over the spread so we have more of a "spray"
		var angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);

		// The magnitude of the emitter's velocity
		var magnitude = this.velocity.mag();

		// The emitter's position
		var position = new Vector(this.position.x, this.position.y);

		// New velocity based off of the calculated angle and magnitude
		var velocity = Vector.fromAngle(angle, magnitude);

		// return our new Particle!
		pts.push(new Particle(1, this.color, position, velocity, new Vector(1, 1)));
	}
	return pts;
};