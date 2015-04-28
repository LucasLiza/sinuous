(function() {
  var Player;

  Player = (function() {
    function Player(size, color) {
      this.size = size;
      this.color = color;
      this.difficulty = 1;
      this.score = 0;
      this.boosts = [];
      this.trail = [];
      this.position = new Vector(0, 0);
    }

    Player.prototype.draw = function(context) {
      var element, _i, _len, _ref;
      _ref = this.boosts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        switch (element.name) {
          case "diff":
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.size * 8, 0, 2 * Math.PI, false);
            context.fillStyle = 'rgba(250,250,250,0.5)';
            context.fill();
            context.closePath();
            break;
          case "gravity":
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.size * 8, 0, 2 * Math.PI, false);
            context.fillStyle = 'rgba(0,0,255,0.3)';
            context.fill();
            context.closePath();
            break;
          case "clear":
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.size * 8, 0, 2 * Math.PI, false);
            context.fillStyle = 'purple';
            context.fill();
            context.closePath();
        }
      }
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
      context.fillStyle = this.color;
      context.fill();
      context.closePath();
    };

    Player.prototype.drawTrail = function(context) {
      var element, _i, _len, _ref;
      context.fillStyle = 'rgba(0,0,0,0.05)';
      context.beginPath();
      context.strokeStyle = 'rgba(20,100,50,0.70)';
      context.lineWidth = 3;
      _ref = this.trail;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        context.lineTo(element.x, element.y);
      }
      context.stroke();
      context.closePath();
    };

    Player.prototype.update = function(position, gameVelocity) {
      var element, index, _i, _j, _len, _len1, _ref, _ref1;
      this.position.x += (position.x - this.position.x) * 0.13;
      this.position.y += (position.y - this.position.y) * 0.13;
      this.trail.push(this.position.clone());
      if (this.trail.length > 40) {
        this.trail.shift();
      }
      _ref = this.boosts;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        element = _ref[index];
        if (element.active()) {
          element.doAction();
        } else {
          this.boosts.splice(index, 1);
        }
      }
      _ref1 = this.trail;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        element = _ref1[_j];
        element.add(gameVelocity);
      }
    };

    Player.prototype.acquire = function(boost) {
      this.boosts.push(boost);
    };

    Player.prototype.increaseScore = function(amount) {
      this.score += amount;
    };

    Player.prototype.updateDifficulty = function(amount) {
      this.difficulty += amount;
    };

    return Player;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Player = Player;
  } else {
    exports.Player = Player;
  }

}).call(this);
