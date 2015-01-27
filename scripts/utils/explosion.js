var Explosion = function (time, particle) {
	"use strict";
	this.pReference = particle;
	this.lifeTime = time;
	this.numParticles = particle.radius * 10;
	this.particles = [];
	for (var i = 0; i < this.numParticles; i++) {
		this.particles.push(new Particle(1, 'white', Vector.mult(this.pReference.position, Math.random() * 2), Vector.div(this.pReference.velocity, 10), 2));
	}
};

Explosion.prototype.draw = function (context) {
	if (this.lifeTime > 0) {
		for (var i = 0; i < this.numParticles; i++) {
			this.particles[i].draw(context);
		}
	}
};

Explosion.prototype.update = function () {
	for (var i = 0; i < this.numParticles; i++) {
		this.particles[i].update();
	}
	this.lifeTime -= 1;
};

Explosion.prototype.isOver = function () {
	return this.lifeTime <= 0;
};