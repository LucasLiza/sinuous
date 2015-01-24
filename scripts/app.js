"use strict";
var Sinuous = function (canvas) {
	this.canvas = canvas;
	this.enemies = [];
	this.player = 1;
	this.context = this.canvas.getContext("2d");
	this.MAX_ENEMIES = 30;
	this.playing = true;
	this.SCREEN_HEIGHT = canvas.height;
	this.SCREEN_WIDTH = canvas.width;
	this.difficulty = 1.001;

	this.init = function () {
		this.createEnemies();
	};

	this.createEnemies = function () {
		//Every time create between 10 and 15 enemies
		var numEnemies = 10 + (Math.random() * 15);
		while (--numEnemies >= 0) {
			var enemy = new Dot(3, 'red', this.generatePosition());
			this.enemies.push(enemy);
			console.log('created enemy ->' + enemy);
		}
	};

	this.generatePosition = function () {
		var position = new Vector(0, 0);
		if (Math.random() > 0.5) {
			position.x = Math.random() * this.SCREEN_WIDTH;
			position.y = -20;
		} else {
			position.x = this.SCREEN_WIDTH + 20;
			position.y = (-this.SCREEN_HEIGHT * 0.2) + (Math.random() * this.SCREEN_HEIGHT * 1.2);
		}

		return position;
	};

	this.drawObjects = function () {
		this.context.fillStyle = 'black';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		for (var enemy in this.enemies) {
			this.enemies[enemy].draw(this.context);
			this.enemies[enemy].update(0.1);
		}

	};

	this.clearObjects = function () {
		for (var enemy in this.enemies) {
			var currentPosition = new Vector(this.enemies[enemy].position.x, this.enemies[enemy].position.y);
			// remove from the enemies array, the dots that are out of bounds
			if (currentPosition.x < 0 || currentPosition.x > this.SCREEN_WIDTH + 20 || currentPosition.y < -20 || currentPosition.y > this.SCREEN_HEIGHT * 2) {
				this.enemies.splice(enemy, 1);
				console.log("removed -> " + enemy);
			}
		}

		//this.createEnemies();
	};

	this.increaseDifficulty = function (amount) {
		this.difficulty += amount;
	};


	this.loop = function () {
		if (this.playing) {
			if (this.enemies.length < 15 * this.difficulty) {
				this.createEnemies();
			}

			this.drawObjects();
			this.clearObjects();
			this.increaseDifficulty(0.007);
		}
	};
};