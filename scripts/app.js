/*global Particle, Player, Vector, Boost, Quadtree*/
/*jslint plusplus: true*/
var mouse = new Vector(100, 100);
function documentMouseMoveHandler(event) {
	"use strict";
	mouse = new Vector(event.clientX, event.clientY);
}

if (window.addEventListener) {
	"use strict";
	// Handle window's `load` event.
	window.addEventListener('load', function () {
		// Wire up the `focus` and `blur` event handlers.		
		window.addEventListener('focus', this.game.resume);
		window.addEventListener('blur', this.game.pause);
	});
}

document.addEventListener('mousemove', documentMouseMoveHandler, false);

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
		ENEMIES_FACTOR = 20,
		enemies = [],
		boosts = [],
		explosions = [],
		context,
		quadtree,
		player = new Player(5, 'green'),
		SCREEN_HEIGHT,
		SCREEN_WIDTH,
		ENEMY_SCORE = 100,
		justclear = false,
		now,
		dt = 0,
		timestamp = function () {
			return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
		},
    last = timestamp(),
		step = 1/60,
		rand = function (min, max) {
			var offset = min,
				range = (max - min) + 1;

			return Math.floor(Math.random() * range) + offset;
		},

		generateStartVelocity = function () {
			return new Vector(-4 + Math.random() * 8, -4 + Math.random() * 8);
		},

		generatePosition = function () {
			var position = new Vector(0, 0);

			if (Math.random() > 0.5) {
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
			var enemy, numEnemies = 8 + (Math.random() * 13);
			while (--numEnemies >= 0) {
				enemy = new Particle(Math.round(3 + (Math.random() * 5)), 'red', generatePosition(), generateStartVelocity(), 1 + (Math.random() * 0.4));
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
				explosions.push(new Explosion(enemies[i].color, enemies[i].position, enemies[i].velocity, 3).emit(enemies[i].radius * 1.5));
			}
			score += ENEMY_SCORE * enemies.length;
			enemies.splice(0, enemies.length);
			justclear = true;
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

		updateObjects = function (playerPosition, velocity, step) {
			var enemy, boost, explosion, particle;
			//velocity.add(step);
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

			for (explosion in explosions) {
				if (explosions.hasOwnProperty(explosion)) {

					for (particle in explosions[explosion]) {
						currentPosition = new Vector(explosions[explosion][particle].position.x, explosions[explosion][particle].position.y);
						if (isOutOfScreen(currentPosition)) {
							explosions[explosion].splice(particle, 1);
						}

						if (explosions[explosion].length == 0) {
							explosions[explosion].splice(explosion, 1);
							justclear = false;
						}
					}
				}
			}
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
		
		requestAnimationFrame(loop);
	};

	this.resume = function () {
		paused = false;
	};

	this.pause = function () {
		paused = true;
	};

	var loop = function () {
		var diffVelocity, chanceOfBoost = Math.random(),
			returnObjects, i;
		requestAnimationFrame(loop);
		now = timestamp();
  	dt = dt + Math.min(1, (now - last) / 1000);
		
		if (playing && !paused) {
			while(dt > step) {
    		dt = dt - step;
				increaseDifficulty(0.0008);
				//console.log(difficulty);
				updateScore();
				//console.log(this.score);
				diffVelocity = Vector.mult(defaultVelocity, difficulty);
				//diffVelocity.add(step);
				//console.log(step);
				if (enemies.length < ENEMIES_FACTOR * difficulty && !justclear) {
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
		}

		
	};
};