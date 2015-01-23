"use strict";
var Dot = function (radius, color, position) {
	this.radius = radius;
	this.color = color;
	this.position = position;

	this.draw = function (context) {
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
	};
};