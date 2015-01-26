/*global Particle, Player, Vector, Boost*/
/*jslint plusplus: true*/
var Sinuous = function (canvas) {
	"use strict";
	var hud,
		time,
		score = 0,
		difficulty = 1.000,
		defaultVelocity = new Vector(-1.3, 1),
		playing = true,
		ENEMIES_FACTOR = 0,
		SCREEN_HEIGHT = canvas.height,
		SCREEN_WIDTH = canvas.width;
	this.canvas = canvas;
	this.enemies = [];
	this.boosts = [];
	this.context = this.canvas.getContext("2d");
	this.player = new Player(5, 'green');

	this.init = function () {
		hud = document.getElementById("hud");
		time = new Date();
		//this.createEnemies();
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
	
	this.generateBoost = function () {
		var diffParticle, diffBoost, gravityBoost, gravityParticle, clearBoost, clearParticle, availableBoosts, position = this.generatePosition();
		
		function rand(min, max) {
			var offset = min, range = (max - min) + 1;
			
			return Math.floor(Math.random() * range) + offset;
		}
		//console.log("position -> "+position.x +", "+ position.y);
		diffParticle = new Particle(10, 'green', position, defaultVelocity, 1 + (Math.random() * 0.4));
		gravityParticle = new Particle(10, 'blue', position, defaultVelocity, 1 + (Math.random() * 0.4));
		clearParticle = new Particle(10, 'purple', position, defaultVelocity, 1 + (Math.random() * 0.5));
		
		diffBoost = new Boost("diff", diffParticle, function () { difficulty -= 0.0007; }, 100);
		gravityBoost = new Boost("gravity", gravityParticle, function () { difficulty -= 0.0007; }, 100);
		clearBoost = new Boost("clear", clearParticle, function () { difficulty -= 0.0007; }, 100);
		
		availableBoosts = [diffBoost, gravityBoost, clearBoost];
		
		//returns random boost from boosts array
		return availableBoosts[rand(0, availableBoosts.length - 1)];
	};
	
	
	this.generateStartVelocity = function () {
		return new Vector(-4 + Math.random() * 8, -4 + Math.random() * 8);
	};

	this.generatePosition = function () {
		var position = new Vector(0, 0);
		
		if (Math.random() > 0.5) {
			position.x = Math.random() * SCREEN_WIDTH;
			position.y = -20;
		} else {
			position.x = SCREEN_WIDTH + 20;
			position.y = (-SCREEN_HEIGHT * 0.2) + (Math.random() * SCREEN_HEIGHT * 1.2);
		}

		return position;
	};

	this.drawObjects = function () {
		var enemy, boost;
		this.context.fillStyle = 'black';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.player.draw(this.context);
		this.player.drawTrail(this.context);
		
		for (enemy in this.enemies) {
			if (this.enemies.hasOwnProperty(enemy)) {
				this.enemies[enemy].draw(this.context);
			}
		}
		
		for (boost in this.boosts) {
			if (this.boosts.hasOwnProperty(boost)) {
				this.boosts[boost].draw(this.context);
			}
		}

	};

	this.updateObjects = function (playerPosition, velocity) {
		var enemy, boost;
		this.player.update(playerPosition, velocity);

		for (enemy in this.enemies) {
			if (this.enemies.hasOwnProperty(enemy)) {
				this.enemies[enemy].setVelocity(velocity);
				this.enemies[enemy].update();
			}
		}
		
		for (boost in this.boosts) {
			if (this.boosts.hasOwnProperty(boost)) {
				//console.log(this.boosts[boost]);
				this.boosts[boost].update();
			}
		}
		
	};
	
	this.isOutOfScreen = function (position) {
		return position.x < 0 || position.x > this.SCREEN_WIDTH + 20 || position.y < -20 || position.y > this.SCREEN_WIDTH + 20;
	};
	this.clearObjects = function () {
		var boost, enemy, currentPosition;
		for (enemy in this.enemies) {
			if (this.enemies.hasOwnProperty(enemy)) {
				currentPosition = new Vector(this.enemies[enemy].position.x, this.enemies[enemy].position.y);
			// remove from the enemies array, the dots that are out of bounds
				if (this.isOutOfScreen(currentPosition)) {
					this.enemies.splice(enemy, 1);
				//console.log("removed -> " + enemy);
				}
			}
		}
		
		for (boost in this.boosts) {
			if (this.boosts.hasOwnProperty(boost)) {
				currentPosition = new Vector(this.boosts[boost].particle.position.x, this.boosts[boost].particle.position.y);
				if (this.isOutOfScreen(currentPosition)) {
					this.boosts.splice(boost, 1);
					//console.log("removed boost -> " + boost);
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
	
	this.updateHUD = function () {
		
		var hudText,
			currentTime = new Date(),
			timePassed = currentTime.getTime() - time.getTime(),
			scoreText = "Score: <span>" + Math.floor(score) + "</span>",
			timeText = " Time: <span>" + (timePassed / 1000).toFixed(2) + "s</span>";
		
		hudText = scoreText + timeText;
		hud.innerHTML = hudText;
	};


	this.loop = function (mouse) {
		var diffVelocity, chanceOfBoost = Math.random();
		if (playing) {
			this.increaseDifficulty(0.0008);
			this.updateScore();
			//console.log(this.score);
			diffVelocity = Vector.mult(defaultVelocity, difficulty);

			if (this.enemies.length < ENEMIES_FACTOR * this.difficulty) {
				this.createEnemies();
			}
			
			//console.log(chanceOfBoost);
			if (chanceOfBoost > 0.9975) {
				//console.log("created boost");
				this.boosts.push(this.generateBoost());
			}

			this.updateObjects(mouse, diffVelocity);
			this.drawObjects();
			//console.log(mouse);

			this.updateHUD();
			this.clearObjects();
		}
		
		//if (this.boost.active()) {
		//	this.boost.doAction();
			//console.log(difficulty);
		//}
		
	};
};