/*global Particle, Player, Vector, Boost, Quadtree*/
/*jslint plusplus: true*/
var Sinuous = function (canvas) {
	"use strict";
	var hud,
		time,
		score = 0,
		difficulty = 1.000,
		defaultVelocity = new Vector(-1.3, 1),
		playing = true,
		paused = false,
		ENEMIES_FACTOR = 10,
		enemies = [],
		boosts = [],
		context,
		quadtree,
		player = new Player(5, 'green'),
		SCREEN_HEIGHT,
		SCREEN_WIDTH,

		rand = function (min, max) {
			var offset = min,
				range = (max - min) + 1;

			return Math.floor(Math.random() * range) + offset;
		},

		drawQuadtree = function (node) {
			var bounds, i;
			//console.log(node);
			//no subnodes? draw the current node
			if (typeof node !== 'undefined') {
				bounds = node.bounds;
				if (node.nodes.length === 0) {
					this.context.strokeStyle = "#FFF";
					this.context.strokeRect(bounds.x, bounds.y, bounds.height, bounds.width);
					//has subnodes? drawQuadtree them!
				} else {
					for (i = 0; i < node.nodes.length; i = i + 1) {
						this.drawQuadtree(node.nodes[i]);
					}
				}
			}
		},

		createEnemies = function () {
			//Every time create between 10 and 15 enemies
			var enemy, numEnemies = 10 + (Math.random() * 15);
			while (--numEnemies >= 0) {
				enemy = new Particle(3 + (Math.random() * 4), 'red', this.generatePosition(), this.generateStartVelocity(), 1 + (Math.random() * 0.4));
				this.enemies.push(enemy);
				//console.log('created enemy ->' + enemy);
			}
		},

		generateBoost = function () {
			var diffParticle, diffBoost, gravityBoost, gravityParticle, clearBoost, clearParticle, availableBoosts, position = this.generatePosition();

			diffParticle = new Particle(10, 'green', position, defaultVelocity, 1 + (Math.random() * 0.4));
			gravityParticle = new Particle(10, 'blue', position, defaultVelocity, 1 + (Math.random() * 0.4));
			clearParticle = new Particle(10, 'purple', position, defaultVelocity, 1 + (Math.random() * 0.5));

			diffBoost = new Boost("diff", diffParticle, function () {
				difficulty -= 0.0007;
			}, 100);

			gravityBoost = new Boost("gravity", gravityParticle, function () {
				difficulty -= 0.0007;
			}, 100);

			clearBoost = new Boost("clear", clearParticle, function () {
				difficulty -= 0.0007;
			}, 100);

			availableBoosts = [diffBoost, gravityBoost, clearBoost];

			//returns random boost from boosts array
			return availableBoosts[rand(0, availableBoosts.length - 1)];
		},

		generateStartVelocity = function () {
			return new Vector(-4 + Math.random() * 8, -4 + Math.random() * 8);
		},

		generatePosition = function () {
			var position = new Vector(0, 0);

			if (Math.random() > 0.5) {
				position.x = Math.random() * SCREEN_WIDTH;
				position.y = -20;
			} else {
				position.x = SCREEN_WIDTH + 20;
				position.y = (-SCREEN_HEIGHT * 0.2) + (Math.random() * SCREEN_HEIGHT * 1.2);
			}

			return position;
		},

		drawObjects = function () {
			var enemy, boost;
			this.context.fillStyle = 'black';
			this.canvas.width = this.canvas.width;

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

		},

		updateObjects = function (playerPosition, velocity) {
			var enemy, boost;
			if (typeof playerPosition !== 'undefined') {
				this.player.update(playerPosition, velocity);
			}
			for (enemy in this.enemies) {
				if (this.enemies.hasOwnProperty(enemy)) {
					this.enemies[enemy].setVelocity(velocity);
					this.enemies[enemy].update();
					this.quadtree.insert(this.enemies[enemy]);
				}
			}

			for (boost in this.boosts) {
				if (this.boosts.hasOwnProperty(boost)) {
					//console.log(this.boosts[boost]);
					this.boosts[boost].update();
					//this.quadtree.insert(this.boosts[boost]);
				}
			}

		},

		isOutOfScreen = function (position) {
			return position.x < 0 || position.x > this.SCREEN_WIDTH + 20 || position.y < -20 || position.y > this.SCREEN_WIDTH + 20;
		},

		clearObjects = function () {
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
		},

		increaseDifficulty = function (amount) {
			difficulty += amount;
		},

		updateScore = function () {
			var lastPlayerPosition = this.player.trail[this.player.trail.length] || this.player.position;

			score += 0.4 * difficulty;
			score += Vector.distance(lastPlayerPosition, this.player.position);
		},

		updateHUD = function () {
			var hudText,
				currentTime = new Date(),
				timePassed = currentTime.getTime() - time.getTime(),
				scoreText = "Score: <span>" + Math.floor(score) + "</span>",
				timeText = " Time: <span>" + (timePassed / 1000).toFixed(2) + "s</span>";

			hudText = scoreText + timeText;
			hud.innerHTML = hudText;
		},

		gameOver = function () {
			playing = false;
		},

		checkCollision = function (objs, target) {
			var i;
			for (i = 0; i < objs.length; i = i + 1) {
				if (Vector.distance(objs[i].position, target.position) <= target.radius + objs[i].radius) {
					this.gameOver();
				}
			}
		};

	this.canvas = canvas;

	this.init = function () {
		hud = document.getElementById("hud");
		SCREEN_HEIGHT = canvas.height;
		SCREEN_WIDTH = canvas.width;
		context = this.canvas.getContext("2d");
		time = new Date();
		quadtree = new Quadtree({
			x: 0,
			y: 0,
			width: this.canvas.height,
			height: this.canvas.width
		});
		createEnemies();
	};

	this.pause = function () {
		paused = true;
	};

	this.resume = function () {
		paused = false;
	};

	this.loop = function (mouse) {
		var diffVelocity, chanceOfBoost = Math.random(),
			returnObjects, i;

		if (playing && !paused) {
			increaseDifficulty(0.0008);
			updateScore();
			//console.log(this.score);
			diffVelocity = Vector.mult(defaultVelocity, difficulty);
			//console.log(this.enemies.length);
			if (enemies.length < ENEMIES_FACTOR * difficulty) {
				createEnemies();
			}

			if (chanceOfBoost > 0.9975) {
				boosts.push(generateBoost());
			}

			updateObjects(mouse, diffVelocity);
			returnObjects = quadtree.retrieve(player);
			checkCollision(returnObjects, player);

			//this.drawQuadtree(this.quadtree);
			//console.log(mouse);
			updateHUD();
			quadtree.clear();
			clearObjects();
			drawObjects();
		}
		//console.log(2);
		//window.requestAnimationFrame(this.loop(mouse));
	};
};