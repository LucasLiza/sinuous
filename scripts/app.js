"use strict";
var Sinuous = function (canvas) {
	this.canvas = canvas;
	this.enemies = [];
	this.player = 1;
	this.context = this.canvas.getContext("2d");

	this.init = function () {
		for (var enemyCount = 0; enemyCount < 10; enemyCount++) {
			this.enemies.push(new Dot(5, 'red', new Vector(10 * enemyCount, 20 * enemyCount)));
		}
	};

	this.drawObjects = function () {
		this.context.fillStyle = 'black';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		for (var enemy in this.enemies) {
			this.enemies[enemy].draw(this.context);
			this.enemies[enemy].update(0.1);
		}
	};
};