/*jslint plusplus: true*/
var Boost = function (name, particle, act, context, duration) {
	"use strict";
	var action = act;
	this.particle = particle;
	this.duration = duration;
	this.name = name;
	this.radius = this.particle.radius;
	this.position = this.particle.position;
	this.id = name[0];
	//Overriding draw
	this.particle.draw = function (context) {
		context.beginPath();
		//console.log(this.position);
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
		context.closePath();
		context.fillStyle = "white";
		context.font = this.radius * 1.5 + "px Tahoma";
		//syntax : .fillText("text", x, y)
		//display the text aligned to the center of the particle
		context.fillText(name[0], this.position.x - this.radius / 2, this.position.y + this.radius / 2);
	};

	this.doAction = function () {
		if (this.duration > 0) {
			act();
		}
		--this.duration;
	};

	this.active = function () {
		return this.duration > 0;
	};

	this.draw = function (context) {
		this.particle.draw(context);
	};

	this.update = function () {
		this.particle.update();
		this.position = this.particle.position;
	};
};