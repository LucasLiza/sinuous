/*global Vector, Particle*/
/*jslint plusplus: true*/
var Explosion = function (color, position, velocity, spread) {
	"use strict";
	this.spread = spread || Math.PI / 32;
	this.velocity = velocity;
	this.position = position;
	this.color = color;
};

Explosion.prototype.emit = function (amount) {
	"use strict";
	var pts = [],
		i,
		angle,
		magnitude,
		position,
		velocity;

	for (i = 0; i < amount; i++) {
		// Use an angle randomized over the spread so we have more of a "spray"
		angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);

		// The magnitude of the emitter's velocity
		magnitude = this.velocity.mag();

		// The emitter's position
		position = new Vector(this.position.x, this.position.y);

		// New velocity based off of the calculated angle and magnitude
		velocity = Vector.fromAngle(angle, magnitude);

		// return our new Particle!
		pts.push(new Particle(1, this.color, position, velocity, new Vector(1, 1)));
	}
	return pts;
};