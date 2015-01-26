/*global Particle, Player, Vector, Boost*/
/*jslint plusplus: true*/
var Sinuous = function (canvas) {
	"use strict";
	var score = 0,
		difficulty = 1.000,
		defaultVelocity = new Vector(-1.3, 1),
		playing = false,
		ENEMIES_FACTOR = 30,
		SCREEN_HEIGHT = canvas.height,
		SCREEN_WIDTH = canvas.width;
	
	this.canvas = canvas;
	this.enemies = [];
	this.boosts = [];
	this.boost = new Boost("speed", new Particle(9, 'green', new Vector(10, 100), new Vector(0, 0), 1 + (Math.random() * 0.4)), function () { difficulty -= 0.0007; }, 100);
	
	this.context = this.canvas.getContext("2d");
	this.player = new Player(5, 'green');

	this.init = function () {
		this.createEnemies();
	};

	this.createEnemies = function () {
		//Every time create between 10 and 15 enemies
		var enemy, numEnemies = 10 + (Math.random() * 15);
		while (--numEnemies >= 0) {
			enemy = new Particle(3 + (Math.random() * 4), 'red', this.generatePosition(), this.generateStartVelocity(), 1 + (Math.random() * 0.4)
													);
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
		var enemy;
		this.context.fillStyle = 'black';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.player.draw(this.context);
		this.player.drawTrail(this.context);
		
		for (enemy in this.enemies) {
			if (this.enemies.hasOwnProperty(enemy)) {
				this.enemies[enemy].draw(this.context);
			}
		}

	};

	this.updateObjects = function (playerPosition, velocity) {
		var enemy;
		this.player.update(playerPosition, velocity);

		for (enemy in this.enemies) {
			if (this.enemies.hasOwnProperty(enemy)) {
				this.enemies[enemy].setVelocity(velocity);
				this.enemies[enemy].update();
			}
		}
	};

	this.clearObjects = function () {
		var enemy, currentPosition;
		for (enemy in this.enemies) {
			if (this.enemies.hasOwnProperty(enemy)) {
				currentPosition = new Vector(this.enemies[enemy].position.x, this.enemies[enemy].position.y);
			// remove from the enemies array, the dots that are out of bounds
				if (currentPosition.x < 0 || currentPosition.x > this.SCREEN_WIDTH + 20 || currentPosition.y < -20 || currentPosition.y > this.SCREEN_WIDTH + 20) {
					this.enemies.splice(enemy, 1);
				//console.log("removed -> " + enemy);
				}
			}
		}
	};

	this.increaseDifficulty = function (amount) {
		difficulty += amount;
	};

	this.updateScore = function () {
		var lastPlayerPosition = this.player.trail[this.player.trail.length] || this.player.position;

		score += 0.3 * difficulty;
		score += Vector.distance(lastPlayerPosition, this.player.position);
	};


	this.loop = function (mouse) {
		if (playing) {
			this.increaseDifficulty(0.0008);
			this.updateScore(score);
			//console.log(this.score);
			var diffVelocity = Vector.mult(defaultVelocity, difficulty);

			if (this.enemies.length < ENEMIES_FACTOR * this.difficulty) {
				this.createEnemies();
			}

			this.updateObjects(mouse, diffVelocity);
			this.drawObjects();
			//console.log(mouse);


			this.clearObjects();
		}
		
		if (this.boost.active()) {
			this.boost.doAction();
			console.log(difficulty);
		}
		
	};
};