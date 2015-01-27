/*global Particle, Player, Vector, Boost, Quadtree*/
/*jslint plusplus: true*/
var Sinuous = function (canvas) {
	"use strict";
	this.canvas = canvas;
	var hud,
		time,
		score = 0,
		difficulty = 1.000,
		defaultVelocity = new Vector(-1.3, 1),
		playing = true,
		paused = false,
		ENEMIES_FACTOR = 0,
		enemies = [],
		boosts = [],
		explosions = [],
		context,
		quadtree,
		player = new Player(5, 'green'),
		SCREEN_HEIGHT,
		SCREEN_WIDTH,
		ENEMY_SCORE = 100,

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
					context.strokeStyle = "#FFF";
					context.strokeRect(bounds.x, bounds.y, bounds.height, bounds.width);
					//has subnodes? drawQuadtree them!
				} else {
					for (i = 0; i < node.nodes.length; i = i + 1) {
						drawQuadtree(node.nodes[i]);
					}
				}
			}
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

		createEnemies = function () {
			//Every time create between 10 and 15 enemies
			var enemy, numEnemies = 10 + (Math.random() * 15);
			while (--numEnemies >= 0) {
				enemy = new Particle(3 + (Math.random() * 4), 'red', generatePosition(), generateStartVelocity(), 1 + (Math.random() * 0.4));
				enemies.push(enemy);
				//console.log('created enemy ->' + enemy);
			}
		},

		generateBoost = function () {
			var diffParticle, diffBoost, gravityBoost, gravityParticle, clearBoost, clearParticle, availableBoosts, position = generatePosition();

			diffParticle = new Particle(10, 'green', position, defaultVelocity, 1 + (Math.random() * 0.4));
			gravityParticle = new Particle(10, 'blue', position, defaultVelocity, 1 + (Math.random() * 0.4));
			clearParticle = new Particle(10, 'purple', position, defaultVelocity, 1 + (Math.random() * 0.5));

			diffBoost = new Boost("diff", diffParticle, function () {
				console.log(generatePosition());
			}, this, 100);

			gravityBoost = new Boost("gravity", gravityParticle, function () {
				console.log("pause");
			}, this, 100);

			clearBoost = new Boost("clear", clearParticle, function () {
				clearEnemies();
			}, this, 1);

			availableBoosts = [diffBoost, gravityBoost, clearBoost];

			//returns random boost from boosts array
			return availableBoosts[rand(0, availableBoosts.length - 1)];
		},

		clearEnemies = function () {
			for (var i = 0; i < enemies.length; i++) {
				explosions.push(new Explosion(enemies[i].color, enemies[i].position, enemies[i].velocity, 3).emit(enemies[i].radius * 2));
			}
			score += ENEMY_SCORE * enemies.length;
			enemies.splice(0, enemies.length);
		},

		drawObjects = function () {
			var enemy, boost, explosion, particle;
			context.fillStyle = 'black';
			canvas.width = canvas.width;

			player.draw(context);
			player.drawTrail(context);

			for (enemy in enemies) {
				if (enemies.hasOwnProperty(enemy)) {
					enemies[enemy].draw(context);
					//console.log(enemies[enemy] instanceof Particle);
				}
			}

			for (boost in boosts) {
				if (boosts.hasOwnProperty(boost)) {
					boosts[boost].draw(context);
				}
			}

			for (explosion in explosions) {
				if (explosions.hasOwnProperty(explosion)) {
					for (particle in explosions[explosion]) {
						explosions[explosion][particle].draw(context);
					}
				}
			}

		},

		updateObjects = function (playerPosition, velocity) {
			var enemy, boost, explosion, particle;
			if (typeof playerPosition !== 'undefined') {
				player.update(playerPosition, velocity);
			}

			for (enemy in enemies) {
				if (enemies.hasOwnProperty(enemy)) {
					enemies[enemy].setVelocity(velocity);
					enemies[enemy].update();
					quadtree.insert(enemies[enemy]);
				}
			}

			for (boost in boosts) {
				if (boosts.hasOwnProperty(boost)) {
					//console.log(boosts[boost]);
					boosts[boost].update();
					//console.log("inserted");
					quadtree.insert(boosts[boost]);
				}
			}

			for (explosion in explosions) {
				if (explosions.hasOwnProperty(explosion)) {
					for (particle in explosions[explosion]) {
						explosions[explosion][particle].update();
					}
				}
			}

		},

		isOutOfScreen = function (position) {
			return position.x < 0 || position.x > SCREEN_WIDTH + 20 || position.y < -20 || position.y > SCREEN_WIDTH + 20;
		},

		clearObjects = function () {
			var boost, enemy, explosion, particle, currentPosition;
			for (enemy in enemies) {
				if (enemies.hasOwnProperty(enemy)) {
					currentPosition = new Vector(enemies[enemy].position.x, enemies[enemy].position.y);
					// remove from the enemies array, the dots that are out of bounds
					if (isOutOfScreen(currentPosition)) {
						enemies.splice(enemy, 1);
						//console.log("removed -> " + enemy);
					}
				}
			}

			for (boost in boosts) {
				if (boosts.hasOwnProperty(boost)) {
					currentPosition = new Vector(boosts[boost].particle.position.x, boosts[boost].particle.position.y);
					if (isOutOfScreen(currentPosition)) {
						boosts.splice(boost, 1);
						//console.log("removed boost -> " + boost);
					}
				}
			}

//			for (explosion in explosions) {
//				if (explosions.hasOwnProperty(explosion)) {
//					currentPosition = new Vector(explosions[explosion].position.x, explosions[explosion].position.y);
//					if (isOutOfScreen(currentPosition)) {
//						for (particle in explosions[explosion]) {
//							explosions[explosion][particle].splice(explosion, 1);
//						}
//					}
//				}
//			}
		},

		increaseDifficulty = function (amount) {
			difficulty += amount;
		},

		updateScore = function () {
			var lastPlayerPosition = player.trail[player.trail.length] || player.position;

			score += 0.4 * difficulty;
			score += Vector.distance(lastPlayerPosition, player.position);
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

		removeBoost = function (b) {
			var index = boosts.indexOf(b);
			if (index > -1) {
				boosts.splice(index, 1);
			}
		},

		checkCollision = function (objs, target) {
			var i;
			for (i = 0; i < objs.length; i = i + 1) {
				if (Vector.distance(objs[i].position, target.position) <= target.radius + objs[i].radius) {
					if (objs[i] instanceof Particle) { //is an enemy
						gameOver();
					} else if (objs[i] instanceof Boost) { //boost it up
						player.acquire(objs[i]);
						removeBoost(objs[i]);
						console.log("Acquired Boost! It's a " + objs[i].name);
					}
				}
			}
		};

	this.init = function () {
		hud = document.getElementById("hud");
		SCREEN_HEIGHT = this.canvas.height;
		SCREEN_WIDTH = this.canvas.width;
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

	this.resume = function () {
		paused = false;
	};

	this.pause = function () {
		paused = true;
	};

	this.loop = function (mouse) {
		var diffVelocity, chanceOfBoost = Math.random(),
			returnObjects, i;

		if (playing && !paused) {
			increaseDifficulty(0.0008);
			//console.log(difficulty);
			updateScore();
			//console.log(this.score);
			diffVelocity = Vector.mult(defaultVelocity, difficulty);
			//console.log(this.enemies.length);
			if (enemies.length < ENEMIES_FACTOR * difficulty) {
				createEnemies();
			}

			if (chanceOfBoost > 0.5975) {
				boosts.push(generateBoost());
			}

			updateObjects(mouse, diffVelocity);
			returnObjects = quadtree.retrieve(player);
			checkCollision(returnObjects, player);

			drawQuadtree(quadtree);
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