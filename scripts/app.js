"use strict";
var Sinuous = function (canvas) {
	this.canvas = canvas;
	this.enemies = [];
	this.context = this.canvas.getContext("2d");
	this.MAX_ENEMIES = 30;
	this.playing = true;
	this.SCREEN_HEIGHT = canvas.height;
	this.SCREEN_WIDTH = canvas.width;
	this.difficulty = 1.000;
	this.defaulVelocity = new Vector(-1.3, 1);
	this.player = new Player(5, 'green');

	this.init = function () {
		this.createEnemies();
	};

	this.createEnemies = function () {
		//Every time create between 10 and 15 enemies
		var numEnemies = 10 + (Math.random() * 15);
		while (--numEnemies >= 0) {
			var enemy = new Particle(3 + (Math.random() * 4), 'red', this.generatePosition(), this.generateStartVelocity(), 1 + (Math.random() * 0.4));
			this.enemies.push(enemy);
			//console.log('created enemy ->' + enemy);
		}
	};

	this.generateStartVelocity = function () {
		return new Vector(-4 + Math.random() * 8, -4 + Math.random() * 8);
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

		this.player.draw(this.context);
		this.player.drawTrail(this.context);
		for (var enemy in this.enemies) {
			this.enemies[enemy].draw(this.context);
		}

	};

	this.updateObjects = function (playerPosition, velocity) {
		this.player.update(playerPosition, velocity);

		for (var enemy in this.enemies) {
			this.enemies[enemy].setVelocity(velocity);
			this.enemies[enemy].update();
		}
	};

	this.clearObjects = function () {
		for (var enemy in this.enemies) {
			var currentPosition = new Vector(this.enemies[enemy].position.x, this.enemies[enemy].position.y);
			// remove from the enemies array, the dots that are out of bounds
			if (currentPosition.x < 0 || currentPosition.x > this.SCREEN_WIDTH + 20 || currentPosition.y < -20 || currentPosition.y > this.SCREEN_WIDTH + 20) {
				this.enemies.splice(enemy, 1);
				//console.log("removed -> " + enemy);
			}
		}
	};

	this.increaseDifficulty = function (amount) {
		this.difficulty += amount;
	};


	this.loop = function (mouse) {
		if (this.playing) {
			this.increaseDifficulty(0.0007);
			var diffVelocity = Vector.mult(this.defaulVelocity, this.difficulty);

			if (this.enemies.length < this.MAX_ENEMIES * this.difficulty) {
				this.createEnemies();
			}

			this.updateObjects(mouse, diffVelocity);
			this.drawObjects();
			//console.log(mouse);


			this.clearObjects();
		}
	};
};