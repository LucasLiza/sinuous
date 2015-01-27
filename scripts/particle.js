/*global Vector*/
var Particle = function (radius, color, position, velocity, force) {
	"use strict";
	this.radius = radius;
	this.color = color;
	this.force = force;
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

Particle.prototype.setVelocity = function (newv) {
	"use strict";
	this.velocity = Vector.mult(newv, this.force);
};

Particle.prototype.update = function () {
	"use strict";
	this.position.add(this.velocity);
};