(function() {
  var Sinuous, documentMouseMoveHandler, mouse,
    __hasProp = {}.hasOwnProperty;

  mouse = new Vector(100, 100);

  documentMouseMoveHandler = function(event) {
    mouse = new Vector(event.clientX, event.clientY);
  };

  if (window.addEventListener) {
    window.addEventListener('load', function() {
      'use strict';
      window.addEventListener('focus', this.game.resume);
      window.addEventListener('blur', this.game.pause);
    });
  }

  document.addEventListener('mousemove', documentMouseMoveHandler, false);

  Sinuous = (function() {
    var ENEMIES_FACTOR, SCREEN_HEIGHT, SCREEN_WIDTH, action, animating, boosts, checkCollision, clearObjects, context, createBoost, createEnemies, drawObjects, dt, enemies, explosions, gameLoop, gameOver, generatePosition, generateStartVelocity, hud, isOutOfScreen, last, now, player, playing, quadtree, rand, removeBoost, returnObjects, time, timestamp, updateHUD, updateObjects, updateScore;

    function Sinuous(canvas) {
      this.canvas = canvas;
    }

    dt = 0;

    SCREEN_WIDTH = 0;

    SCREEN_HEIGHT = 0;

    ENEMIES_FACTOR = 0;

    playing = false;

    animating = false;

    quadtree = void 0;

    player = void 0;

    action = void 0;

    time = void 0;

    context = void 0;

    now = void 0;

    returnObjects = [];

    enemies = [];

    boosts = [];

    explosions = [];

    hud = [];

    timestamp = function() {
      if (window.performance && window.performance.now) {
        return window.performance.now();
      } else {
        return (new Date).getTime();
      }
    };

    last = timestamp();

    rand = function(min, max) {
      var offset, range;
      offset = min;
      range = (max - min) + 1;
      return Math.floor(Math.random() * range) + offset;
    };

    generateStartVelocity = function() {
      return Vector.mult(DEFAULT_VELOCITY, 6);
    };

    generatePosition = function() {
      var position;
      position = new Vector(0, 0);
      if (Math.random() > 0.5) {
        position.x = Math.round(Math.random() * SCREEN_WIDTH);
        position.y = -20;
      } else {
        position.x = SCREEN_WIDTH + 20;
        position.y = Math.floor(-SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 1.2);
      }
      return position;
    };

    createEnemies = function() {
      var accel, numberOfEnemies;
      numberOfEnemies = rand(10, 15);
      while (--numberOfEnemies >= 0) {
        accel = rand(1, 5);
        enemies.push(new Enemy(generatePosition(), generateStartVelocity(), new Vector(-accel, accel)));
      }
    };

    createBoost = function() {
      var accel, availableBoosts, clearAction, clearBoost, gravityAction, gravityBoost, position;
      position = generatePosition();
      accel = rand(0.4, 1);
      clearAction = function() {
        var enemy, _i, _len;
        for (_i = 0, _len = enemies.length; _i < _len; _i++) {
          enemy = enemies[_i];
          explosions.push(new Explosion(enemy.color, enemy.position, enemy.velocity, 3).emit(2));
        }
        player.score += ENEMY_SCORE * enemies.length;
        return enemies.splice(0, enemies.length);
      };
      gravityAction = function() {
        var diffVector, force, i;
        i = 0;
        while (i < returnObjects.length) {
          if (Vector.distance(returnObjects[i].position, player.position) <= player.size * 8 + returnObjects[i].radius) {
            if (returnObjects[i] instanceof Particle) {
              diffVector = Vector.sub(player.position, returnObjects[i].position);
              force = -player.size * 8 * returnObjects[i].radius / Math.pow(diffVector.mag(), 3);
            }
            returnObjects[i].accel.add(Vector.mult(diffVector, force));
          }
          i++;
        }
      };
      clearBoost = new Boost("clear", clearAction, 200, 10, "purple", position, DEFAULT_VELOCITY, new Vector(accel, accel));
      gravityBoost = new Boost("gravity", gravityAction, 200, 10, "green", position, DEFAULT_VELOCITY, new Vector(accel, accel));
      availableBoosts = [gravityBoost, clearBoost];
      return availableBoosts[rand(0, availableBoosts.length - 1)];
    };

    drawObjects = function() {
      var boost, enemy, explosion, particle, _ref;
      context.fillStyle = "black";
      this.canvas.width = this.canvas.width;
      player.draw(context);
      player.drawTrail(context);
      for (enemy in enemies) {
        if (!__hasProp.call(enemies, enemy)) continue;
        enemies[enemy].draw(context);
      }
      for (boost in boosts) {
        if (!__hasProp.call(boosts, boost)) continue;
        boosts[boost].draw(context);
      }
      for (explosion in explosions) {
        if (!__hasProp.call(explosions, explosion)) continue;
        _ref = explosions[explosion];
        for (particle in _ref) {
          if (!__hasProp.call(_ref, particle)) continue;
          explosions[explosion][particle].draw(context);
        }
      }
    };

    updateObjects = function(playerPosition, velocity, step) {
      var boost, enemy, explosion, particle, _ref;
      if ((playerPosition != null) && !animating) {
        player.update(playerPosition, velocity);
        player.updateDifficulty(0.0008);
      }
      for (enemy in enemies) {
        if (!__hasProp.call(enemies, enemy)) continue;
        enemies[enemy].applyVelocity(velocity);
        enemies[enemy].update();
        quadtree.insert(enemies[enemy]);
      }
      for (boost in boosts) {
        if (!__hasProp.call(boosts, boost)) continue;
        boosts[boost].update();
        quadtree.insert(boosts[boost]);
      }
      for (explosion in explosions) {
        if (!__hasProp.call(explosions, explosion)) continue;
        _ref = explosions[explosion];
        for (particle in _ref) {
          if (!__hasProp.call(_ref, particle)) continue;
          explosions[explosion][particle].update();
        }
      }
    };

    isOutOfScreen = function(position) {
      return position.x < 0 || position.x > SCREEN_WIDTH + 20 || position.y < -20 || position.y > SCREEN_HEIGHT + 20;
    };

    clearObjects = function() {
      var boost, currentPosition, enemy, explosion, particle, _ref;
      for (enemy in enemies) {
        if (!__hasProp.call(enemies, enemy)) continue;
        currentPosition = enemies[enemy].position;
        if (isOutOfScreen(currentPosition)) {
          enemies.splice(enemy, 1);
        }
      }
      for (boost in boosts) {
        if (!__hasProp.call(boosts, boost)) continue;
        if (isOutOfScreen(boosts[boost].position)) {
          boosts.splice(boost, 1);
          console.log('Boosts', enemies.length);
        }
      }
      for (explosion in explosions) {
        if (!__hasProp.call(explosions, explosion)) continue;
        _ref = explosions[explosion];
        for (particle in _ref) {
          if (!__hasProp.call(_ref, particle)) continue;
          currentPosition = explosions[explosion][particle].position;
          if (isOutOfScreen(currentPosition)) {
            explosions[explosion].splice(particle, 1);
          }
          if (explosions[explosion].length === 0) {
            explosions.splice(explosion, 1);
          }
        }
      }
    };

    updateScore = function() {
      var lastPlayerPosition;
      lastPlayerPosition = player.trail[player.trail.length - 1] || player.position;
      player.score += 0.4 * player.difficulty;
      return player.score += Vector.distance(lastPlayerPosition, player.position) * 10;
    };

    updateHUD = function() {
      var currentTime, scoreText, timePassed, timeText;
      currentTime = new Date();
      timePassed = currentTime.getTime() - time.getTime();
      scoreText = "Score: " + (Math.floor(player.score));
      timeText = " Time: " + ((timePassed / 1000).toFixed(2)) + "s";
      hud[0].innerHTML = scoreText;
      hud[1].innerHTML = timeText;
    };

    gameOver = function() {
      explosions.push(new Explosion(player.color, player.position, generateStartVelocity(), 3).emit(player.size));
      playing = false;
    };

    removeBoost = function(boost) {
      var index;
      index = boosts.indexOf(boost);
      if (index > -1) {
        boosts.splice(index, 1);
      }
    };

    checkCollision = function(objs, target) {
      var obj, _i, _len;
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        if (Vector.distance(obj.position, target.position) <= target.size + obj.radius) {
          if (obj instanceof Enemy) {
            gameOver();
          } else if (obj instanceof Boost) {
            player.acquire(obj);
            removeBoost(obj);
          }
        }
      }
    };

    gameLoop = function() {
      var chanceOfBoost, diffVelocity, id;
      chanceOfBoost = Math.random();
      id = window.requestAnimationFrame(gameLoop);
      if (playing) {
        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);
        while (dt > step) {
          dt = dt - step;
          updateScore();
          diffVelocity = Vector.mult(DEFAULT_VELOCITY, player.difficulty);
          if (enemies.length < Math.min(30, ENEMIES_FACTOR * player.difficulty)) {
            createEnemies();
          }
          if (chanceOfBoost > 0.9975) {
            boosts.push(createBoost());
          }
          updateObjects(mouse, diffVelocity, step);
          returnObjects = quadtree.retrieve(player);
          checkCollision(returnObjects, player);
          quadtree.clear();
          clearObjects();
        }
        updateHUD();
        drawObjects(dt);
        last = now;
      } else {
        if (!playing) {
          this.canvas.width = this.canvas.width;
          action.call(window);
          return window.cancelAnimationFrame(id);
        }
      }
    };

    Sinuous.prototype.start = function() {
      window.requestAnimationFrame(gameLoop);
    };

    Sinuous.prototype.init = function(act) {
      action = act;
      player = new Player(5, 'green');
      hud.push(document.getElementById("score"));
      hud.push(document.getElementById("time"));
      player.score = 0;
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
        width: this.canvas.width,
        height: this.canvas.height
      });
      playing = true;
    };

    return Sinuous;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Sinuous = Sinuous;
  }

}).call(this);
