"use strict";
/*global Vector*/
var Particle = function (radius, color, position, velocity, force) {
	this.radius = radius;
	this.color = color;
	this.force = force;
	this.position = position;
	this.velocity = velocity;
};

Particle.prototype.draw = function (context) {
	context.beginPath();
	context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	context.fillStyle = this.color;
	context.fill();
};

Particle.prototype.setVelocity = function (newv) {
	this.velocity = Vector.mult(newv, this.force);
};

Particle.prototype.update = function () {
	this.position.add(this.velocity);
};