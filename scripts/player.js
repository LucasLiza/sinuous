/*global Vector*/
/*jslint plusplus: true*/
var Player = function (size, color) {
	"use strict";
	this.radius = size;
	this.color = color;
	this.boosts = [];
	this.trail = [];
	this.position = new Vector(0, 0);
};

Player.prototype.draw = function (context) {
	"use strict";
	var bIndex;
	//Draw player boosts
	for (bIndex = 0; bIndex < this.boosts.length; bIndex++) {
		switch (this.boosts[bIndex].name) {
		case "diff":
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius * 8, 0, 2 * Math.PI, false);
			context.fillStyle = "white";
			context.fill();
			context.closePath();
			break;
		case "gravity":
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius * 8, 0, 2 * Math.PI, false);
			context.fillStyle = "blue";
			context.fill();
			context.closePath();
			break;
		case "clear":
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius * 8, 0, 2 * Math.PI, false);
			context.fillStyle = "purple";
			context.fill();
			context.closePath();
			break;
		}

	}
	//Draw player
	context.beginPath();
	context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	context.fillStyle = this.color;
	context.fill();
	context.closePath();
};

Player.prototype.drawTrail = function (context) {
	"use strict";
	var i;
	context.fillStyle = 'rgba(0,0,0,0.05)';
	context.beginPath();
	context.strokeStyle = 'rgba(20,100,50,0.70)';
	context.lineWidth = 3;

	for (i = 0; i < this.trail.length; i++) {
		context.lineTo(this.trail[i].x, this.trail[i].y);
	}

	context.stroke();
	context.closePath();
};

Player.prototype.update = function (position, gameVelocity) {
	"use strict";
	var i;
	this.position.x += (position.x - this.position.x) * 0.13;
	this.position.y += (position.y - this.position.y) * 0.13;
	this.trail.push(this.position.clone());
	if (this.trail.length > 40) {
		this.trail.shift();
	}

	//Activate Boosts
	for (i = 0; i < this.boosts.length; i++) {
		if (this.boosts[i].active()) {
			this.boosts[i].doAction();
		} else {
			this.boosts.splice(i, 1);
		}
	}
	//console.log(this.position);
	for (i = 0; i < this.trail.length; i++) {
		this.trail[i].add(gameVelocity);
	}
};

Player.prototype.acquire = function (boost) {
	"use strict";
	this.boosts.push(boost);
};