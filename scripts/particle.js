/*global Vector*/
var Particle = function (radius, color, position, velocity, accel) {
	"use strict";
	this.radius = radius;
	this.color = color;
	this.accel = accel;
	this.position = position;
	this.velocity = velocity;
};

Particle.prototype.draw = function (context) {
	"use strict";
	context.beginPath();
	context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	context.fillStyle = this.color;
	context.fill();
	context.closePath();
};

Particle.prototype.applyVelocity = function (newv) {
	this.velocity = newv;
};

Particle.prototype.update = function () {
	"use strict";
	this.position.add(Vector.add(this.velocity, this.accel));
};

Particle.prototype.clone = function () {
	return new Particle(this.radius, this.color, this.position, this.velocity, this.accel);
};