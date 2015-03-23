/*global Particle, Player, Vector, Boost, Quadtree, Explosion*/
/*jslint plusplus: true*/
var mouse = new Vector(100, 100);

function documentMouseMoveHandler(event) {
	"use strict";
	mouse = new Vector(event.clientX, event.clientY);
}

if (window.addEventListener) {

	// Handle window's `load` event.
	window.addEventListener('load', function () {
		"use strict";
		// Wire up the `focus` and `blur` event handlers.		
		window.addEventListener('focus', this.game.resume);
		window.addEventListener('blur', this.game.pause);
	});
}

document.addEventListener('mousemove', documentMouseMoveHandler, false);

var Sinuous = function (canvas) {
	"use strict";
	this.canvas = canvas;
	var hud = [],
		time,
		action,
		score = 0,
		difficulty = 1.000,
		defaultVelocity = new Vector(-1.3, 1),
		playing,
		animating,
		ENEMIES_FACTOR,
		enemies = [],
		boosts = [],
		explosions = [],
		context,
		quadtree,
		player,
		SCREEN_HEIGHT,
		SCREEN_WIDTH,
		ENEMY_SCORE = 100,
		now,
		dt = 0,
		returnObjects,
		timestamp = function () {
			return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
		},
		last = timestamp(),
		step = 1 / 60,
		rand = function (min, max) {
			var offset = min,
				range = (max - min) + 1;

			return Math.floor(Math.random() * range) + offset;
		},

		generateStartVelocity = function () {
			var vel = Vector.mult(defaultVelocity, 6);
			//console.log(vel);
			return vel;
		},

		generatePosition = function () {
			var position = new Vector(0, 0);

			if (Math.random() > 0.5) { //
				position.x = Math.round(Math.random() * SCREEN_WIDTH);
				position.y = -20;
			} else {
				position.x = SCREEN_WIDTH + 20;
				position.y = Math.floor((-SCREEN_HEIGHT * 0.2) + (Math.random() * SCREEN_HEIGHT * 1.2));
			}

			return position;
		},

		createEnemies = function () {
			//Every time create between 10 and 15 enemies
			var enemy, numEnemies = 8 + (Math.random() * 13),
				accel, size;
			while (--numEnemies >= 0) {
				accel = rand(1, 5);
				size = rand(3, 5);
				enemy = new Particle(size, 'red', generatePosition(), generateStartVelocity(), new Vector(-accel, accel));
				enemies.push(enemy);
				//console.log('created enemy ->' + enemy);
			}
		},

		generateBoost = function () {
			var diffParticle, diffBoost, gravityBoost, gravityParticle, clearBoost, clearParticle, availableBoosts, position = generatePosition(),
				accel;
			accel = rand(0.4, 1);
			diffParticle = new Particle(10, 'green', position, defaultVelocity, new Vector(accel, accel));
			accel = rand(0.4, 1);
			gravityParticle = new Particle(10, 'blue', position, defaultVelocity, new Vector(accel, accel));
			accel = rand(0.5, 1);
			clearParticle = new Particle(10, 'purple', position, defaultVelocity, new Vector(accel, accel));

			diffBoost = new Boost("diff", diffParticle, function () {
				//console.log(generatePosition());
			}, 100);

			gravityBoost = new Boost("gravity", gravityParticle, function () {
				var i, force, diffVector;
				for (i = 0; i < returnObjects.length; i++) {
					if (Vector.distance(returnObjects[i].position, player.position) <= player.radius * 8 + returnObjects[i].radius) {
						if (returnObjects[i] instanceof Particle) { //is an enemy
							//mathmagics
							diffVector = Vector.sub(player.position, returnObjects[i].position);
							force = (-player.radius * 8 * returnObjects[i].radius) / Math.pow(diffVector.mag(), 3);
							//returnObjects[i].position = new Vector(player.position.x + player.radius * 8, player.position.y - player.radius * 8);
							returnObjects[i].accel.add(Vector.mult(diffVector, force));
						}
					}
				}
			}, 500);

			clearBoost = new Boost("clear", clearParticle, function () {
				var i;
				for (i = 0; i < enemies.length; i++) {
					explosions.push(new Explosion(enemies[i].color, enemies[i].position, enemies[i].velocity, 3).emit(2));
				}
				score += ENEMY_SCORE * enemies.length;
				enemies.splice(0, enemies.length);
			}, 1);

			availableBoosts = [diffBoost, gravityBoost, clearBoost];

			//returns random boost from boosts array
			return availableBoosts[rand(0, availableBoosts.length - 1)];
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
						if (explosions[explosion].hasOwnProperty(particle)) {
							explosions[explosion][particle].draw(context);
						}
					}
				}
			}

		},

		updateObjects = function (playerPosition, velocity, step) {
			var enemy, boost, explosion, particle;
			//velocity.add(step);
			if (typeof playerPosition !== 'undefined' && !animating) {
				player.update(playerPosition, velocity);
			}

			for (enemy in enemies) {
				if (enemies.hasOwnProperty(enemy)) {
					//enemies[enemy].applyForce(difficulty / 2);
					enemies[enemy].applyVelocity(velocity);
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
						if (explosions[explosion].hasOwnProperty(particle)) {
							explosions[explosion][particle].update();
						}
					}
				}
			}

		},

		isOutOfScreen = function (position) {
			return position.x < 0 || position.x > SCREEN_WIDTH + 20 || position.y < -20 || position.y > SCREEN_HEIGHT + 20;
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

			for (explosion in explosions) {
				if (explosions.hasOwnProperty(explosion)) {

					for (particle in explosions[explosion]) {
						if (explosions[explosion].hasOwnProperty(particle)) {
							currentPosition = explosions[explosion][particle].position;
							//console.log(currentPosition);
							if (isOutOfScreen(currentPosition)) {
								explosions[explosion].splice(particle, 1);
							}

							if (explosions[explosion].length === 0) {
								explosions.splice(explosion, 1);
							}
						}
					}
				}
			}
		},

		increaseDifficulty = function (amount) {
			difficulty += amount;
		},

		updateScore = function () {
			var lastPlayerPosition = player.trail[player.trail.length - 1] || player.position;
			//console.log(Vector.distance(lastPlayerPosition, player.position));
			score += 0.4 * difficulty;
			score += Vector.distance(lastPlayerPosition, player.position) * 10;
		},

		updateHUD = function () {
			var hudText,
				currentTime = new Date(),
				timePassed = currentTime.getTime() - time.getTime(),
				scoreText = "Score: " + Math.floor(score),
				timeText = " Time: " + (timePassed / 1000).toFixed(2) + "s";

			hud[0].innerHTML = scoreText;
			hud[1].innerHTML = timeText;
		},

		gameOver = function () {
			explosions.push(new Explosion(player.color, player.position, generateStartVelocity(), 3).emit(player.radius));
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
						//console.log("Acquired Boost! It's a " + objs[i].name);
					}
				}
			}
		},

		loop = function () {
			var diffVelocity, chanceOfBoost = Math.random(),
				i, id = window.requestAnimationFrame(loop);
			if (playing) {
				//console.log(explosions.length);
				now = timestamp();
				dt = dt + Math.min(1, (now - last) / 1000);
				while (dt > step) {
					dt = dt - step;
					increaseDifficulty(0.0008);
					//console.log(difficulty);
					updateScore();
					//console.log(this.score);
					diffVelocity = Vector.mult(defaultVelocity, difficulty);
					//diffVelocity.limit(2);
					//diffVelocity.add(step);
					//console.log(step);
					if (enemies.length < Math.min(150, ENEMIES_FACTOR * difficulty)) {
						createEnemies();
					}

					if (chanceOfBoost > 0.9975) {
						boosts.push(generateBoost());
					}

					updateObjects(mouse, diffVelocity, step);

					returnObjects = quadtree.retrieve(player);
					checkCollision(returnObjects, player);
					quadtree.clear();
					clearObjects();
				}
				//drawQuadtree(quadtree);
				//console.log(mouse);
				updateHUD();

				drawObjects(dt);
				last = now;
			} else {
				if (!playing) {
					canvas.width = canvas.width;
					action.call(window);
					return window.cancelAnimationFrame(id);
				}
			}
		};

	this.start = function () {
		window.requestAnimationFrame(loop);
	};

	this.init = function (act) {
		action = act;
		player = new Player(5, 'green');
		hud.push(document.getElementById("score"));
		hud.push(document.getElementById("time"));
		score = 0;
		difficulty = 1.000;
		SCREEN_HEIGHT = this.canvas.height;
		SCREEN_WIDTH = this.canvas.width;
		ENEMIES_FACTOR = (SCREEN_WIDTH / SCREEN_HEIGHT) * 30;
		context = this.canvas.getContext("2d");
		time = new Date();
		last = timestamp();
		enemies = [];
		boosts = [];
		explosions = [];
		quadtree = new Quadtree({
			x: 0,
			y: 0,
			width: this.canvas.height,
			height: this.canvas.width
		});
		playing = true;
	};
};