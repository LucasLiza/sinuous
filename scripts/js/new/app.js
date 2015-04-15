(function() {
  var Sinuous, documentMouseMoveHandler, mouse;

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
    var DEFAULT_VELOCITY, ENEMIES_FACTOR, ENEMY_SCORE, SCREEN_HEIGHT, SCREEN_WIDTH, action, animating, boosts, checkCollision, clearObjects, context, createBoost, createEnemies, difficulty, drawObjects, dt, enemies, explosions, gameLoop, gameOver, generatePosition, generateStartVelocity, hud, increaseDifficulty, isOutOfScreen, last, now, player, playing, quadtree, rand, removeBoost, returnObjects, score, step, time, timestamp, updateHUD, updateObjects, updateScore;

    function Sinuous(canvas) {
      this.canvas = canvas;
    }

    score = 0;

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

    difficulty = 1.000;

    ENEMY_SCORE = 100;

    DEFAULT_VELOCITY = new Vector(-1.3, 1);

    step = 1 / 60;

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
      var gravityAction, gravityBoost, position;
      position = generatePosition();
      gravityAction = function() {
        var diffVector, force, i;
        i = 0;
        while (i < returnObjects.length) {
          if (Vector.distance(returnObjects[i].position, player.position) <= player.radius * 8 + returnObjects[i].radius) {
            if (returnObjects[i] instanceof Particle) {
              diffVector = Vector.sub(player.position, returnObjects[i].position);
              force = -player.radius * 8 * returnObjects[i].radius / Math.pow(diffVector.mag(), 3);
            }
            returnObjects[i].accel.add(Vector.mult(diffVector, force));
          }
          i++;
        }
      };
      gravityBoost = new Boost("gravity", gravityAction, 200, 10, "green", position, DEFAULT_VELOCITY, new Vector(accel, accel));
      return gravityBoost;
    };

    drawObjects = function() {
      var boost, enemy, explosion, particle, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      context.fillStyle = "black";
      canvas.width = canvas.width;
      player.draw(context);
      player.drawTrail(context);
      for (_i = 0, _len = enemies.length; _i < _len; _i++) {
        enemy = enemies[_i];
        enemy.draw(context);
      }
      for (_j = 0, _len1 = boosts.length; _j < _len1; _j++) {
        boost = boosts[_j];
        boost.draw(context);
      }
      for (_k = 0, _len2 = explosions.length; _k < _len2; _k++) {
        explosion = explosions[_k];
        for (_l = 0, _len3 = explosion.length; _l < _len3; _l++) {
          particle = explosion[_l];
          particle.draw(context);
        }
      }
    };

    updateObjects = function(playerPosition, velocity, step) {
      var boost, enemy, explosion, particle, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      if ((playerPosition != null) && !animating) {
        player.update(playerPosition, velocity);
      }
      console.log(enemies.length);
      for (_i = 0, _len = enemies.length; _i < _len; _i++) {
        enemy = enemies[_i];
        enemy.applyVelocity(velocity);
        enemy.update();
        quadtree.insert(enemy);
      }
      for (_j = 0, _len1 = boosts.length; _j < _len1; _j++) {
        boost = boosts[_j];
        boost.update();
        quadtree.insert(boost);
      }
      for (_k = 0, _len2 = explosions.length; _k < _len2; _k++) {
        explosion = explosions[_k];
        for (_l = 0, _len3 = explosion.length; _l < _len3; _l++) {
          particle = explosion[_l];
          particle.update();
        }
      }
    };

    isOutOfScreen = function(position) {
      return position.x < 0 || position.x > SCREEN_WIDTH + 20 || position.y < -20 || position.y > SCREEN_HEIGHT + 20;
    };

    clearObjects = function() {
      var boost, eIndex, enemy, explosion, index, pIndex, particle, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      for (index = _i = 0, _len = enemies.length; _i < _len; index = ++_i) {
        enemy = enemies[index];
        if (isOutOfScreen(enemy.position)) {
          console.log("removing enemy");
          enemies.slice(index, 1);
        }
      }
      for (index = _j = 0, _len1 = boosts.length; _j < _len1; index = ++_j) {
        boost = boosts[index];
        if (isOutOfScreen(boost.position)) {
          boosts.slice(index, 1);
        }
      }
      for (eIndex = _k = 0, _len2 = explosions.length; _k < _len2; eIndex = ++_k) {
        explosion = explosions[eIndex];
        for (pIndex = _l = 0, _len3 = explosion.length; _l < _len3; pIndex = ++_l) {
          particle = explosion[pIndex];
          if (isOutOfScreen(particle.position)) {
            explosion.slice(pIndex, 1);
          }
          if (explosion.length === 0) {
            explosions.slice(eIndex, 1);
          }
        }
      }
    };

    increaseDifficulty = function(amount) {
      difficulty += amount;
    };

    updateScore = function() {
      var lastPlayerPosition;
      lastPlayerPosition = player.trail[player.trail.length - 1] || player.position;
      score += 0.4 * difficulty;
      return score += Vector.distance(lastPlayerPosition, player.position) * 10;
    };

    updateHUD = function() {
      var currentTime, scoreText, timePassed, timeText;
      currentTime = new Date();
      timePassed = currentTime.getTime() - time.getTime();
      scoreText = "Score: " + (Math.floor(score));
      timeText = " Time: " + ((timePassed / 1000).toFixed(2)) + "s";
      hud[0].innerHTML = scoreText;
      hud[1].innerHTML = timeText;
    };

    gameOver = function() {
      explosions.push(new Explosion(player.color, player.position, generateStartVelocity(), 3).emit(player.radius));
      playing = false;
    };

    removeBoost = function(boost) {
      var index;
      index = boosts.indexOf(boost);
      if (index > -1) {
        boosts.slice(index, 1);
      }
    };

    checkCollision = function(objs, target) {
      var obj, _i, _len;
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        if (Vector.distance(obj.position, target.position) <= target.radius + obj.radius) {
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
          increaseDifficulty(0.0008);
          updateScore();
          diffVelocity = Vector.mult(DEFAULT_VELOCITY, difficulty);
          if (enemies.length < Math.min(150, ENEMIES_FACTOR * difficulty)) {
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

    return Sinuous;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Sinuous = Sinuous;
  }

}).call(this);
