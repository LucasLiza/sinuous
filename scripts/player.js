"use strict";
/*global Vector*/
/*jslint plusplus: true*/
var Player = function (size, color) {
	this.size = size;
	this.color = color;
	this.boost = 0;
	this.trail = [];
	this.position = new Vector(0, 0);
};

Player.prototype.draw = function (context) {
	//Draw player
	context.beginPath();
	context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
	context.fillStyle = this.color;
	context.fill();
	context.closePath();

};

Player.prototype.drawTrail = function (context) {
	var i;
	context.beginPath();
	context.strokeStyle = this.color;
	context.lineWidth = 2;

	for (i = 0; i < this.trail.length; i++) {
		context.lineTo(this.trail[i].x, this.trail[i].y);
	}

	context.stroke();
	context.closePath();


};

Player.prototype.update = function (position, gameVelocity) {
	var i;
	this.position.x += (position.x - this.position.x) * 0.13;
	this.position.y += (position.y - this.position.y) * 0.13;
	this.trail.push(this.position.clone());
	if (this.trail.length > 60) {
		this.trail.shift();
	}
	//console.log(this.position);
	for (i = 0; i < this.trail.length; i++) {
		this.trail[i].add(gameVelocity);
	}
};